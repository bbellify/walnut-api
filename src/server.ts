import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dashboardRouter from './routes/dashboard';

dotenv.config();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const DEV_ORIGIN = process.env.DEV_ORIGIN;

const server: Express = express();
server.use(express.json());
// allowing origin in .env for dev
server.use(
  cors({
    origin: DEV_ORIGIN,
    methods: ['GET', 'POST']
  })
);

server.use('/dashboard', dashboardRouter);

server.get('/', (_req: Request, res: Response) => {
  res.send('OK');
});

server.listen(PORT, '127.0.0.1', () =>
  console.log(`Walnut API running on port ${PORT}`)
);
