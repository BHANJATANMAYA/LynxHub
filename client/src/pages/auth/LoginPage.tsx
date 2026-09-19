import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, ArrowRight, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      success('Welcome back!', 'Successfully signed in to your account.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-[#FAF9F5] text-[#1A1A1A] selection:bg-[#034F46] selection:text-[#FFFFEB] font-sans-ui relative">
      
      {/* Back to Home Link */}
      <div className="absolute top-6 left-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#1A1A1A]/8 text-xs font-medium text-[#1A1A1A]/70 hover:text-[#034F46] shadow-xs transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#034F46] text-[#FFFFEB] shadow-md shadow-[#034F46]/20 mb-2">
            <LinkIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-editorial font-bold text-[#1A1A1A] tracking-tight">
            Sign in to <span className="italic text-[#034F46]">LynxFlow</span>
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            Branded short links, click telemetry, and creator bio hubs.
          </p>
        </div>

        <Card className="border border-[#1A1A1A]/8 bg-white shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your dashboard and links.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Quick Demo Credentials Banner */}
            <div className="mb-5 p-3.5 rounded-2xl bg-[#FFFFEB] border border-[#034F46]/20 flex items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-[#034F46]">Demo Credentials</span>
                <p className="text-[11px] text-[#1A1A1A]/60 font-mono">demo@lynxhub.com • Password123!</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEmail('demo@lynxhub.com');
                  setPassword('Password123!');
                }}
                className="px-3 py-1.5 rounded-full bg-[#034F46] hover:bg-[#023832] text-[#FFFFEB] text-xs font-semibold transition-all shrink-0 shadow-xs cursor-pointer"
              >
                Auto-fill
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase text-[#1A1A1A]/70 tracking-wider">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-[#034F46] hover:underline font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="pill-primary"
                size="lg"
                loading={loading}
                className="w-full mt-2"
              >
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8 text-center">
              <p className="text-xs text-[#1A1A1A]/60">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-[#034F46] hover:underline"
                >
                  Create a free account →
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
