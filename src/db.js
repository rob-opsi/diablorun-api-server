const { Pool } = require('pg');

const pool = new Pool({
    max: 1,
    min: 0,
    idleTimeoutMillis: 120000,
    connectionTimeoutMillis: 10000
});

let client;

function releaseClient() {
    if (client) {
        try {
            client.release(true);
        } catch (err) {}
    }
}

async function getDbClient() {
    if (!pool.totalCount) {
        client = await pool.connect();
    }

    return client;
}

module.exports = { getDbClient, releaseClient };
