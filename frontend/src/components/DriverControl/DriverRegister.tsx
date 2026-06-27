interface DriverRegisterProps {
  registerName: string;
  registerEmail: string;
  registerPassword: string;
  registerLoading: boolean;
  setRegisterName: (name: string) => void;
  setRegisterEmail: (email: string) => void;
  setRegisterPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function DriverRegister({
  registerName,
  registerEmail,
  registerPassword,
  registerLoading,
  setRegisterName,
  setRegisterEmail,
  setRegisterPassword,
  onSubmit,
}: DriverRegisterProps) {
  return (
    <>
      <h3 className="text-lg font-black text-center text-slate-800">
        New Driver Registration
      </h3>
      <p className="text-xs text-center text-slate-500 mt-1 mb-6">
        Register your profile to setup location tracking
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Rahim Uddin"
            value={registerName}
            onChange={(e) => setRegisterName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-teal-500 text-slate-900 text-sm font-medium"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Email Address
          </label>
          <input
            type="email"
            placeholder="e.g. rahim@example.com"
            value={registerEmail}
            onChange={(e) => setRegisterEmail(e.target.value)}
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
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 placeholder-slate-400 focus:outline-none focus:border-teal-500 text-slate-900 text-sm font-medium"
            required
          />
        </div>
        <button
          type="submit"
          disabled={registerLoading}
          className="w-full py-3 bg-teal-500 text-slate-950 font-bold rounded-xl hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/10 disabled:opacity-50 text-sm"
        >
          {registerLoading ? 'Registering...' : 'Complete Registration'}
        </button>
      </form>
    </>
  );
}
