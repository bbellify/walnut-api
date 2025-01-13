import fetch from 'node-fetch';
import dotenv from 'dotenv';
import RPCClient from '../../rpc';
import { cpuTemperature, mem, currentLoad, time } from 'systeminformation';

import {
  BlockchainInfo,
  NetworkInfo,
  MempoolInfo,
  CGMarketData,
  CGPriceData
} from '../../rpc/types';

dotenv.config();

//
// Summary section
//
export async function getSummaryData() {
  const blockchainInfo = await RPCClient.getblockchaininfo();
  const networkInfo = await RPCClient.getnetworkinfo();
  return toSummary(blockchainInfo, networkInfo);
}

function toSummary(summary: BlockchainInfo, networkInfo: NetworkInfo) {
  return {
    blockCount: summary.blocks.toLocaleString(),
    syncStatus: (summary.verificationprogress * 100).toFixed(0) + '%',
    blockchainSize: formatBytesToGB(summary.size_on_disk) + ' GB',
    connectionsOutbound: networkInfo.connections_out.toString(),
    connectionsInbound: networkInfo.connections_in.toString()
  };
}

function formatBytesToGB(bytes: number) {
  const gigabytes = bytes / 1000 ** 3;
  return gigabytes.toFixed(1);
}

//
// Price section (CoinGecko API)
//
const COIN_GECKO_API_KEY = process.env.COIN_GECKO_API_KEY as string;
const COIN_GECKO_API_URL = 'https://api.coingecko.com/api/v3/coins/bitcoin';
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    'x-cg-demo-api-key': COIN_GECKO_API_KEY
  }
};
const localeOptions: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

