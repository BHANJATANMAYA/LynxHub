import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Link2,
  BarChart3,
  UserCheck,
  Settings,
  Plus,
  Zap,
  Link as LinkIcon,
} from 'lucide-react';
import { Button } from '../ui/Button';

interface SidebarProps {
  onOpenCreateModal?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenCreateModal, isOpen = false, onClose }) => {
  const navItems = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/links', label: 'Links', icon: Link2 },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/bio', label: 'Bio Builder', icon: UserCheck },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 border-r border-[#1A1A1A]/8 bg-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b border-[#1A1A1A]/8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#034F46] text-[#FFFFEB] flex items-center justify-center font-bold text-sm shadow-sm">
              <LinkIcon className="w-4 h-4" />
            </div>
            <span className="text-xl font-editorial font-bold text-[#1A1A1A] tracking-tight">
              Lynx<span className="italic font-normal text-[#034F46]">Flow</span>
            </span>
          </Link>
        </div>

        <div className="p-4">
          <Button
            variant="pill-primary"
            onClick={() => {
              if (onClose) onClose();
              if (onOpenCreateModal) onOpenCreateModal();
            }}
            className="w-full justify-center font-semibold"
          >
            <Plus className="w-4 h-4" />
            Create Short Link
          </Button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#034F46] text-[#FFFFEB] shadow-xs'
                      : 'text-[#1A1A1A]/70 hover:text-[#034F46] hover:bg-[#FAF9F5]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Pro Banner in Wispr Flow Cream Palette */}
        <div className="p-4 m-3 rounded-2xl bg-[#FFFFEB] border border-[#034F46]/15 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#034F46] mb-1">
            <Zap className="w-3.5 h-3.5 fill-[#034F46]" />
            <span>LynxFlow Architecture</span>
          </div>
          <p className="text-[#1A1A1A]/60 text-[11px] leading-relaxed">
            Sub-50ms global edge redirects, salted SHA-256 telemetry, and creator bio hubs.
          </p>
        </div>
      </aside>
    </>
  );
};
