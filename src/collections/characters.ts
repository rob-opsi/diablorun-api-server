import db from '../services/db';

const { itemSlots } = require('@diablorun/diablorun-data');

export interface Character {
  id: number;
  name: string;
  hero: 'ama' | 'asn' | 'nec' | 'bar' | 'pal' | 'sor' | 'dru';
  hc: boolean;
  dead: boolean;

  level: number;
  experience: number;
  strength: number;
  dexterity: number;
  vitality: number;
  energy: number;

  fire_res: number;
  cold_res: number;
  light_res: number;
  poison_res: number;

  fcr: number;
  frw: number;
  fhr: number;
  ias: number;
  mf: number;

  gold: number;
  gold_stash: number;
  gold_total: number;
  inventory_tab: number;

  life: number;
  life_max: number;
  mana: number;
  mana_max: number;

  area: number;
  difficulty: 'normal' | 'nightmare' | 'hell';
  players: number;

  // computed stats
  start_time: number;
  update_time: number;
  in_game_time: number;
  seconds_played: number;

  deaths: number;
  town_visits: number;

  total_kills: number;
  undead_kills: number;
  demon_kills: number;
  unique_kills: number;
  champion_kills: number;
  animal_kills: number;

  finished_normal_quests: number;
  finished_nightmare_quests: number;
  finished_hell_quests: number;

  // race stats
  race_id: number;
  points: number;
  disqualified: boolean;
  preliminary: boolean;
  finish_time: number | null;

  // hireling stats
  hireling_name: string | null;
  hireling_class: number | null;
  hireling_level: number | null;
  hireling_experience: number | null;
  hireling_strength: number | null;
  hireling_dexterity: number | null;
  hireling_fire_res: number | null;
  hireling_cold_res: number | null;
  hireling_light_res: number | null;
  hireling_poison_res: number | null;
  hireling_skill_ids: string | null;

  // system
  lod: boolean;
  seed: number;
  seed_is_arg: boolean;

  // user info
  user_id: number;
  user_name: string;
  user_country_code: string;
  user_color: string;
  user_profile_image_url: string;
}

export interface CharacterQuest {
  character_id: number;
  difficulty: Character["difficulty"];
  quest_id: number;
  update_time: number;
}

export interface CharacterItem {
  character_id: number;
  item_id: number;
  item_hash: number;
  update_time: number;
  
  item_class: number;
  name: string;
  base_name: string;
  quality: 'white' | 'blue' | 'yellow' | 'orange' | 'gold' | 'green' | 'none';
  properties: string;

  container:  'character' | 'hireling'| 'inventory' | 'stash' | 'cube' | 'belt';
  slot: 'head' | 'amulet' | 'body_armor' | 'primary_left' | 'primary_right' | 'ring_left' | 'ring_right' | 'belt' | 'boots' | 'gloves' | 'secondary_left' | 'secondary_right' | null;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
}

export interface CharacterSnapshot {
  character: Character;
  quests: CharacterQuest[];
  items: CharacterItem[];
}

// Get character data by id
export async function getCharacterSnapshot(id: number): Promise<{ character: Character, checkpoints: any[] } | undefined> {
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
    return;
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

// Get character by name
export async function getLatestCharacterByName(userId: number, name: string): Promise<Character | undefined> {
    const characters = await db.query(`
        SELECT * FROM characters
        WHERE user_id=$1 AND name=$2 ORDER BY start_time DESC LIMIT 1
    `, [userId, name]);

    if (!characters.rows.length) {
        return;
    }

    return characters.rows[0];
}

// Get character data by id
export async function getLatestCharacterSnapshotByName(userId: number, name: string): Promise<CharacterSnapshot | undefined> {
  const character = await getLatestCharacterByName(userId, name);

  if (!character) {
    return;
  }
  
  const [items, quests] = await Promise.all([
    await db.query(`SELECT item_hash FROM character_items WHERE character_id=$1`, [character.id]),
    await db.query(`SELECT difficulty, quest_id FROM quests WHERE character_id=$1`, [character.id]),
  ]);

  return { character, items: items.rows, quests: quests.rows };
}
