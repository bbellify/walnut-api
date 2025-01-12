import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { bitcoinRPC } from '../../rpc';
import { cpuTemperature, mem, currentLoad, time } from 'systeminformation';
import { secondsToTime, celciusToFahrenheit } from '../../util';

dotenv.config();
const COIN_GECKO_API_KEY = process.env.COIN_GECKO_API_KEY as string;
const COIN_GECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/bitcoin';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'x-cg-demo-api-key': COIN_GECKO_API_KEY
  }
};

type MarketData = {
  current_price: {
    usd: number;
  };
  ath: {
    usd: number;
  };
  market_cap: {
    usd: number;
  };
  ath_date: {
    usd: string;
  };
  ath_change_percentage: {
    usd: number;
  };
};
type PriceData = {
  price: string;
  marketCap: string;
  ath: string;
  declineFromAth: string;
  athDate: string;
};
export async function getPriceData(): Promise<PriceData | object> {
  return fetch(COIN_GECKO_API_URL, options)
    .then(async (res) => {
      const response = (await res.json()) as { market_data: MarketData };
      const marketData = response.market_data;
      if (marketData) {
        const priceData = toPriceData(marketData);
        return priceData;
      }
      return {};
    })
    .catch((err) => {
      console.error(err);
      return {};
    });
}

function toPriceData(data: MarketData): PriceData {
  const priceData = {
    price: '',
    marketCap: '',
    ath: '',
    declineFromAth: '',
    athDate: ''
  };
  if (data.current_price) {
    priceData.price = '$' + data.current_price.usd.toLocaleString();
  }
  if (data.ath) {
    priceData.ath = '$' + data.ath.usd.toLocaleString();
  }
  if (data.ath_change_percentage) {
    priceData.declineFromAth =
      data.ath_change_percentage.usd.toLocaleString() + '%';
  }
  if (data.market_cap) {
    priceData.marketCap = '$' + formatLargeNumber(data.market_cap.usd);
  }
  if (data.ath_date) {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    priceData.athDate = new Date(data.ath_date.usd).toLocaleDateString(
      'en-US',
      options
    );
  }
  return priceData;
}

function formatLargeNumber(number: number): string {
  const absNumber = Math.abs(number);

  if (absNumber >= 1e12) {
    // Trillion
    return (number / 1e12).toFixed(2) + 'T';
  } else if (absNumber >= 1e9) {
    // Billion
    return (number / 1e9).toFixed(2) + 'B';
  } else if (absNumber >= 1e6) {
    // Million
    return (number / 1e6).toFixed(2) + 'M';
  } else if (absNumber >= 1e3) {
    // Thousand
    return (number / 1e3).toFixed(2) + 'K';
  } else {
    return number.toString();
  }
}

export async function getMempool() {
  const mempool: GetMempoolRPCResult = (await bitcoinRPC(['getmempoolinfo']))
    .result;
  console.log('result in mempool', mempool);
  return toMempool(mempool);
}

function toMempool(mempool: GetMempoolRPCResult) {
  return {
    numberOfTxs: mempool.size.toFixed(0),
    minimumFee: mempool.mempoolminfee,
    // need more info for blocksToClear
    blocksToClear: '5'
  };
}

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

export async function getSummary() {
  const summary: GetBlockChainInfoRPCResult = (
    await bitcoinRPC(['getblockchaininfo'])
  ).result;
  console.log('result in summary', summary);
  return toSummary(summary);
}

function toSummary(summary: GetBlockChainInfoRPCResult) {
  return {
    blockCount: summary.blocks.toLocaleString(),
    syncStatus: (summary.verificationprogress * 100).toFixed(0) + '%',
    blockchainSize: formatBytesToGB(summary.size_on_disk) + ' GB',
    // get these from getnetworkinfo, maybe batch or just separate requests
    connectionsOutbound: '10',
    connectionsInbound: '15'
  };
}

function formatBytesToGB(bytes: number) {
  const gigabytes = bytes / 1000 ** 3;
  return gigabytes.toFixed(1);
}

export async function getFeeData() {
  // const feeData: Get
}

type GetBlockChainInfoRPCResult = {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  time: number;
  mediantime: number;
  verificationprogress: number;
  initialblockdownload: boolean;
  chainwork: string;
  size_on_disk: number;
  pruned: boolean;
  warnings: string[];
};

type GetNetworkInfoRPCResult = {
  connections_in: number;
  connections_out: number;
};

type GetMempoolRPCResult = {
  size: number;
  bytes: number;
  mempoolminfee: number;
};
