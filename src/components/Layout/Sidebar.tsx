import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Layers3, 
  Calendar, 
  Target, 
  Settings,
  LogOut,
  Youtube,
  Linkedin,
  DollarSign
} from 'lucide-react';
import { InfinityLogo } from './InfinityLogo';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/content', icon: Layers3, label: 'Content Center' },
  { path: '/project-1460', icon: Calendar, label: 'Project 1460' },
  { path: '/youtube-systems', icon: Youtube, label: 'YouTube Systems' },
  { path: '/linkedin-systems', icon: Linkedin, label: 'LinkedIn Systems' },
  { path: '/video-revenue', icon: DollarSign, label: 'Video Revenue' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-screen w-64 glass-card border-r border-gray-800/30 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800/30">
        <div className="flex items-center space-x-3">
          <InfinityLogo size="lg" />
          <div>
            <h1 className="text-xl font-bold text-gradient">Infinitum</h1>
            <p className="text-xs text-gray-400">AI Creator Companion</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-cyan-500/30'
                  : 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
              }`
            }
          >
            <item.icon size={20} className="transition-transform group-hover:scale-110" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-800/30">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 hover:bg-red-500/20 text-gray-400 hover:text-red-400 w-full group"
        >
          <LogOut size={20} className="transition-transform group-hover:scale-110" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
}