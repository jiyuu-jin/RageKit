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
              slippage: 5, // 5% slippage for speed
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
    <div className="flex flex-col items-center gap-4 w-full">
      <button
        onClick={executeRageQuit}
        disabled={isExecuting || balances.length === 0}
        className="relative px-8 py-6 text-2xl font-bold text-white bg-red-600 rounded-lg shadow-lg hover:bg-red-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 min-w-[300px]"
      >
        {isExecuting ? (
          <span className="animate-pulse">RAGING...</span>
        ) : (
          '🧨 RAGEQUIT'
        )}
      </button>

      {isExecuting && (
        <div className="w-full max-w-md">
          <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-red-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-2 text-gray-600 dark:text-gray-400">
            {status}
          </p>
        </div>
      )}

      {!isExecuting && status && (
        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {status}
        </p>
      )}
    </div>
  )
}
