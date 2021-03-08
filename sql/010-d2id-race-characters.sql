-- Hero entry conditions
ALTER TABLE races ADD entry_ama boolean DEFAULT false;
ALTER TABLE races ADD entry_sor boolean DEFAULT false;
ALTER TABLE races ADD entry_nec boolean DEFAULT false;
ALTER TABLE races ADD entry_pal boolean DEFAULT false;
ALTER TABLE races ADD entry_bar boolean DEFAULT false;
ALTER TABLE races ADD entry_dru boolean DEFAULT false;
ALTER TABLE races ADD entry_asn boolean DEFAULT false;

-- Race characters
CREATE TABLE race_characters (
  race_id integer REFERENCES races(id) NOT NULL,
  character_id integer REFERENCES characters(id) NOT NULL,
  points bigint DEFAULT 0,
  start_time integer NOT NULL,
  update_time integer NOT NULL,
  finish_time integer,
  
  PRIMARY KEY (race_id, character_id)
);
