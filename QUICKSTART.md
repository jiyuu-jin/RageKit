# RageQuit Kit - Quick Start

## Get Your API Keys (5 minutes)

### 1. Privy (Required)
1. Go to [dashboard.privy.io](https://dashboard.privy.io)
2. Create a new app
3. Copy your App ID
4. Add to `.env.local` as `NEXT_PUBLIC_PRIVY_APP_ID`
5. In settings, add `http://localhost:3000` to allowed domains

### 2. WalletConnect (Optional but Recommended)
1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID
4. Add to `.env.local` as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

### 3. 1inch API Key (Optional)
1. Go to [portal.1inch.dev](https://portal.1inch.dev)
2. Sign up and create an API key
3. Add to `.env.local` as `NEXT_PUBLIC_1INCH_API_KEY`

## Run It

```bash
# Install dependencies
pnpm install

# Add your Privy App ID to .env.local
# Then start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## For Testing

You can test with real wallets on testnets, or use mainnet with small amounts.

### Mainnet Testing (Careful!)
- Connect wallet with Privy
- Make sure you have some degen tokens (PEPE, SHIB, DEGEN on Base)
- Select target chain and hit RageQuit

### Adding Test Tokens

Edit [lib/constants.ts](lib/constants.ts) to add your own tokens to the `DEGEN_TOKENS` object.

## Hackathon Demo Tips

1. **Prepare a demo wallet** with some degen tokens on Base (DEGEN is easy to get)
2. **Show the flow**:
   - Connect with Privy (show embedded wallet creation)
   - Scan balances across chains
   - Select target chain
   - Hit the big red button
3. **Explain the tech**:
   - Privy for seamless auth (embedded wallets + external)
   - 1inch for optimal swap routing
   - Multi-chain support out of the box
   - Stateless design = fast to build, fast to use

## Common Issues

### "NEXT_PUBLIC_PRIVY_APP_ID is not set"
Add your Privy App ID to `.env.local`

### No tokens showing up
Make sure the token address is in `DEGEN_TOKENS` in [lib/constants.ts](lib/constants.ts)

### Swap failing
- Check you have gas on that chain
- Verify the token has liquidity on 1inch
- Try a different chain

## What's Next?

- Add more chains (Polygon, Avalanche, BSC)
- Add token selection (let users choose which tokens to exit)
- Add price impact warnings
- Save preferences to local storage
- Add transaction history
- Bridge to target chain automatically
- Add "reverse ragequit" (buy back in)

## EthGlobal Bounties

This project uses:
- **Privy**: Embedded wallets, social login, wallet connection
- **1inch**: Optimal DEX aggregation and swap routing

Make sure to mention these in your submission!
