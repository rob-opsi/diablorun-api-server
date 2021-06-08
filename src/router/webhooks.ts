import { Router } from 'express';
import db from '../services/db';

export const router = Router();

// Patreon
router.post('/webhooks/patreon', async function (req, res) {
    const id = req.body.data.relationships.patron.data.id;
    const amount = req.body.data.attributes.amount_cents;

    switch (req.header('x-patreon-event')) {
        case 'pledges:create':
        case 'pledges:update':
            await db.query(`
                INSERT INTO patreon_pledges (patreon_user_id, amount_cents)
                VALUES ($1, $2)
                ON CONFLICT (patreon_user_id)
                DO UPDATE SET amount_cents=$2
            `, [id, amount]);
            break;
        case 'pledges:delete':
            await db.query(`
                DELETE FROM patreon_pledges WHERE patreon_user_id=$1
            `, [id]);
            break;
    }

    res.json({});
});

// Twitch bot data
router.get('/twitch-bot', async function (_req, res) {
        const patreons = await db.query(`
        SELECT name FROM users
        LEFT JOIN patreon_pledges ON patreon_pledges.patreon_user_id = users.patreon_id
        WHERE patreon_pledges.amount_cents > 0
    `);

    res.json({
        // commands: Object.keys(commands),
        channels: patreons.rows.map(patreon => patreon.name)
    });
});
