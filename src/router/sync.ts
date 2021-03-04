import { Router } from 'express';
import { sync } from '../sync';

export const router = Router();

router.post('/sync', async function (req, res) {
    try {
        res.send(await sync(req.body));
    } catch (err) {
        if (err.status) {
            res.status(err.status);
            res.send(err.message);
        } else {
            res.status(500);
            res.send('Server error');

            console.log(err);
        }
    }
});
