import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const { refreshUser } = useAuth();

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage('No verification token was found in the link.');
      return;
    }

    const performVerification = async () => {
      try {
        const res = await api.get<{ message: string; user: any }>(`/api/auth/verify-email?token=${token}`);
        if (res.success) {
          setSuccess(true);
          setMessage('Your email address has been successfully verified!');
          await refreshUser();
        } else {
          setSuccess(false);
          setMessage(res.error?.message || 'Invalid or expired verification token.');
        }
      } catch (err: any) {
        setSuccess(false);
        setMessage(err.message || 'Verification failed. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    performVerification();
  }, [token, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/90 text-center p-6">
        <CardContent className="space-y-6 pt-2">
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
              <p className="text-sm text-slate-300">Verifying your email token...</p>
            </div>
          ) : success ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">Account Verified!</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
              <div className="pt-2">
                <Link to="/dashboard">
                  <Button className="w-full">
                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-white font-heading">Verification Failed</h2>
              <p className="text-xs text-rose-300 leading-relaxed">{message}</p>
              <div className="pt-2">
                <Link to="/dashboard">
                  <Button variant="outline" className="w-full">
                    Return to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
