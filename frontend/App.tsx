import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { LendingDashboard } from "./components/LendingDashboard";
import { DexDashboard } from "./components/DexDashboard";
import { Toaster } from "./components/ui/toaster";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Router>
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LendingDashboard />} />
            <Route path="/dex" element={<DexDashboard />} />
          </Routes>
        </main>
        
        <Toaster />
      </Router>
    </div>
  );
}

export default App;