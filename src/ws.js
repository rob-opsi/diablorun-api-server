const fetch = require('node-fetch');

async function broadcast(room, payload, twitchMessages = []) {
    await fetch(`http://${process.env.WS_HOSTNAME}`, {
        method: 'POST',
        body: JSON.stringify({
            secret: process.env.SECRET,
            action: 'broadcast',
            room,
            payload: JSON.stringify(payload),
            twitchMessages
        })
    });
}

module.exports = { broadcast };
