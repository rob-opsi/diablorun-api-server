-- Character updates log
CREATE TABLE characters_log (
  character_id integer REFERENCES characters(id) NOT NULL,
  update_time integer NOT NULL,

  seconds_played integer,
  in_game_time integer,

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
  hireling_skill_ids text,

  area integer,
  difficulty difficulty_type,
  players integer,
  deaths integer,
  fcr integer,
  frw integer,
  fhr integer,
  ias integer,
  mf integer,
  gold_total integer,
  town_visits integer,

  finished_normal_quests integer,
  finished_nightmare_quests integer,
  finished_hell_quests integer,

  total_kills integer,
  animal_kills integer,
  undead_kills integer,
  demon_kills integer,
  champion_kills integer,
  unique_kills integer,

  PRIMARY KEY (character_id, update_time)
);

CREATE INDEX characters_log_in_game_time ON characters_log USING btree(in_game_time);
