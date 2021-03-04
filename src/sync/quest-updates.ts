import { CharacterQuest, CharacterSnapshot } from '../collections/characters';
import { Payload } from './payload';
import db from '../services/db';

export function getQuestUpdates(time: number, payload: Payload, before?: CharacterSnapshot) {
    const completedQuests = payload.CompletedQuests;
    const questUpdates: Partial<CharacterQuest>[] = [];

    if (!completedQuests) {
        return questUpdates;
    }

    const previouslyCompletedQuests = before ? before.quests : [];

    for (const questId of completedQuests.Normal) {
        if (!previouslyCompletedQuests.find(quest => quest.difficulty === 'normal' && quest.quest_id === questId)) {
            questUpdates.push({ update_time: time, difficulty: 'normal', quest_id: questId });
        }
    }

    for (const questId of completedQuests.Nightmare) {
        if (!previouslyCompletedQuests.find(quest => quest.difficulty === 'nightmare' && quest.quest_id === questId)) {
            questUpdates.push({ update_time: time, difficulty: 'nightmare', quest_id: questId });
        }
    }

    for (const questId of completedQuests.Hell) {
        if (!previouslyCompletedQuests.find(quest => quest.difficulty === 'hell' && quest.quest_id === questId)) {
            questUpdates.push({ update_time: time, difficulty: 'hell', quest_id: questId });
        }
    }

    return questUpdates;
}

export async function saveQuestUpdates(characterId: number, questUpdates: Partial<CharacterQuest>[]) {
    if (questUpdates.length) {
        await db.query(`
            INSERT INTO quests (character_id, difficulty, quest_id, update_time) VALUES
            ${questUpdates.map(
            (_, i) => `($${4 * i + 1}, $${4 * i + 2}, $${4 * i + 3}, $${4 * i + 4})`)
            }
        `, Array.prototype.concat(...questUpdates.map(
                ({ update_time, difficulty, quest_id }) => [characterId, difficulty, quest_id, update_time]
            )));
    }
}
