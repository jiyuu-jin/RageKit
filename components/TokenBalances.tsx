'use client'

import { type TokenBalance } from '@/hooks/useTokenBalances'

interface TokenBalancesProps {
  balances: TokenBalance[]
  isLoading: boolean
}

export function TokenBalances({ balances, isLoading }: TokenBalancesProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500 dark:text-gray-400">
          No degen tokens found. You&apos;re playing it safe! 😌
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
        Your Degen Holdings
      </h2>
      <div className="space-y-2">
        {balances.map((balance, index) => (
          <div
            key={`${balance.chainId}-${balance.address}-${index}`}
            className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                {balance.symbol.slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {balance.symbol}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {balance.chainName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {parseFloat(balance.balance).toFixed(4)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
