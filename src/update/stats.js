const { heroes, areas, difficulties } = require('@diablorun/diablorun-data');

const STATS = {
  area: (_, { Area }) => Area,
  difficulty: (_, { Difficulty }) => (Difficulty === undefined) ? undefined : difficulties[Difficulty],
  players: (_, { PlayersX }) => PlayersX,
  hero: (_, { CharClass }) => (CharClass === undefined) ? undefined : heroes[CharClass].id,
  hc: (_, { IsHardcore }) => IsHardcore,
  lod: (_, { IsExpansion }) => IsExpansion,
  dead: (_, { IsDead }) => IsDead,
  deaths: (_, { Deaths }) => Deaths,
  level: (_, { Level }) => Level,
  experience: (_, { Experience }) => {
    if (Experience && Experience < 0) {
      return Experience + Math.pow(2, 32);
    }
    
    return Experience;
  },
  strength: (_, { Strength }) => Strength,
  dexterity: (_, { Dexterity }) => Dexterity,
  vitality: (_, { Vitality }) => Vitality,
  energy: (_, { Energy }) => Energy,
  fire_res: (_, { FireResist }) => FireResist,
  cold_res: (_, { ColdResist }) => ColdResist,
  light_res: (_, { LightningResist }) => LightningResist,
  poison_res: (_, { PoisonResist }) => PoisonResist,
  gold: (_, { Gold }) => Gold,
  gold_stash: (_, { GoldStash }) => GoldStash,
  fcr: (_, { FasterCastRate }) => FasterCastRate,
  frw: (_, { FasterRunWalk }) => FasterRunWalk,
  fhr: (_, { FasterHitRecovery }) => FasterHitRecovery,
  ias: (_, { IncreasedAttackSpeed }) => IncreasedAttackSpeed,
  mf: (_, { MagicFind }) => MagicFind,
  life: (_, { Life }) => Life,
  life_max: (_, { LifeMax }) => LifeMax,
  mana: (_, { Mana }) => Mana,
  mana_max: (_, { ManaMax }) => ManaMax,
  seed: (_, { Seed }) => Seed,
  seed_is_arg: (_, { SeedIsArg }) => SeedIsArg,
  gold_total: ({ gold, gold_stash }, { Gold, GoldStash }) => {
    if (Gold === undefined && GoldStash === undefined) {
      return undefined;
    }

    return ((Gold === undefined) ? (gold || 0) : Gold) +
           ((GoldStash === undefined) ? (gold_stash || 0) : GoldStash);
  },
  seconds_played: ({ start_time, finish_time }, { Time }) => {
    if (!start_time) {
      return 0;
    }

    if (finish_time && finish_time < Time) {
      return finish_time - start_time;
    }

    return Time - start_time;
  },
  in_game_time: ({ update_time, in_game_time }, { Time }) => {
    const diff = Time - (update_time || Time);

    if (diff < 60) {
      return (in_game_time || 0) + diff;
    }

    return undefined;
  },
  town_visits: ({ town_visits, area }, { Area }) => {
    if ((!areas[area] || !areas[area].town) && (areas[Area] && areas[Area].town)) {
      return (town_visits || 0) + 1;
    }

    return undefined;
  },
  inventory_tab: (_, { InventoryTab }) => InventoryTab,
  // Hireling
  hireling_name: (_, { Hireling }) => Hireling ? Hireling.Name : undefined,
  hireling_class: (_, { Hireling }) => Hireling ? Hireling.Class : undefined,
  hireling_level: (_, { Hireling }) => Hireling ? Hireling.Level : undefined,
  hireling_experience: (_, { Hireling }) => Hireling ? Hireling.Experience : undefined,
  hireling_strength: (_, { Hireling }) => Hireling ? Hireling.Strength : undefined,
  hireling_dexterity: (_, { Hireling }) => Hireling ? Hireling.Dexterity : undefined,
  hireling_fire_res: (_, { Hireling }) => Hireling ? Hireling.FireResist : undefined,
  hireling_cold_res: (_, { Hireling }) => Hireling ? Hireling.ColdResist : undefined,
  hireling_light_res: (_, { Hireling }) => Hireling ? Hireling.LightningResist : undefined,
  hireling_poison_res: (_, { Hireling }) => Hireling ? Hireling.PoisonResist : undefined,
  hireling_skill_ids: (_, { Hireling }) => (Hireling && Hireling.SkillIds) ? JSON.stringify(Hireling.SkillIds) : undefined,
  // Kill counters
  total_kills: ({ total_kills }, { KilledMonsters }) => {
    if (KilledMonsters && KilledMonsters.length) {
      return total_kills + KilledMonsters.length;
    }

    return undefined;
  },
  animal_kills: ({ animal_kills }, { KilledMonsters }) => {
    if (!KilledMonsters) {
      return undefined;
    }

    const count = KilledMonsters.filter(m => m.Type === 0).length;

    if (count) {
      return animal_kills + count;
    }

    return undefined;
  },
  undead_kills: ({ undead_kills }, { KilledMonsters }) => {
    if (!KilledMonsters) {
      return undefined;
    }

    const count = KilledMonsters.filter(m => m.Type === 2).length;

    if (count) {
      return undead_kills + count;
    }

    return undefined;
  },
  demon_kills: ({ demon_kills }, { KilledMonsters }) => {
    if (!KilledMonsters) {
      return undefined;
    }

    const count = KilledMonsters.filter(m => m.Type === 1).length;

    if (count) {
      return demon_kills + count;
    }

    return undefined;
  },
  champion_kills: ({ champion_kills }, { KilledMonsters }) => {
    if (!KilledMonsters) {
      return undefined;
    }

    const count = KilledMonsters.filter(m => m.TypeFlags & 0x00000004).length;

    if (count) {
      return champion_kills + count;
    }

    return undefined;
  },
  unique_kills: ({ unique_kills }, { KilledMonsters }) => {
    if (!KilledMonsters) {
      return undefined;
    }

    const count = KilledMonsters.filter(m => m.TypeFlags & 0x00000008).length;

    if (count) {
      return unique_kills + count;
    }

    return undefined;
  },
};

module.exports = { STATS };
