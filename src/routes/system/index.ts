import express, { Request, Response, Router } from 'express';
import { cpuTemperature, mem, currentLoad, time } from 'systeminformation';
import { secondsToTime, celciusToFahrenheit } from '../../util';

const router: Router = express.Router();

router.get('/status', async (req: Request, res: Response) => {
  const uptime = time();
  const memory = await mem();
  const cpuUsage = await currentLoad();
  const temp = await cpuTemperature();
  try {
    const systemStatus = {
      uptime: uptime ? secondsToTime(uptime.uptime) : '',
      cpuUsage: cpuUsage ? cpuUsage.currentLoad.toFixed(2) : '',
      memoryUsage: memory
        ? (((memory.total - memory.available) / memory.total) * 100).toFixed(2)
        : '',
      temperature: temp ? celciusToFahrenheit(temp.main).toFixed(2) : ''
    };
    console.log('systemStatus', systemStatus);

    res.json({
      status: 200,
      message: 'Success',
      data: {
        systemStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch {
    res.json({
      status: 500,
      error: 'Server error'
    });
  }
});

export default router;