export async function getPriceData(): Promise<CGPriceData | object> {
  return fetch(COIN_GECKO_API_URL, options)
    .then(async (res) => {
      const response = (await res.json()) as { market_data: CGMarketData };
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

function toPriceData(data: CGMarketData): CGPriceData {
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
    priceData.athDate = new Date(data.ath_date.usd).toLocaleDateString(
      'en-US',
      localeOptions
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

//
// System Status section
//
export async function getSystemStatusData() {
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

export function secondsToTime(seconds: number): string {
  seconds = Math.floor(seconds);

  const days = Math.floor(seconds / (3600 * 24));
  seconds -= days * 3600 * 24;

  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;

  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  const remainingSeconds = seconds;

  let timeString = '';

  if (days > 0) timeString += `${days}d`;
  if (hours > 0) timeString += `${hours}h`;
  if (minutes > 0) timeString += `${minutes}m`;
  if (remainingSeconds > 0 || timeString === '') {
    timeString += `${remainingSeconds}s`;
  }
  return timeString.replace(/,\s*$/, '');
}

export function celciusToFahrenheit(c: number): number {
  return c * (9 / 5) + 32;
}

//
// Fees section
//
export async function getFeeData() {
  const { feerate: immediate } = await RPCClient.estimatesmartfee(1);
  const { feerate: hour } = await RPCClient.estimatesmartfee(6);
  const { feerate: day } = await RPCClient.estimatesmartfee(144);
  const { feerate: week } = await RPCClient.estimatesmartfee(1008);

  return toFeeData([immediate, hour, day, week]);
}

function toFeeData(fees: number[]) {
  return {
    immediate: fees[0] ? convertToSatPerByte(fees[0]) + ' sat/vB' : '--',
    hour: fees[1] ? convertToSatPerByte(fees[1]) + ' sat/vB' : '--',
    day: fees[2] ? convertToSatPerByte(fees[2]) + ' sat/vB' : '--',
    week: fees[3] ? convertToSatPerByte(fees[3]) + ' sat/vB' : '--'
  };
}

function convertToSatPerByte(feeRateInBTCPerKB: number) {
  // 1 BTC = 100,000,000 satoshis, 1 kB = 1024 bytes
  return Math.ceil((feeRateInBTCPerKB * 100000000) / 1024);
}

//
// Mining section
//
export async function getMiningData() {
  const blockCount = await RPCClient.getblockcount();
  const currentBlockHash = await RPCClient.getblockhash(blockCount);
  const currentBlock = await RPCClient.getblock(currentBlockHash);

  const halvings = Math.floor(blockCount / 210000);
  const currentSubsidy = 50 / 2 ** halvings;

  const blocksUntilHalving = 210000 - (blockCount % 210000);
  const secondsUntilHalving = blocksUntilHalving * secondsPerBlock;
  const estimatedHalvingDate = (currentBlock.time + secondsUntilHalving) * 1000;

  // Current network hashrate (rough estimate)
  const difficulty = currentBlock.difficulty;
  const estimatedHashrate = (difficulty * 2 ** 32) / 600; // In H/s

  return toMiningData(
    blockCount,
    currentSubsidy,
    blocksUntilHalving,
    estimatedHalvingDate,
    estimatedHashrate
  );
}

function toMiningData(
  blockCount: number,
  currentSubsidy: number,
  blocksUntilHalving: number,
  estimatedHalvingDate: number,
  estimatedHashrate: number
) {
  const coins = calculateMinedBitcoin(blockCount);
  const coinPercent = (coins / 21000000) * 100;

  return {
    coins: Math.round(coins).toLocaleString() + ` (${coinPercent.toFixed(2)}%)`,
    blockSubsidy: currentSubsidy.toFixed(3) + ' BTC',
    blocksUntilHalving: blocksUntilHalving.toLocaleString(),
    halvingEstimate: new Date(estimatedHalvingDate).toLocaleDateString(
      'en-US',
      localeOptions
    ),
    networkHashRate: convertHtoEH(estimatedHashrate).toFixed(1) + ' EH/s'
  };
}

function calculateMinedBitcoin(blockHeight: number): number {
  const initialReward = 50; // Initial reward in BTC
  const halvingInterval = 210000; // Blocks per halving
  let totalBitcoinMined = 0;

  // Calculate rewards for each halving period
  let currentReward = initialReward;
  let remainingBlocks = blockHeight;

  while (remainingBlocks > 0) {
    // Determine the blocks in the current halving period
    const blocksInCurrentPeriod = Math.min(halvingInterval, remainingBlocks);

    // Add the mined bitcoins from this halving period
    totalBitcoinMined += blocksInCurrentPeriod * currentReward;

    // Move to the next halving period
    currentReward /= 2;
    remainingBlocks -= halvingInterval;
  }

  // Subtract genesis block reward as it wasn't spendable
  if (blockHeight > 0) {
    totalBitcoinMined -= 50;
  }

  return totalBitcoinMined;
}

function convertHtoEH(hashRateH: number): number {
  // 1 EH/s = 10^18 H/s
  const EHPerSecond = hashRateH / Math.pow(10, 18);
  return EHPerSecond;
}

//
// Mempool section
//
export async function getMempoolData() {
  const mempoolInfo = await RPCClient.getmempoolinfo();

  const mempoolSizeBytes = mempoolInfo.bytes;
  // Convert bytes to weight units (WU), this is a rough estimation
  const effectiveMempoolWeight = mempoolSizeBytes * 4;

  // Estimate average block weight from recent blocks
  let totalBlockWeight = 0;
  const numberOfBlocksToCheck = 10; // Check last 10 blocks
  for (let i = 1; i <= numberOfBlocksToCheck; i++) {
    const blockHash = await RPCClient.getblockhash(
      (await RPCClient.getblockcount()) - i
    );
    const block = await RPCClient.getblock(blockHash);
    totalBlockWeight += block.weight;
  }
  const averageBlockWeight = totalBlockWeight / numberOfBlocksToCheck;

  // Calculate how many blocks are needed
  const estimatedBlocks = Math.ceil(
    effectiveMempoolWeight / averageBlockWeight
  );
  return toMempool(mempoolInfo, estimatedBlocks);
}

function toMempool(mempool: MempoolInfo, estimatedBlocks: number) {
  return {
    numberOfTxs: (+mempool.size.toFixed(0)).toLocaleString(),
    minimumFee: convertToSatPerByte(mempool.mempoolminfee) + ' sat/vB',
    blocksToClear: estimatedBlocks.toString()
  };
}

//
// Difficulty section
//
const expectedAdjustmentTime = 1209600;
const maxAdjustmentFactor = 4;
const blocksPerRetarget = 2016;
const secondsPerBlock = 600;
export async function getDifficultyData() {
  const difficulty = await RPCClient.getdifficulty();
  const blockCount = await RPCClient.getblockcount();
  const currentBlock = await RPCClient.getblock(
    await RPCClient.getblockhash(blockCount)
  );

  const lastRetargetHeight = blockCount - (blockCount % blocksPerRetarget);
  const lastRetargetBlock = await RPCClient.getblock(
    await RPCClient.getblockhash(lastRetargetHeight)
  );

  const actualReadjustmentTime = currentBlock.time - lastRetargetBlock.time;

  const adjustmentFactor = Math.min(
    maxAdjustmentFactor,
    Math.max(
      1 / maxAdjustmentFactor,
      actualReadjustmentTime / expectedAdjustmentTime
    )
  );

  let newDifficulty = lastRetargetBlock.difficulty * adjustmentFactor;
  newDifficulty = Number(newDifficulty.toFixed(8));

  const percentageChange =
    (newDifficulty - lastRetargetBlock.difficulty) /
    (lastRetargetBlock.difficulty * 100);

  return toDifficultyData(
    difficulty,
    blockCount,
    currentBlock.time,
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

  return {
    difficulty: formatScientificNotation(difficulty),
    blocksToRetarget: blocksToRetarget.toString(),
    retargetDate: new Date(estimatedTimeStamp * 1000).toLocaleDateString(
      'en-US',
      localeOptions
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
