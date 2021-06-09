import fetch from 'node-fetch';
import { config } from 'dotenv';
config();

import * as speedrunCom from './speedrun-com';

async function fetchData(uri: string): Promise<any[]> {
    const res = await fetch(uri);
    const { data } = await res.json();

    return data;
}

function addRule(rules: { [label: string]: string[] }, label: string, rule: string) {
    if (!(label in rules)) {
        rules[label] = [];
    }

    if (!rules[label].includes(rule)) {
        rules[label].push(rule);
    }
}

async function run() {
    const data = await fetchData(`https://www.speedrun.com/api/v1/games/${speedrunCom.gameId}/categories`);
    const rules: { [label: string]: string[] } = {};
    const valuesType: { [id: string]: string[] } = {};

    await Promise.all(data.map(async category => {
        // Parse category
        for (const part of category.name.split(' ')) {
            addRule(rules, part, `category === "${category.id}"`);
        }

        // Parse variables
        const variables = await fetchData(`https://www.speedrun.com/api/v1/categories/${category.id}/variables`);
        
        for (const variable of variables) {
            const values = variable.values.values;

            for (const value in values) {
                addRule(rules, values[value].label, `values["${variable.id}"] === "${value}"`);
            }
            
            valuesType[variable.id] = Object.keys(values);
        }
    }));
    
    // Merge rules with alternate category naming
    if (rules.Normal) {
        rules.N = rules.N.concat(rules.Normal);
        delete rules.Normal;
    }

    if (rules.Pacifist) {
        rules.N = rules.N.concat(rules.Pacifist);
        rules.PX = rules.PX.concat(rules.Pacifist);
    }

    if (rules.Hell) {
        rules.H = rules.H.concat(rules.Hell);
        delete rules.Hell;
    }

    // Output rules
    for (const label in rules) {
        console.log(`${label}: ${rules[label].join(' || ')}`);
    }
    
    // Output category type
    const categoryType = data.map(category => `"${category.id}"`).join(' | ');
    console.log(`\ncategory: ${categoryType};`);

    // Output values type
    console.log('values: {');
    for (const value in valuesType) {
        console.log(`\t"${value}"?: ${valuesType[value].map(v => `"${v}"`).join(' | ')};`);
    }
    console.log('};');
}

run();
