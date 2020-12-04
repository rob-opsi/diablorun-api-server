const { areas, quests } = require('@diablorun/diablorun-data');

async function say(db, fromChannel, raceId, message) {
    let channels = [fromChannel];

    if (raceId) {
        const { rows } = await db.query(`
            SELECT name FROM users
            WHERE id IN (
                SELECT DISTINCT(user_id) FROM characters WHERE race_id=$1
            )
        `, [raceId]);

        channels = rows.map(({ name }) => `#${name}`);
    }

    return channels.map(channel => ({
        channel,
        message,
        timeout: 5000
    }));
}

async function updateLog(db, time, user, prev, nextKeys, nextValues, itemUpdates, updatedQuests, raceId, killedMonsters) {
    const channel = `#${user.login}`;
    const link = `diablo.run/${user.name}/${prev.id}`;
    let messages = [];

    // Check for level up
    const levelIndex = nextKeys.indexOf('level');

    if (levelIndex !== -1 && prev.level !== nextValues[levelIndex]) {
        messages = [
            ...messages,
            ...await say(db, channel, raceId, `${user.name} reached level ${nextValues[levelIndex]}`)
        ];
    }

    // Check for death or close call
    const deathsIndex = nextKeys.indexOf('deaths');
    const lifeIndex = nextKeys.indexOf('life');

    if (deathsIndex !== -1 && prev.deaths !== nextValues[deathsIndex]) {
        messages = [
            ...messages,
            ...await say(db, channel, raceId, `${user.name} died in ${areas[prev.area].name} (${prev.difficulty})`)
        ];
    } else if (lifeIndex !== -1 && prev.life > 0 && prev.life < 0.1 * prev.life_max && nextValues[lifeIndex] > 0.1 * prev.life_max) {
        messages = [
            ...messages,
            ...await say(db, channel, raceId, `${user.name} dropped down to ${prev.life} life`)
        ];
    }

    // Quests
    if (updatedQuests.length) {
        let message = `${user.name} finished `;

        message += updatedQuests.map(({ difficulty, quest_id }) => {
            const quest = quests[quest_id];
            return `${quest.short_name} in ${difficulty}`;
        }).join(', ');

        messages = [
            ...messages,
            ...await say(db, channel, raceId, message)
        ];
    }

    /*
    // Items
    const equipped = [];

    for (const slot in itemUpdates) {
        const item = itemUpdates[slot];

        if (!item) {
            continue;
        }
        
        if (['white', 'blue', 'yellow', 'none'].includes(item.quality)) {
            continue;
        }

        if (['primary_left', 'primary_right', 'secondary_left', 'secondary_right'].includes(slot)) {
            continue;
        }

        equipped.push(item.name);
    }
    
    if (equipped.length) {
        await say(channel, `${link} equipped ${equipped.join(', ')}`);
    }
    */

    // Stats log
    const loggedStats = ['level', 'experience', 'gold_total', 'points'];
    const inGameTimeIndex = nextKeys.indexOf('in_game_time');
    const inGameTime = (inGameTimeIndex === -1) ? prev.in_game_time : nextValues[inGameTimeIndex];

    for (const stat of loggedStats) {
        const statIndex = nextKeys.indexOf(stat);

        if (statIndex !== -1) {
            await db.query(`
                INSERT INTO stats_log (race_id, character_id, update_time, in_game_time, stat, value)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT DO NOTHING
            `, [raceId, prev.id, time, inGameTime, stat, nextValues[statIndex]]);
        }
    }

    /*
    // Killed monsters
    if (killedMonsters) {
        for (const monster of killedMonsters) {
            if (monster.TypeFlags & 0x00000002) {
                const message = `${user.name} killed ${monster.Class}`;
        
                messages = [
                    ...messages,
                    ...await say(db, channel, raceId, message)
                ];
            }
        }
    }
    */

    return messages;
}

module.exports = { updateLog };
