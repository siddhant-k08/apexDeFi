import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { LendingDashboard } from "./components/LendingDashboard";
import { DexDashboard } from "./components/DexDashboard";
import { Header } from "./components/Header";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8">
              <Link 
                to="/" 
                className="px-3 py-4 text-lg font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                Lending & Borrowing
              </Link>
              <Link 
                to="/dex" 
                className="px-3 py-4 text-lg font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 border-b-2 border-transparent hover:border-blue-600 transition-colors"
              >
                DEX Trading
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<LendingDashboard />} />
            <Route path="/dex" element={<DexDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;