-- Ladders
CREATE TABLE ladders (
  id serial PRIMARY KEY,
  start_time integer NOT NULL,
  end_time integer NOT NULL,
  stat text NOT NULL
);

ALTER TABLE characters ADD ladder_id integer REFERENCES ladders(id);
