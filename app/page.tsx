'use client'

import { useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { WalletConnect } from '@/components/WalletConnect'
import { TokenBalances } from '@/components/TokenBalances'
import { ChainSelector } from '@/components/ChainSelector'
import { RageQuitButton } from '@/components/RageQuitButton'
import { useTokenBalances } from '@/hooks/useTokenBalances'
import { base } from 'wagmi/chains'

export default function Home() {
  const { authenticated } = usePrivy()
  const { balances, isLoading, refetch } = useTokenBalances()
  const [targetChainId, setTargetChainId] = useState<number>(base.id)

  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-slate-950 via-red-950 to-slate-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-orange-500/10 animate-pulse"></div>

      <div className="relative h-full flex flex-col px-6 py-4">
        {/* Compact Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-[bounce_2s_ease-in-out_infinite]">🧨</div>
            <div>
              <h1 className="text-3xl font-black bg-linear-to-r from-red-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                RageKit
              </h1>
              <p className="text-sm text-gray-400">
                When you&apos;re tilted, don&apos;t think — <span className="text-red-400 font-semibold">hit the button</span>
              </p>
            </div>
          </div>
          <WalletConnect />
        </header>

        {!authenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl font-bold text-white">
                Exit Your Degen Positions
              </h2>
              <p className="text-lg text-gray-300 max-w-xl mx-auto">
                RageKit helps you exit all your risky tokens into stables across chains with one button.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl hover:border-red-500/50 transition-all">
                  <div className="text-3xl mb-2">🎯</div>
                  <h3 className="font-bold text-lg mb-2 text-white">One Click</h3>
                  <p className="text-gray-400 text-sm">Exit all positions instantly</p>
                </div>
                <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl hover:border-orange-500/50 transition-all">
                  <div className="text-3xl mb-2">🔗</div>
                  <h3 className="font-bold text-lg mb-2 text-white">Multi-Chain</h3>
                  <p className="text-gray-400 text-sm">Ethereum, Base, Arbitrum, and more</p>
                </div>
                <div className="p-6 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl hover:border-yellow-500/50 transition-all">
                  <div className="text-3xl mb-2">💰</div>
                  <h3 className="font-bold text-lg mb-2 text-white">Into Stables</h3>
                  <p className="text-gray-400 text-sm">Converts to USDC or chosen stablecoin</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-[320px_1fr] gap-6 overflow-hidden">
            {/* Left Sidebar - Chain Selector */}
            <div className="flex flex-col gap-4">
              <ChainSelector
                selectedChainId={targetChainId}
                onSelectChain={setTargetChainId}
              />
            </div>

            {/* Right Content Area */}
            <div className="flex flex-col gap-4 overflow-hidden">
              {balances.length > 0 && (
                <>
                  {/* Main Action Card */}
                  <div className="bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl shadow-2xl p-8">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-3">
                        Ready to Exit?
                      </h2>
                      <p className="text-gray-400 text-lg">
                        This will swap all your degen tokens into stables. No take-backs.
                      </p>
                    </div>

                    <RageQuitButton
                      balances={balances}
                      onComplete={refetch}
                    />

                    <div className="mt-8 pt-6 border-t border-slate-800 text-sm text-center text-gray-500">
                      <p>Powered by 1inch for optimal swap routes</p>
                      <p className="mt-2">Default slippage: 3%</p>
                    </div>
                  </div>

                  {/* Token Holdings - Compact */}
                  <div className="flex-1 overflow-y-auto">
                    <TokenBalances balances={balances} isLoading={isLoading} />
                  </div>
                </>
              )}

              {balances.length === 0 && !isLoading && (
                <TokenBalances balances={balances} isLoading={isLoading} />
              )}

              {isLoading && (
                <TokenBalances balances={balances} isLoading={isLoading} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
