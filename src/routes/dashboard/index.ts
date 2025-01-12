import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import SSE from '../../sse';
import { getSummary, getSystemStatus, getPriceData } from './data';

const router: Router = express.Router();

router.get('/stream', (req, res) => {
  // const clientId = SSE.init(req, res);
  SSE.init(req, res);
});

dotenv.config();
const RPC_URL = process.env.RPC_URL as string;

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const systemStatus = await getSystemStatus();

    res.json({
      status: 200,
      message: 'get system status successful',
      type: 'systemStatus',
      data: systemStatus,
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      error: 'Server error'
    });
  }
});

setInterval(async () => {
  SSE.sendUpdate({
    update: {
      type: 'systemStatus',
      data: await getSystemStatus(),
      timestamp: new Date().toISOString()
    }
  });
}, 10000); // 10 seconds (helpful for dev, make less frequent eventually)

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

router.get('/price', async (_req: Request, res: Response) => {
  try {
    const priceData = await getPriceData();
    if (Object.entries(priceData).length) {
      res.json({
        status: 200,
        message: 'get price successful',
        data: priceData,
        type: 'price',
        errors: null
      });
    } else {
      res.json({
        status: 500,
        error: 'Server error'
      });
    }
  } catch {
    res.json({
      status: 500,
      error: 'Server error'
    });
  }
});

setInterval(async () => {
  const priceData = await getPriceData();
  if (Object.entries(priceData).length) {
    SSE.sendUpdate({
      update: {
        type: 'systemStatus',
        data: await getSystemStatus(),
        timestamp: new Date().toISOString()
      }
    });
  }
}, 600000); // 10 mins

// TODO refactor all these with try/catch
router.get('/getblockchaininfo', async (_req: Request, response: Response) => {
  const options = {
    method: 'POST'
    // body: dataString('getblockchaininfo')
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
