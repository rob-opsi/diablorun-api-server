const moment = require('moment');
const millify = require('millify').default;
const data = require('@diablorun/diablorun-data');
const { getDbClient } = require('./db');
const { getUserByName } = require('./users');
const { getLastUpdatedCharacter } = require('./users');

async function getCharacterByUsername(username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    return await getLastUpdatedCharacter(user.id); 
}

async function itemCommand(slot, username) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    if (character[slot]) {
        return `${character[slot].name}: ${JSON.parse(character[slot].properties).join(', ')}`;
    } else {
        return `Nothing in ${slot}`;
    }
}

exports['!gear'] = async function (username) {
    return `diablo.run/${username}/@`;
};

exports['!character'] = async function (username) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    return `diablo.run/${username}/${character.name}${character.id}`;
};

exports['!race'] = async function (username) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character || !character.race_id) {
      return;
    }

    return `diablo.run/race/${character.race_id}`;
};

exports['!towns'] = async function (username) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    return `${character.name} has gone to town ${character.town_visits} times`;
};

exports['!merc'] = async function (username) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    const act = data.hirelings[character.hireling_class];
    const skills = JSON.parse(character.hireling_skill_ids)
      .map(id => data.skills[id]).join(' and ');

    return `${character.hireling_name} is a level ${character.hireling_level} hireling from ${act} using ${skills}`;
};

exports['!exp'] = async function (username, args) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    const interval = args[0] || 'hour';
    const seconds = moment.duration(1, interval).asSeconds();
    const inGameTime = character.in_game_time - seconds;

    const db = await getDbClient();
    const log = await db.query(`
      SELECT in_game_time, value FROM stats_log
      WHERE character_id=$1 AND stat=$2 AND in_game_time >= $3
      ORDER BY in_game_time ASC LIMIT 1
    `, [character.id, 'experience', inGameTime]);

    if (!log.rows.length) {
        return;
    }
    
    const gain = character.experience - log.rows[0].value;
    const time = character.in_game_time - log.rows[0].in_game_time;
    let message = `${millify(gain)} exp in ${moment.duration(time, 'seconds').humanize()}`;

    if (character.level < 99) {
        const expToLevel = data.levelExperience[character.level] - character.experience;
        const timeToLevel = time * expToLevel / gain;
        const h = Math.floor(timeToLevel / 3600);
        const m = Math.floor((timeToLevel % 3600) / 60);
        const s = Math.floor(timeToLevel % 60);

        message += `, level ${character.level + 1} in`;

        if (h) message += ` ${h}h`;
        if (m) message += ` ${m}m`;
        if (s) message += ` ${s}s`;
    }

    return message;
};

exports['!gold'] = async function (username, args) {
    const { character } = await getCharacterByUsername(username);
    
    if (!character) {
      return;
    }

    const interval = args[0] || 'hour';
    const seconds = moment.duration(1, interval).asSeconds();
    const inGameTime = character.in_game_time - seconds;

    const db = await getDbClient();
    const log = await db.query(`
      SELECT in_game_time, value FROM stats_log
      WHERE character_id=$1 AND stat=$2 AND in_game_time >= $3
      ORDER BY in_game_time ASC LIMIT 1
    `, [character.id, 'gold_total', inGameTime]);

    if (!log.rows.length) {
        return;
    }

    const gain = character.gold_total - log.rows[0].value;
    const humanizedDuration = moment.duration(character.in_game_time - log.rows[0].in_game_time, 'seconds').humanize(true);

    return `${millify(gain)} gold ${humanizedDuration}`;
};

