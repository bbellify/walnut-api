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

const headers = {
  'content-type': 'text/plain;',
  Authorization: `Basic ${USER}:${PASS}`
};

function dataString(method: string, params?: string[]): string {
  // TODO: method should be type that has method name and id
  return `{"jsonrpc":"1.0","id":"curltext","method":${method},"params":${params}`;
}

router.get('/', (_req: Request, res: Response) => res.send('rpc OK'));

router.get('/getblockcount', (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(dataString('getblockcount')),
    headers: headers
  };

  fetch(RPC_URL, options)
    .then((res) => {
      response.send(res);
    })
    .catch((err) => {
      console.log('error log', err);
    });
});

router.get('/batchtest', (req, res) => {
  // use array of methods with jsonpc:1, try two and see what happes
  console.log('batching');
});

export default router;
