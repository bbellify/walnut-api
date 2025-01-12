import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';

// TODO: any
const fetch = (url: string, options?: any) =>
  import('node-fetch').then(({ default: fetch }) => fetch(url, options));

dotenv.config();
const router: Router = express.Router();

const RPC_URL = process.env.RPC_URL as string;

function dataString(method: string, params?: string[]): string {
  // TODO: method should be type that has method name and id
  return JSON.stringify({
    jsonrpc: '1.0',
    id: 'curltext',
    method: method,
    params: params ?? []
  });
}

function getSummary() {
  return {
    blockCount: '800,000',
    price: '$100,000',
    marketCap: '1T',
    networkConnections: '42',
    syncStatus: 'synced',
    blockchainSize: '750G'
  };
}

router.get('/', (_req: Request, res: Response) => res.send('/rpc OK'));

router.get('/summary', (_req: Request, res: Response) => {
  try {
    const summary = getSummary();
    res.json({
      status: 200,
      message: 'get summary successful',
      data: summary,
      type: 'summary',
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      error: 'Server error'
    });
  }
});

router.get('/getblockcount', async (_req: Request, res: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockcount')
    // headers: headers
  };

  try {
    const response = await fetch(RPC_URL, options);
    const data = await response.json();
    res.send(data);
  } catch (error) {
    console.log('error', error);
    res.status(501).send({ error: 'node error' });
  }
});

// TODO refactor all these with try/catch
router.get('/getblockchaininfo', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST',
    body: dataString('getblockchaininfo')
    // headers: headers
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
    body: body
    // headers: headers
  };

  const res = await fetch(RPC_URL, options);
  const data = await res.json();

  response.send(data);
});

export default router;