exports['!head'] = itemCommand.bind(exports, 'head');
exports['!amulet'] = itemCommand.bind(exports, 'amulet');
exports['!body_armor'] = itemCommand.bind(exports, 'body_armor');
exports['!primary_left'] = itemCommand.bind(exports, 'primary_left');
exports['!primary_right'] = itemCommand.bind(exports, 'primary_right');
exports['!ring_left'] = itemCommand.bind(exports, 'ring_left');
exports['!ring_right'] = itemCommand.bind(exports, 'ring_right');
exports['!belt'] = itemCommand.bind(exports, 'belt');
exports['!boots'] = itemCommand.bind(exports, 'boots');
exports['!gloves'] = itemCommand.bind(exports, 'gloves');
exports['!secondary_left'] = itemCommand.bind(exports, 'secondary_left');
exports['!secondary_right'] = itemCommand.bind(exports, 'secondary_right');
exports['!hireling_head'] = itemCommand.bind(exports, 'hireling_head');
exports['!hireling_body_armor'] = itemCommand.bind(exports, 'hireling_body_armor');
exports['!hireling_primary_left'] = itemCommand.bind(exports, 'hireling_primary_left');
exports['!hireling_primary_right'] = itemCommand.bind(exports, 'hireling_primary_right');

exports['!deaths'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const result = await db.query(`
        SELECT SUM(deaths) AS total FROM characters
        WHERE user_id=$1
    `, [user.id]);

    return `${username} has ${result.rows[0].total} total deaths`;
};

exports['!classes'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const stats = await db.query(`
        SELECT hero, COUNT(*) AS count FROM characters
        WHERE user_id=$1 GROUP BY hero
    `, [user.id]);

    const rows = stats.rows.filter(s => s.hero);
    const total = rows.reduce((t, row) => t + parseInt(row.count), 0);
    const values = rows.map(
        row => `${Math.round(parseInt(row.count) / total * 100)}% ${row.hero}`
    );

    return values.join(', ');
};

exports['!core'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const stats = await db.query(`
          SELECT hc, COUNT(*) AS count FROM characters
          WHERE user_id=$1 GROUP BY hc
        `, [user.id]);

    const rows = stats.rows.filter(row => row.hc !== null).map(row => ({
        count: parseInt(row.count),
        value: row.hc ? 'hc' : 'sc'
    }));

    const total = rows.reduce((t, row) => t + row.count, 0);
    const values = rows.map(
        row => `${Math.round(row.count / total * 100)}% ${row.value}`
    );

    return values.join(', ');
};

exports['!levels'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const stats = await db.query(`
          SELECT
            COUNT(CASE WHEN level <= 17 THEN 1 ELSE NULL END) AS "1-17",
            COUNT(CASE WHEN level > 17 AND level <= 21 THEN 1 ELSE NULL END) AS "18-21",
            COUNT(CASE WHEN level > 21 THEN 1 ELSE NULL END) AS "22+"
          FROM characters wHERE user_id=$1
        `, [user.id]);

    const rows = [
        { count: parseInt(stats.rows[0]['1-17']), value: '1-17' },
        { count: parseInt(stats.rows[0]['18-21']), value: '18-21' },
        { count: parseInt(stats.rows[0]['22+']), value: '22+' }
    ];

    const total = rows.reduce((t, row) => t + row.count, 0);
    const values = rows.map(
        row => `${Math.round(row.count / total * 100)}% ${row.value}`
    );

    return values.join(', ');
};

exports['!hcdead'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const result = await db.query(`
          SELECT AVG(level) FROM characters
          WHERE user_id=$1 AND dead AND hc
        `, [user.id]);

    return `On average, ${user.name} dies at level ${Math.round(result.rows[0].avg * 10) / 10} in HC`;
};

exports['!hcwhere'] = async function (username) {
    const user = await getUserByName(username);

    if (!user) {
      return;
    }

    const db = await getDbClient();
    const result = await db.query(`
          WITH t AS (
            SELECT area, COUNT(*) FROM characters
            WHERE user_id=$1 AND dead AND hc GROUP BY area
          )
          SELECT * FROM t ORDER BY count DESC LIMIT 5
        `, [user.id]);

    let values = result.rows.map(
        row => `${row.count} in ${data.areas[row.area].name}`
    );

    return `Common HC deaths: ${values.join(', ')}`;
};

