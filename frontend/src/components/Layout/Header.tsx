import { NavLink } from 'react-router-dom';
import { Navigation, Activity, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 glass-panel-light border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-teal-500 flex shrink-0 items-center justify-center text-slate-950 font-black shadow-lg shadow-teal-500/10">
            <Navigation className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-900 leading-tight">
              Rio GPS
            </h1>
            <span className="block truncate text-[8px] sm:text-[9px] font-bold tracking-wider text-slate-500 uppercase">
              Live Vehicle Tracking
            </span>
          </div>
        </div>

        {/* Tab Selector */}
        <nav className="grid w-full grid-cols-2 gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 sm:w-auto sm:flex sm:items-center">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
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
                Users
              </>
            )}
          </NavLink>
          <NavLink
            to="/driver"
            className={({ isActive }) =>
              `flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap ${
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
                Driver
              </>
            )}
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
