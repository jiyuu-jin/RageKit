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
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-3">
        Exit to:
      </h3>
      <div className="flex flex-col gap-2">
        {availableChains.map((chain) => {
          const stablecoin = STABLECOINS[chain.id][0]
          const isSelected = selectedChainId === chain.id
          const emoji = chainEmojis[chain.id] || '⛓'

          return (
            <button
              key={chain.id}
              onClick={() => onSelectChain(chain.id)}
              className={`relative p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                isSelected
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <div className="text-2xl">{emoji}</div>
              <div className="flex-1 text-left">
                <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
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
      <p className="text-xs text-gray-500 mt-3">
        All tokens will be swapped to {STABLECOINS[selectedChainId]?.[0]?.symbol || 'USDC'} on {SUPPORTED_CHAINS.find(c => c.id === selectedChainId)?.name || 'Base'}
      </p>
    </div>
  )
}