// Recipes (runewords and crafting)
async function addRecipeCommand(cmd, message) {
    exports[`!${cmd}`] = async () => message;
}

// Runewords
addRecipeCommand("ancient's pledge", "Ancient's Pledge: Ral + Ort + Tal (Shields)");
addRecipeCommand("black", "Black: Thul + Io + Nef (Clubs/Hammers/Maces)");
addRecipeCommand("fury", "Fury: Jah + Gul + Eth (Melee Weapons)");
addRecipeCommand("holy thunder", "Holy Thunder: Eth + Ral + Ort + Tal (Scepters)");
addRecipeCommand("honor", "Honor: Amn + El + Ith + Tir + Sol (Melee Weapons)");
addRecipeCommand("king's grace", "King's Grace: Amn + Ral + Thul (Swords/Scepters)");
addRecipeCommand("leaf", "Leaf: Tir + Ral (Staves)");
addRecipeCommand("lionheart", "Lionheart: Hel + Lum + Fal (Body Armor)");
addRecipeCommand("lore", "Lore: Ort + Sol (Helms)");
addRecipeCommand("malice", "Malice: Ith + El + Eth (Melee Weapons)");
addRecipeCommand("melody", "Melody: Shael + Ko + Nef (Missile Weapons)");
addRecipeCommand("memory", "Memory: Lum + Io + Sol + Eth (Staves)");
addRecipeCommand("nadir", "Memory: Nef + Tir (Helms)");
addRecipeCommand("radiance", "Radiance: Nef + Sol + Ith (Helms)");
addRecipeCommand("rhyme", "Rhyme: Shael + Eth (Shields)");
addRecipeCommand("silence", "Silence: Dol + Eld + Hel + Ist + Tir + Vex (Weapons)");
addRecipeCommand("smoke", "Smoke: Nef + Lum (Body Armor)");
addRecipeCommand("stealth", "Stealth: Tal + Eth (Body Armor)");
addRecipeCommand("steel", "Steel: Tir + El (Swords/Axes/Maces)");
addRecipeCommand("strength", "Strength: Amn + Tir (Melee Weapons)");
addRecipeCommand("venom", "Venom: Tal + Dol + Mal (Weapons)");
addRecipeCommand("wealth", "Wealth: Lem + Ko + Tir (Body Armor)");
addRecipeCommand("white", "White: Dol + Io (Wand)");
addRecipeCommand("zephyr", "White: Ort + Eth (Missile Weapons)");
addRecipeCommand("beast", "Beast: Ber + Tir + Um + Mal + Lum (Axes/Scepters/Hammers)");
addRecipeCommand("bramble", "Bramble: Ral + Ohm + Sur + Eth (Body Armor)");
addRecipeCommand("botd", "Breath of the Dying: Vex + Hel + El + Eld + Zod + Eth (Weapons)");
addRecipeCommand("cta", "Call To Arms: Amn + Ral + Mal + Ist + Ohm (Weapons)");
addRecipeCommand("coh", "Chains of Honor: Dol + Um + Ber + Ist (Body Armor)");
addRecipeCommand("chaos", "Chaos: Fal + Ohm + Um (Claws)");
addRecipeCommand("crescent moon", "Crescent Moon: Shael + Um + Tir (Axes/Swords/Polearms)");
addRecipeCommand("delirium", "Delirium: Lem + Ist + Io (Helms)");
addRecipeCommand("duress", "Duress: Shael + Um + Thul (Body Armor)");
addRecipeCommand("enigma", "Enigma: Jah + Ith + Ber (Body Armor)");
addRecipeCommand("eternity", "Eternity: Amn + Ber + Ist + Sol + Sur (Melee Weapons)");
addRecipeCommand("exile", "Exile: Fal + Ohm + Ort + Jah (Axes/Hammers)");
addRecipeCommand("gloom", "Gloom: Fal + Um + Pul (Body Armor)");
addRecipeCommand("hand of justice", "Hand of Justice: Sur + Cham + Amn + Lo (Weapons)");
addRecipeCommand("hoto", "Heart of the Oak: Ko + Vex + Pul + Thul (Staves/Maces)");
addRecipeCommand("doom", "Doom: Hel + Ohm + Um + Lo + Cham (Axes/Polearms/Hammers)");
addRecipeCommand("kingslayer", "Kingslayer: Mal + Um + Gul + Fal (Swords/Axes)");
addRecipeCommand("passion", "Passion: Dol + Ort + Eld + Lem (Weapons)");
addRecipeCommand("prudence", "Prudence: Mal + Tir (Body Armor)");
addRecipeCommand("sanctuary", "Sanctuary: Ko + Ko + Ma (Shields)");
addRecipeCommand("splendor", "Splendor: Eth + Lum (Shields)");
addRecipeCommand("stone", "Stone: Shael + Um + Pul + Lum (Body Armor)");
addRecipeCommand("wind", "Wind: Sur + El (Melee Weapons)");
addRecipeCommand("brand", "Brand: Jah + Lo + Mal + Gul (Missile Weapons, Ladder)");
addRecipeCommand("death", "Death: Hel + El + Vex + Ort + Gul (Swords/Axes, Ladder)");
addRecipeCommand("destruction", "Destruction: Vex + Lo + Ber + Jah + Ko (Polearms/Swords, Ladder)");
addRecipeCommand("dragon", "Dragon: Sur + Lo + Sol (Body Armor/Shields, Ladder)");
addRecipeCommand("dream", "Dream: Io + Jah + Pul (Helms/Shields, Ladder)");
addRecipeCommand("edge", "Edge: Tir + Tal + Amn (Missile Weapons, Ladder)");
addRecipeCommand("faith", "Faith: Ohm + Jah + Lem + Eld (Missile Weapons, Ladder)");
addRecipeCommand("fortitude", "Fortitude: El + Sol + Dol + Lo (Weapons/Body Armor, Ladder)");
addRecipeCommand("grief", "Grief: Eth + Tir + Lo + Mal + Ral (Swords/Axes, Ladder)");
addRecipeCommand("plague", "Plague: Cham + Fal + Um (Weapons, Disabled)");
addRecipeCommand("harmony", "Harmony: Tir + Ith + Sol + Ko (Missile Weapons, Ladder)");
addRecipeCommand("ice", "Ice: Amn + Shael + Jah + Lo (Missile Weapons, Ladder)");
addRecipeCommand("infinity", "Infinity:  	Ber + Mal + Ber + Ist (Polearms, Ladder)");
addRecipeCommand("insight", "Insight: Ral + Tir + Tal + Sol (Polearms/Staves, Ladder)");
addRecipeCommand("last wish", "Last Wish: Jah + Mal + Jah + Sur + Jah + Ber (Swords/Hammers/Axes, Ladder)");
addRecipeCommand("lawbringer", "Lawbringer: Amn + Lem + Ko (Swords/Hammers/Scepters, Ladder)");
addRecipeCommand("oath", "Oath: Eth + Tir + Lo + Mal + Ral (Swords/Axes/Maces, Ladder)");
addRecipeCommand("obedience", "Obedience: Hel + Ko + Thul + Eth + Fal (Polearms, Ladder)");
addRecipeCommand("phoenix", "Phoenix: Vex + Vex + Lo + Jah (Weapons/Shields, Ladder)");
addRecipeCommand("pride", "Pride: Cham + Sur + Io + Lo (Polearms, Ladder)");
addRecipeCommand("rift", "Rift: Hel + Ko + Lem + Gul (Polearms/Scepters, Ladder)");
addRecipeCommand("spirit", "Spirit: Tal + Thul + Ort + Amn (Swords/Shields, Ladder)");
addRecipeCommand("voice of reason", "Voice of Reason: Lem + Ko + El + Eld (Swords/Maces, Ladder)");
addRecipeCommand("wrath", "Wrath: Pul + Lum + Ber + Mal (Missile Weapons, Ladder)");
addRecipeCommand("bone", "Bone: Sol + Um + Um (Body Armor)");
addRecipeCommand("enlightenment", "Enlightenment: Pul + Ral + Sol (Body Armor)");
addRecipeCommand("myth", "Myth: Hel + Amn + Nef (Body Armor)");
addRecipeCommand("peace", "Peace: Shael + Thul + Amn (Body Armor)");
addRecipeCommand("principle", "Principle: Ral + Gul + Eld (Body Armor)");
addRecipeCommand("rain", "Rain: Ort + Mal + Ith (Body Armor)");
addRecipeCommand("treachery", "Treachery: Shael + Thul + Lem (Body Armor)");

