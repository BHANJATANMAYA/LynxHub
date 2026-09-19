import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ShortLink, PaginationMeta } from '../../types';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { QrCodeModal } from '../../components/links/QrCodeModal';
import { DeleteConfirmDialog } from '../../components/links/DeleteConfirmDialog';
import { useToast } from '../../context/ToastContext';
import { formatDate, truncateUrl } from '../../lib/utils';
import {
  Search,
  Plus,
  Copy,
  Check,
  QrCode,
  BarChart2,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const LinksPage: React.FC = () => {
  const { openCreateLinkModal } = useOutletContext<{ openCreateLinkModal: () => void }>();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Actions state
  const [activeQrLink, setActiveQrLink] = useState<ShortLink | null>(null);
  const [linkToDelete, setLinkToDelete] = useState<ShortLink | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { success, error: toastError } = useToast();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPagination((prev) => ({ ...prev, page: 1 }));
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchLinks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      if (debouncedSearch.trim()) {
        queryParams.set('search', debouncedSearch.trim());
      }

      const res = await api.get<ShortLink[]>(`/api/links?${queryParams.toString()}`);
      if (res.success && res.data) {
        setLinks(res.data);
        if (res.meta?.pagination) {
          setPagination(res.meta.pagination);
        }
      } else {
        setError(res.error?.message || 'Failed to load links');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading links from server');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    fetchLinks();

    const handleCreated = () => fetchLinks();
    window.addEventListener('lynxhub:link-created', handleCreated);
    return () => window.removeEventListener('lynxhub:link-created', handleCreated);
  }, [fetchLinks]);

  const handleCopy = async (link: ShortLink) => {
    const url = `${window.location.origin}/r/${link.shortCode}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(link._id);
    success('Copied short link!', url);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!linkToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/api/links/${linkToDelete._id}`);
      if (res.success) {
        success('Link deleted', `Short link /r/${linkToDelete.shortCode} has been deleted.`);
        setLinkToDelete(null);
        fetchLinks();
      } else {
        toastError('Failed to delete', res.error?.message);
      }
    } catch (err: any) {
      toastError('Delete error', err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-heading">
            Link Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage, search, and monitor all your branded short redirects.
          </p>
        </div>

        <Button onClick={openCreateLinkModal} className="shrink-0 font-semibold shadow-indigo-600/30">
          <Plus className="w-4 h-4" />
          Create Short Link
        </Button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-md">
        <Input
          placeholder="Search by slug, title, or destination URL..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLinks}>
            Retry
          </Button>
        </div>
      )}

      {/* Link Table / Card Surface */}
      <Card className="glass-card border-slate-800/80 overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <p className="text-xs text-slate-400">Loading links from server...</p>
            </div>
          ) : links.length > 0 ? (
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Short Link & Title</TableHead>
                    <TableHead className="hidden md:table-cell">Destination URL</TableHead>
                    <TableHead className="text-center">Clicks</TableHead>
                    <TableHead className="hidden sm:table-cell">Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link._id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <a
                              href={`${window.location.origin}/r/${link.shortCode}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-mono text-sm font-semibold text-indigo-400 hover:text-indigo-300 hover:underline inline-flex items-center gap-1"
                            >
                              /r/{link.shortCode}
                              <ExternalLink className="w-3 h-3 text-slate-500" />
                            </a>
                            {link.isCustomSlug && <Badge variant="purple">Vanity</Badge>}
                          </div>
                          {link.title && (
                            <p className="text-xs font-medium text-slate-200">{link.title}</p>
                          )}
                          <p className="text-[11px] text-slate-500 md:hidden truncate max-w-[200px]">
                            {link.destinationUrl}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        <a
                          href={link.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-slate-400 hover:text-slate-200 truncate block max-w-xs transition-colors"
                          title={link.destinationUrl}
                        >
                          {truncateUrl(link.destinationUrl, 42)}
                        </a>
                      </TableCell>

                      <TableCell className="text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-200">
                          {link.clickCount}
                        </span>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell text-xs text-slate-400">
                        {formatDate(link.createdAt)}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => handleCopy(link)}
                            title="Copy link"
                            className="h-8 w-8"
                          >
                            {copiedId === link._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </Button>

                          <Button
                            variant="secondary"
                            size="icon"
                            onClick={() => setActiveQrLink(link)}
                            title="Generate QR code"
                            className="h-8 w-8"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </Button>

                          <Link to={`/analytics?linkId=${link._id}`}>
                            <Button
                              variant="secondary"
                              size="icon"
                              title="View analytics"
                              className="h-8 w-8"
                            >
                              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
                            </Button>
                          </Link>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setLinkToDelete(link)}
                            title="Delete link"
                            className="h-8 w-8 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Server-side Pagination Controls */}
              <div className="p-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing{' '}
                  <span className="font-semibold text-slate-200">
                    {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}
                  </span>{' '}
                  to{' '}
                  <span className="font-semibold text-slate-200">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold text-slate-200">{pagination.total}</span> links
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                  </Button>

                  <span className="px-2 font-medium text-slate-300">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  >
                    Next <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-800">
                <Link2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-200">
                {debouncedSearch ? 'No matching links found' : 'No short links yet'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {debouncedSearch
                  ? `No links matched your query "${debouncedSearch}". Try a different search term.`
                  : 'Start by creating your first branded short link or vanity slug.'}
              </p>
              {!debouncedSearch && (
                <Button onClick={openCreateLinkModal} size="sm">
                  <Plus className="w-3.5 h-3.5" /> Create Link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <QrCodeModal link={activeQrLink} onClose={() => setActiveQrLink(null)} />
      <DeleteConfirmDialog
        link={linkToDelete}
        loading={deleteLoading}
        onClose={() => setLinkToDelete(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
};
