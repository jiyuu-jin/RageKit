# RageQuit Kit - Project Structure

## Overview

```
RageKit/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with Privy provider
│   ├── page.tsx                 # Main landing/app page
│   └── globals.css              # Global styles
│
├── components/                   # React components
│   ├── providers/
│   │   └── PrivyProvider.tsx   # Privy + wagmi provider setup
│   ├── WalletConnect.tsx        # Wallet connection UI
│   ├── TokenBalances.tsx        # Display user's token balances
│   ├── ChainSelector.tsx        # Choose target chain/stablecoin
│   └── RageQuitButton.tsx       # The big red button + execution logic
│
├── hooks/                        # Custom React hooks
│   └── useTokenBalances.ts      # Fetch balances across chains
│
├── lib/                          # Utilities and config
│   ├── wagmi.ts                 # Wagmi configuration
│   ├── constants.ts             # Chain configs, token lists, ABIs
│   └── 1inch.ts                 # 1inch API integration
│
├── .env.local                    # Environment variables (git-ignored)
├── .env.local.example           # Example env file
├── SETUP.md                      # Detailed setup guide
├── QUICKSTART.md                # Quick reference
└── README.md                     # Project overview
```

## Key Files Explained

### [app/layout.tsx](app/layout.tsx)
- Wraps the app with PrivyProvider
- Sets up metadata
- Configures fonts

### [app/page.tsx](app/page.tsx)
- Main UI with conditional rendering (logged in vs not)
- Connects all components together
- Manages state (target chain selection)

### [components/providers/PrivyProvider.tsx](components/providers/PrivyProvider.tsx)
- Configures Privy with:
  - Embedded wallets
  - Login methods (email, wallet, Google)
  - Supported chains
  - Theme customization
- Wraps with wagmi and React Query

### [components/RageQuitButton.tsx](components/RageQuitButton.tsx)
**This is the core logic!**
- Groups tokens by chain
- For each token:
  1. Check if approval needed
  2. Approve token spend if needed
  3. Get swap quote from 1inch
  4. Execute swap transaction
- Shows progress indicator
- Handles errors gracefully

### [hooks/useTokenBalances.ts](hooks/useTokenBalances.ts)
- Scans all supported chains
- Reads ERC20 balances for configured tokens
- Reads native token balances (ETH, etc.)
- Returns formatted balance data

### [lib/wagmi.ts](lib/wagmi.ts)
- Configures wagmi with supported chains
- Sets up RPC transports

### [lib/constants.ts](lib/constants.ts)
- `SUPPORTED_CHAINS`: Which chains to support
- `DEGEN_TOKENS`: Tokens to scan for (organized by chain)
- `STABLECOINS`: Target stablecoins (organized by chain)
- `ERC20_ABI`: Minimal ABI for token interactions
- `CHAIN_ID_TO_1INCH`: Maps chain IDs to 1inch API chain IDs

### [lib/1inch.ts](lib/1inch.ts)
- `getSwapQuote()`: Get quote for a swap
- `getSwapTransaction()`: Get executable swap transaction
- `checkAllowance()`: Check if token is approved
- `getApproveTransaction()`: Get approval transaction

## Data Flow

1. **User Connects Wallet** (via Privy)
   - `WalletConnect.tsx` triggers Privy login
   - Privy creates embedded wallet or connects external wallet

2. **Scan Balances**
   - `useTokenBalances.ts` hook activates
   - Loops through all chains and tokens in `DEGEN_TOKENS`
   - Uses viem to read contract balances
   - Returns array of `TokenBalance` objects

3. **Display**
   - `TokenBalances.tsx` shows found tokens
   - `ChainSelector.tsx` lets user pick target chain

4. **RageQuit Execution**
   - User clicks button in `RageQuitButton.tsx`
   - Groups balances by chain
   - For each chain:
     - Switch to that chain (if needed)
     - For each token:
       - Check allowance via 1inch API
       - Send approval tx if needed
       - Get swap quote from 1inch API
       - Send swap transaction
       - Wait for confirmation
   - Shows progress throughout

## Environment Variables

- `NEXT_PUBLIC_PRIVY_APP_ID` - **Required** - From Privy dashboard
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - Optional - For WalletConnect v2
- `NEXT_PUBLIC_1INCH_API_KEY` - Optional - For higher rate limits

## Adding New Features

### Add a New Chain
1. Import chain from `wagmi/chains` in `lib/wagmi.ts`
2. Add to config and transports
3. Add to `SUPPORTED_CHAINS` in `lib/constants.ts`
4. Add 1inch chain ID mapping (if supported)
5. Add stablecoins for that chain
6. Add degen tokens for that chain (optional)

### Add a New Token
1. Find token address on chain
2. Add to `DEGEN_TOKENS` in `lib/constants.ts`:
   ```typescript
   {
     address: '0x...',
     symbol: 'TOKEN',
     decimals: 18
   }
   ```

### Change Slippage Tolerance
Edit the `slippage` parameter in `RageQuitButton.tsx`:
```typescript
const swapTx = await getSwapTransaction({
  // ...
  slippage: 5, // 5% - change this
})
```

### Add Token Selection UI
Currently exits ALL degen tokens. To make it selective:
1. Add checkbox state in `page.tsx`
2. Pass selected tokens to `RageQuitButton`
3. Filter `balances` based on selection

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4
- **Blockchain**: wagmi v3 + viem
- **Auth**: Privy (embedded wallets + social login)
- **Swaps**: 1inch Aggregation API
- **State**: React hooks + React Query

## Performance Notes

- Balance scanning happens in parallel across chains
- Swap execution is sequential per chain (can't switch chains mid-flow)
- 1inch API calls are rate-limited (use API key for production)
- Turbopack provides fast dev server and builds
