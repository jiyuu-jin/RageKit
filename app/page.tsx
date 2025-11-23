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
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-red-950 to-slate-950">
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-red-500/10 via-transparent to-orange-500/10 animate-pulse"></div>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        <header className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start mb-3">
              <div className="text-6xl animate-bounce">🧨</div>
              <h1 className="text-5xl md:text-6xl font-black bg-linear-to-r from-red-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                RageQuit Kit
              </h1>
            </div>
            <p className="text-xl text-gray-300">
              When you&apos;re tilted, don&apos;t think — <span className="text-red-400 font-bold">hit the button</span>
            </p>
          </div>
          <WalletConnect />
        </header>

        {!authenticated ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Exit Your Degen Positions
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                RageQuit Kit helps you exit all your risky tokens into stables across chains with one button.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="p-8 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl hover:border-red-500/50 transition-all">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="font-bold text-xl mb-3 text-white">
                    One Click
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Exit all positions instantly with a single button
                  </p>
                </div>
                <div className="p-8 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl hover:border-orange-500/50 transition-all">
                  <div className="text-5xl mb-4">🔗</div>
                  <h3 className="font-bold text-xl mb-3 text-white">
                    Multi-Chain
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Works across Ethereum, Base, Arbitrum, and more
                  </p>
                </div>
                <div className="p-8 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-xl hover:border-yellow-500/50 transition-all">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="font-bold text-xl mb-3 text-white">
                    Into Stables
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Converts everything to USDC or your chosen stablecoin
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <TokenBalances balances={balances} isLoading={isLoading} />

            {balances.length > 0 && (
              <>
                <ChainSelector
                  selectedChainId={targetChainId}
                  onSelectChain={setTargetChainId}
                />

                <div className="w-full max-w-2xl bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl p-8">
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
                    <p className="mt-2">Default slippage: 5% (for speed when you&apos;re tilted)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <footer className="mt-20 pt-8 border-t border-slate-800 text-center text-sm text-gray-500">
          <p>
            Built with <span className="text-red-500">♥</span> for EthGlobal using{' '}
            <a
              href="https://privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privy
            </a>{' '}
            and{' '}
            <a
              href="https://1inch.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              1inch
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
