import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import initDB from './db/init.js';
import { init } from './db/queries.js';

import rpcRouter from './routes/rpc';
import authRouter from './routes/auth';

dotenv.config();
const PORT = process.env.PORT;

const server: Express = express();
// TODO need to set this an env variable depending on dev/prod envs
server.use(
  cors({
    origin: 'http://localhost:5555',
    methods: ['GET', 'POST']
  })
);

server.use('/auth', authRouter);
server.use('/rpc', rpcRouter);

server.get('/init', async (_req: Request, res: Response) => {
  try {
    const user = await init();
    res.send({ initialized: user ? true : false });
  } catch {
    res.status(500).send({ error: 'failed to initialize' });
  }
});

server.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

initDB().then(() => {
  server.listen(PORT, () => console.log(`Walnut API running on port ${PORT}`));
});
