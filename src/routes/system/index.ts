import express, { Request, Response, Router } from 'express';
import { cpuTemperature, mem, currentLoad, time } from 'systeminformation';
import { secondsToTime, celciusToFahrenheit } from '../../util';
import SSE from '../../sse';

const router: Router = express.Router();

async function getSystemStatus() {
  const uptime = time();
  const memory = await mem();
  const cpuUsage = await currentLoad();
  const temp = await cpuTemperature();

  return {
    uptime: uptime ? secondsToTime(uptime.uptime) : '',
    cpuUsage: cpuUsage ? cpuUsage.currentLoad.toFixed(2) + '%' : '',
    memoryUsage: memory
      ? (((memory.total - memory.available) / memory.total) * 100).toFixed(2) +
        '%'
      : '',
    //   hardcoded to F for now
    temperature: temp ? celciusToFahrenheit(temp.main).toFixed(2) + 'ºF' : ''
  };
}

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
}, 10000);

export default router;
