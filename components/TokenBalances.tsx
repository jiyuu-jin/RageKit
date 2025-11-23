'use client'

import { type TokenBalance } from '@/hooks/useTokenBalances'

interface TokenBalancesProps {
  balances: TokenBalance[]
  isLoading: boolean
}

export function TokenBalances({ balances, isLoading }: TokenBalancesProps) {
  if (isLoading) {
    return (
      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-red-500"></div>
          <p className="text-gray-400">Scanning chains for your degen holdings...</p>
        </div>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="w-full max-w-4xl bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">😌</div>
          <p className="text-xl text-gray-300 mb-2">
            No degen tokens found
          </p>
          <p className="text-gray-500">
            You&apos;re playing it safe!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          Your Degen Holdings
        </h2>
        <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-full">
          <span className="text-red-400 font-semibold">{balances.length} tokens</span>
        </div>
      </div>
      <div className="grid gap-3">
        {balances.map((balance, index) => (
          <div
            key={`${balance.chainId}-${balance.address}-${index}`}
            className="flex items-center justify-between p-5 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl hover:border-red-500/30 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform">
                  {balance.symbol.slice(0, 2)}
                </div>
                {/* Chain badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-slate-900 border-2 border-slate-800 rounded-full flex items-center justify-center text-xs">
                  {balance.chainId === 1 && '⟠'}
                  {balance.chainId === 8453 && '🔵'}
                  {balance.chainId === 42161 && '🔷'}
                  {balance.chainId === 10 && '🔴'}
                  {balance.chainId === 137 && '🟣'}
                </div>
              </div>
              <div>
                <p className="font-bold text-lg text-white group-hover:text-red-400 transition-colors">
                  {balance.symbol}
                </p>
                <p className="text-sm text-gray-500">
                  {balance.chainName}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-white">
                {parseFloat(balance.balance) < 0.0001
                  ? parseFloat(balance.balance).toExponential(2)
                  : parseFloat(balance.balance).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}
              </p>
              <p className="text-sm text-gray-500">{balance.symbol}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
