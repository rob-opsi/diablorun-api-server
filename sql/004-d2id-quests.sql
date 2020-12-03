CREATE TABLE quests (
  character_id integer REFERENCES characters(id) NOT NULL,
  difficulty difficulty_type NOT NULL,
  quest_id integer NOT NULL,
  update_time integer NOT NULL,
  PRIMARY KEY(character_id, difficulty, quest_id)
);

CREATE INDEX quests_character_id ON quests USING btree (character_id);
