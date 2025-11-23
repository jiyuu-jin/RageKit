import { config } from 'dotenv'
import { resolve, join } from 'path'
import { promises as fs } from 'fs'
import { Telegraf, Context } from 'telegraf'
import { message } from 'telegraf/filters'
import { DEGEN_TOKENS } from '../../lib/constants'

// Load environment variables from .env or .env.local
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// Initialize bot
const botToken = process.env.TELEGRAM_BOT_TOKEN

if (!botToken) {
  console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment variables')
  process.exit(1)
}

const bot = new Telegraf(botToken)

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
  // Convert to string and remove trailing zeros and unnecessary decimal places
  const str = price.toString()
  // If it's a whole number, return without decimals
  if (price % 1 === 0) {
    return price.toString()
  }
  // Otherwise, remove trailing zeros
  return str.replace(/\.?0+$/, '')
}

// Price alert storage
interface PriceAlert {
  userId: number
  tokenSymbol: string
  threshold: number
  direction: 'above' | 'below'
  chainId: number
  tokenAddress: string
}

const priceAlerts: Map<string, PriceAlert> = new Map()

// Path to alerts storage file
const ALERTS_FILE_PATH = join(process.cwd(), 'data', 'alerts.json')

// Helper function to get alert key
function getAlertKey(userId: number, tokenSymbol: string): string {
  return `${userId}_${tokenSymbol.toUpperCase()}`
}

// Load alerts from file
async function loadAlerts(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Try to read alerts file
    try {
      const data = await fs.readFile(ALERTS_FILE_PATH, 'utf-8')
      const alerts: PriceAlert[] = JSON.parse(data)
      
      // Load alerts into map
      for (const alert of alerts) {
        const key = getAlertKey(alert.userId, alert.tokenSymbol)
        priceAlerts.set(key, alert)
      }
      
      console.log(`✅ Loaded ${alerts.length} price alert(s) from storage`)
    } catch (error: any) {
      // File doesn't exist yet, that's okay
      if (error.code !== 'ENOENT') {
        console.error('Error loading alerts:', error)
      }
    }
  } catch (error) {
    console.error('Error setting up alerts storage:', error)
  }
}

// Save alerts to file
async function saveAlerts(): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = join(process.cwd(), 'data')
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    // Convert map to array
    const alerts = Array.from(priceAlerts.values())
    
    // Write to file
    await fs.writeFile(ALERTS_FILE_PATH, JSON.stringify(alerts, null, 2), 'utf-8')
  } catch (error) {
    console.error('Error saving alerts:', error)
  }
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

// Fetch token price from CoinGecko
async function getTokenPrice(tokenSymbol: string): Promise<number | null> {
  const coingeckoId = TOKEN_COINGECKO_MAP[tokenSymbol.toUpperCase()]
  if (!coingeckoId) {
    return null
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
    )
    const data = await response.json()
    return data[coingeckoId]?.usd || null
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol}:`, error)
    return null
  }
}

// Helper function to format chain names
function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum',
    8453: 'Base',
    42161: 'Arbitrum',
    10: 'Optimism',
    137: 'Polygon',
  }
  return chainNames[chainId] || `Chain ${chainId}`
}

// Start command
bot.start(async (ctx: Context) => {
  const welcomeMessage = `
🧨 *Welcome to RageGuard*

Your helper for *Ragekit* —* when you're tilted, don't think — *hit the button*.

RageGuard helps you learn about and access RageQuit, which exits your degen tokens into stablecoins across multiple chains.

*Available Commands:*
/help - Show this help message
/info - Learn about RageQuit
/chains - View supported chains
/tokens - View tracked degen tokens
/alert - Set a price alert for a token
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
})

// Help command
bot.command('help', async (ctx: Context) => {
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
})

// Info command
bot.command('info', async (ctx: Context) => {
  const infoMessage = `
🧨 *About RageQuit*

*What is RageQuit?*
A panic button for degens. Exit all your risk tokens into stablecoins with a single click.

*Features:*
• Multi-chain support (Ethereum, Base, Arbitrum, Optimism, Polygon)
• Automatic token scanning
• Optimal swap routing via 1inch
• Embedded wallets via Privy (no wallet needed to start)
• Connect existing wallets for power users

*Tech Stack:*
• Next.js + TypeScript
• Privy for wallet management
• 1inch Aggregation API for swaps
• wagmi + viem for blockchain interactions

*Safety:*
All transactions require your explicit approval. We never have access to your private keys.

*About RageGuard:*
I'm your helper bot for RageQuit. Use /webapp to access the RageQuit application!
  `
  await ctx.reply(infoMessage, { parse_mode: 'Markdown' })
})

// Chains command
bot.command('chains', async (ctx: Context) => {
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
})

// Tokens command
bot.command('tokens', async (ctx: Context) => {
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
})

