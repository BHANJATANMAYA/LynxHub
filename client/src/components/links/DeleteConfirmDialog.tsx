import React from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ShortLink } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmDialogProps {
  link: ShortLink | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  link,
  loading,
  onClose,
  onConfirm,
}) => {
  if (!link) return null;

  return (
    <Dialog
      open={!!link}
      onClose={onClose}
      title="Delete Short Link?"
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-200">This action cannot be undone.</p>
            <p className="mt-1 text-rose-300/80">
              The short link <span className="font-mono font-bold">/r/{link.shortCode}</span> and all associated click telemetry analytics will be permanently erased.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
          <p className="text-slate-400 truncate">
            Target: <span className="text-slate-200">{link.destinationUrl}</span>
          </p>
          <p className="text-slate-400">
            Total recorded clicks: <span className="font-semibold text-white">{link.clickCount}</span>
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800/60">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
            Yes, Delete Link
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
