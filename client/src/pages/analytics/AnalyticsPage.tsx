import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import { AnalyticsData, ShortLink } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatTimeAgo, formatDate } from '../../lib/utils';
import {
  MousePointerClick,
  Users,
  Smartphone,
  Globe,
  Clock,
  ExternalLink,
  Loader2,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const DEVICE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#64748b'];

export const AnalyticsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLinkId = searchParams.get('linkId') || 'overview';

  const [selectedLinkId, setSelectedLinkId] = useState<string>(initialLinkId);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [selectedLinkDetails, setSelectedLinkDetails] = useState<ShortLink | null>(null);
  const [userLinks, setUserLinks] = useState<ShortLink[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch list of links for dropdown filter
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const res = await api.get<ShortLink[]>('/api/links?limit=50&page=1');
        if (res.success && res.data) {
          setUserLinks(res.data);
        }
      } catch {
        // Ignored
      }
    };
    loadLinks();
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      if (selectedLinkId === 'overview') {
        const res = await api.get<AnalyticsData>(`/api/analytics/overview?period=${period}`);
        if (res.success && res.data) {
          setAnalytics(res.data);
          setSelectedLinkDetails(null);
        }
      } else {
        const res = await api.get<AnalyticsData & { link: ShortLink }>(
          `/api/links/${selectedLinkId}/analytics?period=${period}`
        );
        if (res.success && res.data) {
          setAnalytics(res.data);
          setSelectedLinkDetails((res.data as any).link || null);
        }
      }
    } catch {
      // Ignored
    } finally {
      setLoading(false);
    }
  }, [selectedLinkId, period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleLinkChange = (linkId: string) => {
    setSelectedLinkId(linkId);
    if (linkId === 'overview') {
      searchParams.delete('linkId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ linkId });
    }
  };

  const periodOptions: Array<{ value: '7d' | '30d' | '90d' | 'all'; label: string }> = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: 'all', label: 'All Time' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Click Telemetry & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Privacy-conscious telemetry aggregated with MongoDB pipelines.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Link Scope Selector */}
          <div className="relative">
            <select
              value={selectedLinkId}
              onChange={(e) => handleLinkChange(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs font-medium text-slate-200 rounded-xl px-3 py-2 pr-8 focus:outline-none focus:border-indigo-500 cursor-pointer appearance-none"
            >
              <option value="overview">📊 All Links (Account Overview)</option>
              {userLinks.map((l) => (
                <option key={l._id} value={l._id}>
                  🔗 /r/{l.shortCode} {l.title ? `(${l.title})` : ''}
                </option>
              ))}
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Date Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer select-none ${
                  period === opt.value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected link breadcrumb if viewing specific link */}
      {selectedLinkDetails && (
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400">Filtering single link:</span>
            <div className="flex items-center gap-2">
              <a
                href={`${window.location.origin}/r/${selectedLinkDetails.shortCode}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-base font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                /r/{selectedLinkDetails.shortCode}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              {selectedLinkDetails.isCustomSlug && <Badge variant="purple">Vanity</Badge>}
            </div>
            <p className="text-slate-400 truncate max-w-lg">
              Target: <span className="text-slate-200">{selectedLinkDetails.destinationUrl}</span>
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLinkChange('overview')}
            className="self-start sm:self-center"
          >
            Switch to All Links
          </Button>
        </div>
      )}

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400">Aggregating telemetry data from MongoDB...</p>
        </div>
      ) : analytics ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Total Recorded Clicks</span>
                <MousePointerClick className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white font-heading">
                  {analytics.summary.totalClicks}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">In selected timeframe ({period})</p>
              </div>
            </Card>

            <Card className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Unique Hashed IPs</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white font-heading">
                  {analytics.summary.uniqueVisitors}
                </span>
                <p className="text-[11px] text-emerald-400 mt-1">Salted SHA-256 privacy hashed</p>
              </div>
            </Card>

            <Card className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Top Device</span>
                <Smartphone className="w-4 h-4 text-purple-400" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-white font-heading">
                  {analytics.summary.topDevice}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Leading client platform</p>
              </div>
            </Card>

            <Card className="glass-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Latest Click</span>
                <Clock className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3">
                <span className="text-lg font-bold text-white font-heading">
                  {analytics.summary.latestClickAt
                    ? formatTimeAgo(analytics.summary.latestClickAt)
                    : 'No clicks yet'}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">
                  {analytics.summary.latestClickAt
                    ? formatDate(analytics.summary.latestClickAt)
                    : 'Awaiting first redirect'}
                </p>
              </div>
            </Card>
          </div>

          {/* Main Chart: Clicks Over Time */}
          <Card className="glass-card border-slate-800/80">
            <CardHeader>
              <CardTitle>Clicks Over Time</CardTitle>
              <p className="text-xs text-slate-400">Daily click telemetry volume</p>
            </CardHeader>
            <CardContent>
              <div className="h-[280px] w-full pt-2">
                {analytics.clicksOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.clicksOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="analyticsClickGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="date"
                        stroke="#475569"
                        fontSize={11}
                        tickLine={false}
                        tickFormatter={(d) => d.slice(5)}
                      />
                      <YAxis stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="clicks"
                        stroke="#6366f1"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#analyticsClickGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No clicks recorded in this period.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Two Columns: Device Breakdown & Top Referrers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Distribution */}
            <Card className="glass-card border-slate-800/80">
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <p className="text-xs text-slate-400">Breakdown of clicks by device category</p>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full flex items-center justify-center">
                  {analytics.summary.totalClicks > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analytics.deviceDistribution.filter((d) => d.count > 0)}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                        >
                          {analytics.deviceDistribution.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            fontSize: '12px',
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          iconType="circle"
                          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-xs text-slate-500">No device data available.</p>
                  )}
                </div>

                {/* Percentage list */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-xs">
                  {analytics.deviceDistribution.map((d, i) => (
                    <div key={d.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: DEVICE_COLORS[i % DEVICE_COLORS.length] }}
                        />
                        {d.name}
                      </span>
                      <span className="font-semibold text-white">
                        {d.count} ({d.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Traffic Referrers */}
            <Card className="glass-card border-slate-800/80">
              <CardHeader>
                <CardTitle>Top Referrers</CardTitle>
                <p className="text-xs text-slate-400">Traffic origin domains</p>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full">
                  {analytics.topReferrers.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analytics.topReferrers}
                        layout="vertical"
                        margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
                      >
                        <XAxis type="number" stroke="#475569" fontSize={11} tickLine={false} allowDecimals={false} />
                        <YAxis
                          type="category"
                          dataKey="domain"
                          stroke="#475569"
                          fontSize={11}
                          tickLine={false}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#334155',
                            borderRadius: '0.75rem',
                            fontSize: '12px',
                          }}
                        />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-slate-500">
                      No referrer data recorded yet.
                    </div>
                  )}
                </div>

                {/* Referrers list */}
                <div className="mt-4 pt-4 border-t border-slate-800/60 divide-y divide-slate-800/50 text-xs">
                  {analytics.topReferrers.map((r) => (
                    <div key={r.domain} className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-300 truncate max-w-[200px] flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        {r.domain}
                      </span>
                      <span className="font-semibold text-white">
                        {r.count} clicks ({r.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Clicks Activity Stream */}
          <Card className="glass-card border-slate-800/80 overflow-hidden">
            <CardHeader>
              <CardTitle>Recent Click Telemetry Stream</CardTitle>
              <p className="text-xs text-slate-400">
                Live stream of individual redirect events with privacy-preserved hashed metadata.
              </p>
            </CardHeader>
            <CardContent className="p-0">
              {analytics.recentClicks.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Device Category</TableHead>
                      <TableHead>Referrer Domain</TableHead>
                      <TableHead>Raw Referrer Header</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.recentClicks.map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="font-mono text-xs text-slate-300">
                          {formatDate(click.timestamp)} • {formatTimeAgo(click.timestamp)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              click.deviceType === 'Mobile'
                                ? 'purple'
                                : click.deviceType === 'Tablet'
                                ? 'info'
                                : 'default'
                            }
                          >
                            {click.deviceType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-slate-200">
                          {click.referrerDomain}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 truncate max-w-xs font-mono">
                          {click.referrer}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500">
                  No individual click telemetry events logged in this timeframe.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="py-16 text-center text-xs text-slate-500">
          Unable to load analytics data.
        </div>
      )}
    </div>
  );
};
