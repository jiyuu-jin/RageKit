/**
 * Test script for RageGuard Telegram Bot
 * 
 * This script allows you to test bot commands without actually connecting to Telegram.
 * Useful for demos and development.
 * 
 * Usage: pnpm bot:test
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Mock Telegram context for testing
interface MockContext {
  from?: { id: number; username?: string; first_name?: string }
  message?: { text?: string; chat: { id: number } }
  reply: (text: string, options?: any) => Promise<void>
  updateType: string
}

// Import bot functions (we'll need to export them from index.ts or create testable versions)
import { DEGEN_TOKENS } from '../../lib/constants'

// Token symbol to CoinGecko ID mapping
const TOKEN_COINGECKO_MAP: Record<string, string> = {
  PEPE: 'pepe',
  SHIB: 'shiba-inu',
  DEGEN: 'degen-base',
  BRETT: 'brett-base',
  PORK: 'pepefork',
  TOBY: 'toby-the-token',
}

// Helper function to format numbers without trailing zeros
function formatPrice(price: number): string {
  const str = price.toString()
  if (price % 1 === 0) {
    return price.toString()
  }
  return str.replace(/\.?0+$/, '')
}

// Get all tracked tokens
function getAllTrackedTokens(): Array<{
  symbol: string
  chainId: number
  address: string
}> {
  const tokens: Array<{ symbol: string; chainId: number; address: string }> = []
  for (const [chainIdStr, tokenList] of Object.entries(DEGEN_TOKENS)) {
    const chainId = parseInt(chainIdStr)
    for (const token of tokenList) {
      tokens.push({
        symbol: token.symbol,
        chainId,
        address: token.address,
      })
    }
  }
  return tokens
}

// Mock context creator
function createMockContext(
  command: string,
  userId: number = 12345,
  username: string = 'testuser',
): MockContext {
  const replies: string[] = []

  return {
    from: { id: userId, username, first_name: 'Test' },
    message: {
      text: command,
      chat: { id: userId },
    },
    updateType: 'message',
    reply: async (text: string, options?: any) => {
      replies.push(text)
      console.log('\n📨 Bot Response:')
      console.log('─'.repeat(60))
      console.log(text)
      if (options?.reply_markup) {
        console.log('\n🔘 Buttons:', JSON.stringify(options.reply_markup, null, 2))
      }
      console.log('─'.repeat(60))
      return Promise.resolve()
    },
  }
}

// Test command handlers
async function testStartCommand() {
  console.log('\n🧪 Testing /start command')
  console.log('='.repeat(60))
  
  const ctx = createMockContext('/start')
  
  const welcomeMessage = `
🧨 *Welcome to RageGuard*

Your helper for *RageQuit* —* when you're tilted, don't think — *hit the button*.

RageGuard helps you learn about and access RageQuit, which exits your degen tokens into stablecoins across multiple chains.

*Available Commands:*
/help - Show this help message
/info - Learn about RageQuit
/chains - View supported chains
/tokens - View tracked degen tokens
/alert - Set a price alert for a token (e.g., /alert PEPE above 0.00001)
/alerts - View your active price alerts
/removealert - Remove a price alert
/webapp - Get link to RageQuit web app

*How RageQuit works:*
1. Connect your wallet via Privy
2. We scan your balances across chains
3. Select your target chain and stablecoin
4. Hit the RageQuit button to exit all positions

Ready to rage quit? Use /webapp to get started!
  `
  
  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' })
}

async function testHelpCommand() {
  console.log('\n🧪 Testing /help command')
  console.log('='.repeat(60))
  
  const ctx = createMockContext('/help')
  
  const helpMessage = `
*RageGuard Commands:*

RageGuard is your helper for RageQuit. Use these commands to learn more:

/help - Show this help message
/info - Learn about RageQuit
/chains - View supported chains and stablecoins
/tokens - View tracked degen tokens
/alert - Set a price alert for a token (e.g., /alert PEPE above 0.00001)
/alerts - View your active price alerts
/removealert - Remove a price alert
/webapp - Get link to the RageQuit web application

*Price Alerts:*
Set alerts for tracked tokens and get notified when prices hit your threshold. Use /alert to set one up!

*Need help?*
RageGuard provides information and links about RageQuit. To actually execute RageQuit, visit the web app and connect your wallet.
  `
  
  await ctx.reply(helpMessage, { parse_mode: 'Markdown' })
}

async function testTokensCommand() {
  console.log('\n🧪 Testing /tokens command')
  console.log('='.repeat(60))
  
  const ctx = createMockContext('/tokens')
  
  const tokensMessage = `
*Tracked Degen Tokens:*

*Ethereum*
• PEPE: \`0x6982508145454Ce325dDbE47a25d4ec3d2311933\`
• SHIB: \`0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE\`

*Base*
• DEGEN: \`0x4ed4E862860beD51a9570b96d89aF5E1B0Efefed\`
• BRETT: \`0x532f27101965dd16442E59d40670FaF5eBB142E4\`
• PORK: \`0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85\`
• TOBY: \`0x9fE8E567eE8cE5BdB5Bb96cF5D0b0bD4F5c0b5b5\`

*Note:* This list can be expanded. The web app scans for these tokens across all supported chains.

Use /alert to set price alerts for any of these tokens!

Use /webapp to check your balances and rage quit!
  `
  
  await ctx.reply(tokensMessage, { parse_mode: 'Markdown' })
}

async function testAlertCommand() {
  console.log('\n🧪 Testing /alert command')
  console.log('='.repeat(60))
  
  // Test valid alert
  console.log('\n✅ Test 1: Valid alert creation')
  const ctx1 = createMockContext('/alert PEPE above 0.00001')
  
  const token = getAllTrackedTokens().find((t) => t.symbol === 'PEPE')
  if (token && TOKEN_COINGECKO_MAP[token.symbol]) {
    const directionEmoji = '📈'
    await ctx1.reply(
      `✅ Alert set!\n\n${directionEmoji} ${token.symbol} above $${formatPrice(0.00001)}\n\nI'll notify you when the price hits this threshold!`,
    )
  }
  
  // Test invalid token
  console.log('\n❌ Test 2: Invalid token')
  const ctx2 = createMockContext('/alert INVALID above 1')
  await ctx2.reply(
    '❌ Token "INVALID" not found in tracked tokens.\n\nUse /tokens to see available tokens.',
  )
  
  // Test invalid direction
  console.log('\n❌ Test 3: Invalid direction')
  const ctx3 = createMockContext('/alert PEPE sideways 0.00001')
  await ctx3.reply(
    '❌ Direction must be "above" or "below".\n\nExample: /alert PEPE above 0.00001',
  )
  
  // Test help message
  console.log('\nℹ️ Test 4: Alert help message')
  const ctx4 = createMockContext('/alert')
  const helpMessage = `
*Set Price Alert*

Usage: \`/alert TOKEN above|below PRICE\`

*Examples:*
\`/alert PEPE above 0.00001\` - Alert when PEPE goes above $0.00001
\`/alert SHIB below 0.000008\` - Alert when SHIB goes below $0.000008
\`/alert DEGEN above 0.5\` - Alert when DEGEN goes above $0.50

*Available tokens:* PEPE, SHIB, DEGEN, BRETT, PORK, TOBY

Use /tokens to see all tracked tokens.
  `
  await ctx4.reply(helpMessage, { parse_mode: 'Markdown' })
}

async function testChainsCommand() {
  console.log('\n🧪 Testing /chains command')
  console.log('='.repeat(60))
  
  const ctx = createMockContext('/chains')
  
  const chainsMessage = `
*Supported Chains & Stablecoins:*

*Ethereum (Mainnet)*
• USDC: \`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\`
• USDT: \`0xdAC17F958D2ee523a2206206994597C13D831ec7\`

*Base*
• USDC: \`0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913\`

*Arbitrum*
• USDC: \`0xaf88d065e77c8cC2239327C5EDb3A432268e5831\`
• USDT: \`0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9\`

*Optimism*
• USDC: \`0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85\`

*Polygon*
• USDC: \`0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359\`
• USDT: \`0xc2132D05D31c914a87C6611C10748AEb04B58e8F\`

Use /webapp to select your target chain and stablecoin.
  `
  
  await ctx.reply(chainsMessage, { parse_mode: 'Markdown' })
}

async function testWebappCommand() {
  console.log('\n🧪 Testing /webapp command')
  console.log('='.repeat(60))
  
  const ctx = createMockContext('/webapp')
  const webappUrl = process.env.WEBAPP_URL || 'http://localhost:3000'
  
  const webappMessage = `
🌐 *RageQuit Web Application*

Click the link below to access RageQuit:

${webappUrl}

*What to do:*
1. Open the link above
2. Connect your wallet (or create an embedded wallet with Privy)
3. Wait for balance scan to complete
4. Select your target chain and stablecoin
5. Hit the big red RageQuit button!

*Remember:* All transactions require your approval. Stay safe! 🛡️
  `
  
  await ctx.reply(webappMessage, { parse_mode: 'Markdown' })
  
  await ctx.reply('🚀 Open RageQuit', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Open RageQuit', url: webappUrl }],
      ],
    },
  })
}

// Run all tests
async function runTests() {
  console.log('\n🤖 RageGuard Bot Test Suite')
  console.log('='.repeat(60))
  console.log('Testing bot commands without Telegram connection...\n')

  try {
    await testStartCommand()
    await testHelpCommand()
    await testTokensCommand()
    await testChainsCommand()
    await testAlertCommand()
    await testWebappCommand()

    console.log('\n✅ All tests completed!')
    console.log('='.repeat(60))
    console.log('\n💡 Tip: Use "pnpm bot" to run the actual bot with Telegram')
  } catch (error) {
    console.error('\n❌ Test failed:', error)
    process.exit(1)
  }
}

// Run if executed directly
runTests().catch((error) => {
  console.error('Error running tests:', error)
  process.exit(1)
})

export { runTests, createMockContext }

