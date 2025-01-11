import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import initDB from './db/init.js';

import rpcRouter from './routes/rpc';
import systemRouter from './routes/system';

dotenv.config();
const PORT = process.env.PORT;

const server: Express = express();
server.use(express.json());
// TODO need to set this an env variable depending on dev/prod envs
server.use(
  cors({
    origin: 'http://localhost:5555',
    methods: ['GET', 'POST']
  })
);

server.use('/rpc', rpcRouter);
server.use('/system', systemRouter);

server.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

server.listen(PORT, () => console.log(`Walnut API running on port ${PORT}`));
// initDB().then(() => {
//   server.listen(PORT, () => console.log(`Walnut API running on port ${PORT}`));
// });
