import { config } from 'dotenv';
config();

import * as express from 'express';
import * as cors from 'cors';
import db from './services/db';
import router from './router';

const app = express();
const port = parseInt(process.env.PORT || '8123');

app.use(cors());
app.use(router);

db.connect().then(
    () => app.listen(port, () => console.log(`diablorun-api-server running on port ${port}`))
);
