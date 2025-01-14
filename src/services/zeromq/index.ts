import { Subscriber } from 'zeromq';
import SSE from '../sse';
import {
  getSummaryData,
  getFeeData,
  getMiningData,
  getMempoolData,
  getDifficultyData,
  getNextBlockData,
  getLatestBlocksData
} from '../../routes/dashboard/data';

export default class BlockSubscriber {
  private socket: Subscriber;

  constructor(url: string) {
    this.socket = new Subscriber();
    this.setupSocket(url);
  }

  private async setupSocket(url: string) {
    try {
      this.socket.connect(url);
      console.log('Connected to ZeroMQ endpoint for new block hash');
      // Subscribe to all messages on this endpoint
      this.socket.subscribe();
      // Listen for messages
      for await (const [, message] of this.socket) {
        await this.handleNewBlock(message);
      }
    } catch (error) {
      console.error('Failed to connect or subscribe:', error);
    }
  }

  private async handleNewBlock(hashData: Buffer) {
    const blockHash = hashData.toString('hex');
    const date = new Date().toLocaleString();
    console.log('New Block Hash Received at: ', date);
    console.log('New Block Hash Received:', blockHash);

    // summary
    const summaryData = await getSummaryData();
    SSE.sendUpdate({
      update: {
        type: 'summary',
        data: summaryData,
        timestamp: new Date().toISOString()
      }
    });
    // fees
    const feeData = await getFeeData();
    SSE.sendUpdate({
      update: {
        type: 'fees',
        data: feeData,
        timestamp: new Date().toISOString()
      }
    });
    // mining
    const miningData = await getMiningData();
    SSE.sendUpdate({
      update: {
        type: 'mining',
        data: miningData,
        timestamp: new Date().toISOString()
      }
    });
    // mempool
    const mempoolData = await getMempoolData();
    SSE.sendUpdate({
      update: {
        type: 'mempool',
        data: mempoolData,
        timestamp: new Date().toISOString()
      }
    });
    // difficulty
    const difficultyData = await getDifficultyData();
    SSE.sendUpdate({
      update: {
        type: 'difficulty',
        data: difficultyData,
        timestamp: new Date().toISOString()
      }
    });
    // next block
    const nextBlockData = await getNextBlockData();
    SSE.sendUpdate({
      update: {
        type: 'nextblock',
        data: nextBlockData,
        timestamp: new Date().toISOString()
      }
    });
    // latest blocks
    const latestBlocksData = await getLatestBlocksData();
    SSE.sendUpdate({
      update: {
        type: 'latestblocks',
        data: latestBlocksData,
        timestamp: new Date().toISOString()
      }
    });
  }
}
