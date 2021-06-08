import { Router } from 'express';
import db from '../services/db';
import * as sql from 'pg-format';
const { itemSlots } = require('@diablorun/diablorun-data');

export const router = Router();

// Get character data by id
export async function getCharacterSnapshot(id: number) {
    const [character, items, checkpoints] = await Promise.all([
    await db.query(`
      SELECT
        characters.*,
        users.name AS user_name,
        users.country_code AS user_country_code,
        users.dark_color_from AS user_color,
        users.profile_image_url AS user_profile_image_url
      FROM characters
      INNER JOIN users ON characters.user_id = users.id
      WHERE characters.id=$1
    `, [id]),
    await db.query(`
      SELECT * FROM items WHERE character_id=$1
    `, [id]),
    await db.query(`
      SELECT
        character_checkpoints.*,
        race_rules.type
      FROM character_checkpoints
      INNER JOIN race_rules ON character_checkpoints.rule_id = race_rules.id
      WHERE character_checkpoints.character_id=$1 AND race_rules.type != 'per'
      ORDER BY update_time DESC LIMIT 10
    `, [id])
  ]);

  if (!character.rows.length) {
    throw { status: 404, message: 'Character not found' };
  }

  for (const slot of itemSlots) {
    character.rows[0][slot] = null;
    character.rows[0][`hireling_${slot}`] = null;
  }

  for (const item of items.rows) {
    if (item.container === 'character') {
      character.rows[0][item.slot] = item;
    } else if (item.container === 'hireling') {
      character.rows[0][`hireling_${item.slot}`] = item;
    }
  }

  return {
    character: character.rows[0],
    checkpoints: checkpoints.rows
  };
}

// Get character by id
router.get('/characters/:id', async function (req, res) {
  try {
    res.json(await getCharacterSnapshot(parseInt(req.params.id)));
  } catch (err) {
    res.sendStatus(404);
  }
});

// Get character log by character id
const allowedLogColumns = [
  'level', 'experience',
  'strength', 'dexterity', 'vitality', 'energy',
  'fire_res', 'cold_res', 'light_res', 'poison_res',
  'fcr', 'frw', 'fhr', 'ias', 'mf',
  'life', 'life_max', 'mana', 'mana_max',
  'gold', 'gold_stash', 'gold_total',
  'deaths', 'town_visits',

  'seed', 'seed_is_arg', 'inventory_tab',
  'area', 'difficulty', 'players',
  'finished_normal_quests', 'finished_nightmare_quests', 'finished_hell_quests',

  'total_kills', 'champion_kills', 'unique_kills',
  'animal_kills', 'undead_kills', 'demon_kills',

  'hireling_name', 'hireling_class', 'hireling_skill_ids',
  'hireling_level', 'hireling_experience',
  'hireling_strength', 'hireling_dexterity',
  'hireling_fire_res', 'hireling_cold_res', 'hireling_light_res', 'hireling_poison_res'
];

router.get('/characters/:id/log', async function (req, res) {
  const columns = (req.query.columns as string || 'level,experience,gold_total').split(',').filter(
    column => allowedLogColumns.includes(column)
  );
  
  let query = sql(
    `SELECT update_time, in_game_time, ${columns} FROM characters_log WHERE character_id=%L`,
    req.params.id
  );

  if (req.query.before) {
    query += sql(' AND update_time < %L', req.query.before);
  }

  if (req.query.after) {
    query += sql(' AND update_time > %L', req.query.after);
  }
  
  query += ' ORDER BY update_time ASC';

  const log = await db.query(query);
  res.json(log.rows);
});

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

router.get('/characters', async function (req, res) {
  res.json(await getCharacters(req.query));
});

// Delete a character
router.delete('/characters/:id', async function (req, res) {
    const user = await db.query(`
    SELECT users.id, users.api_key, characters.race_id FROM characters
    INNER JOIN users ON characters.user_id = users.id
    WHERE characters.id=$1
  `, [req.params.id]);

  if (!user.rows.length || user.rows[0].api_key !== req.header('Authorization')?.split(' ')[1]) {
    res.sendStatus(401);
    return;
  }

  if (user.rows[0].race_id) {
    res.status(403);
    res.send('Character cannot be deleted because it took part in a race.');
    return;
  }

  const speedruns = await db.query(`
    SELECT COUNT(*) FROM speedruns WHERE character_id=$1
  `, [req.params.id]);

  if (speedruns.rows[0].count > 0) {
    res.status(403);
    res.send('Character cannot be deleted because it is linked to a speedrun.');
    return;
  }

  await db.query(`DELETE FROM items WHERE character_id=$1`, [req.params.id]);
  await db.query(`DELETE FROM quests WHERE character_id=$1`, [req.params.id]);
  await db.query(`DELETE FROM characters WHERE id=$1`, [req.params.id]);

  res.sendStatus(200);
});