// Crafting
addRecipeCommand("blood helm", "Helm/Casque/Armet + Ral + Ruby + Jewel");
addRecipeCommand("blood boots", "Light Plated/Battle/Mirrored Boots + Eth + Ruby + Jewel");
addRecipeCommand("blood gloves", "Heavy/Sharkskin/Vampirebone Gloves + Nef + Ruby + Jewel");
addRecipeCommand("blood belt", "Belt/Mesh Belt/Mithril Coil + Tal + Ruby + Jewel");
addRecipeCommand("blood shield", "Spiked Shield/Barbed Shield/Blade Barrier + Ith + Ruby + Jewel");
addRecipeCommand("blood armor", "Plate Mail/Templar Coat/Hellforge Plate + Thul + Ruby + Jewel");
addRecipeCommand("blood amulet", "Magic Amulet + Amn + Ruby + Jewel");
addRecipeCommand("blood ring", "Magic Ring + Sol + Ruby + Jewel");
addRecipeCommand("blood weapon", "Normal/Exceptional/Elite Axe + Ort + Ruby + Jewel");
addRecipeCommand("caster helm", "Mask/Death Mask/Demonhead + Nef + Amethyst + Jewel");
addRecipeCommand("caster boots", "Boots/Demonhide/Wyrmhide Boots + Thul + Amethyst + Jewel");
addRecipeCommand("caster gloves", "Leather Gloves/Demonhide Gloves/Bramble Mitts + Ort + Amethyst + Jewel");
addRecipeCommand("caster belt", "Light/Sharkskin/Vampirefang Belt + Ith + Amethyst + Jewel");
addRecipeCommand("caster shield", "Small Shield/Round Shield/Luna + Eth + Amethyst + Jewel");
addRecipeCommand("caster armor", "Light/Mage/Archon Plate + Tal + Amethyst + Jewel");
addRecipeCommand("caster amulet", "Magic Amulet + Amn + Amethyst + Jewel");
addRecipeCommand("caster ring", "Magic Ring + Ral + Amethyst + Jewel");
addRecipeCommand("caster weapon", "Any Scepter, Wand or Staff + Amn + Amethyst + Jewel");
addRecipeCommand("safety helm", "Crown/Grand Crown/Corona + Ith + Emerald + Jewel");
addRecipeCommand("safety boots", "Greaves/War/Myrmidon Boots + Ort + Emerald + Jewel");
addRecipeCommand("safety gloves", "Gauntlets/War/Ogre Gauntlets + Ral + Emerald + Jewel");
addRecipeCommand("safety belt", "Sash/Demonhide/Spiderweb Sash + Tal + Emerald + Jewel");
addRecipeCommand("safety shield", "Kite/Dragon/Monarch + Nef + Emerald + Jewel");
addRecipeCommand("safety armor", "Breast Plate/Cuirass/Great Hauberk + Eth + Emerald + Jewel");
addRecipeCommand("safety amulet", "Magic Amulet + Thul + Emerald + Jewel");
addRecipeCommand("safety ring", "Magic Ring + Amn + Emerald + Jewel");
addRecipeCommand("safety weapon", "Any Spear or Javelin + Sol + Emerald + Jewel");
addRecipeCommand("hit helm", "Full Helm/Basinet/Giant Conch + Ith + Sapphire + Jewel");
addRecipeCommand("hit boots", "Chain/Mesh/Boneweave Boots + Ral + Sapphire + Jewel");
addRecipeCommand("hit gloves", "Chain Gloves/Heavy Bracers/Vambraces + Ort + Sapphire + Jewel");
addRecipeCommand("hit belt", "Heavy/Battle/Troll Belt + Tal + Sapphire + Jewel");
addRecipeCommand("hit shield", "Gothic/Ancient/Ward + Eth + Sapphire + Jewel");
addRecipeCommand("hit armor", "Field Plate/Sharktooth Armor/Kraken Shell + Nef + Sapphire + Jewel");
addRecipeCommand("hit amulet", "Magic Amulet + Thul + Sapphire + Jewel");
addRecipeCommand("hit ring", "Magic Ring + Amn + Sapphire + Jewel");
addRecipeCommand("hit weapon", "Any Blunt Weapon + Tir + Sapphire + Jewel");

