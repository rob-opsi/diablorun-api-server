import db from '../services/db';
import { SpeedrunCategory } from '../types';

// Get speedrun categories
export async function getSpeedrunCategories(): Promise<SpeedrunCategory[]> {
  const { rows } = await db.query(`SELECT * FROM speedrun_categories WHERE precedence > 0 ORDER BY precedence ASC`);
  return rows;
}
