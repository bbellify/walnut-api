import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

import {
  RPCResponse,
  BlockchainInfo,
  NetworkInfo,
  SmartFeeEstimate,
  BlockCount,
  BlockHash,
  Block,
  MempoolInfo,
  Difficulty,
  BlockTemplate
} from './types';

dotenv.config();

const HOST = 'localhost';
const PORT = process.env.RPC_PORT ? parseInt(process.env.RPC_PORT) : 8332;
const COOKIE_PATH = process.env.PATH_TO_COOKIE as string;

class RPCClient {
  private url: string;
  private cookie: string;

  constructor(
    host: string = 'localhost',
    port: number = 8332,
    cookiePath: string
  ) {
    this.url = `http://${host}:${port}`;
    this.cookie = this.readCookie(cookiePath);
  }

  private readCookie(cookiePath: string): string {
    try {
      return fs.readFileSync(cookiePath).toString('base64');
    } catch (error) {
      throw new Error(
        `Failed to read cookie file: ${(error as Error).message}`
      );
    }
  }

  private async makeRequest<T>(
    method: string,
    params: unknown[] = []
  ): Promise<T> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${this.cookie}`
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: 'rpc-client',
        method: method,
        params: params
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = (await response.json()) as RPCResponse<T>;
    if (json.error) {
      throw new Error(`RPC error: ${json.error.message}`);
    }

    return json.result;
  }

  public async getblockchaininfo(): Promise<BlockchainInfo> {
    return this.makeRequest('getblockchaininfo');
  }

  public async getnetworkinfo(): Promise<NetworkInfo> {
    return this.makeRequest('getnetworkinfo');
  }

  public async estimatesmartfee(
    conf_target: number,
    estimate_mode?: string
  ): Promise<SmartFeeEstimate> {
    return this.makeRequest('estimatesmartfee', [conf_target, estimate_mode]);
  }

  public async getblockcount(): Promise<BlockCount> {
    return this.makeRequest('getblockcount');
  }

  public async getblockhash(height: number): Promise<BlockHash> {
    return this.makeRequest('getblockhash', [height]);
  }

  // no support for verbosity argument yet
  public async getblock(hash: string): Promise<Block> {
    return this.makeRequest('getblock', [hash]);
  }

  public async getmempoolinfo(): Promise<MempoolInfo> {
    return this.makeRequest('getmempoolinfo');
  }

  public async getdifficulty(): Promise<Difficulty> {
    return this.makeRequest('getdifficulty');
  }

  // not full support for this RPC method
  public async getblocktemplate(rules: string[]): Promise<BlockTemplate> {
    return this.makeRequest('getblocktemplate', [{ rules }]);
  }
}

export default new RPCClient(HOST, PORT, COOKIE_PATH);

// REFERENCE:
// this batch data structure works
// const body = JSON.stringify([
//   {
//     jsonrpc: '1.0',
//     id: 'curltext',
//     method: 'getblockcount',
//     params: []
//   },
//   {
//     jsonrpc: '1.0',
//     id: 'curltext',
//     method: 'getblockchaininfo',
//     params: []
//   }
// ]);

// const options = {
//   method: 'POST',
//   body: body
//   // headers: headers
// };
