import db from '../services/db';
import { getCharacterSnapshot } from './characters';

export interface User {
    id: number;
    login: string;
    name: string;
    country_code: string;
    color: string;
    profile_image_url: string;
}

// Get user by clause
async function getUserByClause(clause: string, values?: any[]): Promise<User | undefined> {
    const user = await db.query(`
    SELECT
      id,
      name,
      country_code,
      dark_color_from AS color,
      profile_image_url
    FROM users WHERE ${clause}
  `, values);

    if (!user.rows.length) {
        return;
    }

    return user.rows[0];
}

// Get user by api key
export async function getUserByApiKey(apiKey: string) {
    return await getUserByClause('api_key=$1', [apiKey]);
}

// Get user by name or channel id
export async function getUserByName(name: string) {
    return await getUserByClause('login=$1 OR twitch_id=$1', [name.toLowerCase()]);
}

// Get user's last updated character snapshot
export async function getLastUpdatedCharacterSnapshot(userId: number) {
    const lastUpdatedCharacter = await db.query(`
    SELECT id FROM characters
    WHERE user_id=$1 ORDER BY update_time DESC LIMIT 1
  `, [userId]);

    if (!lastUpdatedCharacter.rows.length) {
        return;
    }

    return await getCharacterSnapshot(lastUpdatedCharacter.rows[0].id);
}
