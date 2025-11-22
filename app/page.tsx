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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950">
      <div className="container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              🧨 RageQuit Kit
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              When you&apos;re tilted, don&apos;t think — <strong>hit the button</strong>
            </p>
          </div>
          <WalletConnect />
        </header>

        {!authenticated ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Exit Your Degen Positions
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                RageQuit Kit helps you exit all your risky tokens into stables across chains with one button.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    One Click
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Exit all positions instantly with a single button
                  </p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-4xl mb-3">🔗</div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Multi-Chain
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Works across Ethereum, Base, Arbitrum, and more
                  </p>
                </div>
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-semibold text-lg mb-2 text-gray-900 dark:text-white">
                    Into Stables
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
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

                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      Ready to Exit?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      This will swap all your degen tokens into stables. No take-backs.
                    </p>
                  </div>

                  <RageQuitButton
                    balances={balances}
                    onComplete={refetch}
                  />

                  <div className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
                    <p>Powered by 1inch for optimal swap routes</p>
                    <p className="mt-1">Default slippage: 5% (for speed when you&apos;re tilted)</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <footer className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Built with <span className="text-red-500">♥</span> for EthGlobal using{' '}
            <a
              href="https://privy.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              Privy
            </a>{' '}
            and{' '}
            <a
              href="https://1inch.io"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700 dark:hover:text-gray-300"
            >
              1inch
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}
