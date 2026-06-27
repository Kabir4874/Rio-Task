import { NavLink } from 'react-router-dom';
import { Navigation, Activity, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-panel-light border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/10">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 leading-none">
              Rio Deep Live GPS
            </h1>
            <span className="text-[9px] font-bold tracking-wider text-slate-500 uppercase">
              Multi-Vehicle Tracking System
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Activity
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-teal-500' : 'text-slate-400'
                  }`}
                />
                User Dashboard
              </>
            )}
          </NavLink>
          <NavLink
            to="/driver"
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-100'
                  : 'text-slate-500 hover:text-slate-800'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <User
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-teal-500' : 'text-slate-400'
                  }`}
                />
                Driver Control
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
