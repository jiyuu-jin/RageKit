# RageQuit Kit Telegram Bot

A Telegram bot for the RageQuit Kit that provides information, commands, and quick access to the web application.

## Features

- `/start` - Welcome message and overview
- `/help` - List of available commands
- `/info` - Detailed information about RageQuit Kit
- `/chains` - View supported chains and stablecoins
- `/tokens` - View tracked degen tokens
- `/webapp` - Get link to the web application

## Setup

1. **Get a Telegram Bot Token:**
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Use `/newbot` command
   - Follow the instructions to create your bot
   - Copy the bot token

2. **Configure Environment Variables:**
   ```bash
   cp env.example .env.local
   ```
   
   Then edit `.env.local` and add:
   ```env
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   WEBAPP_URL=https://your-app-url.com  # or http://localhost:3000 for dev
   ```

3. **Install Dependencies:**
   ```bash
   pnpm install
   ```

4. **Run the Bot:**
   ```bash
   # Production mode
   pnpm bot
   
   # Development mode (with auto-reload)
   pnpm bot:dev
   ```

## Usage

Once the bot is running, users can:
- Start a chat with your bot on Telegram
- Use `/start` to begin
- Navigate through commands to learn about RageQuit Kit
- Get direct links to the web application

## Architecture

The bot is built with:
- **Telegraf** - Telegram Bot Framework
- **TypeScript** - Type safety
- **tsx** - TypeScript execution

## Commands Reference

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and quick start guide |
| `/help` | Show all available commands |
| `/info` | Learn about RageQuit Kit features and tech stack |
| `/chains` | View all supported chains and their stablecoins |
| `/tokens` | View tracked degen tokens by chain |
| `/webapp` | Get a clickable link to the web application |

## Development

The bot code is located in `src/bot/index.ts`. To add new commands:

1. Add a new command handler:
   ```typescript
   bot.command('mycommand', async (ctx: Context) => {
     await ctx.reply('My response')
   })
   ```

2. Update the `/help` command to include your new command

3. Test locally with `pnpm bot:dev`

## Notes

- The bot is informational only - actual transactions must be done through the web app
- All wallet connections and transactions require user approval in the web interface
- The bot provides quick access and information, not transaction execution

## Troubleshooting

**Bot not responding:**
- Check that `TELEGRAM_BOT_TOKEN` is set correctly
- Verify the bot token is valid (not expired/revoked)
- Check console for error messages

**Commands not working:**
- Make sure the bot is running (`pnpm bot`)
- Try restarting the bot
- Check that you're messaging the correct bot account

