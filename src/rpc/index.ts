import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

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

  // Example method: getblockchaininfo
  public async getblockchaininfo(): Promise<BlockchainInfo> {
    return this.makeRequest('getblockchaininfo');
  }
}

export default new RPCClient(HOST, PORT, COOKIE_PATH);

// Define the return type of getblockchaininfo
type BlockchainInfo = {
  chain: string;
  blocks: number;
  headers: number;
  bestblockhash: string;
  difficulty: number;
  mediantime: number;
  verificationprogress: number;
  initialblockdownload: boolean;
  chainwork: string;
  size_on_disk: number;
  pruned: boolean;
  softforks: {
    [key: string]: {
      type: string;
      active: boolean;
      height: number;
    };
  };
  warnings: string;
};

// Define interface for RPC response to ensure type safety
type RPCResponse = {
  result: any;
  error: any;
  id: string | number;
};

type RPCResponse_<T> = {
  result: T;
  error?: {
    message: string;
    code: number;
  };
  id: string | number;
};
