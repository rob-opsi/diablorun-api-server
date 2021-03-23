import fetch from 'node-fetch';
import db from '../../services/db';
import * as sqlFormat from 'pg-format';
import { Character } from "src/collections/characters";
import { Speedrun, SpeedrunUser } from 'src/collections/speedruns';

/*
category (5) ["7kjqovgd", "5dw89pgd", "wkpm98jk", "w20g1v5k", "jdz9zng2"]
kn04xp7l (3) ["5lmd0vjl", "81wnxzo1", ""]
ql6g3kv8 (4) ["zqo56kpl", "", "0132nddq", "rqvm5g7q"]
6njve7en (8) ["jq626n3l", "9qjgkveq", "mln5jp0l", "5q8gwjgl", "810xkgw1", "21d2x94l", "4qyngd41", ""]
789k450l (3) ["", "rqvm597q", "5lee755l"]
r8roz2r8 (4) ["", "xqkmx7yl", "gq7r6kyl", "z198w7kq"]
5ly703yl (2) ["", "21g23yml"]
e8mmz2x8 (3) ["", "klryrn2q", "81wrepml"]
onv2eorl (3) ["", "jq637ynq", "5lmzn8yq"]
ylpmodvl (4) ["", "81w38e9l", "zqodnmg1", "0133rwk1"]
0nwk4zkn (9) ["", "4lx340jl", "5led83p1", "z197r4jl", "8143dkwq", "p123z5vl", "rqv3d65l", "0q5k8xrq", "81p8n7el"]

kn04xp7l
softcore hell, hardcore hell

ql6g3kv8
players 1 hell, players x hell, players 8 hell

6njve7en
Hell Sorceress, Hell Paladin, Hell Druid, Hell Assassin, Hell Necromancer, Hell Amazon, Hell Barbarian

789k450l
Pacifist Paladin, Pacifist Sorceress

onv2eorl
softcore normal, hardcore normal

ylpmodvl
players 1 normal, players x normal, players 8 normal

0nwk4zkn
normal druid, normal assassin, normal paladin, normal necromancer, normal sorceress, normal amazon, normal barbarian (81p8n7el is some repair category and can be ignored)
*/

export const gameId = 'yd4opx1e'; // Diablo II: Lord of Destruction

export interface SpeedrunComRun {
    id: string;
    weblink: string;
    date: string;
    submitted: string;
    comment: string | null;

    players: {
        rel: 'user' | 'guest';
        id: string;
    }[];

    times: {
        primary_t: number;
        realtime_t: number;
        realtime_noloads_t: number;
        ingame_t: number;
    };

    values: {
        'kn04xp7l'?: "5lmd0vjl" | "81wnxzo1";
        'ql6g3kv8'?: "zqo56kpl" | "0132nddq" | "rqvm5g7q";
        '6njve7en'?: "jq626n3l" | "9qjgkveq" | "mln5jp0l" | "5q8gwjgl" | "810xkgw1" | "21d2x94l" | "4qyngd41";
        '789k450l'?: "rqvm597q" | "5lee755l";
        'r8roz2r8'?: "xqkmx7yl" | "gq7r6kyl" | "z198w7kq";
        '5ly703yl'?: "21g23yml";
        'e8mmz2x8'?: "klryrn2q" | "81wrepml";
        'onv2eorl'?: "jq637ynq" | "5lmzn8yq";
        'ylpmodvl'?: "81w38e9l" | "zqodnmg1" | "0133rwk1";
        '0nwk4zkn'?: "4lx340jl" | "5led83p1" | "z197r4jl" | "8143dkwq" | "p123z5vl" | "rqv3d65l" | "0q5k8xrq" | "81p8n7el";
    };
}

export function getCategoryId({ values }: SpeedrunComRun): number {
    if ('789k450l' in values) {
        return 3;
    }

    if ('789k450l' in values || 'onv2eorl' in values || 'ylpmodvl' in values || '0nwk4zkn' in values) {
        return 1;
    }

    return 2;
}

export function isHC({ values }: SpeedrunComRun) {
    return values['kn04xp7l'] === '81wnxzo1' || values['onv2eorl'] === '5lmzn8yq';
}

export function getPlayersCategory({ values }: SpeedrunComRun) {
    if ('789k450l' in values || values['ql6g3kv8'] === '0132nddq' || values['ylpmodvl'] === 'zqodnmg1') {
        return 'px';
    }

    if (values['ql6g3kv8'] === 'zqo56kpl' || values['ylpmodvl'] === '81w38e9l') {
        return 'p1';
    }

    return 'p8';
}

export function getHero({ values }: SpeedrunComRun): Character["hero"] | null {
    if (values['6njve7en'] === 'jq626n3l' || values['0nwk4zkn'] === 'p123z5vl' || values['789k450l'] === '5lee755l') {
        return 'sor';
    }

    if (values['6njve7en'] === '9qjgkveq' || values['0nwk4zkn'] === 'z197r4jl' || values['789k450l'] === 'rqvm597q') {
        return 'pal';
    }

    if (values['6njve7en'] === 'mln5jp0l' || values['0nwk4zkn'] === '4lx340jl' || values['789k450l'] === 'zqo569pl') {
        return 'dru';
    }

    if (values['6njve7en'] === '5q8gwjgl' || values['0nwk4zkn'] === '5led83p1' || values['789k450l'] === '5lmd0pjl') {
        return 'asn';
    }

    if (values['6njve7en'] === '810xkgw1' || values['0nwk4zkn'] === '8143dkwq' || values['789k450l'] === '0132npdq') {
        return 'nec';
    }

    if (values['6njve7en'] === '21d2x94l' || values['0nwk4zkn'] === 'rqv3d65l' || values['789k450l'] === 'jq626p3l') {
        return 'ama';
    }

    if (values['6njve7en'] === '4qyngd41' || values['0nwk4zkn'] === '0q5k8xrq' || values['789k450l'] === '81wnx9o1') {
        return 'bar';
    }

    return null;
}

