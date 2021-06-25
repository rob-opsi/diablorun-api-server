-- Bounties
CREATE TABLE bounties (
  id serial PRIMARY KEY,
  author_user_id integer REFERENCES users(id),
  name text NOT NULL,
  description text NOT NULL,
  reward text,
  prepaid boolean,
  expiration integer,
  claimed_character_id integer REFERENCES characters(id)
);
