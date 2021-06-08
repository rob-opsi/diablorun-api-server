import db from '../services/db';

// Get characters by query
export async function getCharacters(query: any) {
  let userId;
  let offsetFilter = '';

  if (query.user_id) {
    userId = parseInt(query.user_id);
  } else if (query.user_name) {
    const user = await db.query(`
      SELECT id FROM users WHERE LOWER(name)=$1
    `, [query.user_name]);

    if (!user.rows.length) {
      throw { status: 404, message: 'User not found' };
    }

    userId = user.rows[0].id;
  }

  if (query.offset) {
    offsetFilter = `AND characters.id < ${parseInt(query.offset)}`;
  }

  const count = await db.query(`
    SELECT COUNT(*) AS count FROM characters
    WHERE user_id=$1 AND characters.seconds_played >= 60 ${offsetFilter}
  `, [userId]);

  const characters = await db.query(`
    SELECT
      characters.*,
      users.name AS user_name,
      users.country_code AS user_country_code,
      users.dark_color_from AS user_color,
      users.profile_image_url AS user_profile_image_url
    FROM characters
    INNER JOIN users ON characters.user_id = users.id
    WHERE user_id=$1 AND characters.seconds_played >= 60 ${offsetFilter}
    ORDER BY id DESC
    LIMIT $2
  `, [
    userId,
    Math.min(parseInt(query.limit) || 30, 100)
  ]);

  return {
    data: characters.rows,
    meta: {
      more: count.rows[0].count > characters.rows.length,
      offset: characters.rows.length ? characters.rows[characters.rows.length - 1].id : 0
    }
  };
}
