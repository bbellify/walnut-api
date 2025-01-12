import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import SSE from './sse';

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server: Express = express();
server.use(express.json());
// TODO need to set this an env variable depending on dev/prod envs
server.use(
  cors({
    origin: 'http://localhost:5555',
    methods: ['GET', 'POST']
  })
);

server.get('/stream', (req, res) => {
  // const clientId = SSE.init(req, res);
  SSE.init(req, res);
});

import dashboardRouter from './routes/dashboard';

server.use('/dashboard', dashboardRouter);

server.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

server.listen(PORT, '0.0.0.0', () =>
  console.log(`Walnut API running on port ${PORT}`)
);
