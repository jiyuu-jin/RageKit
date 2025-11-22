# RageQuit Kit Setup Guide

## Prerequisites

- Node.js 18+ and pnpm
- A Privy account (free at [dashboard.privy.io](https://dashboard.privy.io))
- (Optional) WalletConnect Project ID for additional wallet support
- (Optional) 1inch API key for higher rate limits

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and add your API keys:

```env
# Required: Get from https://dashboard.privy.io
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id_here

# Optional: Get from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here

# Optional: Get from https://portal.1inch.dev
NEXT_PUBLIC_1INCH_API_KEY=your_1inch_api_key_here
```

### 3. Configure Privy

1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app or select an existing one
3. Copy your App ID to `.env.local`
4. In the Privy dashboard, configure:
   - **Login methods**: Enable Email, Wallet, and Google
   - **Embedded wallets**: Enable "Create on login for users without wallets"
   - **Allowed domains**: Add `localhost:3000` for development

### 4. (Optional) Get a 1inch API Key

The app works without an API key, but you may hit rate limits. To get higher limits:

1. Go to [portal.1inch.dev](https://portal.1inch.dev)
2. Sign up for a free account
3. Create an API key
4. Add it to `.env.local`

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. **Connect Wallet**: Users connect via Privy (embedded wallet or external wallet)
2. **Scan Balances**: The app automatically scans for degen tokens across supported chains
3. **Select Target**: Choose which chain and stablecoin to end up in
4. **RageQuit**: Hit the big red button to exit all positions into stables

## Supported Chains

- Ethereum Mainnet
- Base
- Arbitrum
- Optimism
- Polygon

## Customization

### Adding More Degen Tokens

Edit `lib/constants.ts` and add tokens to the `DEGEN_TOKENS` object:

```typescript
export const DEGEN_TOKENS: Record<number, { address: string; symbol: string; decimals: number }[]> = {
  1: [
    {
      address: '0x...',
      symbol: 'NEWTOKEN',
      decimals: 18,
    },
  ],
}
```

### Adding More Stablecoins

Edit `lib/constants.ts` and add stablecoins to the `STABLECOINS` object:

```typescript
export const STABLECOINS: Record<number, { address: string; symbol: string; decimals: number }[]> = {
  1: [
    {
      address: '0x...',
      symbol: 'DAI',
      decimals: 18,
    },
  ],
}
```

### Adding More Chains

1. Add the chain to `lib/wagmi.ts`:

```typescript
import { myNewChain } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon, myNewChain],
  transports: {
    // ... existing transports
    [myNewChain.id]: http(),
  },
})
```

2. Add the chain to `lib/constants.ts`:

```typescript
export const SUPPORTED_CHAINS = [mainnet, base, arbitrum, optimism, polygon, myNewChain]
```

3. Add the 1inch chain ID mapping (if supported by 1inch):

```typescript
export const CHAIN_ID_TO_1INCH: Record<number, number> = {
  // ... existing mappings
  [myNewChain.id]: 1inch_chain_id,
}
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repo in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Don't forget to add your production domain to Privy's allowed domains.

### Other Platforms

The app is a standard Next.js app and can be deployed anywhere that supports Next.js:

- Netlify
- Railway
- Render
- Self-hosted with Docker

## Troubleshooting

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"

Make sure you've created a `.env.local` file and added your Privy App ID.

### "Chain X not supported by 1inch"

Check if the chain is supported by 1inch. If not, you'll need to use a different swap aggregator or remove that chain from `SUPPORTED_CHAINS`.

### Transactions failing

- Check that you have enough gas on the chain
- Try increasing slippage tolerance in `components/RageQuitButton.tsx`
- Make sure the tokens you're trying to swap have liquidity on 1inch

### Balance not showing

- Make sure the token is added to `DEGEN_TOKENS` in `lib/constants.ts`
- Check that the token address is correct for the chain
- Verify you actually have a balance of that token

## Development Tips

### Testing with Testnet Tokens

To test without real funds, you can:

1. Add testnet chains to the config
2. Get testnet tokens from faucets
3. Add testnet token addresses to `DEGEN_TOKENS`

### Hot Reload Issues

If you make changes to environment variables, you'll need to restart the dev server:

```bash
# Stop the server (Ctrl+C)
pnpm dev
```

## Support

For issues specific to:
- **Privy**: Check [Privy docs](https://docs.privy.io)
- **1inch**: Check [1inch docs](https://docs.1inch.io)
- **wagmi**: Check [wagmi docs](https://wagmi.sh)
- **This project**: Open an issue on GitHub

## License

MIT
