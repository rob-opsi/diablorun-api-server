import db from '../services/db';
import { Character, Race, RaceRule, RaceCharacter, RaceCharacterCheckpoint } from '../types';

// Find races where a character fulfils entry conditions
export async function getRacesForCharacterEntry(character: Partial<Character>): Promise<Race[]> {
  const conditions = [];

  if (character.lod) {
    conditions.push('entry_classic=false');
  } else {
    conditions.push('entry_classic=true');
  }

  if (!character.hc) {
    conditions.push('entry_hc=false');
  }

  if (character.hero) {
    conditions.push(`entry_${character.hero}=true`);
  }

  if (character.players === 1) {
    conditions.push(`(entry_players='p1' OR entry_players='px')`);
  } else if (character.players === 8) {
    conditions.push(`(entry_players='p8' OR entry_players='px')`);
  }

  const { rows } = await db.query(`SELECT * FROM races WHERE ${conditions.join(' AND ')}`);
  return rows;
}

// Add character to race
export async function insertRaceCharacter(raceId: number, characterId: number) {
  await db.query('INSERT INTO race_characters (race_id, character_id) VALUES ($1, $2)', [raceId, characterId]);
}

// Find race rules
export async function findRaceRules(query: string): Promise<RaceRule[]> {
  const { rows } = await db.query(query);
  return rows;
}

// Find race characters
export async function findRaceCharacters(query: string): Promise<RaceCharacter[]> {
  const { rows } = await db.query(query);
  return rows;
}

// Find race character checkpoints
export async function findRaceCharacterCheckpoints(query: string): Promise<RaceCharacterCheckpoint[]> {
  const { rows } = await db.query(query);
  return rows;
}
