// 1inch price API integration for price health data
import { CHAIN_ID_TO_1INCH } from './constants'

interface TokenPriceResponse {
  price: string
  priceChange24h?: string
}

/**
 * Get 24h price change for a token using 1inch Price API
 */
export async function get24hPriceChange(
  chainId: number,
  tokenAddress: string
): Promise<number | null> {
  try {
    const chain1inch = CHAIN_ID_TO_1INCH[chainId]
    if (!chain1inch) return null

    const response = await fetch(
      `https://api.1inch.dev/price/v1.1/${chain1inch}/${tokenAddress}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_1INCH_API_KEY || ''}`,
        },
      }
    )

    if (!response.ok) return null

    const data: TokenPriceResponse = await response.json()

    // priceChange24h is returned as a string percentage like "5.23" for 5.23%
    if (data.priceChange24h) {
      return parseFloat(data.priceChange24h)
    }

    return null
  } catch (error) {
    console.error('Error fetching price change:', error)
    return null
  }
}

/**
 * Get health score based on 24h price change
 * Returns: 'healthy' (green), 'warning' (yellow), 'critical' (red)
 */
export function getHealthScore(priceChange24h: number | null): {
  score: 'healthy' | 'warning' | 'critical' | 'unknown'
  color: string
  emoji: string
} {
  if (priceChange24h === null) {
    return { score: 'unknown', color: 'text-gray-500', emoji: '❓' }
  }

  if (priceChange24h >= 0) {
    return { score: 'healthy', color: 'text-green-400', emoji: '✅' }
  } else if (priceChange24h > -10) {
    return { score: 'warning', color: 'text-yellow-400', emoji: '⚠️' }
  } else {
    return { score: 'critical', color: 'text-red-400', emoji: '🔥' }
  }
}
