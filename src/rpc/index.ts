import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';

// TODO: any
const fetch = (url: string, options?: any) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, options));

const router: Router = express.Router();
dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const RPC_URL = process.env.RPC_URL as string;

// TODO: maybe auth string should come from fe
const headers: string = JSON.stringify({
  'content-type': 'text/plain;',
  Authorization: `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`
});

function dataString(method: string, params?: string[]): string {
  // TODO: method should be type that has method name and id
  return JSON.stringify({
    jsonrpc: '1.0',
    id: 'curltext',
    method: method,
    params: params ?? []
  });
}

router.get('/', (_req: Request, res: Response) => res.send('rpc OK'));

router.get('/getblockcount', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockcount'),
    headers: JSON.stringify(headers)
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

router.get('/getblockchaininfo', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockchaininfo'),
    headers: JSON.stringify(headers)
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

router.get('/batchtest', (req, res) => {
  // use array of methods with jsonpc:1, try two and see what happes
  console.log('batching');
});

export default router;
