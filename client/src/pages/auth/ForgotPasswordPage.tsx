import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, Link as LinkIcon } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [simulatedResetUrl, setSimulatedResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post<{ message: string; simulatedResetUrl?: string }>(
        '/api/auth/forgot-password',
        { email }
      );
      setSubmitted(true);
      if (res.data?.simulatedResetUrl) {
        setSimulatedResetUrl(res.data.simulatedResetUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request password reset.');
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
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#034F46] text-[#FFFFEB] shadow-md shadow-[#034F46]/20 mb-2">
            <LinkIcon className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-editorial font-bold text-[#1A1A1A] tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            We will generate a secure one-time reset link for your account.
          </p>
        </div>

        <Card className="border border-[#1A1A1A]/8 bg-white shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle>Account Recovery</CardTitle>
            <CardDescription>
              Enter the email address registered with your LynxFlow account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
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
                  Send Reset Link <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#10B981]/15 text-[#034F46] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
                </div>
                <h3 className="text-base font-editorial font-bold text-[#1A1A1A]">Reset Link Dispatched</h3>
                <p className="text-xs text-[#1A1A1A]/70 leading-relaxed">
                  If an account matches <span className="font-semibold text-[#1A1A1A]">{email}</span>, a secure password reset link has been generated.
                </p>

                {simulatedResetUrl && (
                  <div className="p-3.5 rounded-2xl bg-[#FFFFEB] border border-[#034F46]/20 text-left space-y-1.5">
                    <p className="text-[11px] font-semibold text-[#034F46]">
                      Direct Password Reset Link
                    </p>
                    <a
                      href={simulatedResetUrl}
                      className="text-xs font-mono text-[#034F46] underline break-all hover:text-[#023832]"
                    >
                      {simulatedResetUrl}
                    </a>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8 text-center text-xs">
              <Link to="/login" className="text-[#034F46] font-semibold hover:underline inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
