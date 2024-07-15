import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

const router: Router = express.Router();
dotenv.config();

const USER = process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD;
const RPC_URL = process.env.RPC_URL;

const headers = {
  'content-type': 'text/plain;'
};

const url = `http://${USER}:${PASS}@127.0.0.1:8332/`;
function dataString(method: string, params?: string[]): string {
  // method should be type that has method name and id
  return `{"jsonrpc":"1.0","id":"curltext","method":${method},"params":${params}`;
}

router.get('/', (_req: Request, res: Response) => res.send('rpc OK'));

router.get('/getblockcount', (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: JSON.stringify(dataString('getblockcount')),
    headers: headers
  };

  // const data = await response.json();
  fetch(RPC_URL as string, options)
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
