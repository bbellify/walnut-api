import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';

// TODO: any
const fetch = (url: string, options?: any) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, options));

dotenv.config();
const router: Router = express.Router();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const RPC_URL = process.env.RPC_URL as string;

// TODO: maybe auth string should come from fe
const headers = {
  'content-type': 'text/plain;',
  Authorization: `Basic ${Buffer.from(`${USER}:${PASS}`).toString('base64')}`
};

function dataString(method: string, params?: string[]): string {
  // TODO: method should be type that has method name and id
  return JSON.stringify({
    jsonrpc: '1.0',
    id: 'curltext',
    method: method,
    params: params ?? []
  });
}

router.get('/', (_req: Request, res: Response) => res.send('/rpc OK'));

router.get('/getblockcount', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockcount'),
    headers: headers
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

router.get('/getblockchaininfo', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockchaininfo'),
    headers: headers
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

router.get('/batchtest', async (_req, response) => {
  // this batch data structure works
  const body = JSON.stringify([
    {
      jsonrpc: '1.0',
      id: 'curltext',
      method: 'getblockcount',
      params: []
    },
    {
      jsonrpc: '1.0',
      id: 'curltext',
      method: 'getblockchaininfo',
      params: []
    }
  ]);

  const options = {
    method: 'POST',
    body: body,
    headers: headers
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

export default router;