// Alert command - Set a price alert
bot.command('alert', async (ctx: Context) => {
  if (!ctx.from) {
    await ctx.reply('Unable to identify user.')
    return
  }

  const userId = ctx.from.id
  const args = ctx.message && 'text' in ctx.message 
    ? ctx.message.text.split(' ').slice(1) 
    : []

  if (args.length < 3) {
    const helpMessage = `
*Set Price Alert*

Usage: \`/alert TOKEN above|below PRICE\`

*Examples:*
\`/alert PEPE above 0.00001\` - Alert when PEPE goes above $0.00001
\`/alert SHIB below 0.000008\` - Alert when SHIB goes below $0.000008
\`/alert DEGEN above 0.5\` - Alert when DEGEN goes above $0.50

*Available tokens:* PEPE, SHIB, DEGEN

Use /tokens to see all tracked tokens.
    `
    await ctx.reply(helpMessage, { parse_mode: 'Markdown' })
    return
  }

  const [tokenSymbol, direction, priceStr] = args
  const directionLower = direction.toLowerCase()

  if (directionLower !== 'above' && directionLower !== 'below') {
    await ctx.reply(
      '❌ Direction must be "above" or "below".\n\nExample: /alert PEPE above 0.00001',
    )
    return
  }

  const threshold = parseFloat(priceStr)
  if (isNaN(threshold) || threshold <= 0) {
    await ctx.reply('❌ Invalid price. Please provide a positive number.')
    return
  }

  // Find the token in our tracked list
  const allTokens = getAllTrackedTokens()
  const token = allTokens.find(
    (t) => t.symbol.toUpperCase() === tokenSymbol.toUpperCase(),
  )

  if (!token) {
    await ctx.reply(
      `❌ Token "${tokenSymbol}" not found in tracked tokens.\n\nUse /tokens to see available tokens.`,
    )
    return
  }

  // Check if CoinGecko supports this token
  if (!TOKEN_COINGECKO_MAP[token.symbol.toUpperCase()]) {
    await ctx.reply(
      `❌ Price tracking not available for ${token.symbol} yet.`,
    )
    return
  }

  // Check if alert already exists
  const alertKey = getAlertKey(userId, token.symbol)
  if (priceAlerts.has(alertKey)) {
    await ctx.reply(
      `⚠️ You already have an alert for ${token.symbol}. Use /removealert ${token.symbol} first, or I'll update it.`,
    )
  }

  // Create or update alert
  priceAlerts.set(alertKey, {
    userId,
    tokenSymbol: token.symbol,
    threshold,
    direction: directionLower as 'above' | 'below',
    chainId: token.chainId,
    tokenAddress: token.address,
  })

  // Save to file
  await saveAlerts()

  const directionEmoji = directionLower === 'above' ? '📈' : '📉'
  await ctx.reply(
    `✅ Alert set!\n\n${directionEmoji} ${token.symbol} ${directionLower} $${formatPrice(threshold)}\n\nI'll notify you when the price hits this threshold!`,
  )
})

// Alerts command - List user's alerts
bot.command('alerts', async (ctx: Context) => {
  if (!ctx.from) {
    await ctx.reply('Unable to identify user.')
    return
  }

  const userId = ctx.from.id
  const userAlerts = Array.from(priceAlerts.values()).filter(
    (alert) => alert.userId === userId,
  )

  if (userAlerts.length === 0) {
    await ctx.reply(
      "You don't have any active alerts.\n\nUse /alert to set one up!",
    )
    return
  }

  let message = `*Your Active Alerts:*\n\n`
  for (const alert of userAlerts) {
    const directionEmoji = alert.direction === 'above' ? '📈' : '📉'
    const chainName = getChainName(alert.chainId)
    message += `${directionEmoji} *${alert.tokenSymbol}* ${alert.direction} $${formatPrice(alert.threshold)}\n`
    message += `   Chain: ${chainName}\n\n`
  }

  message += `Use /removealert TOKEN to remove an alert.`

  await ctx.reply(message, { parse_mode: 'Markdown' })
})

// Remove alert command
bot.command('removealert', async (ctx: Context) => {
  if (!ctx.from) {
    await ctx.reply('Unable to identify user.')
    return
  }

  const userId = ctx.from.id
  const args = ctx.message && 'text' in ctx.message 
    ? ctx.message.text.split(' ').slice(1) 
    : []

  if (args.length === 0) {
    await ctx.reply(
      'Usage: /removealert TOKEN\n\nExample: /removealert PEPE',
    )
    return
  }

  const tokenSymbol = args[0].toUpperCase()
  const alertKey = getAlertKey(userId, tokenSymbol)

  if (!priceAlerts.has(alertKey)) {
    await ctx.reply(`❌ No alert found for ${tokenSymbol}.\n\nUse /alerts to see your active alerts.`)
    return
  }

  priceAlerts.delete(alertKey)
  
  // Save to file
  await saveAlerts()
  
  await ctx.reply(`✅ Alert for ${tokenSymbol} removed.`)
})

