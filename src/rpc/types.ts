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
