import React, { useRef } from 'react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { ShortLink } from '../../types';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Copy, Check, ExternalLink } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface QrCodeModalProps {
  link: ShortLink | null;
  onClose: () => void;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ link, onClose }) => {
  const [copied, setCopied] = React.useState(false);
  const { success } = useToast();
  const svgRef = useRef<HTMLDivElement>(null);

  if (!link) return null;

  const shortUrl = `${window.location.origin}/r/${link.shortCode}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    success('Copied to clipboard!', shortUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgElement = svgRef.current.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const linkEl = document.createElement('a');
    linkEl.href = url;
    linkEl.download = `qr-${link.shortCode}.svg`;
    document.body.appendChild(linkEl);
    linkEl.click();
    document.body.removeChild(linkEl);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={!!link}
      onClose={onClose}
      title="Link QR Code"
      description={`Scan to instantly open the destination URL.`}
      maxWidth="sm"
    >
      <div className="flex flex-col items-center gap-5">
        {/* White container for QR readability */}
        <div
          ref={svgRef}
          className="p-6 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center border border-slate-200"
        >
          <QRCodeSVG
            value={shortUrl}
            size={220}
            level="H"
            includeMargin
            imageSettings={{
              src: '/logo.svg',
              x: undefined,
              y: undefined,
              height: 32,
              width: 32,
              excavate: true,
            }}
          />
          <p className="mt-2 text-xs font-mono font-bold text-slate-800 tracking-wide">
            /r/{link.shortCode}
          </p>
        </div>

        <div className="w-full text-center space-y-1">
          <p className="text-xs text-slate-400 truncate max-w-full">
            Target: <span className="text-slate-200">{link.destinationUrl}</span>
          </p>
          <p className="text-xs font-mono text-indigo-400 font-medium">
            {shortUrl}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full pt-3 border-t border-slate-800/60">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-1">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>

          <Button variant="primary" size="sm" onClick={handleDownloadSvg} className="flex-1">
            <Download className="w-3.5 h-3.5" />
            Download SVG
          </Button>
        </div>

        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1 transition-colors"
        >
          Test short link in new tab <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </Dialog>
  );
};
