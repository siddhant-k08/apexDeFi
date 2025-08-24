import { WalletSelector } from "./WalletSelector";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div> */}
            <h1 className="text-xl font-bold text-foreground">APEX DeFi</h1>
          </div>

          {/* Navigation and Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Wallet Connection */}
            <WalletSelector />
          </div>
        </div>
      </div>
    </header>
  );
}
