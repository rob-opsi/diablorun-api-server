import { Router } from 'express';
import db from '../services/db';
import { getUserByName } from '../collections/users';

export const router = Router();

// Get latest character snapshot by user name
router.get('/snapshots/users/:name', async function (req, res) {
  const user = await getUserByName(req.params.name);

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  const characters = await db.query(`
      SELECT
        characters.*,
        users.name AS user_name,
        users.country_code AS user_country_code,
        users.dark_color_from AS user_color,
        users.profile_image_url AS user_profile_image_url
      FROM characters
      INNER JOIN users ON characters.user_id = users.id
      WHERE characters.user_id=$1 ORDER BY characters.update_time DESC LIMIT 1
    `, [user.id])

  if (!characters.rows.length) {
    throw { status: 404, message: 'Character not found' };
  }

  const character = characters.rows[0];
  const [items, quests] = await Promise.all([
    await db.query(`SELECT * FROM character_items WHERE character_id=$1`, [character.id]),
    await db.query(`SELECT update_time, difficulty, quest_id FROM quests WHERE character_id=$1`, [character.id]),
  ]);

  res.json({ character, items: items.rows, quests: quests.rows });
});

// Get character snapshot by id
router.get('/snapshots/characters/:id', async function (req, res) {
  const characters = await db.query(`
      SELECT
        characters.*,
        users.name AS user_name,
        users.country_code AS user_country_code,
        users.dark_color_from AS user_color,
        users.profile_image_url AS user_profile_image_url
      FROM characters
      INNER JOIN users ON characters.user_id = users.id
      WHERE characters.id=$1
    `, [req.params.id])

  if (!characters.rows.length) {
    throw { status: 404, message: 'Character not found' };
  }

  const character = characters.rows[0];
  const [items, quests] = await Promise.all([
    await db.query(`SELECT * FROM character_items WHERE character_id=$1`, [character.id]),
    await db.query(`SELECT update_time, difficulty, quest_id FROM quests WHERE character_id=$1`, [character.id]),
  ]);

  res.json({ character, items: items.rows, quests: quests.rows });
});
