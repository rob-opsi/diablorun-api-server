-- Character items
CREATE TABLE character_items (
  character_id integer REFERENCES characters(id) NOT NULL,
  item_id integer NOT NULL,
  item_class integer NOT NULL,
  item_hash bigint NOT NULL,

  container item_container_type NOT NULL,
  slot item_slot_type,
  x integer,
  y integer,
  width integer,
  height integer,
  
  update_time integer NOT NULL,
  quality item_quality_type NOT NULL,
  name text NOT NULL,
  base_name text NOT NULL,
  properties text NOT NULL,

  PRIMARY KEY (character_id, item_id)
);

CREATE INDEX character_items_character_id ON character_items USING btree (character_id);
