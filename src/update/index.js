const dotenv = require('dotenv');
const { STATS } = require('./stats');
const { updateRaceProgress } = require('./race');
const { updateItems } = require('./items');
const { zipObject } = require('./utils');
const { broadcast } = require('../ws');
const { updateLog } = require('./log');
const { areas } = require('@diablorun/diablorun-data');
const { getDbClient } = require('../db');

module.exports = async function (body) {
  const client = await getDbClient();

  try {
    // Validate JSON
    const time = Math.floor(new Date().getTime() / 1000);
    const update = { ...body, Time: time };
    const headers = dotenv.parse(update.Headers);
    const newCharacter = update.NewCharacter && update.Experience === 0;

    // Verify API key
    const user = await client.query(`
      SELECT
        id, name, login, country_code, dark_color_from,
        patreon_pledges.amount_cents
      FROM users
      LEFT JOIN patreon_pledges ON patreon_pledges.patreon_user_id=users.patreon_id
      WHERE api_key = $1
    `, [headers.API_KEY]);

    if (!user.rows.length) {
      return 'Invalid API_KEY. Visit https://diablo.run/setup.';
    }

    const userId = user.rows[0].id;
    const updatedStats = ['update_time'];
    const updatedStatsValues = [time];

    if (userId === 2 && update.Hireling) {
      console.log('[DEBUG]', update.Hireling);
    }

    // Updated or created character ID and race goal
    let characterId, raceId, raceSlug;
    let currentStats = {};
    let notifications = [];

    // Find latest existing character
    const lastUpdatedCharacter = await client.query(`
      SELECT * FROM characters
      WHERE user_id=$1 AND name=$2 ORDER BY start_time DESC LIMIT 1
    `, [userId, update.Name]);

    if (!newCharacter && lastUpdatedCharacter.rows.length) {
      characterId = lastUpdatedCharacter.rows[0].id;
      raceId = lastUpdatedCharacter.rows[0].race_id;
      currentStats = lastUpdatedCharacter.rows[0];

      // Do not update character if disqualified
      if (currentStats.disqualified) {
        return 'Disqualified';
      }

      // Do not update character if race is finished
      if (!currentStats.preliminary && currentStats.finish_time && time > currentStats.finish_time) {
        return `#${update.Name}${characterId} finished the race!`;
      }
    }

    // Get updated stats
    for (const stat in STATS) {
      const value = STATS[stat](currentStats, update);

      if (value !== undefined) {
        updatedStats.push(stat);
        updatedStatsValues.push(value);
      }
    }

    // Get updated quests
    let updatedQuests = [];

    if (update.CompletedQuests) {
      let previousQuests = [];

      if (characterId) {
        const quests = await client.query(`
          SELECT difficulty, quest_id FROM quests WHERE character_id=$1
        `, [characterId]);
        previousQuests = quests.rows;
      }

      for (const difficulty in update.CompletedQuests) {
        if (!update.CompletedQuests[difficulty].length) {
          continue;
        }

        if (update.CompletedQuests[difficulty].length > 100) {
          return 'Bad request.';
        }

        const difficultyUpdatedQuests = update.CompletedQuests[difficulty]
          .filter(quest_id =>
            !previousQuests.find(q =>
              q.difficulty === difficulty.toLowerCase() && q.quest_id === quest_id
            )
          ).map(quest_id =>
            ({ difficulty: difficulty.toLowerCase(), quest_id })
          );

        if (difficultyUpdatedQuests.length) {
          updatedQuests = [...updatedQuests, ...difficultyUpdatedQuests];

          const stat = `finished_${difficulty.toLowerCase()}_quests`;
          updatedStats.push(stat);
          updatedStatsValues.push((currentStats[stat] || 0) + difficultyUpdatedQuests.length);
        }
      }
    }

    // Verify race token if provided
    if (headers.RACE_TOKEN && !raceId) {
      const race = await client.query(`
        SELECT id, slug, start_time, finish_time,
        entry_new_character, entry_hero, entry_classic, entry_hc
        FROM races WHERE token=$1
      `, [headers.RACE_TOKEN]);

      if (!race.rows.length) {
        return 'Invalid RACE_TOKEN.';
      }

      if (race.rows[0].finish_time && time >= race.rows[0].finish_time) {
        return 'Race is over.';
      }

      raceId = race.rows[0].id;
      raceSlug = race.rows[0].id;
      updatedStats.push('race_id');
      updatedStatsValues.push(raceId);

      // Verify entry conditions
      const entryHeroes = race.rows[0].entry_hero.split(',');
      const heroStatIndex = updatedStats.findIndex(stat => stat === 'hero');
      const lodStatIndex = updatedStats.findIndex(stat => stat === 'lod');
      const hcStatIndex = updatedStats.findIndex(stat => stat === 'hc');

      if (race.rows[0].entry_new_character && !newCharacter && !updatedStats.includes('disqualified')) {
        updatedStats.push('disqualified');
        updatedStatsValues.push(true);
      }

      if (!entryHeroes.includes(updatedStatsValues[heroStatIndex]) && !updatedStats.includes('disqualified')) {
        updatedStats.push('disqualified');
        updatedStatsValues.push(true);
      }

      if (race.rows[0].entry_classic && updatedStatsValues[lodStatIndex] && !updatedStats.includes('disqualified')) {
        updatedStats.push('disqualified');
        updatedStatsValues.push(true);
      }

      if (race.rows[0].entry_hc && !updatedStatsValues[hcStatIndex] && !updatedStats.includes('disqualified')) {
        updatedStats.push('disqualified');
        updatedStatsValues.push(true);
      }

      // Get character finish time from finish conditions
      const conditions = await client.query(`
        SELECT time_type, time_seconds FROM race_rules
        WHERE race_id=$1 AND context='finish_conditions' AND type='time'
      `, [raceId]);

      if (conditions.rows.length) {
        updatedStats.push('finish_time');
        updatedStatsValues.push(Math.min(...conditions.rows.map(
          ({ time_type, time_seconds}) => {
            if (time_type === 'race') {
              return race.rows[0].start_time + time_seconds;
            } else {
              return time + time_seconds;
            }
          })
        ));
      }

      if (!race.rows[0].start_time || time < race.rows[0].start_time) {
        updatedStats.push('preliminary');
        updatedStatsValues.push(true);
      }

      // Start notification
      notifications.push({
        type: 'start'
      });
    }

    // Update or insert character stats
    if (!characterId) {
      const result = await client.query(`
        INSERT INTO characters (user_id, name, start_time, points, ${updatedStats})
        VALUES ($1, $2, $3, $4, ${updatedStats.map((_, i) => `$${5 + i}`)})
        RETURNING *
      `, [userId, update.Name, time, 0, ...updatedStatsValues]);

      characterId = result.rows[0].id;
      currentStats = result.rows[0];
    }

    // Monster kills
    const monsterKills = [];

    if (update.KilledMonsters) {
      const aggregatedKills = [];

      for (const monster of update.KilledMonsters) {
        /*
        None = 0x00000000,
        // 00000001 = 001 = 0x00000001 - MONTYPE_OTHER
        // (set for some champs, uniques)
        Other = 0x00000001,
        // 00000010 = 002 = 0x00000002 - MONTYPE_SUPERUNIQUE
        // (eg. BISHIBOSH)
        SuperUnique = 0x00000002,
        // 00000100 = 004 = 0x00000004 - MONTYPE_CHAMPION
        Champion = 0x00000004,
        // 00001000 = 008 = 0x00000008 - MONTYPE_UNIQUE
        // (eg. BISHIBOSH, BLOODRAVEN, random bosses)
        Unique = 0x00000008,
        // 00010000 = 016 = 0x00000010 - MONTYPE_MINION      
        Minion = 0x00000010,
        // 00100000 = 032 = 0x00000020 - MONTYPE_POSSESSED
        Possessed = 0x00000020,
        // 01000000 = 064 = 0x00000040 - MONTYPE_GHOSTLY
        Ghostly = 0x00000040,
        // 10000000 = 128 = 0x00000080 - MONTYPE_MULTISHOT
        Multishot = 0x00000080,
        */

        let quality = 'normal';
        let type = 'none';

        if (monster.TypeFlags & 0x00000002) {
          quality = 'unique'; // super unique
        } else if (monster.TypeFlags & 0x00000008) {
          quality = 'unique';
        } else if (monster.TypeFlags & 0x00000004) {
          quality = 'champion';
        } else if (monster.TypeFlags & 0x00000010) {
          quality = 'minion';
        }

        if (monster.Type === 1) {
          type = 'demon';
        } else if (monster.Type === 2) {
          type = 'undead';
        }

        const counter = aggregatedKills.find(
          m => m.class === monster.Class && m.quality === quality && m.type === type
        );

        if (counter) {
          ++counter.kills;
        } else {
          aggregatedKills.push({
            class: monster.Class,
            quality,
            type,
            flags: monster.TypeFlags,
            kills: 1
          });
        }
      }

      for (const counter of aggregatedKills) {
        const result = await client.query(`
          INSERT INTO monster_kills (
            character_id, monster_class, monster_quality,
            monster_flags, monster_type, kills
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (character_id, monster_class, monster_quality)
          DO UPDATE SET kills=monster_kills.kills+$6
          RETURNING kills
        `, [
          characterId, counter.class, counter.quality,
          counter.flags, counter.type, counter.kills
        ]);

        monsterKills.push({ ...counter, kills: result.rows[0].kills });
      }
    }

    // Update race if character in race
    if (raceId) {
      const raceNotifications = await updateRaceProgress(
        client,
        time,
        raceId,
        characterId,
        updatedStats,
        updatedStatsValues,
        updatedQuests,
        currentStats,
        monsterKills
      );

      notifications = [...notifications, ...raceNotifications];

      // Preliminary character must stay in town
      if (
        currentStats.race_id
        && (currentStats.preliminary || currentStats.start_time > time)
        && update.Area && !areas[update.Area].town
        && !updatedStats.includes('disqualified')
      ) {
        updatedStats.push('disqualified');
        updatedStatsValues.push(true);
      }
    }

    await client.query(`
      UPDATE characters SET ${updatedStats.map((stat, i) => `${stat}=$${1 + i}`)}
      WHERE id=$${updatedStats.length + 1}
    `, [...updatedStatsValues, characterId]);

    // Add and remove items
    const itemUpdates = await updateItems(
      client,
      time,
      currentStats,
      update,
      updatedStats,
      updatedStatsValues,
      update.DIApplicationInfo ? update.DIApplicationInfo.Version : '0.6.6'
    );

    // Update quest completion
    if (updatedQuests.length) {
      await client.query(`
        INSERT INTO quests (character_id, difficulty, quest_id, update_time) VALUES
        ${updatedQuests.map(
          (_, i) => `($${4*i+1}, $${4*i+2}, $${4*i+3}, $${4*i+4})`)
        }
      `, Array.prototype.concat(...updatedQuests.map(
        ({ difficulty, quest_id }) => [characterId, difficulty, quest_id, time]
      )));
    }

    // Save notifications
    if (notifications.length) {
      const values = [raceId, characterId, time];

      for (const notification of notifications) {
        notification.time = time;
        notification.race_id = raceId;
        notification.character_id = characterId;

        values.push(notification.type);
        values.push(notification.rule_id);
        values.push(notification.points);
      }

      const { rows } = await client.query(`
        INSERT INTO race_notifications
          (race_id, character_id, type, rule_id, time, points)
        VALUES
          ${notifications.map(
            (_, i) => `($1, $2, $${i*3+4}, $${i*3+5}, $3, $${i*3+6})`
          )}
        RETURNING id
      `, values);

      for (let i = 0; i < rows.length; ++i) {
        notifications[i].id = rows[i].id;
      }
    }

    // Log
    let twitchMessages = [];

    if (raceId || user.rows[0].amount_cents) {
      twitchMessages = await updateLog(
        client,
        time,
        user.rows[0], 
        currentStats,
        updatedStats,
        updatedStatsValues,
        itemUpdates,
        updatedQuests,
        raceId,
        update.KilledMonsters
      );
    }

    // WebSocket push
    const userRoom = `user/${user.rows[0].name.toLowerCase()}`;
    const newStats = zipObject(updatedStats, updatedStatsValues);

    await broadcast(userRoom, {
      room: `${userRoom}/${characterId}`,
      action: 'character',
      payload: {
        character: {
          id: characterId,
          name: update.Name,
          start_time: currentStats.start_time,
          ...newStats,
          ...itemUpdates,
          updatedQuests: updatedQuests.length ? updatedQuests : undefined,
          update_time: undefined
        },
        notifications
      }
    }, twitchMessages);

    if (raceId && (
      notifications.length
      || newCharacter
      || updatedStats.includes('points')
      || updatedStats.includes('gold_total')
      || updatedStats.includes('level')
      || updatedStats.includes('area')
      || updatedStats.includes('finish_time')
      || updatedStats.includes('players')
      || updatedStats.includes('dead')
      || updatedStats.includes('deaths')
      || updatedStats.includes('difficulty')
      || updatedStats.includes('disqualified')
      || updatedStats.includes('lod')
    )) {
      const stats = {
        ...currentStats,
        ...newStats
      };

      await broadcast(`race/${raceId}`, {
        room: `race/${raceId}`,
        action: 'race',
        payload: {
          characters: [{
            user_id: user.rows[0].id,
            user_name: user.rows[0].name,
            user_country_code: user.rows[0].country_code,
            user_color: user.rows[0].dark_color_from,
            id: characterId,
            name: update.Name,
            difficulty: stats.difficulty,
            area: stats.area,
            level: stats.level,
            points: parseFloat(stats.points),
            finish_time: stats.finish_time,
            hero: stats.hero,
            hc: stats.hc,
            lod: stats.lod,
            players: stats.players,
            gold_total: stats.gold_total,
            dead: stats.dead,
            deaths: stats.deaths,
            start_time: stats.start_time,
            disqualified: stats.disqualified,
            is_finished: stats.finish_time && stats.finish_time <= time,
            update_time: time
          }],
          notifications
        }
      });
    }

    // Return character hash
    if (raceSlug) {
      return `#${user.rows[0].name} #${update.Name}${characterId} #${raceSlug}${raceId}`;
    } else {
      return `#${user.rows[0].name} #${update.Name}${characterId}`;
    }
  } catch (err) {
    console.log('ERROR!');
    console.log(JSON.stringify(body, null, 2));
    console.log(err);
    console.log(err.stack);

    return 'Server error. Contact OverseerShenk on Discord.';
  }
};
