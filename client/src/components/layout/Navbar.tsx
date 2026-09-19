import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { LogOut, ExternalLink, ShieldCheck, AlertTriangle, Menu, Link as LinkIcon } from 'lucide-react';

export const Navbar: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const { user, logout, simulatedVerificationUrl } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    success('Logged out', 'You have been safely signed out.');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col w-full border-b border-[#1A1A1A]/8 bg-[#FAF9F5]/90 backdrop-blur-xl">
      {/* Email Verification Alert Banner */}
      {user && !user.isEmailVerified && (
        <div className="w-full bg-[#FFFFEB] border-b border-[#034F46]/20 px-4 py-2 text-xs text-[#034F46] flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-medium">
              Your email address is unverified.
            </span>
          </div>
          {simulatedVerificationUrl ? (
            <a
              href={simulatedVerificationUrl}
              className="font-semibold underline hover:text-[#023832] inline-flex items-center gap-1 bg-[#034F46]/10 px-2.5 py-0.5 rounded-full"
            >
              Verify account now <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="text-[#1A1A1A]/50 italic">Please check your inbox for the verification link</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-full text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#1A1A1A]/5 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2 md:hidden">
            <div className="w-7 h-7 rounded-full bg-[#034F46] text-[#FFFFEB] flex items-center justify-center font-bold text-xs shadow-sm">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <span className="text-lg font-editorial font-bold text-[#1A1A1A] tracking-tight">
              Lynx<span className="italic font-normal text-[#034F46]">Flow</span>
            </span>
          </Link>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            {/* Link to public bio */}
            <Link
              to={`/bio/${user.username}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs text-[#034F46] hover:text-[#023832] bg-white hover:bg-[#FFFFEB] px-3.5 py-1.5 rounded-full border border-[#1A1A1A]/10 font-semibold shadow-xs transition-all"
            >
              <span>/bio/{user.username}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#034F46]" />
            </Link>

            <div className="flex items-center gap-2.5 pl-2 border-l border-[#1A1A1A]/8">
              <Avatar
                fallback={user.username}
                size="sm"
                src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#1A1A1A] leading-tight">
                  {user.username}
                </span>
                <span className="text-[10px] text-[#1A1A1A]/50 leading-tight flex items-center gap-1">
                  {user.isEmailVerified ? (
                    <span className="text-[#10B981] font-medium flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  ) : (
                    <span className="text-amber-600 font-medium">Unverified</span>
                  )}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
                className="text-[#1A1A1A]/50 hover:text-rose-600 rounded-full"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
