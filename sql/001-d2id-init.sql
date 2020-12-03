-- Users
CREATE TABLE users (
  id serial PRIMARY KEY,
  login text NOT NULL UNIQUE,
  name text NOT NULL,
  api_key text NOT NULL UNIQUE
);

-- Heroes
CREATE TYPE hero_type AS ENUM (
  'ama',
  'asn',
  'nec',
  'bar',
  'pal',
  'sor',
  'dru'
);

-- Characters
CREATE TABLE characters (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id) NOT NULL,
  name text NOT NULL,
  hero hero_type,
  start_time integer,
  update_time integer,
  level integer,
  experience integer,
  strength integer,
  dexterity integer,
  vitality integer,
  energy integer,
  fire_res integer,
  cold_res integer,
  light_res integer,
  poison_res integer,
  gold integer,
  gold_stash integer,
  life integer,
  life_max integer,
  mana integer,
  mana_max integer,
  seed integer,
  seed_is_arg boolean,
  inventory_tab boolean,
  -- Hireling
  hireling_name text,
  hireling_class integer,
  hireling_level integer,
  hireling_experience integer,
  hireling_strength integer,
  hireling_dexterity integer,
  hireling_fire_res integer,
  hireling_cold_res integer,
  hireling_light_res integer,
  hireling_poison_res integer,
  hireling_skill_ids text
);

CREATE INDEX characters_user_id ON characters USING btree (user_id);

-- Item containers
CREATE TYPE item_container_type AS ENUM (
  'character',
  'hireling',
  'inventory',
  'stash',
  'cube',
  'belt'
);

-- Item slots
CREATE TYPE item_slot_type AS ENUM (
  'head',
  'amulet',
  'body_armor',
  'primary_left',
  'primary_right',
  'ring_left',
  'ring_right',
  'belt',
  'boots',
  'gloves',
  'secondary_left',
  'secondary_right'
);

-- Item quality
CREATE TYPE item_quality_type AS ENUM (
  'white',
  'blue',
  'yellow',
  'orange',
  'gold',
  'green',
  'none'
);

-- Items
CREATE TABLE items (
  character_id integer REFERENCES characters(id) NOT NULL,
  container item_container_type NOT NULL,
  slot item_slot_type NOT NULL,
  update_time integer NOT NULL,
  quality item_quality_type NOT NULL,
  name text NOT NULL,
  base_name text NOT NULL,
  properties text NOT NULL,
  PRIMARY KEY (character_id, container, slot)
);

CREATE INDEX items_character_id ON items USING btree (character_id);
