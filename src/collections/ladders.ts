import db from '../services/db';
import { Ladder } from '../types';

// Get current ladder
export async function getCurrentLadder(): Promise<Ladder | null> {
  const time = Math.floor(Date.now()/1000);
  const { rows } = await db.query(`SELECT * FROM ladders WHERE start_time < $1 AND end_time > $1 ORDER BY id DESC LIMIT 1`, [time]);

  if (!rows.length) {
    return null;
  }

  return rows[0];
}
