import { useWallet } from "@aptos-labs/wallet-adapter-react";
// Internal Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Header";
import { WalletDetails } from "@/components/WalletDetails";
import { LendingDashboard } from "@/components/LendingDashboard";




function App() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {connected ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold text-foreground">
                APEX Lending Protocol
              </h1>
              <p className="text-lg text-muted-foreground">
                Borrow APEX tokens against your APT collateral
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Wallet Info Sidebar */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <WalletDetails />
                  </CardContent>
                </Card>
              </div>
              
              {/* Main Lending Interface */}
              <div className="lg:col-span-3 space-y-6">
                <LendingDashboard />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="shadow-xl border-0 bg-card/90 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4 p-8">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <CardTitle className="text-2xl text-foreground">
                  Connect Your Wallet
                </CardTitle>
                <p className="text-muted-foreground max-w-md">
                  Connect your Aptos wallet to start lending and borrowing with the APEX protocol
                </p>
              </CardHeader>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;