// Rune Upgrades
addRecipeCommand("eld", "Eld: 3 El");
addRecipeCommand("tir", "Tir: 3 Eld");
addRecipeCommand("nef", "Nef: 3 Tir");
addRecipeCommand("eth", "Eth: 3 Nef");
addRecipeCommand("ith", "Ith: 3 Eth");
addRecipeCommand("tal", "Tal: 3 Ith");
addRecipeCommand("ral", "Ral: 3 Tal");
addRecipeCommand("ort", "Ort: 3 Ral");
addRecipeCommand("thul", "Thul: 3 Ort");
addRecipeCommand("amn", "Amn: 3 Thul + Chipped Topaz");
addRecipeCommand("sol", "Sol: 3 Amn  + Chipped Amethyst");
addRecipeCommand("shael", "Shael: 3 Sol + Chipped Sapphire");
addRecipeCommand("dol", "Dol: 3 Shael + Chipped Ruby");
addRecipeCommand("hel", "Hel: 3 Dol + Chipped Emerald");
addRecipeCommand("io", "Io: 3 Hel + Chipped Diamond");
addRecipeCommand("lum", "Lum: 3 Io + Flawed Topaz");
addRecipeCommand("ko", "Ko: 3 Lum + Flawed Amethyst");
addRecipeCommand("fal", "Fal: 3 Ko + Flawed Sapphire");
addRecipeCommand("lem", "Lem: 3 Fal + Flawed Ruby");
addRecipeCommand("pul", "Pul: 3 Lem + Flawed Emerald");
addRecipeCommand("um", "Um: 2 Pul + Flawed Diamond");
addRecipeCommand("mal", "Mal: 2 Um + Topaz");
addRecipeCommand("ist", "Ist: 2 Mal + Amethyst");
addRecipeCommand("gul", "Gul: 2 Ist + Sapphire");
addRecipeCommand("vex", "Vex: 2 Gul + Ruby");
addRecipeCommand("ohm", "Ohm: 2 Vex + Emerald");
addRecipeCommand("lo", "Lo: 2 Ohm + Diamond");
addRecipeCommand("sur", "Sur: 2 Lo + Flawless Topaz");
addRecipeCommand("ber", "Ber: 2 Sur + Flawless Amethyst");
addRecipeCommand("jah", "Jah: 2 Ber + Flawless Sapphire");
addRecipeCommand("cham", "Cham: 2 Jah + Flawless Ruby");
addRecipeCommand("zod", "Zod: 2 Cham + Flawless Emerald");

// Socket Recipes
addRecipeCommand("socket weapon", "Socket Weapon: Ral + Amn + Perfect Amethyst");
addRecipeCommand("socket armor", "Socket Armor: Tal + Thul + Perfect Topaz");
addRecipeCommand("socket helm", "Socket Helm: Tal + Thul + Perfect Topaz");
addRecipeCommand("socket shield", "Socket Shield: Tal + Amn + Perfect Ruby");

// Other
addRecipeCommand("forge", "Up to Amn in normal, Sol to Um in nightmare and Hel to Gul in hell.");
