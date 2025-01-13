import express, { Request, Response, Router } from 'express';
import dotenv from 'dotenv';
import SSE from '../../sse';
import {
  getSummaryData,
  getPriceData,
  getSystemStatusData,
  getFeeData,
  getMiningData,
  getMempoolData,
  getDifficultyData
} from './data';

const router: Router = express.Router();

router.get('/stream', (req, res) => {
  // const clientId = SSE.init(req, res);
  SSE.init(req, res);
});

dotenv.config();

router.get('/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await getSummaryData();
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

setInterval(async () => {
  const priceData = await getPriceData();
  if (Object.entries(priceData).length) {
    SSE.sendUpdate({
      update: {
        type: 'price',
        data: await getPriceData(),
        timestamp: new Date().toISOString()
      }
    });
  }
}, 600000); // 10 mins

router.get('/status', async (_req: Request, res: Response) => {
  try {
    const systemStatus = await getSystemStatusData();
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
      data: await getSystemStatusData(),
      timestamp: new Date().toISOString()
    }
  });
}, 10000); // 10 seconds (helpful for dev, make less frequent eventually)

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

router.get('/mempool', async (_req: Request, res: Response) => {
  try {
    const mempoolData = await getMempoolData();
    res.json({
      status: 200,
      message: 'get mempool successful',
      data: mempoolData,
      type: 'mempool',
      errors: null
    });
  } catch {
    res.json({
      status: 500,
      type: 'mempool',
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

export default router;
