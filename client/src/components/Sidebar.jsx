import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileCheck2,
  Calculator,
  AlertTriangle,
  Flame,
  Building2,
  BarChart3,
  HelpCircle,
  FileText
} from 'lucide-react';

const navigation = [
  { name: 'Executive Overview', href: '/', icon: LayoutDashboard },
  { name: 'Treaties & Facultative', href: '/treaties', icon: FileCheck2 },
  { name: 'Underwriting Workbench', href: '/underwriting', icon: Calculator },
  { name: 'Claims & Ceded Losses', href: '/claims', icon: AlertTriangle },
  { name: 'Catastrophe Accumulation', href: '/cat-exposure', icon: Flame },
  { name: 'Cedents & Brokers', href: '/cedents', icon: Building2 },
  { name: 'Portfolio Analytics', href: '/analytics', icon: BarChart3 },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-3">
          Core Reinsurance
        </p>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-semibold text-slate-200">Treaty Guidelines 2026</span>
          </div>
          <p className="text-xs text-slate-400 mb-2">
            Refer to Gen Re global property/casualty guidelines and ESG exclusion mandates.
          </p>
          <a
            href="#guidelines"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1"
          >
            <span>View Manual</span>
            <span>&rarr;</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
