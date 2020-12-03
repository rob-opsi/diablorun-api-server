CREATE TABLE races (
  id serial PRIMARY KEY,
  name text,
  slug text,
  start_time integer,
  estimated_start_time integer,
  editor_token text UNIQUE,
  token text UNIQUE,
  points text,
  finish_conditions text,
  finish_conditions_global boolean,
  finish_time integer,
  description text;
);

ALTER TABLE characters ADD race_id integer REFERENCES races(id);
ALTER TABLE characters ADD points integer DEFAULT 0;
ALTER TABLE characters ADD preliminary boolean DEFAULT false;

-- Entry conditions
ALTER TABLE races ADD entry_new_character boolean DEFAULT true;
ALTER TABLE races ADD entry_hero text DEFAULT 'ama,sor,nec,pal,bar,dru,asn';
ALTER TABLE races ADD entry_classic boolean DEFAULT false;
ALTER TABLE races ADD entry_hc boolean DEFAULT false;
ALTER TABLE races ADD entry_players text DEFAULT 'p1';

-- Rules
CREATE TABLE race_rules (
  id serial PRIMARY KEY,
  race_id integer REFERENCES races(id),
  context text,
  amount integer,
  type text,
  counter integer,
  stat text,
  difficulty difficulty_type,
  quest_id integer,
  time_type text,
  time text,
  time_seconds integer,
  claimed boolean DEFAULT false
);

CREATE INDEX race_rules_race_id ON race_rules USING btree(race_id);

-- Checkpoints
CREATE TABLE character_checkpoints (
  race_id integer REFERENCES races(id),
  character_id integer REFERENCES characters(id),
  rule_id integer REFERENCES race_rules(id),
  update_time integer,
  points integer,
  PRIMARY KEY (character_id, rule_id)
);

CREATE INDEX character_checkpoints_race_id ON character_checkpoints USING btree(race_id);
CREATE INDEX character_checkpoints_update_time ON character_checkpoints USING btree(update_time);

-- Notifications
CREATE TABLE race_notifications (
  id serial PRIMARY KEY,
  race_id integer REFERENCES races(id),
  character_id integer REFERENCES characters(id),
  type text,
  rule_id integer REFERENCES race_rules(id),
  time integer,
  points integer
);

CREATE INDEX race_notifications_race_id ON race_notifications USING btree(race_id);
