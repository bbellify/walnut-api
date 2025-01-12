import fetch from 'node-fetch';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const HOST = 'localhost';
const PORT = process.env.RPC_PORT || 8332;
const COOKIE_PATH = process.env.PATH_TO_COOKIE as string;

// Define interface for RPC response to ensure type safety
type RPCResponse = {
  result: any;
  error: any;
  id: string | number;
};

export async function bitcoinRPC(
  methods: string[],
  params?: string[]
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
