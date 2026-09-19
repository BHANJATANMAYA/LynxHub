import React, { useEffect, useState, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { AnalyticsData, ShortLink } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { QrCodeModal } from '../../components/links/QrCodeModal';
import { truncateUrl } from '../../lib/utils';
import { useToast } from '../../context/ToastContext';
import {
  Link2,
  MousePointerClick,
  Smartphone,
  Globe2,
  Plus,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  TrendingUp,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const OverviewPage: React.FC = () => {
  const { openCreateLinkModal } = useOutletContext<{ openCreateLinkModal: () => void }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [totalLinks, setTotalLinks] = useState(0);
  const [recentLinks, setRecentLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQrLink, setActiveQrLink] = useState<ShortLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { success } = useToast();

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsRes, linksRes] = await Promise.all([
        api.get<AnalyticsData & { totalLinks: number }>('/api/analytics/overview?period=30d'),
        api.get<ShortLink[]>('/api/links?limit=5&page=1'),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setAnalytics(analyticsRes.data);
        setTotalLinks(analyticsRes.data.totalLinks || 0);
      }

      if (linksRes.success && linksRes.data) {
        setRecentLinks(linksRes.data);
      }
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleCreated = () => loadDashboardData();
    window.addEventListener('lynxhub:link-created', handleCreated);
    return () => window.removeEventListener('lynxhub:link-created', handleCreated);
  }, [loadDashboardData]);

  const handleCopy = async (link: ShortLink) => {
    const url = `${window.location.origin}/r/${link.shortCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(link._id);
    success('Copied to clipboard!', url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#034F46]" />
        <p className="text-xs text-[#1A1A1A]/60 font-medium">Loading platform overview...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans-ui text-[#1A1A1A]">
      {/* Top Header in Wispr Flow Editorial Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>REAL-TIME TELEMETRY ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-editorial font-bold text-[#1A1A1A] tracking-tight">
            Platform <span className="italic text-[#034F46]">Overview</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#1A1A1A]/60 mt-1">
            Real-time telemetry and branded short link performance at the speed of thought.
          </p>
        </div>

        <Button
          variant="pill-primary"
          size="lg"
          onClick={openCreateLinkModal}
          className="shrink-0 font-semibold"
        >
          <Plus className="w-4 h-4" />
          Create Short Link
        </Button>
      </div>

      {/* Metrics Row (Wispr Flow Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-white rounded-3xl border border-[#1A1A1A]/8 shadow-xs hover:border-[#034F46]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#1A1A1A]/50 tracking-wider">Total Short Links</span>
            <div className="w-9 h-9 rounded-full bg-[#034F46]/10 text-[#034F46] flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-editorial font-bold text-[#1A1A1A]">{totalLinks}</span>
            <p className="text-[11px] text-[#1A1A1A]/50 mt-1 font-medium">Active redirects configured</p>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-3xl border border-[#1A1A1A]/8 shadow-xs hover:border-[#034F46]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#1A1A1A]/50 tracking-wider">Total Telemetry Clicks</span>
            <div className="w-9 h-9 rounded-full bg-[#10B981]/15 text-[#034F46] flex items-center justify-center">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-editorial font-bold text-[#1A1A1A]">
              {analytics?.summary.totalClicks ?? 0}
            </span>
            <p className="text-[11px] text-[#034F46] mt-1 font-medium flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{analytics?.summary.uniqueVisitors ?? 0} unique hashed visitors</span>
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-3xl border border-[#1A1A1A]/8 shadow-xs hover:border-[#034F46]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#1A1A1A]/50 tracking-wider">Primary Device</span>
            <div className="w-9 h-9 rounded-full bg-[#034F46]/10 text-[#034F46] flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-editorial font-bold text-[#1A1A1A] truncate block">
              {analytics?.summary.topDevice || 'None'}
            </span>
            <p className="text-[11px] text-[#1A1A1A]/50 mt-1 font-medium">Based on UA classification</p>
          </div>
        </Card>

        <Card className="p-6 bg-white rounded-3xl border border-[#1A1A1A]/8 shadow-xs hover:border-[#034F46]/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-[#1A1A1A]/50 tracking-wider">Top Traffic Origin</span>
            <div className="w-9 h-9 rounded-full bg-[#034F46]/10 text-[#034F46] flex items-center justify-center">
              <Globe2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-editorial font-bold text-[#1A1A1A] truncate block">
              {analytics?.summary.topReferrer || 'Direct / None'}
            </span>
            <p className="text-[11px] text-[#1A1A1A]/50 mt-1 font-medium">Referrer domain extraction</p>
          </div>
        </Card>
      </div>

      {/* Analytics Summary Chart */}
      <Card className="border border-[#1A1A1A]/8 bg-white shadow-xs rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Clicks Over Time</CardTitle>
            <p className="text-xs text-[#1A1A1A]/50 mt-0.5">Aggregated daily redirects over the past 30 days</p>
          </div>
          <Link to="/analytics">
            <Button variant="pill-outline" size="sm" className="text-[#034F46]">
              Detailed Analytics <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full pt-4">
            {analytics && analytics.clicksOverTime && analytics.clicksOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.clicksOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#034F46" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#034F46" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    stroke="#8A928E"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(str) => str.slice(5)}
                  />
                  <YAxis stroke="#8A928E" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFEB',
                      borderColor: 'rgba(3, 79, 70, 0.2)',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#1A1A1A',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    }}
                    labelStyle={{ color: '#034F46', fontWeight: 600 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    stroke="#034F46"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#clickGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#1A1A1A]/40">
                No telemetry clicks recorded yet. Share your short link to view activity.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Links Section */}
      <Card className="border border-[#1A1A1A]/8 bg-white shadow-xs rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Short Links</CardTitle>
            <p className="text-xs text-[#1A1A1A]/50 mt-0.5">Quick access to your latest created links</p>
          </div>
          <Link to="/links">
            <Button variant="pill-outline" size="sm" className="text-[#034F46]">
              View All Links <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentLinks.length > 0 ? (
            <div className="divide-y divide-[#1A1A1A]/6">
              {recentLinks.map((link) => (
                <div
                  key={link._id}
                  className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={`${window.location.origin}/r/${link.shortCode}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-sm font-semibold text-[#034F46] hover:underline flex items-center gap-1"
                      >
                        /r/{link.shortCode}
                        <ExternalLink className="w-3 h-3 text-[#1A1A1A]/40" />
                      </a>
                      {link.isCustomSlug && (
                        <span className="px-2 py-0.5 rounded-full bg-[#FFFFEB] border border-[#034F46]/20 text-[10px] font-semibold text-[#034F46]">
                          Vanity Slug
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#1A1A1A]/60 truncate max-w-md">
                      {link.title ? <span className="text-[#1A1A1A] font-medium mr-2">{link.title} •</span> : null}
                      {truncateUrl(link.destinationUrl, 50)}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-base font-editorial font-bold text-[#1A1A1A]">{link.clickCount}</span>
                      <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider">clicks</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="pill-secondary"
                        size="sm"
                        onClick={() => handleCopy(link)}
                        title="Copy short link"
                      >
                        {copiedId === link._id ? (
                          <Check className="w-3.5 h-3.5 text-[#10B981]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>

                      <Button
                        variant="pill-secondary"
                        size="sm"
                        onClick={() => setActiveQrLink(link)}
                        title="Generate QR code"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                      </Button>

                      <Link to={`/analytics?linkId=${link._id}`}>
                        <Button variant="pill-outline" size="sm">
                          Metrics
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FAF9F5] text-[#034F46] flex items-center justify-center mx-auto border border-[#1A1A1A]/10">
                <Link2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-editorial font-bold text-[#1A1A1A]">No short links created yet</h4>
              <p className="text-xs text-[#1A1A1A]/60 max-w-sm mx-auto">
                Create your first branded short link to start tracking real-time click telemetry and device analytics.
              </p>
              <Button variant="pill-primary" onClick={openCreateLinkModal} size="sm">
                <Plus className="w-3.5 h-3.5" /> Create Link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Code Modal */}
      <QrCodeModal link={activeQrLink} onClose={() => setActiveQrLink(null)} />
    </div>
  );
};

export default OverviewPage;
