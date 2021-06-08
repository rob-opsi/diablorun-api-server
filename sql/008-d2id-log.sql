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
