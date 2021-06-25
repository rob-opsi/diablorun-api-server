import db from '../services/db';
import { Bounty } from '../types';

// Get all bounties
export async function getBounties(): Promise<Bounty[]> {
  const { rows } = await db.query(`SELECT * FROM bounties`);
  return rows;
}
