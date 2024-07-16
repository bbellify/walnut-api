import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import './db/index.ts';

import rpcRouter from './routes/rpc';
import authRouter from './routes/auth';

dotenv.config();
const PORT = process.env.PORT;

const server: Express = express();

server.use('/auth', authRouter);
server.use('/rpc', rpcRouter);

server.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

server.listen(PORT, () => console.log(`Walnut API running on port ${PORT}`));
