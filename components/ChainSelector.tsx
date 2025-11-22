'use client'

import { SUPPORTED_CHAINS, STABLECOINS } from '@/lib/constants'

interface ChainSelectorProps {
  selectedChainId: number
  onSelectChain: (chainId: number) => void
}

export function ChainSelector({
  selectedChainId,
  onSelectChain,
}: ChainSelectorProps) {
  const availableChains = SUPPORTED_CHAINS.filter(
    (chain) => STABLECOINS[chain.id] && STABLECOINS[chain.id].length > 0
  )

  return (
    <div className="w-full max-w-2xl">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
        Target Chain & Stablecoin
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {availableChains.map((chain) => {
          const stablecoin = STABLECOINS[chain.id][0]
          const isSelected = selectedChainId === chain.id

          return (
            <button
              key={chain.id}
              onClick={() => onSelectChain(chain.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-red-400'
              }`}
            >
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {chain.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                → {stablecoin.symbol}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
