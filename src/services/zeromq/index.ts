import { Subscriber } from 'zeromq';
import SSE from '../sse';
import {
  getSummaryData
  // getFeeData,
  // getMiningData,
  // getMempoolData,
  // getDifficultyData,
  // getNextBlockData,
  // getLatestBlocksData
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
    // fees
    // mining
    // mempool
    // difficulty
    // next block
    const summaryData = await getSummaryData();
    SSE.sendUpdate({
      update: {
        type: 'summary',
        data: summaryData,
        timestamp: new Date().toISOString()
      }
    });

    // const feeData = getFeeData();
    // const miningData = getMiningData();
    // const mempoolData = getMempoolData();
    // const difficultyData = getDifficultyData();
    // const nextBlockData = getNextBlockData();
    // const latestBlocksData = getLatestBlocksData();
  }
}
