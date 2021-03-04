import { config } from 'dotenv';
config();

import db from '../services/db';

before(async () => await db.connect());
after(async () => await db.end());

import { sync } from '.';

const payload = {
  "Headers": `API_KEY=${process.env.TEST_API_KEY}`,
  "Area": 40,
  "InventoryTab": 0,
  "Difficulty": 0,
  "PlayersX": 3,
  "Seed": 1231040419,
  "SeedIsArg": false,
  "Name": "Shenk",
  "Guid": "b187d2cd-6d03-40f4-9587-46db31709178",
  "CharClass": 5,
  "IsHardcore": false,
  "IsExpansion": true,
  "IsDead": false,
  "Deaths": 0,
  "Level": 17,
  "Experience": 276510,
  "Strength": 30,
  "Dexterity": 20,
  "Vitality": 90,
  "Energy": 20,
  "FireResist": 0,
  "ColdResist": 0,
  "LightningResist": 0,
  "PoisonResist": 12,
  "Gold": 0,
  "GoldStash": 7941,
  "Life": 209,
  "LifeMax": 209,
  "Mana": 52,
  "ManaMax": 52,
  "FasterCastRate": 10,
  "FasterHitRecovery": 0,
  "FasterRunWalk": 0,
  "IncreasedAttackSpeed": 0,
  "MagicFind": 0,
  "AddedItems": [
    {
      "Class": 398,
      "ItemName": " Wolf Head",
      "ItemBaseName": "Wolf Head",
      "QualityColor": "WHITE",
      "Properties": [
        "+2 to Raven (Druid Only)",
        "Increase Maximum Durability 11%",
        "Socketed (2)"
      ],
      "Location": {
        "X": 1,
        "Y": 0,
        "Width": 2,
        "Height": 2,
        "BodyLocation": 1,
        "Container": 0
      },
      "GUID": 4,
      "BaseItem": "Wolf Head",
      "Quality": "WHITE"
    },
    {
      "Class": 520,
      "ItemName": "Amulet of the Apprentice",
      "ItemBaseName": "Amulet",
      "QualityColor": "BLUE",
      "Properties": [
        "+10% Faster Cast Rate"
      ],
      "Location": {
        "X": 2,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 2,
        "Container": 0
      },
      "GUID": 1,
      "BaseItem": "Amulet",
      "Quality": "BLUE"
    },
    {
      "Class": 316,
      "ItemName": "Studded Leather",
      "ItemBaseName": "Studded Leather",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 3,
        "Y": 0,
        "Width": 2,
        "Height": 3,
        "BodyLocation": 3,
        "Container": 0
      },
      "GUID": 44,
      "BaseItem": "Studded Leather",
      "Quality": "WHITE"
    },
    {
      "Class": 14,
      "ItemName": "Club",
      "ItemBaseName": "Club",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 4,
        "Y": 0,
        "Width": 1,
        "Height": 3,
        "BodyLocation": 4,
        "Container": 0
      },
      "GUID": 51,
      "BaseItem": "Club",
      "Quality": "WHITE"
    },
    {
      "Class": 329,
      "ItemName": "Cleglaw's Claw Small Shield",
      "ItemBaseName": "Small Shield",
      "QualityColor": "GREEN",
      "Properties": [
        "+17 Defense",
        "Poison Length Reduced by 75%"
      ],
      "Location": {
        "X": 5,
        "Y": 0,
        "Width": 2,
        "Height": 2,
        "BodyLocation": 5,
        "Container": 0
      },
      "GUID": 52,
      "BaseItem": "Small Shield",
      "Quality": "GREEN"
    },
    {
      "Class": 346,
      "ItemName": "Belt",
      "ItemBaseName": "Belt",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 0,
        "Width": 2,
        "Height": 1,
        "BodyLocation": 8,
        "Container": 0
      },
      "GUID": 3,
      "BaseItem": "Belt",
      "Quality": "WHITE"
    },
    {
      "Class": 341,
      "ItemName": "Doom Trample Chain Boots",
      "ItemBaseName": "Chain Boots",
      "QualityColor": "YELLOW",
      "Properties": [
        "+15% Enhanced Defense",
        "Heal Stamina Plus 25%",
        "Poison Resist +12%",
        "Poison Length Reduced by 25%"
      ],
      "Location": {
        "X": 9,
        "Y": 0,
        "Width": 2,
        "Height": 2,
        "BodyLocation": 9,
        "Container": 0
      },
      "GUID": 48,
      "BaseItem": "Chain Boots",
      "Quality": "YELLOW"
    },
    {
      "Class": 335,
      "ItemName": "Heavy Gloves",
      "ItemBaseName": "Heavy Gloves",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 10,
        "Y": 0,
        "Width": 2,
        "Height": 2,
        "BodyLocation": 10,
        "Container": 0
      },
      "GUID": 50,
      "BaseItem": "Heavy Gloves",
      "Quality": "WHITE"
    },
    {
      "Class": 515,
      "ItemName": "Rejuvenation Potion",
      "ItemBaseName": "Rejuvenation Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 0,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 31,
      "BaseItem": "Rejuvenation Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 588,
      "ItemName": "Light Healing Potion",
      "ItemBaseName": "Light Healing Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 1,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 34,
      "BaseItem": "Light Healing Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 2,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 30,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 3,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 29,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 515,
      "ItemName": "Rejuvenation Potion",
      "ItemBaseName": "Rejuvenation Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 4,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 39,
      "BaseItem": "Rejuvenation Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 588,
      "ItemName": "Light Healing Potion",
      "ItemBaseName": "Light Healing Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 35,
      "BaseItem": "Light Healing Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 6,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 32,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 7,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 37,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 515,
      "ItemName": "Rejuvenation Potion",
      "ItemBaseName": "Rejuvenation Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 40,
      "BaseItem": "Rejuvenation Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 588,
      "ItemName": "Light Healing Potion",
      "ItemBaseName": "Light Healing Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 9,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 36,
      "BaseItem": "Light Healing Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 10,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 33,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 11,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 1
      },
      "GUID": 38,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 518,
      "ItemName": "Tome of Town Portal",
      "ItemBaseName": "Tome of Town Portal",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 0,
        "Y": 0,
        "Width": 1,
        "Height": 2,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 2,
      "BaseItem": "Tome of Town Portal",
      "Quality": "WHITE"
    },
    {
      "Class": 519,
      "ItemName": "Tome of Identify",
      "ItemBaseName": "Tome of Identify",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 1,
        "Y": 0,
        "Width": 1,
        "Height": 2,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 45,
      "BaseItem": "Tome of Identify",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 6,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 46,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 7,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 18,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 14,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 1,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 24,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 6,
        "Y": 1,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 21,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 7,
        "Y": 1,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 17,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 1,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 13,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 549,
      "ItemName": "Horadric Cube",
      "ItemBaseName": "Horadric Cube",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 0,
        "Y": 2,
        "Width": 2,
        "Height": 2,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 41,
      "BaseItem": "Horadric Cube",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 3,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 47,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 4,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 26,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 23,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 6,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 20,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 7,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 16,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 12,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 515,
      "ItemName": "Rejuvenation Potion",
      "ItemBaseName": "Rejuvenation Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 9,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 5,
      "BaseItem": "Rejuvenation Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 2,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 43,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 3,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 49,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 4,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 25,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 22,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 6,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 19,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 7,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 15,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 593,
      "ItemName": "Light Mana Potion",
      "ItemBaseName": "Light Mana Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 8,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 11,
      "BaseItem": "Light Mana Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 515,
      "ItemName": "Rejuvenation Potion",
      "ItemBaseName": "Rejuvenation Potion",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 9,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 2
      },
      "GUID": 10,
      "BaseItem": "Rejuvenation Potion",
      "Quality": "WHITE"
    },
    {
      "Class": 521,
      "ItemName": "Top of the Horadric Staff",
      "ItemBaseName": "Top of the Horadric Staff",
      "QualityColor": "GOLD",
      "Properties": [
        "+10 to Life",
        "+10 to Mana",
        "Poison Resist +25%"
      ],
      "Location": {
        "X": 2,
        "Y": 0,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 5
      },
      "GUID": 42,
      "BaseItem": "Top of the Horadric Staff",
      "Quality": "GOLD"
    },
    {
      "Class": 612,
      "ItemName": "Tir Rune",
      "ItemBaseName": "Tir Rune",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 2,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 28,
      "BaseItem": "Tir Rune",
      "Quality": "WHITE"
    },
    {
      "Class": 611,
      "ItemName": "Eld Rune",
      "ItemBaseName": "Eld Rune",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 3,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 27,
      "BaseItem": "Eld Rune",
      "Quality": "WHITE"
    },
    {
      "Class": 582,
      "ItemName": "Chipped Diamond",
      "ItemBaseName": "Chipped Diamond",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 4,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 9,
      "BaseItem": "Chipped Diamond",
      "Quality": "WHITE"
    },
    {
      "Class": 572,
      "ItemName": "Chipped Emerald",
      "ItemBaseName": "Chipped Emerald",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 5,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 8,
      "BaseItem": "Chipped Emerald",
      "Quality": "WHITE"
    },
    {
      "Class": 577,
      "ItemName": "Chipped Ruby",
      "ItemBaseName": "Chipped Ruby",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 6,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 7,
      "BaseItem": "Chipped Ruby",
      "Quality": "WHITE"
    },
    {
      "Class": 577,
      "ItemName": "Chipped Ruby",
      "ItemBaseName": "Chipped Ruby",
      "QualityColor": "WHITE",
      "Properties": [],
      "Location": {
        "X": 5,
        "Y": 7,
        "Width": 1,
        "Height": 1,
        "BodyLocation": 0,
        "Container": 6
      },
      "GUID": 6,
      "BaseItem": "Chipped Ruby",
      "Quality": "WHITE"
    }
  ],
  "CompletedQuests": {
    "Normal": [
      12,
      81,
      83,
      85,
      88
    ],
    "Nightmare": [],
    "Hell": []
  },
  "Hireling": {
    "Name": "Mahala",
    "Class": 271,
    "Level": 8,
    "Experience": 63566,
    "Strength": 41,
    "Dexterity": 55,
    "FireResist": 10,
    "ColdResist": 10,
    "LightningResist": 10,
    "PoisonResist": 10,
    "Items": [
      {
        "Class": 308,
        "ItemName": " Helm",
        "ItemBaseName": "Helm",
        "QualityColor": "WHITE",
        "Properties": [
          "+8% Enhanced Defense"
        ],
        "Location": {
          "X": 1,
          "Y": 1,
          "Width": 2,
          "Height": 2,
          "BodyLocation": 1,
          "Container": 10
        },
        "GUID": 53,
        "BaseItem": "Helm",
        "Quality": "WHITE"
      }
    ],
    "SkillIds": [
      336,
      8,
      7
    ]
  },
  "D2ProcessInfo": {
    "Type": "D2",
    "Version": "1.14d",
    "CommandLineArgs": [
      "-w"
    ]
  },
  "DIApplicationInfo": {
    "Version": "0.6.9"
  }
}

describe('Sync', () => {
  it('should sync', async () => {
    await sync(payload);
  });
});
