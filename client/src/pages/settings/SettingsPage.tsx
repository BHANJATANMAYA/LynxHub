import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ShieldCheck,
  User,
  Lock,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, refreshUser, simulatedVerificationUrl } = useAuth();
  const { success, error: toastError } = useToast();
  const [verifying, setVerifying] = useState(false);

  const handleSimulateVerification = async () => {
    if (!simulatedVerificationUrl) {
      toastError(
        'Check server logs',
        'Verification URL was printed in the backend terminal during registration.'
      );
      return;
    }

    try {
      setVerifying(true);
      const url = new URL(simulatedVerificationUrl);
      const token = url.searchParams.get('token');
      const res = await api.get(`/api/auth/verify-email?token=${token}`);
      if (res.success) {
        success('Verified!', 'Your email has been marked as verified.');
        await refreshUser();
      }
    } catch (err: any) {
      toastError('Verification error', err.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
          Account & Architecture Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review authenticated user details, verification state, and technical architecture specifications.
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="glass-card border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            Account Overview
          </CardTitle>
          <CardDescription>Your registered LynxHub tenant credentials.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400">Username</span>
              <p className="text-sm font-semibold text-white">@{user?.username}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
              <span className="text-xs text-slate-400">Email Address</span>
              <p className="text-sm font-semibold text-white">{user?.email}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  user?.isEmailVerified
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {user?.isEmailVerified ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Email Verification</span>
                  {user?.isEmailVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {user?.isEmailVerified
                    ? 'Your account has completed the email verification flow.'
                    : 'Verify your email address to unlock full account privileges.'}
                </p>
              </div>
            </div>

            {!user?.isEmailVerified && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleSimulateVerification}
                loading={verifying}
              >
                Verify Email Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Technical Architecture & Security Architecture Summary Card */}
      <Card className="glass-card border-slate-800/80">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Security & Platform Architecture
          </CardTitle>
          <CardDescription>
            Core security and cryptographic principles powering the LynxHub platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-indigo-400">
                <Lock className="w-3.5 h-3.5" />
                <span>Token Rotation & Cookies</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Access tokens (15m) and refresh tokens (7d) are transmitted solely via strict <code>httpOnly</code> cookies. Each refresh request creates a fresh session and revokes the previous token to eliminate replay attacks.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-emerald-400">
                <Database className="w-3.5 h-3.5" />
                <span>Privacy-Preserving Telemetry</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Raw IP addresses are never saved to MongoDB. IPs are cryptographically salted and hashed using SHA-256 before telemetry aggregation, maintaining privacy and compliance.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-purple-400">
                <Cpu className="w-3.5 h-3.5" />
                <span>Non-Blocking 302 Redirects</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Short URL redirects return HTTP 302 immediately using single-index lookups. Analytics writes occur asynchronously via setImmediate without delaying the user redirect.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-amber-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Multi-Tenant Data Isolation</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                All database operations strictly enforce <code>userId</code> ownership. Cross-tenant access attempts return 404/403 errors and are completely isolated.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
