import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, ArrowRight, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { success } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset token is missing from the link.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/api/auth/reset-password', {
        token,
        password,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Password reset failed.');
      }

      success('Password updated!', 'You can now sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
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
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#034F46] text-[#FFFFEB] shadow-md shadow-[#034F46]/20 mb-2">
            <LinkIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-editorial font-bold text-[#1A1A1A] tracking-tight">
            Set New Password
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            Enter a new secure password for your LynxFlow account.
          </p>
        </div>

        <Card className="border border-[#1A1A1A]/8 bg-white shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle>Choose Password</CardTitle>
            <CardDescription>
              Your new password must be at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="New Password"
                type="password"
                placeholder="Min. 8 chars (upper, lower, number)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
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
                Update Password <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8 text-center text-xs">
              <Link to="/login" className="text-[#034F46] font-semibold hover:underline">
                Back to Sign In →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
