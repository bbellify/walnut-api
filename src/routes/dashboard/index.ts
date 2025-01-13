import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import SSE from '../../sse';
import {
  getSummary,
  getSystemStatus,
  getPriceData,
  getFeeData,
  getDifficultyData,
  getMiningData
} from './data';

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
      type: 'systemStatus',
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

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await getSummary();
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
      type: 'summary',
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
        type: 'price',
        error: 'external API request error'
      });
    }
  } catch {
    res.json({
      status: 500,
      type: 'price',
      error: 'Server error'
    });
  }
});

// router.get('/mempool', async (_req: Request, res: Response) => {
//   console.log("in mempool")
//   const mempool = await getMempool()
// })

router.get('/fees', async (_req: Request, res: Response) => {
  try {
    const feeData = await getFeeData();
    res.json({
      status: 200,
      message: 'get fees successful',
      data: feeData,
      type: 'fees',
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      type: 'fees',
      error: 'Server error'
    });
  }
});

router.get('/difficulty', async (_req: Request, res: Response) => {
  try {
    const difficultyData = await getDifficultyData();
    res.json({
      status: 200,
      message: 'get difficulty successful',
      data: difficultyData,
      type: 'difficulty',
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      type: 'difficulty',
      error: 'Server error'
    });
  }
});

router.get('/mining', async (_req: Request, res: Response) => {
  try {
    const miningData = await getMiningData();
    res.json({
      status: 200,
      message: 'get mining successful',
      data: miningData,
      type: 'mining',
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      type: 'mining',
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
