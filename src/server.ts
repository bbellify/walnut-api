import express, { Express, Request, Response } from 'express';
import rpcRouter from './rpc';
import dotenv from 'dotenv';

dotenv.config();
const PORT = process.env.PORT;

const server: Express = express();

server.use('/rpc', rpcRouter);

server.get('/', (_req: Request, res: Response) => {
  res.send('Walnut OK');
});

server.listen(PORT, () => console.log(`Walnut API running on port ${PORT}`));
