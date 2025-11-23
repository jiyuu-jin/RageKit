'use client'

import { useState } from 'react'
import { useAccount, useWalletClient, useSwitchChain, usePublicClient } from 'wagmi'
import { type TokenBalance } from '@/hooks/useTokenBalances'
import { getSwapTransaction, getApproveTransaction, checkAllowance } from '@/lib/1inch'
import { STABLECOINS } from '@/lib/constants'

interface RageQuitButtonProps {
  balances: TokenBalance[]
  onComplete?: () => void
}

export function RageQuitButton({
  balances,
  onComplete,
}: RageQuitButtonProps) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()
  const { switchChain } = useSwitchChain()
  const [isExecuting, setIsExecuting] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [progress, setProgress] = useState(0)

  async function executeRageQuit() {
    if (!address || !walletClient) {
      setStatus('Please connect your wallet')
      return
    }

    if (balances.length === 0) {
      setStatus('No tokens to swap')
      return
    }

    setIsExecuting(true)
    setStatus('Starting RageQuit...')
    setProgress(0)

    try {
      const totalSteps = balances.length * 2 // Approve + swap for each token
      let currentStep = 0

      // Group balances by chain
      const balancesByChain = balances.reduce((acc, balance) => {
        if (!acc[balance.chainId]) {
          acc[balance.chainId] = []
        }
        acc[balance.chainId].push(balance)
        return acc
      }, {} as Record<number, TokenBalance[]>)

      // Execute swaps chain by chain
      for (const [chainId, chainBalances] of Object.entries(balancesByChain)) {
        const chain = parseInt(chainId)

        // Get target stablecoin for this chain
        const targetStable = STABLECOINS[chain]?.[0]
        if (!targetStable) {
          console.warn(`No stablecoin configured for chain ${chain}`)
          continue
        }

        // Switch to the chain if needed
        if (walletClient.chain.id !== chain) {
          setStatus(`Switching to chain ${chain}...`)
          await switchChain({ chainId: chain })
          // Wait a bit for the switch to complete
          await new Promise(resolve => setTimeout(resolve, 1000))
        }

        // Process each token on this chain
        for (const balance of chainBalances) {
          // Skip if this is already the target stablecoin
          if (balance.address.toLowerCase() === targetStable.address.toLowerCase()) {
            currentStep += 2
            setProgress((currentStep / totalSteps) * 100)
            continue
          }

          // Skip native tokens for now (would need wrapping)
          if (balance.address === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
            console.log(`Skipping native token ${balance.symbol}`)
            currentStep += 2
            setProgress((currentStep / totalSteps) * 100)
            continue
          }

          try {
            setStatus(`Checking allowance for ${balance.symbol}...`)

            // Check allowance
            const allowance = await checkAllowance(
              chain,
              balance.address,
              address
            )

            // Approve if needed
            if (BigInt(allowance) < balance.rawBalance) {
              setStatus(`Approving ${balance.symbol}...`)

              const approveTx = await getApproveTransaction(
                chain,
                balance.address,
                balance.rawBalance.toString()
              )

              const approveHash = await walletClient.sendTransaction({
                to: approveTx.to as `0x${string}`,
                data: approveTx.data as `0x${string}`,
                value: BigInt(approveTx.value),
              })

              setStatus(`Waiting for approval of ${balance.symbol}...`)
              if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: approveHash })
              }
            }

            currentStep++
            setProgress((currentStep / totalSteps) * 100)

            // Execute swap
            setStatus(`Swapping ${balance.symbol} to ${targetStable.symbol}...`)

            const swapTx = await getSwapTransaction({
              chainId: chain,
              src: balance.address,
              dst: targetStable.address,
              amount: balance.rawBalance.toString(),
              from: address,
              slippage: 3, // 3% slippage
            })

            const swapHash = await walletClient.sendTransaction({
              to: swapTx.tx.to as `0x${string}`,
              data: swapTx.tx.data as `0x${string}`,
              value: BigInt(swapTx.tx.value),
              gas: BigInt(swapTx.tx.gas),
            })

            setStatus(`Waiting for swap of ${balance.symbol}...`)
            if (publicClient) {
              await publicClient.waitForTransactionReceipt({ hash: swapHash })
            }

            currentStep++
            setProgress((currentStep / totalSteps) * 100)

            console.log(`Successfully swapped ${balance.symbol}`)
          } catch (error) {
            console.error(`Error swapping ${balance.symbol}:`, error)
            // Continue with other tokens even if one fails
            currentStep += 2
            setProgress((currentStep / totalSteps) * 100)
          }
        }
      }

      setStatus('RageQuit complete! 🎉')
      setProgress(100)

      if (onComplete) {
        setTimeout(() => {
          onComplete()
        }, 2000)
      }
    } catch (error) {
      console.error('RageQuit error:', error)
      setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setTimeout(() => {
        setIsExecuting(false)
        setStatus('')
        setProgress(0)
      }, 5000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <button
        onClick={executeRageQuit}
        disabled={isExecuting || balances.length === 0}
        className="group relative w-full py-8 text-3xl font-black text-white bg-linear-to-r from-red-600 via-red-500 to-orange-600 rounded-2xl shadow-2xl hover:shadow-red-500/50 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
      >
        {/* Animated background */}
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        <span className="relative flex items-center justify-center gap-3">
          {isExecuting ? (
            <>
              <span className="animate-spin text-4xl">🧨</span>
              <span className="animate-pulse">RAGING...</span>
            </>
          ) : (
            <>
              <span className="group-hover:animate-bounce">🧨</span>
              <span>RAGEQUIT</span>
            </>
          )}
        </span>
      </button>

      {isExecuting && (
        <div className="w-full space-y-3">
          <div className="bg-slate-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-red-500 via-orange-500 to-red-600 rounded-full transition-all duration-500 shadow-lg shadow-red-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <p className="text-sm text-center text-gray-400 font-medium">
              {status}
            </p>
          </div>
        </div>
      )}

      {!isExecuting && status && (
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg">
          <span className="text-2xl">🎉</span>
          <p className="text-sm text-green-400 font-medium">
            {status}
          </p>
        </div>
      )}
    </div>
  )
}
