import db from '../services/db';
import { Bounty } from '../types';

// Get all bounties
export async function getBounties(): Promise<Bounty[]> {
  const { rows } = await db.query(`
    SELECT
      bounties.*,

      author.name AS author_name,
      author.country_code AS author_country_code,
      author.dark_color_from AS author_color,
      author.profile_image_url AS author_profile_image_url,

      claimed_character.name AS claimed_character_name,
      claimed_character.hero AS claimed_character_hero,
      claimed_character.hc AS claimed_character_hc,

      claimed_user.id AS claimed_user_id,
      claimed_user.name AS claimed_user_name,
      claimed_user.country_code AS claimed_user_country_code,
      claimed_user.dark_color_from AS claimed_user_color,
      claimed_user.profile_image_url AS claimed_user_profile_image_url

    FROM bounties
    LEFT OUTER JOIN "users" author ON bounties.author_user_id = author.id
    LEFT OUTER JOIN "characters" claimed_character ON bounties.claimed_character_id = claimed_character.id
    LEFT OUTER JOIN "users" claimed_user ON claimed_character.user_id = claimed_user.id
  `);

  return rows.map(row => ({
    ...row,

    author_user: {
      id: row.author_user_id,
      name: row.author_name,
      country_code: row.author_country_code,
      color: row.author_color,
      profile_image_url: row.author_profile_image_url
    },

    claimed_character: row.claimed_character_id ? {
      id: row.claimed_character_id,
      name: row.claimed_character_name,
      hero: row.claimed_character_hero,
      hc: row.claimed_character_hc,

      user_id: row.claimed_user_id,
      user_name: row.claimed_user_name,
      user_country_code: row.claimed_user_country_code,
      user_color: row.claimed_user_color,
      user_profile_image_url: row.claimed_user_profile_image_url
    } : null,

    author_id: undefined,
    author_name: undefined,
    author_country_code: undefined,
    author_color: undefined,
    author_profile_image_url: undefined,

    claimed_character_id: undefined,
    claimed_character_name: undefined,
    claimed_character_hero: undefined,
    claimed_character_hc: undefined,

    claimed_user_id: undefined,
    claimed_user_name: undefined,
    claimed_user_country_code: undefined,
    claimed_user_color: undefined,
    claimed_user_profile_image_url: undefined
  }));
}
