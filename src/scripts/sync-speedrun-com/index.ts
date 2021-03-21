import { config } from 'dotenv';
config();

import db from '../../services/db';
import * as sqlFormat from 'pg-format';
import * as speedrunCom from './speedrun-com';
import { Speedrun, SpeedrunUser } from 'src/collections/speedruns';

async function run() {
    await db.connect();

    // Get speedrun.com sync offset
    const res = await db.query('SELECT MAX(speedrun_offset) AS offset FROM speedruns');
    let offset = res.rows[0].offset ? (res.rows[0].offset + 1) : 0;
    offset = 0;

    // Fetch speedrun.com runs
    const speedruns: Speedrun[] = [];
    const userIds = new Set<string>();
    const characterIds = new Set<number>();

    while (1) {
        console.log(`[INFO] Fetching speedrun.com runs from offset ${offset}...`);
        const { data, more, nextOffset } = await speedrunCom.fetchRuns(offset);

        for (const run of data) {
            if (run.speedrun_user_id) {
                userIds.add(run.speedrun_user_id);
            }

            if (run.character_id) {
                characterIds.add(run.character_id);
            }

            speedruns.push(run);
        }

        offset = nextOffset;

        if (!more) {
            break;
        }
    }

    // Fetch speedrun.com users
    console.log('[INFO] Fetching speedrun.com users...');
    const speedrunUsers = await speedrunCom.fetchUsers(Array.from(userIds));

    // Save users
    console.log('[INFO] Saving users...');
    
    await Promise.all(speedrunUsers.map(async user => {
        const keys = Object.keys(user) as (keyof SpeedrunUser)[];
        const values = keys.map(key => user[key]);

        await db.query(sqlFormat(`
            INSERT INTO speedrun_users (${keys}) VALUES (${keys.map((_, i) => `%${i + 1}$L`)})
            ON CONFLICT (id) DO UPDATE SET ${keys.map((key, i) => `${key}=%${i + 1}$L`)}
        `, ...values));
    }));

    // Save runs
    console.log('[INFO] Saving runs...');

    await Promise.all(speedruns.map(async speedrun => {
        const keys = Object.keys(speedrun) as (keyof Speedrun)[];
        const values = keys.map(key => speedrun[key]);

        await db.query(sqlFormat(`
            INSERT INTO speedruns (${keys}) VALUES (${keys.map((_, i) => `%${i + 1}$L`)})
            ON CONFLICT (speedrun_id) DO UPDATE SET ${keys.map((key, i) => `${key}=%${i + 1}$L`)}
        `, ...values));
    }));

    await db.end();
}

run();
