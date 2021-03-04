import fetch from 'node-fetch';

export async function broadcast(room: string, payload: any, twitchMessages: { channel: string, message: string }[] = []) {
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
