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
const expectedAdjustmentTime = 1209600;
const maxAdjustmentFactor = 4;
const blocksPerRetarget = 2016;
const secondsPerBlock = 600;

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
  const mempool: GetMempoolRPCResult = (await bitcoinRPC(['getmempoolinfo']))[0]
    .result;
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
  )[0].result;
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
  const fees = await bitcoinRPC(
    [
      'estimatesmartfee',
      'estimatesmartfee',
      'estimatesmartfee',
      'estimatesmartfee'
    ],
    [[1], [6], [144], [1008]]
  );
  return toFeeData(
    fees.map((fee) => {
      return fee.error
        ? {
            feerate: ''
          }
        : fee.result;
    })
  );
}

function toFeeData(fees: GetFeesRPCResult[]) {
  return {
    immediate: fees[0].feerate
      ? convertToSatPerByte(fees[0].feerate) + ' sat/vB'
      : '--',
    hour: fees[1].feerate
      ? convertToSatPerByte(fees[1].feerate) + ' sat/vB'
      : '--',
    day: fees[2].feerate
      ? convertToSatPerByte(fees[2].feerate) + ' sat/vB'
      : '--',
    week: fees[3].feerate
      ? convertToSatPerByte(fees[3].feerate) + ' sat/vB'
      : '--'
  };
}

function convertToSatPerByte(feeRateInBTCPerKB: number) {
  // 1 BTC = 100,000,000 satoshis, 1 kB = 1024 bytes
  return Math.ceil((feeRateInBTCPerKB * 100000000) / 1024);
}

export async function getDifficultyData() {
  const difficulty = (await bitcoinRPC(['getdifficulty']))[0].result as number;
  const blockCount = (await bitcoinRPC(['getblockcount']))[0].result;
  const currentBlockHash = (
    await bitcoinRPC(['getblockhash'], [[blockCount]])
  )[0].result;
  const currentBlock = (await bitcoinRPC(['getblock'], [[currentBlockHash]]))[0]
    .result;
  const currentBlockTime = currentBlock.time as number;

  const lastRetargetHeight = blockCount - (blockCount % blocksPerRetarget);
  const lastRetargetBlockHash = (
    await bitcoinRPC(['getblockhash'], [[lastRetargetHeight]])
  )[0].result;
  const lastRetargetBlock = (
    await bitcoinRPC(['getblock'], [[lastRetargetBlockHash]])
  )[0].result;
  const lastRetargetBlockTime = lastRetargetBlock.time as number;
  const lastRetargetBlockDifficulty = lastRetargetBlock.difficulty as number;
  const actualReadjustmentTime = currentBlockTime - lastRetargetBlockTime;

  let newDifficulty =
    lastRetargetBlockDifficulty *
    (expectedAdjustmentTime / actualReadjustmentTime);
  const adjustmentFactor = Math.min(
    maxAdjustmentFactor,
    Math.max(
      1 / maxAdjustmentFactor,
      expectedAdjustmentTime / actualReadjustmentTime
    )
  );
  newDifficulty = lastRetargetBlockDifficulty * adjustmentFactor;
  const percentageChange = Math.abs(
    ((newDifficulty - difficulty) / difficulty) * 100
  );
  console.log('percentage change', percentageChange);

  return toDifficultyData(
    difficulty,
    blockCount,
    currentBlockTime,
    percentageChange
  );
}

function toDifficultyData(
  difficulty: number,
  blockCount: number,
  currentBlockTime: number,
  percentageChange: number
) {
  const blocksToRetarget =
    blocksPerRetarget - Math.floor(blockCount % blocksPerRetarget);
  const secondsUntilRetarget = blocksToRetarget * secondsPerBlock;
  const estimatedTimeStamp = currentBlockTime + secondsUntilRetarget;

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  return {
    difficulty: formatScientificNotation(difficulty),
    blocksToRetarget: blocksToRetarget.toString(),
    retargetDate: new Date(estimatedTimeStamp * 1000).toLocaleDateString(
      'en-US',
      options
    ),
    estimatedAdjustment: percentageChange.toFixed(2) + '%'
  };
}

function formatScientificNotation(number: number): string {
  // Convert the number to its scientific notation form
  const scientific = number.toExponential();

  // Split the scientific notation into parts
  const parts = scientific.split('e');
  let coefficient = parseFloat(parts[0]);
  let exponent = parseInt(parts[1]);

  // Adjust coefficient and exponent to keep the number in hundreds
  exponent -= 2; // Decrease exponent by 2
  coefficient *= 100; // Increase coefficient by 100 to compensate

  // Format the coefficient to 3 significant figures for consistency
  const formattedCoefficient = coefficient.toPrecision(6).replace(/\.0+$/, ''); // Remove trailing .00 if present for whole numbers

  const sign = exponent < 0 ? '-' : '';
  const absExponent = Math.abs(exponent);

  // Create superscript for the exponent
  const superscript = absExponent
    .toString()
    .split('')
    .map((char) => {
      switch (char) {
        case '0':
          return '⁰';
        case '1':
          return '¹';
        case '2':
          return '²';
        case '3':
          return '³';
        case '4':
          return '⁴';
        case '5':
          return '⁵';
        case '6':
          return '⁶';
        case '7':
          return '⁷';
        case '8':
          return '⁸';
        case '9':
          return '⁹';
        default:
          return char;
      }
    })
    .join('');

  // Combine everything into the desired format
  return `${formattedCoefficient}×10${sign}${superscript}`;
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

type GetFeesRPCResult = {
  feerate: number;
};
