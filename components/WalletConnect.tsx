'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export function WalletConnect() {
  const { login, logout, authenticated } = usePrivy()
  const { address } = useAccount()

  if (!authenticated) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Connect to start your RageQuit
        </p>
        <button
          onClick={login}
          className="px-6 py-3 text-lg font-semibold text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <div className="text-sm">
        <p className="text-gray-600 dark:text-gray-400">Connected</p>
        <p className="font-mono font-semibold">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </div>
      <button
        onClick={logout}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}
