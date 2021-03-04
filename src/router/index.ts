import { Router } from 'express';
import * as bodyParser from 'body-parser';

import * as users from './users';
import * as characters from './characters';
import * as home from './home';
import * as races from './races';
import * as speedruns from './speedruns';
import * as webhooks from './webhooks';
import * as sync from './sync';

const router = Router();

router.use(bodyParser.json());
router.use(sync.router);
router.use(users.router);
router.use(characters.router);
router.use(home.router);
router.use(races.router);
router.use(speedruns.router);
router.use(webhooks.router);

export default router;
