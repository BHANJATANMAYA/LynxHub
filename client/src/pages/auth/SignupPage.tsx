import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Lock, User, ArrowRight, CheckCircle2, Link as LinkIcon, ArrowLeft } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signup } = useAuth();
  const { success, toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Password requirements check
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Password must include uppercase, lowercase, and numeric characters');
      return;
    }

    setLoading(true);

    try {
      const result = await signup(email, password, username);
      success('Account created!', `Welcome to LynxFlow, ${username}!`);

      if (result.simulatedVerificationUrl) {
        toast({
          type: 'info',
          title: '📧 Verification Email Sent',
          message: 'Click the link below or in the top banner to verify your account.',
          actionUrl: result.simulatedVerificationUrl,
          actionLabel: 'Verify Account Now',
          duration: 10000,
        });
      }

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
            Create your <span className="italic text-[#034F46]">LynxFlow</span> Account
          </h1>
          <p className="text-xs text-[#1A1A1A]/60">
            Get your branded short links and link-in-bio page in seconds.
          </p>
        </div>

        <Card className="border border-[#1A1A1A]/8 bg-white shadow-sm rounded-3xl">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>
              Choose your creator username and secure your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                leftIcon={<User className="w-4 h-4" />}
                helperText={`Your public bio will be at /bio/${username || 'username'}`}
                required
                autoComplete="username"
              />

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

              <Input
                label="Password"
                type="password"
                placeholder="Min. 8 chars (upper, lower, number)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="new-password"
              />

              {/* Password checks */}
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#1A1A1A]/8 text-[11px] text-[#1A1A1A]/70 space-y-1">
                <div className={`flex items-center gap-1.5 ${password.length >= 8 ? 'text-[#10B981] font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Minimum 8 characters
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(password) && /[a-z]/.test(password) ? 'text-[#10B981] font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Uppercase and lowercase letters
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(password) ? 'text-[#10B981] font-semibold' : ''}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> At least one numeric digit
                </div>
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
                Create Free Account
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8 text-center text-xs text-[#1A1A1A]/60">
              Already have an account?{' '}
              <Link to="/login" className="text-[#034F46] font-semibold hover:underline">
                Sign in →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignupPage;
