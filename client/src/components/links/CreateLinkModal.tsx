import React, { useState } from 'react';
import { Dialog } from '../ui/Dialog';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { ShortLink } from '../../types';
import { Link2, Copy, Check, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface CreateLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newLink: ShortLink) => void;
}

export const CreateLinkModal: React.FC<CreateLinkModalProps> = ({ open, onClose, onSuccess }) => {
  const [destinationUrl, setDestinationUrl] = useState('');
  const [title, setTitle] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state after creation
  const [createdLink, setCreatedLink] = useState<ShortLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const { success } = useToast();

  const resetForm = () => {
    setDestinationUrl('');
    setTitle('');
    setCustomSlug('');
    setError(null);
    setCreatedLink(null);
    setCopied(false);
    setShowQr(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const fullShortUrl = createdLink
    ? `${window.location.origin}/r/${createdLink.shortCode}`
    : `${window.location.origin}/r/${customSlug.trim() || 'xxxxxx'}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic frontend validation
    if (!destinationUrl.trim()) {
      setError('Please enter a destination URL');
      return;
    }

    try {
      new URL(destinationUrl.trim());
    } catch {
      setError('Please enter a valid URL with http:// or https://');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<{ link: ShortLink }>('/api/links', {
        destinationUrl: destinationUrl.trim(),
        title: title.trim() || undefined,
        customSlug: customSlug.trim() || undefined,
      });

      if (!res.success) {
        throw new Error(res.error?.message || 'Failed to create short link');
      }

      setCreatedLink(res.data.link);
      success('Link created successfully!', `Your short URL is ready.`);
      if (onSuccess) {
        onSuccess(res.data.link);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while creating link');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!createdLink) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/r/${createdLink.shortCode}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={createdLink ? '🎉 Short Link Created!' : 'Create a Branded Short Link'}
      description={
        createdLink
          ? 'Your link is live and tracking telemetry clicks.'
          : 'Transform long URLs into memorable, branded short links with click analytics.'
      }
      maxWidth="md"
    >
      {!createdLink ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Destination URL *"
            placeholder="https://example.com/my-long-landing-page-url"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            leftIcon={<Link2 className="w-4 h-4" />}
            required
            autoFocus
          />

          <Input
            label="Title / Label (Optional)"
            placeholder="e.g. Summer Promo Launch"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Custom Vanity Slug (Optional)
            </label>
            <div className="relative flex items-center rounded-xl overflow-hidden bg-slate-900/90 border border-slate-800 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <span className="pl-3.5 pr-1 text-xs font-mono text-slate-500 select-none">
                {window.location.host}/r/
              </span>
              <input
                type="text"
                placeholder="summer-sale"
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                className="w-full bg-transparent px-2 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to automatically generate a unique 6-character short code.
            </p>
          </div>

          {/* Live URL Preview box */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs flex items-center justify-between">
            <span className="text-slate-400">Preview:</span>
            <span className="font-mono text-indigo-400 font-medium truncate max-w-[280px]">
              {fullShortUrl}
            </span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              <Sparkles className="w-4 h-4" />
              Generate Short Link
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          {/* Success details card */}
          <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
            <span className="text-xs font-medium text-slate-400">Generated Short Link:</span>
            <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="font-mono text-sm font-semibold text-indigo-300 truncate">
                {window.location.origin}/r/{createdLink.shortCode}
              </span>
              <Button
                size="sm"
                variant={copied ? 'secondary' : 'primary'}
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Destination:</span>
              <a
                href={createdLink.destinationUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 underline truncate max-w-[280px]"
              >
                {createdLink.destinationUrl}
              </a>
            </div>
            {createdLink.title && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Title:</span>
                <span className="text-slate-200">{createdLink.title}</span>
              </div>
            )}
          </div>

          {/* QR Code toggle */}
          {showQr && (
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl animate-in zoom-in-95 duration-200 shadow-xl">
              <QRCodeSVG
                id={`qr-${createdLink.shortCode}`}
                value={`${window.location.origin}/r/${createdLink.shortCode}`}
                size={180}
                level="H"
                includeMargin
              />
              <p className="text-xs text-slate-700 font-mono mt-2">/r/{createdLink.shortCode}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowQr(!showQr)}
            >
              <QrCode className="w-4 h-4" />
              {showQr ? 'Hide QR Code' : 'View QR Code'}
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" onClick={resetForm}>
                Create Another
              </Button>
              <Button type="button" onClick={handleClose}>
                Done <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
