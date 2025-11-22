import { http, createConfig } from 'wagmi'
import { mainnet, base, arbitrum, optimism, polygon } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
  },
})
