-- Character stats log
CREATE TABLE stats_log (
  race_id integer REFERENCES races(id),
  character_id integer REFERENCES characters(id) NOT NULL,
  update_time integer NOT NULL,
  in_game_time integer NOT NULL,
  stat text NOT NULL,
  value bigint,
  PRIMARY KEY (character_id, update_time, stat)
);

CREATE INDEX stats_log_in_game_time ON stats_log USING btree(in_game_time);
CREATE INDEX stats_log_race_id ON stats_log USING btree(race_id);

-- Monster quality
CREATE TYPE monster_quality_type AS ENUM (
  'normal',
  'champion',
  'minion',
  'unique'
);

CREATE TYPE monster_type_type AS ENUM (
  'none',
  'demon',
  'undead'
);

-- Monster kill stats
CREATE TABLE monster_kills (
  character_id integer REFERENCES characters(id) NOT NULL,
  monster_class integer NOT NULL,
  monster_quality monster_quality_type NOT NULL,
  monster_flags integer NOT NULL,
  monster_type monster_type_type NOT NULL,
  kills integer NOT NULL,
  PRIMARY KEY (character_id, monster_class, monster_quality)
);