export function getCharacterId(run: SpeedrunComRun) {
    const match = (run.comment || '').match(/diablo\.run\/.*?\/.*?(\d+)/i);
    return match ? parseInt(match[1]) : null;
}

export interface SpeedrunComRunsResponse {
    data: SpeedrunComRun[];
    pagination: {
        offset: number;
        max: number;
        size: number;
        links: {
            rel: 'next';
            uri: string;
        }[];
    }
}

export async function fetchRuns(offset: number = 0): Promise<{ data: Speedrun[], more: boolean, nextOffset?: number }> {
    const uri = `https://www.speedrun.com/api/v1/runs?game=${gameId}&status=verified&orderby=verify-date&direction=asc&offset=${offset}`;
    const res = await fetch(uri);
    const { data, pagination }: SpeedrunComRunsResponse = await res.json();
    const speedruns: Speedrun[] = [];

    data.forEach((run, index) => {
        const hero = getHero(run);

        if (!hero) {
            return;
        }

        speedruns.push({
            run_time: Math.floor(new Date(run.date).getTime() / 1000),
            submit_time: Math.floor(new Date(run.submitted).getTime() / 1000),
            seconds_played: run.times.realtime_t,

            category_id: getCategoryId(run),
            players_category: getPlayersCategory(run),
            hc: isHC(run),
            hero,
            character_id: getCharacterId(run),

            speedrun_offset: offset + index,
            speedrun_id: run.id,
            speedrun_link: run.weblink,
            speedrun_user_id: run.players.filter(player => player.rel === 'user').map(user => user.id).join(','),
        });
    });

    return { data: speedruns, more: !!pagination.links.find(link => link.rel === 'next'), nextOffset: offset + pagination.size };
}

export interface SpeedrunComUserResponse {
    data: {
        id: string;
        weblink: string;

        names: {
            international: string;
        };

        'name-style': {
            style: 'solid' | 'gradient';
            color?: {
                light: string;
                dark: string;
            }
            'color-from'?: {
                light: string;
                dark: string;
            };
            'color-to'?: {
                light: string;
                dark: string;
            }
        };

        location?: {
            country: {
                code: string;
            }
        };

        twitch?: {
            uri: string;
        };

        hitbox?: {
            uri: string;
        };

        youtube?: {
            uri: string;
        };

        twitter?: {
            uri: string;
        };

        speedrunslive?: {
            uri: string;
        };
    };
}

export async function fetchUsers(userIds: string[]): Promise<SpeedrunUser[]> {
    const speedrunUsers: SpeedrunUser[] = [];
    const twitchUsernamesMap: { [username: string]: SpeedrunUser[] } = {};

    // Fetch speedrun.com users
    await Promise.all(userIds.map(async id => {
        try {
            const res = await fetch(`https://www.speedrun.com/api/v1/users/${id}`);
            const { data }: SpeedrunComUserResponse = await res.json();
            const speedrunUser = {
                id: data.id,
                user_id: null,
                name: data.names.international,
                weblink: data.weblink,
                light_color_from: data['name-style'].style === 'solid' ? data['name-style'].color!.light : data['name-style']['color-from']!.light,
                light_color_to: data['name-style'].style === 'solid' ? data['name-style'].color!.light : data['name-style']['color-to']!.light,
                dark_color_from: data['name-style'].style === 'solid' ? data['name-style'].color!.dark : data['name-style']['color-from']!.dark,
                dark_color_to: data['name-style'].style === 'solid' ? data['name-style'].color!.dark : data['name-style']['color-to']!.dark,
                country_code: data.location ? data.location.country.code : null,
                twitch: data.twitch ? data.twitch.uri : null,
                hitbox: data.hitbox ? data.hitbox.uri : null,
                youtube: data.youtube ? data.youtube.uri : null,
                twitter: data.twitter ? data.twitter.uri : null,
                speedrunslive: data.speedrunslive ? data.speedrunslive.uri : null
            };

            if (data.twitch) {
                const match = data.twitch.uri.match(/twitch\.tv\/(.*?)\/?$/);

                if (match) {
                    const username = match[1].toLowerCase();

                    if (username in twitchUsernamesMap) {
                        twitchUsernamesMap[username].push(speedrunUser);
                    } else {
                        twitchUsernamesMap[username] = [speedrunUser];
                    }
                }
            }

            speedrunUsers.push(speedrunUser);
        } catch (err) {
            console.log(err);
        }
    }));

    // Fetch diablo.run users by Twitch usernames
    const twitchUsernames = Object.keys(twitchUsernamesMap);

    if (twitchUsernames.length) {
        const users = await db.query(sqlFormat(`
            SELECT id, login FROM users WHERE login IN (%L)
        `, twitchUsernames));

        for (const user of users.rows) {
            for (const speedrunUser of twitchUsernamesMap[user.login]) {
                speedrunUser.user_id = user.id;
            }
        }
    }

    return speedrunUsers;
}
