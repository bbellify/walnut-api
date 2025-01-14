import { Subscriber } from 'zeromq';

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
        this.handleNewBlock(message);
      }
    } catch (error) {
      console.error('Failed to connect or subscribe:', error);
    }
  }

  private handleNewBlock(hashData: Buffer) {
    const blockHash = hashData.toString('hex');
    console.log('New Block Hash Received:', blockHash);
  }
}
