CREATE TABLE speedrun_users (
    id text PRIMARY KEY,
    user_id integer REFERENCES users(id),
    name text NOT NULL,
    weblink text NOT NULL,
    light_color_from text,
    light_color_to text,
    dark_color_from text,
    dark_color_to text,
    country_code text,
    twitch text,
    hitbox text,
    youtube text,
    twitter text,
    speedrunslive text
);

CREATE TABLE speedrun_categories (
    id serial PRIMARY KEY,
    name text NOT NULL
);

INSERT INTO speedrun_categories VALUES (1, 'Normal'), (2, 'Hell'), (3, 'Pacifist');

CREATE TABLE speedruns (
  id serial PRIMARY KEY,
  user_id integer REFERENCES users(id),
  character_id integer REFERENCES characters(id),
  speedrun_offset integer,
  speedrun_id text,
  speedrun_link text,
  speedrun_user_id text REFERENCES speedrun_users(id),
  run_time integer NOT NULL,
  submit_time integer NOT NULL,
  category_id integer REFERENCES speedrun_categories(id) NOT NULL,
  players_category text NOT NULL,
  hc boolean NOT NULL,
  hero hero_type NOT NULL,
  seconds_played integer NOT NULL
);

CREATE INDEX speedruns_user_id ON speedruns USING btree (user_id);
CREATE INDEX speedruns_character_id ON speedruns USING btree (character_id);
CREATE INDEX speedruns_category_id ON speedruns USING btree (category_id);
CREATE INDEX speedruns_players_category ON speedruns USING btree (players_category);
CREATE INDEX speedruns_hc ON speedruns USING btree (hc);
CREATE INDEX speedruns_hero ON speedruns USING btree (hero);
CREATE INDEX speedruns_seconds_played ON speedruns USING btree (seconds_played);
CREATE INDEX speedruns_run_time ON speedruns USING btree (run_time);
CREATE INDEX speedruns_submit_time ON speedruns USING btree (submit_time);
