import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "./WalletSelector";

export function Header() {
  const { connected } = useWallet();

  return (
    <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-900/90 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              APEX DeFi
            </h1>
          </div>

          {/* Navigation
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
              Docs
            </a>
            <a href="#" className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors">
              Support
            </a>
          </nav> */}

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {connected && (
              <div className="hidden sm:flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Connected</span>
              </div>
            )}
            <WalletSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
