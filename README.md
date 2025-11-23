# 🧨 RageKit

> When you’re tilted, don’t think — **hit the button**.  
> RageKit is a degen panic button that exits your risk tokens into stables across chains using **Privy** + **1inch**.

---

## ✨ What is RageKit?

RageKit is a small but mean dApp for people who ape first and regret later.

In your **calm state**, you create a *RageQuit profile* that defines:
- Which **tokens** are “degen risk” (e.g. PEPE, random casino tokens)
- Which **chain** you want to end up on (e.g. Base)
- Which **stablecoin** you want to hold (e.g. USDC)

In your **tilted state**, you:
- Log in with **Privy** (embedded wallet or connected wallet)
- Smash the **RageQuit** button
- We:
  - Read your balances
  - Build optimal swap routes via the **1inch API**
  - Route everything into stables with a **single flow**

You go from scattered exposure → clean stable position, in one emotional moment.

---

## 🧠 Core Idea

Most DeFi tools help you optimize risk.  
RageKit helps you **escape** it.

- No portfolio theory.
- No “maybe later” buttons.
- Just: *“Please get me out.”*

---

## ⚙️ Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (App Router)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [wagmi](https://wagmi.sh/) / [viem](https://viem.sh/) for EVM interactions

**Auth & Wallets**
- [Privy](https://www.privy.io/)
  - Embedded wallets for normies
  - Connect existing wallets for power users

**Swaps & Routing**
- [1inch API](https://portal.1inch.dev/)
  - Multi-chain swap routes
  - Optimized DEX routing under the hood

**Infra**
- Vercel
- RPC provider(s) of your choice (Alchemy, Infura, Ankr, etc.)
