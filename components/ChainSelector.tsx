'use client'

import { SUPPORTED_CHAINS, STABLECOINS } from '@/lib/constants'

interface ChainSelectorProps {
  selectedChainId: number
  onSelectChain: (chainId: number) => void
}

const chainEmojis: Record<number, string> = {
  1: '⟠',     // Ethereum
  8453: '🔵',  // Base
  42161: '🔷', // Arbitrum
  10: '🔴',    // Optimism
  137: '🟣',   // Polygon
}

export function ChainSelector({
  selectedChainId,
  onSelectChain,
}: ChainSelectorProps) {
  const availableChains = SUPPORTED_CHAINS.filter(
    (chain) => STABLECOINS[chain.id] && STABLECOINS[chain.id].length > 0
  )

  return (
    <div className="w-full max-w-4xl">
      <h3 className="text-xl font-bold text-white mb-4">
        Target Chain & Stablecoin
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {availableChains.map((chain) => {
          const stablecoin = STABLECOINS[chain.id][0]
          const isSelected = selectedChainId === chain.id
          const emoji = chainEmojis[chain.id] || '⛓'

          return (
            <button
              key={chain.id}
              onClick={() => onSelectChain(chain.id)}
              className={`relative p-5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-center">
                <div className="text-3xl mb-2">{emoji}</div>
                <p className={`font-bold text-sm mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {chain.name}
                </p>
                <p className="text-xs text-gray-500">
                  → {stablecoin.symbol}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      <p className="text-sm text-gray-500 mt-4 text-center">
        All tokens will be swapped to {STABLECOINS[selectedChainId]?.[0]?.symbol || 'USDC'} on {SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.name || 'selected chain'}
      </p>
    </div>
  )
}
