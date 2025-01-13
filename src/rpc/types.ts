export type RPCResponse_<T> = {
  result: T;
  error?: {
    message: string;
    code: number;
  };
  id: string | number;
};

export type BlockchainInfo = {
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

export type NetworkInfo = {
  version: number;
  subversion: string;
  protocolversion: number;
  localservices: string;
  localservicesnames: string[];
  localrelay: boolean;
  timeoffset: number;
  connections: number;
  connections_in: number;
  connections_out: number;
  networkactive: boolean;
  networks: {
    name: string;
    limited: boolean;
    rechable: boolean;
    proxy: string;
    proxy_randomize_credentials: boolean;
  }[];
  relayfee: number;
  incrementalfee: number;
  localaddresses: {
    address: string;
    port: number;
    score: number;
  }[];
  warnings: string;
};

export type SmartFeeEstimate = {
  feerate: number;
  errors: string[];
  blocks: number;
};

export type BlockCount = number;

export type BlockHash = string;

export type Block = {
  hash: string;
  confirmations: number;
  size: number;
  strippedsize: number;
  weight: number;
  height: number;
  version: number;
  versionHex: string;
  merkleroot: string;
  tx: string[];
  time: number;
  mediantime: number;
  nonce: number;
  bits: string;
  difficulty: number;
  chainwork: string;
  nTx: number;
  previousblockhash: string;
  nextblockhash: string;
};

export type BlockTemplate = {
  version: number;
  rules: string[];
  vbavailable: {
    rulename: string;
  };
  vbrequired: number;
  previousblockhash: string;
  transactions: {
    data: string;
    txid: string;
    hash: string;
    depends: number[];
    fee: number;
    sigops: number;
    weight: number;
  }[];
  coinbaseaux: {
    key: string;
  };
  coinbasevalue: number;
  longpollid: string;
  target: string;
  mintime: number;
  mutable: string[];
  noncerange: string;
  sigoplimit: number;
  sizelimit: number;
  weightlimit: number;
  curtime: number;
  bits: string;
  height: number;
  default_witness_committment: string;
};

export type MempoolInfo = {
  loaded: boolean;
  size: number;
  bytes: number;
  usage: number;
  maxmempool: number;
  mempoolminfee: number;
  minrelaytxfee: number;
  unbroadcastcount: number;
};

export type Difficulty = number;

// CoinGecko API types
export type CGMarketData = {
  current_price: {
    usd: number;
  };
  ath: {
    usd: number;
  };
  market_cap: {
    usd: number;
  };
  ath_date: {
    usd: string;
  };
  ath_change_percentage: {
    usd: number;
  };
};

export type CGPriceData = {
  price: string;
  marketCap: string;
  ath: string;
  declineFromAth: string;
  athDate: string;
};
