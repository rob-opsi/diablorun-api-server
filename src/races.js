const shortid = require('shortid');
const { Router } = require('express');
const { getDbClient } = require('./db');
const { broadcast } = require('./ws');
const router = new Router();

// Get recent races
router.get('/races', async function (req, res) {
    const db = await getDbClient();
    const races = await db.query(`
        SELECT
            id, name, slug, start_time, finish_time, description,
            finish_conditions_global,
            entry_new_character,
            entry_hero, entry_classic,
            entry_hc, entry_players
        FROM races ORDER BY start_time DESC NULLS LAST LIMIT 10
    `);

    res.json(races.rows);
});

// Get race settings using editor token
router.get('/races/editor', async function (req, res) {
    const db = await getDbClient();
    const editorToken = req.query.editor_token;

    const race = await db.query(`
        SELECT * FROM races WHERE editor_token=$1
    `, [editorToken]);

    if (!race.rows.length) {
        res.sendStatus(404);
        return;
    }

    const rules = await db.query(`
        SELECT * FROM race_rules WHERE race_id = $1
    `, [race.rows[0].id]);

    res.json({
        race: race.rows[0],
        rules: rules.rows
    });
});

// Get race by id
router.get('/races/:id', async function (req, res) {
    const db = await getDbClient();
    const id = req.params.id;
    const time = Math.ceil(new Date().getTime() / 1000);

    // Get race
    const race = await db.query(`
        SELECT
            id, name, slug, start_time, finish_time, description,
            estimated_start_time,
            finish_conditions_global,
            entry_hero, entry_classic,
            entry_hc, entry_players,
            active, token
        FROM races WHERE id=$1
    `, [id]);

    if (!race.rows[0].active) {
        delete race.rows[0].token;
    }

    // Get rules
    const rules = await db.query(`
        SELECT * FROM race_rules WHERE race_id = $1
    `, [id]);

    // Get top characters
    const characters = await db.query(`
        WITH latest_characters AS (
            SELECT DISTINCT ON (user_id)
                id, user_id, name, difficulty, area, level, points, finish_time,
                hero, hc, lod, players, gold_total, dead, deaths, start_time, disqualified,
                (finish_time IS NOT NULL AND finish_time <= $2) AS is_finished
            FROM characters
            WHERE race_id=$1
            ORDER BY user_id, update_time DESC
        ), rankings AS (
            SELECT latest_characters.*,
            (RANK() OVER (
                ORDER BY
                disqualified ASC NULLS FIRST,
                finish_time <= $2 DESC NULLS LAST,
                points DESC NULLS LAST,
                finish_time ASC NULLS LAST
            ))::integer AS rank
            FROM latest_characters
        )
        SELECT
            rankings.*,
            users.name AS user_name,
            users.country_code AS user_country_code,
            users.dark_color_from AS user_color
        FROM rankings
        INNER JOIN users ON rankings.user_id = users.id
        ORDER BY rank LIMIT 100
    `, [id, time]);

    // Get recent notifications
    const notifications = await db.query(`
        SELECT * FROM race_notifications
        WHERE race_id=$1
        ORDER BY time DESC LIMIT 4
    `, [id]);

    // Get points statistics
    const pointsLog = await db.query(`
        WITH stats_log_indexed AS (
            SELECT
                characters.user_id,
                stats_log.update_time,
                stats_log.value,
                ROW_NUMBER() OVER (ORDER BY user_id, stats_log.update_time) AS index
            FROM stats_log
            LEFT JOIN characters ON characters.id = stats_log.character_id
            WHERE stats_log.race_id=$1 AND stats_log.stat=$2 AND stats_log.update_time>$3
        )
        SELECT user_id, update_time, value FROM stats_log_indexed
        WHERE index % (1 + (
        SELECT COUNT(*) FROM stats_log
        WHERE race_id=$1 AND stat=$2
        )::integer / $4) = 0
    `, [id, 'points', race.rows[0].start_time, 50 * Math.max(1, characters.rows.length)]);

    // Value
    res.json({
        time: new Date().getTime(),
        race: race.rows[0],
        rules: rules.rows,
        characters: characters.rows,
        notifications: notifications.rows,
        pointsLog: race.rows[0].start_time ? pointsLog.rows : []
    });
});

