import { Request, Response } from 'express';

class SSEManager {
  private clients: { [id: string]: Response } = {};
  private clientIdCounter = 0;

  constructor() {}

  public init(req: Request, res: Response) {
    req.socket.setKeepAlive(true);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    res.write(`data: ${JSON.stringify({ status: 'Connected' })}\n\n`);

    const clientId = this.clientIdCounter++;
    this.clients[clientId] = res;

    req.on('close', () => {
      delete this.clients[clientId];
    });

    return clientId;
  }

  //   TODO this any will be replaced with some union at some point
  public sendUpdate(data: any) {
    const dataString = JSON.stringify(data);
    for (const clientId in this.clients) {
      const client = this.clients[clientId];
      try {
        client.write(`data: ${dataString}\n\n`);
      } catch (e) {
        // If writing to this client fails, assume the connection is broken
        delete this.clients[clientId];
      }
    }
  }

  //   TODO this any will be replaced with some union at some point
  public sendUpdateToClient(clientId: string, data: any) {
    const client = this.clients[clientId];
    if (client) {
      client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  }
}

export default new SSEManager();
