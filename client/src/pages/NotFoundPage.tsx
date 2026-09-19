import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full text-center space-y-5 p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold font-heading text-white tracking-tight">404</h1>
        <h2 className="text-lg font-semibold text-slate-200">Page Not Found</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested page or short route doesn't exist, may have been removed, or is currently unavailable.
        </p>
        <div className="pt-2">
          <Link to="/dashboard">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
