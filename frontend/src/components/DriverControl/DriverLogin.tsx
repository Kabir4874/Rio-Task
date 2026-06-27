interface DriverLoginProps {
  loginEmail: string;
  loginPassword: string;
  loginLoading: boolean;
  setLoginEmail: (email: string) => void;
  setLoginPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DriverLogin({
  loginEmail,
  loginPassword,
  loginLoading,
  setLoginEmail,
  setLoginPassword,
  onSubmit,
}: DriverLoginProps) {
  return (
    <>
      <h3 className="text-lg font-black text-center text-slate-800">
        Driver Portal Login
      </h3>
      <p className="text-xs text-center text-slate-500 mt-1 mb-6">
        Sign in to your profile to manage and track your vehicles
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. rahim@example.com"
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-teal-500 text-slate-900 text-sm font-medium"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-teal-500 text-slate-900 text-sm font-medium"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loginLoading}
          className="w-full py-3 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/10 disabled:opacity-50 text-sm"
        >
          {loginLoading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
    </>
  );
}