// Save race settings
router.post('/races', async function (req, res) {
    const db = await getDbClient();
    const race = req.body;

    if (race.start_in) {
        race.start_time = Math.floor(new Date().getTime() / 1000) + race.start_in;
    }

    // Update race configuration
    if (race.editor_token) {
        const update = await db.query(`
            UPDATE races SET
                name=$1, slug=$2, description=$3,
                finish_conditions_global=$4,
                start_time=$5, finish_time=$6,
                entry_new_character=$7,
                entry_hero=$8, entry_classic=$9,
                entry_hc=$10, entry_players=$11,
                estimated_start_time=$12
            WHERE editor_token=$13 RETURNING id
        `, [
            race.name, race.slug, race.description,
            race.finish_conditions_global,
            race.start_time, race.finish_time,
            race.entry_new_character,
            race.entry_hero, race.entry_classic,
            race.entry_hc, race.entry_players,
            race.estimated_start_time,
            race.editor_token
        ]);

        race.id = update.rows[0].id;
    } else {
        race.token = shortid();
        race.editor_token = shortid();

        const insert = await db.query(`
            INSERT INTO races (
                name, slug, description,
                token, editor_token,
                finish_conditions_global,
                entry_new_character,
                entry_hero, entry_classic,
                entry_hc, entry_players,
                estimated_start_time
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id
        `, [
            race.name, race.slug, race.description, race.token, race.editor_token,
            race.finish_conditions_global,
            race.entry_new_character,
            race.entry_hero, race.entry_classic,
            race.entry_hc, race.entry_players,
            race.estimated_start_time
        ]);

        race.id = insert.rows[0].id;
    }

    // Update race rules
    if (race.update_rules) {
        await db.query(`DELETE FROM character_checkpoints WHERE race_id=$1`, [race.id]);
        await db.query(`DELETE FROM race_notifications WHERE race_id=$1`, [race.id]);
        await db.query(`DELETE FROM race_rules WHERE race_id=$1`, [race.id]);

        if (race.rules.length) {
            await db.query(`
                INSERT INTO race_rules (
                    race_id, context, type, amount,
                    stat, counter,
                    difficulty, quest_id,
                    time_type, time, time_seconds
                ) VALUES ${race.rules.map((_, i) => `(
                    $1, $${10 * i + 2}, $${10 * i + 3}, $${10 * i + 4},
                    $${10 * i + 5}, $${10 * i + 6},
                    $${10 * i + 7}, $${10 * i + 8},
                    $${10 * i + 9}, $${10 * i + 10}, $${10 * i + 11}
                )`)}
            `, [race.id, ...Array.prototype.concat(
                ...race.rules.map(point => [
                    point.context,
                    point.type, point.amount || 0,
                    point.stat, point.counter || 0,
                    point.difficulty, point.quest_id || 0,
                    point.time_type, point.time, point.time_seconds || 0
                ])
            )]);
        }
    }

    // Start race
    if (race.start_time) {
        race.preliminary_character_finish_time = null;
        const conditions = await db.query(`
            SELECT time_type, time_seconds FROM race_rules
            WHERE race_id=$1 AND context='finish_conditions' AND type='time'
        `, [race.id]);

        if (conditions.rows.length) {
            race.preliminary_character_finish_time = Math.min(...conditions.rows.map(
                ({ time_seconds }) => race.start_time + time_seconds
            ));
        }

        await db.query(`
            UPDATE characters
            SET preliminary=false, start_time=$1, finish_time=$2
            WHERE race_id=$3 AND preliminary=true
        `, [race.start_time, race.preliminary_character_finish_time, race.id]);
    }

    // Websocket push
    const room = `race/${race.id}`;
    const twitchMessages = [];

    if (race.start_in) {
        const participants = await db.query(`
            SELECT name FROM users
            WHERE id IN (
                SELECT DISTINCT(user_id) FROM characters WHERE race_id=$1
            )
        `, [race.id]);

        for (const { name } of participants.rows) {
            twitchMessages.push({
                channel: `#${name}`,
                message: `diablo.run/race/${race.id} starting in ${race.start_in} seconds!`
            });

            twitchMessages.push({
                channel: `#${name}`,
                message: `diablo.run/race/${race.id} has started!`,
                timeout: race.start_in * 1000
            });
        }
    }

    await broadcast(room, {
        room,
        action: 'race',
        payload: {
            race: {
                ...race,
                token: undefined,
                editor_token: undefined,
                points: undefined,
                finish_conditions: undefined,
                update_rules: undefined
            },
            rules: race.update_rules ? race.rules : undefined
        }
    }, twitchMessages);

    res.json(race);
});

// Get active race
async function getActiveRace () {
    const db = await getDbClient();
    const {rows} = await db.query(`
        SELECT
            id, name, slug, start_time, finish_time, description,
            finish_conditions_global,
            entry_new_character,
            entry_hero, entry_classic,
            entry_hc, entry_players,
            token
        FROM races
        WHERE active=true LIMIT 1
    `);

    return rows.length ? rows[0] : null;
}

module.exports = { router, getActiveRace };
