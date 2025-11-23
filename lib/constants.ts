import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains'

export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, optimism, polygon]

// 1inch API chain IDs
export const CHAIN_ID_TO_1INCH: Record<number, number> = {
  1: 1, // Ethereum
  8453: 8453, // Base
  42161: 42161, // Arbitrum
  10: 10, // Optimism
  137: 137, // Polygon
}

// Common stablecoins by chain
export const STABLECOINS: Record<
  number,
  { address: string; symbol: string; decimals: number }[]
> = {
  1: [
    {
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      symbol: 'USDT',
      decimals: 6,
    },
  ],
  8453: [
    {
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  42161: [
    {
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
      symbol: 'USDT',
      decimals: 6,
    },
  ],
  10: [
    {
      address: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      symbol: 'USDC',
      decimals: 6,
    },
  ],
  137: [
    {
      address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
      symbol: 'USDC',
      decimals: 6,
    },
    {
      address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
      symbol: 'USDT',
      decimals: 6,
    },
  ],
}

// Common degen tokens (feel free to expand this list)
export const DEGEN_TOKENS: Record<
  number,
  { address: string; symbol: string; decimals: number }[]
> = {
  1: [
    {
      address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
      symbol: 'PEPE',
      decimals: 18,
    },
    {
      address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
      symbol: 'SHIB',
      decimals: 18,
    },
  ],
  8453: [
    {
      address: '0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed',
      symbol: 'DEGEN',
      decimals: 18,
    },
    {
      address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
      symbol: 'BRETT',
      decimals: 18,
    },
    {
      address: '0x9fE8E567eE8cE5BdB5Bb96cF5D0b0bD4F5c0b5b5',
      symbol: 'TOBY',
      decimals: 18,
    },
    {
      address: '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85',
      symbol: 'PORK',
      decimals: 18,
    },
  ],
}

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_spender', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      { name: '_owner', type: 'address' },
      { name: '_spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const