// Webapp command
bot.command('webapp', async (ctx: Context) => {
  // In production, replace with your actual web app URL
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
  
  // Also send as a clickable button
  await ctx.reply('🚀 Open RageQuit', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🌐 Open RageQuit', url: webappUrl }],
      ],
    },
  })
})

// Handle any other text messages
bot.on(message('text'), async (ctx: Context) => {
  if (ctx.message && 'text' in ctx.message) {
    await ctx.reply(
      "I didn't understand that command. Use /help to see available commands.",
    )
  }
})

// Error handling
bot.catch((err, ctx) => {
  console.error(`Error for ${ctx.updateType}:`, err)
  console.error('Error details:', err instanceof Error ? err.stack : err)
  try {
    ctx.reply('An error occurred. Please try again later.')
  } catch (replyError) {
    console.error('Failed to send error message:', replyError)
  }
})

// Add middleware to log all updates
bot.use(async (ctx, next) => {
  console.log(`📨 Received update: ${ctx.updateType}`)
  if (ctx.message && 'text' in ctx.message) {
    console.log(`   Message: ${ctx.message.text}`)
  }
  try {
    await next()
  } catch (error) {
    console.error('Error in middleware:', error)
    throw error
  }
})

// Price monitoring function
async function checkPriceAlerts() {
  if (priceAlerts.size === 0) {
    return
  }

  // Get unique tokens to check
  const tokensToCheck = new Set<string>()
  for (const alert of priceAlerts.values()) {
    tokensToCheck.add(alert.tokenSymbol)
  }

  // Check prices for all tokens
  for (const tokenSymbol of tokensToCheck) {
    const price = await getTokenPrice(tokenSymbol)
    if (price === null) {
      continue
    }

    // Check all alerts for this token
    for (const alert of priceAlerts.values()) {
      if (alert.tokenSymbol.toUpperCase() !== tokenSymbol.toUpperCase()) {
        continue
      }

      const shouldTrigger =
        (alert.direction === 'above' && price >= alert.threshold) ||
        (alert.direction === 'below' && price <= alert.threshold)

      if (shouldTrigger) {
        const webappUrl = process.env.WEBAPP_URL || 'http://localhost:3000'
        const chainName = getChainName(alert.chainId)
        const directionEmoji = alert.direction === 'above' ? '📈' : '📉'
        
        const notificationMessage = `
🚨 *Price Alert Triggered!*

${directionEmoji} *${alert.tokenSymbol}* is now ${alert.direction} $${formatPrice(alert.threshold)}

*Current Price:* $${formatPrice(price)}
*Chain:* ${chainName}

*Time to RageQuit!* 🧨

Click below to exit your positions:
        `

        try {
          await bot.telegram.sendMessage(alert.userId, notificationMessage, {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🚀 RageQuit Now', url: webappUrl }],
              ],
            },
          })

          // Remove the alert after triggering
          const alertKey = getAlertKey(alert.userId, alert.tokenSymbol)
          priceAlerts.delete(alertKey)
          
          // Save to file
          await saveAlerts()
        } catch (error) {
          console.error(`Error sending alert to user ${alert.userId}:`, error)
        }
      }
    }
  }
}

// Start price monitoring loop
function startPriceMonitoring() {
  // Check prices every 60 seconds
  setInterval(async () => {
    try {
      await checkPriceAlerts()
    } catch (error) {
      console.error('Error in price monitoring:', error)
    }
  }, 60000) // 60 seconds

  console.log('📊 Price monitoring started (checking every 60 seconds)')
}

// Start bot
async function startBot() {
  try {
    console.log('🤖 Starting RageGuard...')
    console.log(`   Bot token: ${botToken ? `${botToken.substring(0, 10)}...` : 'NOT SET'}`)
    
    // Load alerts from storage
    await loadAlerts()
    
    console.log('   Launching bot...')
    await bot.launch()
    console.log('✅ RageGuard is running!')
    console.log('   Bot is ready to receive messages')
    
    // Start price monitoring
    startPriceMonitoring()
    
    // Graceful shutdown - save alerts before exiting
    process.once('SIGINT', async () => {
      console.log('💾 Saving alerts before shutdown...')
      await saveAlerts()
      await bot.stop('SIGINT')
      process.exit(0)
    })
    process.once('SIGTERM', async () => {
      console.log('💾 Saving alerts before shutdown...')
      await saveAlerts()
      await bot.stop('SIGTERM')
      process.exit(0)
    })
  } catch (error) {
    console.error('❌ Failed to start bot:', error)
    if (error instanceof Error) {
      console.error('   Stack:', error.stack)
    }
    process.exit(1)
  }
}

// Start the bot
startBot()

export default bot

