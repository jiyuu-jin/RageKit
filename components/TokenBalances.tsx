'use client'

import { useState, useEffect } from 'react'
import { type TokenBalance } from '@/hooks/useTokenBalances'
import { get24hPriceChange, getHealthScore } from '@/lib/priceHealth'

interface TokenBalancesProps {
  balances: TokenBalance[]
  isLoading: boolean
}

interface TokenWithHealth extends TokenBalance {
  priceChange24h: number | null
}

export function TokenBalances({ balances, isLoading }: TokenBalancesProps) {
  const [tokensWithHealth, setTokensWithHealth] = useState<TokenWithHealth[]>([])
  const [loadingHealth, setLoadingHealth] = useState(false)

  useEffect(() => {
    async function fetchHealthData() {
      if (balances.length === 0) return

      setLoadingHealth(true)
      const healthPromises = balances.map(async (balance) => {
        const priceChange24h = await get24hPriceChange(balance.chainId, balance.address)
        return {
          ...balance,
          priceChange24h,
        }
      })

      const results = await Promise.all(healthPromises)
      setTokensWithHealth(results)
      setLoadingHealth(false)
    }

    fetchHealthData()
  }, [balances])

  if (isLoading) {
    return (
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-red-500"></div>
          <p className="text-gray-400">Scanning chains for your degen holdings...</p>
        </div>
      </div>
    )
  }

  if (balances.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-8">
        <div className="text-center">
          <div className="text-5xl mb-3">😌</div>
          <p className="text-lg text-gray-300 mb-1">
            No degen tokens found
          </p>
          <p className="text-gray-500 text-sm">
            You&apos;re playing it safe!
          </p>
        </div>
      </div>
    )
  }

  const displayBalances = tokensWithHealth.length > 0 ? tokensWithHealth : balances.map(b => ({ ...b, priceChange24h: null }))

  return (
    <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">
          Your Holdings
        </h2>
        <div className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
          <span className="text-red-400 font-semibold text-sm">{balances.length} tokens</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {displayBalances.map((balance, index) => {
          const health = getHealthScore(balance.priceChange24h)

          return (
            <div
              key={`${balance.chainId}-${balance.address}-${index}`}
              className="flex items-center justify-between p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-red-500/30 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-linear-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {balance.symbol.slice(0, 2)}
                  </div>
                  {/* Chain badge */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center text-xs">
                    {balance.chainId === 1 && '⟠'}
                    {balance.chainId === 8453 && '🔵'}
                    {balance.chainId === 42161 && '🔷'}
                    {balance.chainId === 10 && '🔴'}
                    {balance.chainId === 137 && '🟣'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white">
                      {balance.symbol}
                    </p>
                    {/* Health indicator */}
                    <span className="text-xs" title={balance.priceChange24h !== null ? `${balance.priceChange24h > 0 ? '+' : ''}${balance.priceChange24h.toFixed(2)}% (24h)` : 'Loading...'}>
                      {loadingHealth ? '⏳' : health.emoji}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {balance.chainName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-white">
                  {parseFloat(balance.balance) < 0.0001
                    ? parseFloat(balance.balance).toExponential(2)
                    : parseFloat(balance.balance).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                      })}
                </p>
                <p className="text-xs text-gray-500">{balance.symbol}</p>
                {balance.priceChange24h !== null && !loadingHealth && (
                  <p className={`text-xs font-semibold ${health.color}`}>
                    {balance.priceChange24h > 0 ? '+' : ''}{balance.priceChange24h.toFixed(2)}%
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
