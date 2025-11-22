import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { formatUnits } from 'viem'
import { ERC20_ABI, DEGEN_TOKENS, SUPPORTED_CHAINS } from '@/lib/constants'

export interface TokenBalance {
  chainId: number
  chainName: string
  address: string
  symbol: string
  balance: string
  rawBalance: bigint
  decimals: number
}

export function useTokenBalances() {
  const { address, isConnected } = useAccount()
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address || !isConnected) {
      setBalances([])
      return
    }

    async function fetchBalances() {
      setIsLoading(true)
      setError(null)

      try {
        const allBalances: TokenBalance[] = []

        for (const chain of SUPPORTED_CHAINS) {
          const tokens = DEGEN_TOKENS[chain.id] || []

          for (const token of tokens) {
            try {
              // Create a public client for this chain
              const { createPublicClient, http } = await import('viem')
              const publicClient = createPublicClient({
                chain,
                transport: http(),
              })

              const balance = (await publicClient.readContract({
                address: token.address as `0x${string}`,
                abi: ERC20_ABI,
                functionName: 'balanceOf',
                args: [address],
              })) as bigint

              if (balance > 0n) {
                allBalances.push({
                  chainId: chain.id,
                  chainName: chain.name,
                  address: token.address,
                  symbol: token.symbol,
                  balance: formatUnits(balance, token.decimals),
                  rawBalance: balance,
                  decimals: token.decimals,
                })
              }
            } catch (err) {
              console.error(
                `Error fetching balance for ${token.symbol} on ${chain.name}:`,
                err
              )
            }
          }

          // Also check native token balance
          try {
            const { createPublicClient, http } = await import('viem')
            const publicClient = createPublicClient({
              chain,
              transport: http(),
            })

            const balance = await publicClient.getBalance({
              address: address as `0x${string}`
            })

            if (balance > 0n) {
              allBalances.push({
                chainId: chain.id,
                chainName: chain.name,
                address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Special address for native token
                symbol: chain.nativeCurrency.symbol,
                balance: formatUnits(balance, chain.nativeCurrency.decimals),
                rawBalance: balance,
                decimals: chain.nativeCurrency.decimals,
              })
            }
          } catch (err) {
            console.error(
              `Error fetching native balance on ${chain.name}:`,
              err
            )
          }
        }

        setBalances(allBalances)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch balances')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalances()
  }, [address, isConnected])

  return { balances, isLoading, error, refetch: () => {} }
}
