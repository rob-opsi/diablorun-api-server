const { areas } = require('@diablorun/diablorun-data');

async function processPointsRule(
  client, time, raceId, characterId,
  stats, statsValues, quests, rule, previousStats
) {
  let claimed = false;
  let notification;

  switch (rule.type) {
    case 'quest': {
      const quest = quests.find(
        q => q.difficulty === rule.difficulty && q.quest_id === rule.quest_id
      );

      if (quest) {
        try {
          await client.query(`
            INSERT INTO character_checkpoints (
              race_id, character_id, rule_id, update_time, points
            ) VALUES (
              $1, $2, $3, $4, $5
            )
          `, [raceId, characterId, rule.id, time, rule.amount]);

          claimed = true;
          notification = {
            type: 'claim',
            points: rule.amount
          };
        } catch (err) {}
      }
      break;
    }

    case 'for': {
      const index = stats.indexOf(rule.stat);

      if (index !== -1) {
        if (statsValues[index] >= rule.counter) {
          try {
            await client.query(`
              INSERT INTO character_checkpoints (
                race_id, character_id, rule_id, update_time, points
              ) VALUES (
                $1, $2, $3, $4, $5
              )
            `, [raceId, characterId, rule.id, time, rule.amount]);

            claimed = true;
            notification = {
              type: 'claim',
              points: rule.amount
            };
          } catch (err) {}
        } else {
          const { rowCount } = await client.query(`
            DELETE FROM character_checkpoints
            WHERE character_id=$1 AND rule_id=$2
          `, [characterId, rule.id]);

          if (rowCount) {
            notification = {
              type: 'lose',
              points: -rule.amount
            };
          }
        }
      }
      break;
    }

    case 'per': {
      const index = stats.indexOf(rule.stat);

      if (index !== -1) {
        const value = Math.floor(rule.amount * statsValues[index] / rule.counter);
        let setPoints = '$5';

        if (rule.time_type === 'max') {
          if (rule.amount < 0) {
            setPoints = 'LEAST(character_checkpoints.points, $5)';
          } else {
            setPoints = 'GREATEST(character_checkpoints.points, $5)';
          }
        }

        await client.query(`
          INSERT INTO character_checkpoints (
            race_id, character_id, rule_id, update_time, points
          ) VALUES (
            $1, $2, $3, $4, $5
          ) ON CONFLICT (character_id, rule_id) DO UPDATE SET
            update_time = $4, points = ${setPoints}
        `, [raceId, characterId, rule.id, time, value]);
      }
      break;
    }
  }

  if (rule.time_type === 'first' && claimed) {
    await client.query(`
      UPDATE race_rules SET claimed=true WHERE id=$1
    `, [rule.id]);
  }

  return notification;
}

async function checkFinishConditionsRule(
  stats, statsValues, quests, rule
) {
  switch (rule.type) {
    case 'quest': {
      if (quests.find(
        q => q.difficulty === rule.difficulty && q.quest_id === rule.quest_id
      )) {
        return true;
      }

      break;
    }

    case 'stat': {
      const index = stats.indexOf(rule.stat);

      if (index !== -1 && statsValues[index] >= rule.counter) {
        return true;
      }
      break;
    }
  }
}

async function updateRaceProgress(
  client, time, raceId, characterId,
  stats, statsValues, quests, currentStats, monsterKills
) {
  const notifications = [];
  const clauses = [];
  let parameters = [raceId];

  if (stats.length) {
    clauses.push(`stat IN (${stats.map((_, i) => `$${2+i}`)})`);
    parameters = [...parameters, ...stats];
  }

  if (quests.length) {
    clauses.push(`quest_id IN (${quests.map((_, i) => `$${2+stats.length+i}`)})`);
    parameters = [...parameters, ...quests.map(quest => quest.quest_id)];
  }

  // Check entry condition: players setting
  const race = await client.query(`
    SELECT start_time, entry_players, finish_conditions_global
    FROM races WHERE id=$1
  `, [raceId]);

  const playersIndex = stats.indexOf('players');
  const areaIndex = stats.indexOf('area');
  const players = (playersIndex === -1) ? currentStats.players : statsValues[playersIndex];
  const areaId = (areaIndex === -1) ? currentStats.area : statsValues[areaIndex];

  if (
    (race.rows[0].entry_players === 'p1' && players !== 1)
    || (race.rows[0].entry_players === 'p8' && players !== 8)
  ) {
    if (!areas[areaId].town) {
      stats.push('disqualified');
      statsValues.push(true);

      notifications.push({
        type: 'disqualify'
      });

      return notifications;
    }
  }

  if (!clauses.length) {
    return notifications;
  }

  // Check points and finish conditions
  let isFinished = false;
  const rules = await client.query(`
    SELECT * FROM race_rules WHERE race_id=$1
    AND (time_type != 'first' OR claimed=false)
    AND (time_type != 'in_under' OR time_seconds > ${time - race.rows[0].start_time})
    AND (${clauses.join(' OR ')})
  `, parameters);

  await Promise.all(rules.rows.map(async rule => {
    switch (rule.context) {
      case 'points': {
        const notification = await processPointsRule(
          client, time, raceId, characterId,
          stats, statsValues, quests, rule, currentStats
        );

        if (notification) {
          notifications.push({
            rule_id: rule.id,
            ...notification
          });
        }
        break;
      }
      case 'finish_conditions': {
        if (!isFinished) {
          isFinished = await checkFinishConditionsRule(
            stats, statsValues, quests, rule
          );

          if (isFinished) {
            notifications.push({
              type: 'finish',
              rule_id: rule.id
            });
          }
        }
        break;
      }
    }
  }));

  // Re-calculate points if checkpoints changed
  if (rules.rows.length) {
    const checkpoints = await client.query(`
      SELECT SUM(points) as total_points FROM character_checkpoints WHERE character_id=$1
    `, [characterId]);

    stats.push('points');
    statsValues.push(checkpoints.rows[0].total_points || 0);
  }

  // Update finish time
  if (isFinished) {
    if (race.rows[0].finish_conditions_global) {
      await client.query(`
        UPDATE races SET finish_time=$1 WHERE id=$2
      `, [time, raceId]);

      await client.query(`
        UPDATE characters SET finish_time=$1 WHERE race_id=$2
      `, [time, raceId]);
    }

    stats.push('finish_time');
    statsValues.push(time);
  }

  return notifications;
}

module.exports = { updateRaceProgress };
