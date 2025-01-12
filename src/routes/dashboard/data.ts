import { cpuTemperature, mem, currentLoad, time } from 'systeminformation';
import { secondsToTime, celciusToFahrenheit } from '../../util';

export async function getSystemStatus() {
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

export function dataString(method: string, params?: string[]): string {
  // TODO: method should be type that has method name and id
  return JSON.stringify({
    jsonrpc: '1.0',
    id: 'curltext',
    method: method,
    params: params ?? []
  });
}

export function getSummary() {
  return {
    blockCount: '800,000',
    price: '$100,000',
    marketCap: '1T',
    networkConnections: '42',
    syncStatus: 'synced',
    blockchainSize: '750G'
  };
}
