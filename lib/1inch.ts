import { CHAIN_ID_TO_1INCH } from './constants'

const API_BASE_URL = 'https://api.1inch.dev/swap/v6.0'

interface SwapQuoteParams {
  chainId: number
  src: string
  dst: string
  amount: string
  from: string
}

interface SwapParams extends SwapQuoteParams {
  slippage: number
  disableEstimate?: boolean
}

export interface SwapQuote {
  dstAmount: string
  tx: {
    from: string
    to: string
    data: string
    value: string
    gas: number
    gasPrice: string
  }
}

async function makeRequest(url: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  const apiKey = process.env.NEXT_PUBLIC_1INCH_API_KEY
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(url, { headers })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`1inch API error: ${error}`)
  }

  return response.json()
}

export async function getSwapQuote(
  params: SwapQuoteParams
): Promise<SwapQuote> {
  const oneInchChainId = CHAIN_ID_TO_1INCH[params.chainId]
  if (!oneInchChainId) {
    throw new Error(`Chain ${params.chainId} not supported by 1inch`)
  }

  const queryParams = new URLSearchParams({
    src: params.src,
    dst: params.dst,
    amount: params.amount,
    from: params.from,
    slippage: '1', // 1% default slippage
    disableEstimate: 'true',
  })

  const url = `${API_BASE_URL}/${oneInchChainId}/swap?${queryParams}`
  return makeRequest(url)
}

export async function getSwapTransaction(params: SwapParams): Promise<SwapQuote> {
  const oneInchChainId = CHAIN_ID_TO_1INCH[params.chainId]
  if (!oneInchChainId) {
    throw new Error(`Chain ${params.chainId} not supported by 1inch`)
  }

  const queryParams = new URLSearchParams({
    src: params.src,
    dst: params.dst,
    amount: params.amount,
    from: params.from,
    slippage: params.slippage.toString(),
    disableEstimate: params.disableEstimate ? 'true' : 'false',
  })

  const url = `${API_BASE_URL}/${oneInchChainId}/swap?${queryParams}`
  return makeRequest(url)
}

export async function checkAllowance(
  chainId: number,
  tokenAddress: string,
  walletAddress: string
): Promise<string> {
  const oneInchChainId = CHAIN_ID_TO_1INCH[chainId]
  if (!oneInchChainId) {
    throw new Error(`Chain ${chainId} not supported by 1inch`)
  }

  const url = `${API_BASE_URL}/${oneInchChainId}/approve/allowance?tokenAddress=${tokenAddress}&walletAddress=${walletAddress}`
  const data = await makeRequest(url)
  return data.allowance
}

export async function getApproveTransaction(
  chainId: number,
  tokenAddress: string,
  amount?: string
): Promise<{ data: string; gasPrice: string; to: string; value: string }> {
  const oneInchChainId = CHAIN_ID_TO_1INCH[chainId]
  if (!oneInchChainId) {
    throw new Error(`Chain ${chainId} not supported by 1inch`)
  }

  const queryParams = new URLSearchParams({
    tokenAddress,
  })

  if (amount) {
    queryParams.append('amount', amount)
  }

  const url = `${API_BASE_URL}/${oneInchChainId}/approve/transaction?${queryParams}`
  return makeRequest(url)
}
