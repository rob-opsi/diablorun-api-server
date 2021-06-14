import db from '../services/db';
import { SpeedrunCategory } from '../types';

// Get speedrun category by id
export async function getSpeedrunCategory(id: number): Promise<SpeedrunCategory | null> {
  const { rows } = await db.query(`SELECT * FROM speedrun_categories WHERE id=$1`, [id]);

  if (!rows.length) {
    return null;
  }
  
  return rows[0];
}

// Get speedrun categories
export async function getSpeedrunCategories(): Promise<SpeedrunCategory[]> {
  const { rows } = await db.query(`SELECT * FROM speedrun_categories WHERE precedence > 0 ORDER BY precedence ASC`);
  return rows;
}
