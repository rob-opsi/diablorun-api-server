import { CharacterItem, CharacterSnapshot } from 'src/collections/characters';
import { Payload } from './payload';
import db from '../services/db';
import { hash32 } from 'farmhash';

interface ItemUpdates {
    removedItems: number[];
    addedItems: Partial<CharacterItem>[];
}

function getItemContainer(location: number): CharacterItem["container"] {
    switch (location) {
        case 0: return 'character';
        case 1: return 'belt';
        case 2: return 'inventory';
        case 5: return 'cube';
        case 6: return 'stash';
        case 10: return 'hireling';
    }

    return 'stash';
}

function getItemSlot(container: CharacterItem["container"], inventoryTab: number, location: number): CharacterItem["slot"] {
    switch (location) {
        case 1: return 'head';
        case 2: return 'amulet';
        case 3: return 'body_armor';
        case 4: return (container !== 'character' || !inventoryTab) ? 'primary_left' : 'primary_right';
        case 5: return (container !== 'character' || !inventoryTab) ? 'primary_right' : 'primary_left';
        case 6: return 'ring_left';
        case 7: return 'ring_right';
        case 8: return 'belt';
        case 9: return 'boots';
        case 10: return 'gloves';
        case 11: return (container !== 'character' || !inventoryTab) ? 'secondary_left' : 'secondary_right';
        case 12: return (container !== 'character' || !inventoryTab) ? 'secondary_right' : 'secondary_left';
    }

    return null;
}

export function getItemUpdates(time: number, payload: Payload, inventoryTab: number, before?: CharacterSnapshot): ItemUpdates {
    const removedItems = [
        ...(payload.RemovedItems || []),
        ...(payload.Hireling?.RemovedItems || [])
    ];

    const itemHashesBefore = (before ? before.items : []).map(item => Number(item.item_hash));
    const addedItems: Partial<CharacterItem>[] = [];
    const addedPayload = [
        ...(payload.AddedItems || []),
        ...(payload.Hireling?.Items || payload.Hireling?.AddedItems || [])
    ];

    for (const itemPayload of addedPayload) {
        const container = getItemContainer(itemPayload.Location.Container);
        const item_class = itemPayload.Class;
        const name = itemPayload.ItemName.trim();
        const quality = itemPayload.Quality.toLowerCase() as CharacterItem["quality"];
        const properties = JSON.stringify(itemPayload.Properties);
        const slot = getItemSlot(container, inventoryTab, itemPayload.Location.BodyLocation);
        const x = itemPayload.Location.X;
        const y = itemPayload.Location.Y;
        const item_hash = hash32(item_class + name + quality + properties + container + slot + x + y);

        if (!itemHashesBefore.includes(item_hash)) {
            addedItems.push({
                update_time: time,
                item_id: itemPayload.GUID,
                item_class,
                name,
                base_name: itemPayload.BaseItem.trim(),
                quality,
                properties,
                container,
                slot,
                x,
                y,
                width: itemPayload.Location.Width,
                height: itemPayload.Location.Height,
                item_hash
            });
        }
    }

    return {
        removedItems,
        addedItems
    };
}

export async function saveItemUpdates(characterId: number, { removedItems, addedItems }: ItemUpdates) {
    if (removedItems.length) {
        await db.query(`
            DELETE FROM character_items WHERE character_id=$1
            AND item_id IN (${removedItems.map((_, i) => `$${2 + i}`)})
        `, [characterId, ...removedItems]);
    }

    if (addedItems.length) {
        await db.query(`
            INSERT INTO character_items (
                character_id, update_time, item_id, item_class, name, base_name,
                quality, properties, container, slot, x, y, width, height, item_hash
            ) VALUES
            ${addedItems.map(
            (_, i) => `(
                $${15 * i + 1}, $${15 * i + 2}, $${15 * i + 3}, $${15 * i + 4}, $${15 * i + 5},
                $${15 * i + 6}, $${15 * i + 7}, $${15 * i + 8}, $${15 * i + 9}, $${15 * i + 10},
                $${15 * i + 11}, $${15 * i + 12}, $${15 * i + 13}, $${15 * i + 14}, $${15 * i + 15}
            )`)}
        `, Array.prototype.concat(...addedItems.map(item => [
                characterId, item.update_time, item.item_id, item.item_class, item.name, item.base_name,
                item.quality, item.properties, item.container, item.slot, item.x, item.y, item.width, item.height, item.item_hash
            ])));
    }
}
