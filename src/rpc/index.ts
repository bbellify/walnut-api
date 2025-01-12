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
  method: string,
  params?: string[]
): Promise<RPCResponse> {
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
    body: JSON.stringify({
      jsonrpc: '1.0',
      id: 'node-fetch',
      method: method,
      params: params
    })
  };

  try {
    const response = await fetch(`http://${HOST}:${PORT}`, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = (await response.json()) as RPCResponse;

    // Error from Bitcoin Core RPC
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }
    return data.result;
  } catch (error) {
    // Handle fetch or parsing errors
    console.error('Fetch error:', error);
    throw error;
  }
}
