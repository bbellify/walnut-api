import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

import {
  RPCResponse_,
  BlockchainInfo,
  NetworkInfo,
  SmartFeeEstimate,
  BlockCount,
  BlockHash,
  Block,
  // continue here, want in order in types
  MempoolInfo
} from './types';

dotenv.config();

const HOST = 'localhost';
const PORT = process.env.RPC_PORT ? parseInt(process.env.RPC_PORT) : 8332;
const COOKIE_PATH = process.env.PATH_TO_COOKIE as string;

export async function bitcoinRPC(
  methods: string[],
  params?: any[][]
): Promise<RPCResponse[]> {
  let auth: string;
  try {
    auth = fs.readFileSync(COOKIE_PATH).toString('base64');
  } catch (error) {
    throw new Error('Failed to read cookie file: ' + error.message);
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${auth}`
    },
    body: JSON.stringify(
      methods.map((m, i) => {
        return {
          jsonrpc: '1.0',
          id: 'node-fetch',
          method: m,
          params: params && params[i] ? params[i] : null
        };
      })
    )
  };

  try {
    const response = await fetch(`http://${HOST}:${PORT}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data as RPCResponse[];
  } catch (error) {
    // Handle fetch or parsing errors
    console.error('Fetch error:', error);
    throw error;
  }
}

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

  private async makeRequest<T>(method: string, params: any[] = []): Promise<T> {
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

    const json = (await response.json()) as RPCResponse_<T>;
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
}

export default new RPCClient(HOST, PORT, COOKIE_PATH);

// Define interface for RPC response to ensure type safety
type RPCResponse = {
  result: any;
  error: any;
  id: string | number;
};

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
