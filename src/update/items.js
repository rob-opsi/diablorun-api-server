const { itemSlots } = require('@diablorun/diablorun-data');

function getItemSlot(container, location, inventoryTab) {
  let slot = itemSlots[location - 1];

  if (container.id === 'hireling') {
    return slot;
  }

  if (inventoryTab) {
    if (slot === 'primary_right') {
      return 'secondary_right';
    }

    if (slot === 'primary_left') {
      return 'secondary_left';
    }

    if (slot === 'secondary_right') {
      return 'primary_right';
    }

    if (slot === 'secondary_left') {
      return 'primary_left';
    }
  }

  return slot;
}

async function updateItems(client, time, character, update, updatedStats, updatedStatsValues) {
  const changes = {};

  // Do nothing if dead
  if (character.hc && character.dead) {
    return changes;
  }

  const itemUpdateContainers = [
    { id: 'character', prefix: '', update: update },
    { id: 'hireling', prefix: 'hireling_', update: update.Hireling || {} }
  ];

  const inventoryTabIndex = updatedStats.indexOf('inventory_tab');
  const inventoryTab = inventoryTabIndex === -1 ? character.inventory_tab : updatedStatsValues[inventoryTabIndex];

  for (const itemUpdateContainer of itemUpdateContainers) {
    let { Items, AddedItems, RemovedItems } = itemUpdateContainer.update;

    AddedItems = (AddedItems || Items || []).filter(item => item.Location !== 0);
    RemovedItems = (RemovedItems || []).filter(item => item !== 0);

    // Remove items
    if (RemovedItems && RemovedItems.length) {
      if (RemovedItems.length > 1000) {
        return changes;
      }

      const removedSlots = [];

      for (const location of RemovedItems) {
        const slot = getItemSlot(itemUpdateContainer, location, inventoryTab);
        changes[itemUpdateContainer.prefix + slot] = null;
        removedSlots.push(slot);
      }

      await client.query(`
        DELETE FROM items WHERE character_id=$1 AND container=$2
        AND slot IN (${RemovedItems.map((_, i) => `$${3+i}`)})
      `, [character.id, itemUpdateContainer.id, ...removedSlots]);
    }

    // Add items
    if (AddedItems && AddedItems.length) {
      if (AddedItems.length > 1000) {
        return changes;
      }

      for (const item of AddedItems) {
        const slot = getItemSlot(itemUpdateContainer, item.Location, inventoryTab);
        const quality = item.Quality.toLowerCase();
        const name = item.ItemName.trim();
        const baseName = item.ItemBaseName.trim();
        const properties = JSON.stringify(item.Properties);

        /*const previousItem = await client.query(`
          SELECT quality, name, properties FROM items
          WHERE character_id=$1 AND container=$2 AND slot=$3
        `, [character.id, itemUpdateContainer.id, slot]);

        if (!previousItem.rows.length
          || previousItem.rows[0].quality !== quality
          || previousItem.rows[0].name !== name
          || previousItem.rows[0].properties !== properties
        ) {*/
          await client.query(`
            INSERT INTO items (
              character_id, container, slot, update_time, quality, name, base_name, properties
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (character_id, container, slot) DO UPDATE
              SET update_time=$9, quality=$10, name=$11, base_name=$12, properties=$13
          `, [
            character.id, itemUpdateContainer.id, slot, time,
            quality, name, baseName, properties,
            time, quality, name, baseName, properties
          ]);

          changes[itemUpdateContainer.prefix + slot] = {
            quality,
            name,
            base_name: baseName,
            properties
          };
        //}
      }
    }
  }

  return changes;
}

module.exports = { updateItems };
