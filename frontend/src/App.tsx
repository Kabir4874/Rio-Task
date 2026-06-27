import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { CheckCircle, MapPin } from 'lucide-react';
import { Header } from './components/Layout/Header';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { DriverControlPage } from './pages/DriverControlPage';

function App() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => setErrorMsg(null), 5000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500 selection:text-slate-900">
      {/* Toast Messages */}
      {successMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 bg-emerald-500/95 border border-emerald-400 text-white rounded-xl shadow-2xl glass-panel-light animate-bounce">
          <CheckCircle className="w-5 h-5 text-emerald-100" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-2 px-4 py-3 bg-rose-500/95 border border-rose-400 text-white rounded-xl shadow-2xl glass-panel-light">
          <MapPin className="w-5 h-5 rotate-45 animate-pulse text-rose-100" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Header */}
      <Header />

      {/* Application Body */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route
            path="/"
            element={<UserDashboardPage showError={showError} />}
          />
          <Route
            path="/driver"
            element={
              <DriverControlPage
                showError={showError}
                showSuccess={showSuccess}
              />
            }
          />
        </Routes>
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center sm:text-left">
            <p className="font-bold text-slate-700">
              Rio Deep Technologies Assessment
            </p>
            <p className="mt-0.5">Designed by Kabir Ahmed Ridoy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
