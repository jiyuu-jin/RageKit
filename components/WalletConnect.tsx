'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useAccount } from 'wagmi'

export function WalletConnect() {
  const { login, logout, authenticated } = usePrivy()
  const { address } = useAccount()

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="px-8 py-4 text-lg font-bold text-white bg-linear-to-r from-red-600 to-orange-600 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-red-500/50"
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur border border-slate-800 rounded-xl px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <div className="text-sm">
          <p className="text-gray-500 text-xs">Connected</p>
          <p className="font-mono font-bold text-white">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>
      </div>
      <button
        onClick={logout}
        className="ml-3 px-4 py-2 text-sm font-medium text-gray-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
      >
        Disconnect
      </button>
    </div>
  )
}
