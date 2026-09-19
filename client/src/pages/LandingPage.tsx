import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Copy,
  QrCode,
  Zap,
  Smartphone,
  Share2,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Link as LinkIcon,
  MessageSquare,
  Mail
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'dictation' | 'notetaker'>('dictation'); // Branded Links vs Bio Hub
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeFaqIndex, setActiveFaqIndex] = useState(0);
  const [destination, setDestination] = useState<'slack' | 'twitter' | 'claude' | 'gmail' | 'bio'>('slack');

  // Interactive Live Shortener state
  const [inputUrl, setInputUrl] = useState('https://github.com/lynxhub/nextgen-link-infrastructure');
  const [customSlug, setCustomSlug] = useState('nextgen-edge');
  const [generatedLink, setGeneratedLink] = useState('lynx.to/nextgen-edge');
  const [showQrModal, setShowQrModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [latencyPing, setLatencyPing] = useState(38);

  const presets = [
    { label: 'GitHub Repo', url: 'https://github.com/lynxhub/nextgen-link-infrastructure', slug: 'nextgen-repo' },
    { label: 'Product Launch', url: 'https://store.acme.co/products/summer-drop-2026?utm_source=twitter&utm_medium=social', slug: 'summer-drop' },
    { label: 'YouTube Video', url: 'https://youtube.com/watch?v=dQw4w9WgXcQ&feature=share&t=42', slug: 'product-demo' },
    { label: 'Creator Bio', url: 'https://lynxhub.app/bio/alexrivera?utm_campaign=ig_bio', slug: 'alex' }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setInputUrl(preset.url);
    setCustomSlug(preset.slug);
    setGeneratedLink(`lynx.to/${preset.slug}`);
    setLatencyPing(Math.floor(Math.random() * 15) + 28);
  };

  const handleShorten = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      const slug = customSlug.trim() || 'flow-' + Math.random().toString(36).substring(2, 7);
      setGeneratedLink(`lynx.to/${slug}`);
      setLatencyPing(Math.floor(Math.random() * 12) + 26);
      setIsProcessing(false);
    }, 350);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const faqs = [
    {
      q: 'Will LynxHub links work in my Slack, emails, social bios, and AI tools?',
      a: 'Yes. LynxHub links are universal HTTP 302 redirects with instant latency. They expand natively with OpenGraph cards in Slack, iMessage, Twitter/X, LinkedIn, Discord, and code editors. Wherever a standard URL works, LynxHub works seamlessly without third-party dependencies.'
    },
    {
      q: 'How is LynxHub different from legacy shorteners like Bitly or TinyURL?',
      a: 'Legacy shorteners are slow (300-600ms latency), inject third-party ad pixels, and collect unhashed IP addresses. LynxHub redirects resolve at global edge in under 50ms, hash IP addresses with SHA-256 and secret server salts for zero-PII privacy compliance, and pair short links with a modular Link-in-Bio builder.'
    },
    {
      q: 'How does privacy-preserving click telemetry actually work?',
      a: 'We never store raw IP addresses in MongoDB. When a link is clicked, the client IP address is combined with a secure server-side salt and hashed through SHA-256. This enables accurate unique-visitor analytics without ever storing personally identifiable information (SOC-2 and GDPR compliant).'
    },
    {
      q: 'Can I customize my Link-in-Bio profile with distinct themes and icons?',
      a: 'Yes! LynxHub includes a live dual-pane Link-in-Bio editor with three curated themes: Minimal Light, Dark Slate, and Vibrant Gradient. You can reorder social links, upload avatars, and share your public profile at lynx.to/bio/:username.'
    },
    {
      q: 'Is there a free tier for individual creators and developers?',
      a: 'Yes, LynxHub is free with no trial expiration or credit card required. You get unlimited redirects, up to 1,000 active links, instant QR codes, and a customizable Link-in-Bio profile.'
    }
  ];

  const partners = [
    { name: 'Vercel', logo: 'VERCEL' },
    { name: 'Notion', logo: 'NOTION' },
    { name: 'Stripe', logo: 'STRIPE' },
    { name: 'Linear', logo: 'LINEAR' },
    { name: 'GitHub', logo: 'GITHUB' },
    { name: 'Figma', logo: 'FIGMA' },
    { name: 'Raycast', logo: 'RAYCAST' },
    { name: 'Shopify', logo: 'SHOPIFY' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-[#1A1A1A] selection:bg-[#034F46] selection:text-[#FFFFEB] font-sans-ui overflow-x-hidden">
      
      {/* Top Banner (Wispr Flow style) */}
      <div className="bg-[#FFFFEB] border-b border-[#1A1A1A]/8 px-4 py-2.5 text-xs sm:text-sm text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span className="text-[#1A1A1A]/90">
          <strong>LynxHub 2.0 is live:</strong> Branded Short Links + Link-in-Bio Hubs with sub-50ms edge redirection.
        </span>
        <a
          href="#sandbox"
          className="underline decoration-[#1A1A1A]/30 hover:decoration-[#034F46] text-[#034F46] ml-1 font-semibold flex items-center gap-0.5"
        >
          Try live demo <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Floating Island Glass Navbar (Wispr Flow style) */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 max-w-6xl mx-auto">
        <nav className="wispr-glass-nav rounded-full px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-full bg-[#034F46] text-[#FFFFEB] flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
                <LinkIcon className="w-4 h-4" />
              </div>
              <span className="font-editorial text-2xl font-bold tracking-tight text-[#1A1A1A]">
                Lynx<span className="italic font-normal text-[#034F46]">Flow</span>
              </span>
            </Link>

            {/* Segmented Pill Switcher (Wispr Flow Dictation vs Notetaker) */}
            <div className="hidden md:flex items-center bg-[#1A1A1A]/5 p-1 rounded-full text-xs font-semibold ml-2">
              <button
                onClick={() => setActiveTab('dictation')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'dictation'
                    ? 'bg-[#FFFFEB] text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                Branded Links
              </button>
              <button
                onClick={() => setActiveTab('notetaker')}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  activeTab === 'notetaker'
                    ? 'bg-[#FFFFEB] text-[#1A1A1A] shadow-xs'
                    : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                }`}
              >
                Bio Hub
              </button>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#1A1A1A]/75">
            <a href="#features" className="hover:text-[#034F46] transition-colors">Features</a>
            <a href="#performance" className="hover:text-[#034F46] transition-colors">Performance</a>
            <a href="#destinations" className="hover:text-[#034F46] transition-colors">Integrations</a>
            <a href="#sandbox" className="hover:text-[#034F46] transition-colors">Playground</a>
            <a href="#faq" className="hover:text-[#034F46] transition-colors">FAQ</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-medium text-[#1A1A1A]/75 hover:text-[#034F46] px-2 py-1"
            >
              Sign in
            </Link>
            <Button
              variant="pill-primary"
              size="sm"
              onClick={() => navigate('/signup')}
              className="hidden sm:inline-flex"
            >
              Get started free
            </Button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#1A1A1A] lg:hidden rounded-full hover:bg-[#1A1A1A]/5 cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-4 wispr-glass-nav rounded-3xl shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center bg-[#1A1A1A]/5 p-1 rounded-full text-xs font-semibold mb-2">
              <button
                onClick={() => { setActiveTab('dictation'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 rounded-full transition-all ${
                  activeTab === 'dictation' ? 'bg-[#FFFFEB] text-[#1A1A1A] shadow-xs' : 'text-[#1A1A1A]/60'
                }`}
              >
                Branded Links
              </button>
              <button
                onClick={() => { setActiveTab('notetaker'); setMobileMenuOpen(false); }}
                className={`flex-1 py-1.5 rounded-full transition-all ${
                  activeTab === 'notetaker' ? 'bg-[#FFFFEB] text-[#1A1A1A] shadow-xs' : 'text-[#1A1A1A]/60'
                }`}
              >
                Bio Hub
              </button>
            </div>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-[#034F46]">Features</a>
            <a href="#performance" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-[#034F46]">Performance</a>
            <a href="#destinations" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-[#034F46]">Integrations</a>
            <a href="#sandbox" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-[#034F46]">Live Playground</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium hover:text-[#034F46]">FAQ</a>
            <div className="pt-2 border-t border-[#1A1A1A]/10 flex flex-col gap-2">
              <Link to="/login" className="text-center py-2 text-sm font-medium">Log in</Link>
              <Button variant="pill-primary" size="md" onClick={() => navigate('/signup')}>
                Get started for free
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Wispr Flow Signature Aesthetic) */}
      <section className="pt-16 sm:pt-24 pb-12 sm:pb-20 px-4 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto">
          {/* Tag Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold tracking-wider uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
            <span>LYNXFLOW SHORT-LINK & BIO INFRASTRUCTURE</span>
          </div>

          {/* Signature Editorial Serif Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-editorial font-normal tracking-tight text-[#1A1A1A] leading-[1.08] mb-6">
            Don’t just share links,<br />
            <em className="italic text-[#034F46] font-normal">craft an experience.</em>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-[#1A1A1A]/70 max-w-2xl mx-auto leading-relaxed mb-8">
            The next-generation link platform that turns messy URLs into branded, sub-50ms experiences with privacy-preserving telemetry and creator bio hubs.
          </p>

          {/* Button Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
            <Button
              variant="pill-primary"
              size="pill-lg"
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto shadow-lg shadow-[#034F46]/20"
            >
              Get started for free
            </Button>
            <a
              href="#sandbox"
              className="w-full sm:w-auto inline-flex items-center justify-center font-medium rounded-full bg-[#FFFFEB] hover:bg-[#F4F3DE] text-[#1A1A1A] border border-[#1A1A1A]/12 text-sm sm:text-base px-6 py-3 shadow-xs transition-all"
            >
              Try live demo
            </a>
          </div>

          <p className="text-xs sm:text-sm text-[#1A1A1A]/50">
            Available on Web, Chrome Extension, Node/Go API, and Mobile Bio
          </p>
        </div>

        {/* Signature Wispr Flow SVG Curved Ribbon Motion */}
        <div className="mt-12 sm:mt-16 max-w-5xl mx-auto relative px-2">
          <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-[#FAF9F5] via-[#FFFFEB]/60 to-[#F2F1E8] border border-[#1A1A1A]/8 overflow-hidden shadow-sm">
            
            {/* Background SVG Wave Ribbon with moving text */}
            <div className="absolute inset-0 opacity-25 pointer-events-none overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 1000 300" fill="none" preserveAspectRatio="none">
                <path
                  id="heroWavePath"
                  d="M0,150 C200,60 350,240 500,150 C650,60 800,240 1000,150"
                  stroke="#034F46"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                />
              </svg>
            </div>

            {/* Visual Transformation: Clumsy Raw Link -> LynxFlow Engine -> Polished Branded Short Link */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
              
              {/* Left Column: Raw Clumsy Tracking Link */}
              <div className="md:col-span-4 bg-white/85 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#1A1A1A]/8 text-left shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-rose-600 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                    Raw Clumsy URL
                  </span>
                  <span className="text-[11px] text-[#1A1A1A]/40">148 chars</span>
                </div>
                <div className="font-mono text-xs text-[#1A1A1A]/60 break-all bg-[#1A1A1A]/3 p-2.5 rounded-xl">
                  https://myshop.co/collections/winter-sale-2026/product/78391?utm_source=twitter&utm_medium=cpc&utm_campaign=winter_launch&ref=affiliate_94
                </div>
                <div className="mt-2 text-[11px] text-[#1A1A1A]/50 flex items-center gap-1">
                  <span>Slow 480ms</span> • <span>Zero brand trust</span> • <span>Exposes UTM clutter</span>
                </div>
              </div>

              {/* Center Column: LynxFlow Engine with Animated Soundwave Bars */}
              <div className="md:col-span-3 flex flex-col items-center justify-center py-2">
                <div className="bg-[#062823] text-[#FFFFEB] px-5 py-4 rounded-3xl border border-[#10B981]/30 shadow-xl flex flex-col items-center gap-2.5 animate-glow-pulse">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></div>
                    <span className="text-xs font-bold tracking-wider uppercase text-[#FFFFEB]">LYNXFLOW ENGINE</span>
                  </div>

                  {/* Wispr Flow Soundwave / Pulse Bars */}
                  <div className="flex items-center gap-1 h-8 px-2">
                    {[12, 24, 16, 28, 20, 32, 22, 14, 26, 18, 10].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#10B981] rounded-full transition-all duration-300"
                        style={{
                          height: `${h}px`,
                          animation: `soundwave 1.2s ease-in-out infinite alternate ${i * 0.1}s`
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-[10px] text-[#FFFFEB]/80 font-mono flex items-center gap-1">
                    <span>⚡ SHA-256 HASHED</span> • <span>38ms REDIRECT</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Polished Branded Short Link & Bio Preview */}
              <div className="md:col-span-4 bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#034F46]/20 text-left shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-[#034F46] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    Branded Short Link
                  </span>
                  <span className="text-[11px] text-[#034F46] font-semibold">22 chars</span>
                </div>
                <div className="flex items-center justify-between bg-[#FFFFEB] border border-[#034F46]/15 p-2.5 rounded-xl">
                  <span className="font-mono text-sm font-semibold text-[#034F46]">
                    lynx.to/winter-drop
                  </span>
                  <button
                    onClick={() => handleCopy('https://lynx.to/winter-drop')}
                    className="p-1 rounded-lg hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/70 cursor-pointer"
                    title="Copy short link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-[#034F46] font-medium flex items-center justify-between">
                  <span>Edge Cache: 28ms</span>
                  <span>Direct QR ready</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Infinite Logo Ticker (Wispr Flow style) */}
      <section className="py-10 border-y border-[#1A1A1A]/6 overflow-hidden bg-[#FFFFEB]/40">
        <div className="max-w-6xl mx-auto px-4 text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]/50">
            Trusted by modern creators & engineering teams
          </p>
        </div>
        <div className="relative w-full overflow-hidden flex">
          {/* Gradient edge masks */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#FAF9F5] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#FAF9F5] to-transparent z-10 pointer-events-none"></div>

          <div className="animate-logo-ticker flex items-center gap-12 sm:gap-16 whitespace-nowrap">
            {[...partners, ...partners, ...partners].map((p, idx) => (
              <div
                key={idx}
                className="text-base sm:text-lg font-bold tracking-widest text-[#1A1A1A]/35 hover:text-[#034F46] transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-[#1A1A1A]/20"></span>
                <span>{p.logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "4x Faster Than Typing" / Comparison Section (Wispr Flow Signature) */}
      <section id="performance" className="py-16 sm:py-24 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold mb-3">
            <span>SPEED OF LIGHT ARCHITECTURE</span>
          </div>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-editorial font-normal text-[#1A1A1A] leading-tight">
            4x faster <em className="italic text-[#034F46]">than legacy links</em>
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A1A]/70 max-w-2xl mx-auto mt-4">
            Link infrastructure that finally works at the speed of thought. LynxHub redirects resolve at global edge in under 50ms, while maintaining strict zero-PII privacy.
          </p>
        </div>

        {/* Dual Cards Comparison (Wispr Flow 45wpm vs 220wpm) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Legacy Card (45 wpm equivalent) */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#1A1A1A]/8 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/8">
                <div>
                  <h3 className="text-lg font-semibold text-[#1A1A1A]">Traditional Shortener</h3>
                  <p className="text-xs text-[#1A1A1A]/50">Legacy central proxy</p>
                </div>
                <span className="text-2xl font-editorial font-bold text-[#1A1A1A]/60">450 ms</span>
              </div>

              {/* Simulated slow stream */}
              <div className="my-6 p-4 rounded-2xl bg-[#1A1A1A]/3 border border-[#1A1A1A]/5 font-mono text-xs text-[#1A1A1A]/60 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-rose-500 font-semibold">
                  <span>Slow HTTP 301 hop</span>
                  <span>Uncached query</span>
                </div>
                <p className="line-through text-rose-400">DNS Resolution: 120ms</p>
                <p className="line-through text-rose-400">Database Roundtrip: 280ms</p>
                <p className="line-through text-rose-400">IP Geo-Lookup: 50ms</p>
                <p className="text-[#1A1A1A]/80 font-bold">Total Latency: ~450ms</p>
              </div>

              <ul className="space-y-2.5 text-xs text-[#1A1A1A]/70">
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Unsalted raw IP logging leaks visitor privacy</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>No integrated Link-in-Bio mobile hub</span>
                </li>
                <li className="flex items-center gap-2">
                  <X className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Clunky paywalled QR code generation</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-[#1A1A1A]/8 text-[11px] text-[#1A1A1A]/40 font-mono">
              STATUS: HIGH LATENCY BOTTLENECK
            </div>
          </div>

          {/* LynxFlow Card (220 wpm equivalent - Dark Pine card) */}
          <div className="lg:col-span-7 wispr-card-pine p-6 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Luminous background gradient */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#FFFFEB]/10">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] text-xs font-semibold uppercase tracking-wider mb-1">
                    <span>Edge Native</span>
                  </div>
                  <h3 className="text-xl font-editorial font-bold text-[#FFFFEB]">LynxFlow Engine</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-editorial font-bold text-[#FFFFEB]">38 ms</span>
                  <p className="text-[11px] text-[#10B981] font-mono">Sub-50ms Global Edge</p>
                </div>
              </div>

              {/* Fast stream showcase */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl bg-[#034F46]/50 border border-[#10B981]/20 font-mono text-xs text-[#FFFFEB]/90 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-[#10B981] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
                    Async Non-Blocking Telemetry
                  </span>
                  <span>SHA-256 Salted</span>
                </div>
                <p className="text-[#FFFFEB]/80">✓ Edge Key-Value Resolution: 12ms</p>
                <p className="text-[#FFFFEB]/80">✓ Asynchronous Telemetry Queue: 0ms blocking</p>
                <p className="text-[#FFFFEB]/80">✓ Instant 302 Found Redirection</p>
                <div className="pt-2 border-t border-[#FFFFEB]/10 flex items-center justify-between text-[#10B981] font-bold">
                  <span>Fastest in class</span>
                  <span>4x Faster than legacy</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#FFFFEB]/80">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>SHA-256 salted IP privacy (Zero PII)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Instant SVG QR code export</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Integrated Link-in-Bio hub</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10B981] shrink-0" />
                  <span>Full REST API & CLI access</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#FFFFEB]/10 flex items-center justify-between text-xs text-[#FFFFEB]/60">
              <span>Included in Free Plan</span>
              <Button
                variant="pill-secondary"
                size="sm"
                onClick={() => navigate('/signup')}
              >
                Claim Free Account →
              </Button>
            </div>
          </div>

        </div>
      </section>

      {/* Interactive Destination Switcher (Wispr Flow App Switcher) */}
      <section id="destinations" className="py-16 sm:py-20 px-4 bg-[#FFFFEB]/50 border-y border-[#1A1A1A]/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold mb-3">
              <span>EFFORTLESS COMPOSER INTEGRATIONS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-editorial font-normal text-[#1A1A1A]">
              Types wherever <em className="italic text-[#034F46]">your cursor is</em>
            </h2>
            <p className="text-base sm:text-lg text-[#1A1A1A]/70 max-w-xl mx-auto mt-3">
              Share branded links that unfurl cleanly in every chat, email, social profile, and editor.
            </p>
          </div>

          {/* Destination Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {[
              { id: 'slack', label: 'Slack', icon: MessageSquare },
              { id: 'twitter', label: 'X / Twitter', icon: Share2 },
              { id: 'claude', label: 'Claude / AI', icon: Sparkles },
              { id: 'gmail', label: 'Gmail / Email', icon: Mail },
              { id: 'bio', label: 'Creator Bio', icon: Smartphone },
            ].map(item => {
              const Icon = item.icon;
              const isSelected = destination === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setDestination(item.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#034F46] text-[#FFFFEB] shadow-md shadow-[#034F46]/20 scale-105'
                      : 'bg-white text-[#1A1A1A]/70 hover:text-[#1A1A1A] border border-[#1A1A1A]/8 hover:border-[#1A1A1A]/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic App Preview Card based on Destination */}
          <div className="bg-white rounded-3xl border border-[#1A1A1A]/10 p-6 sm:p-8 shadow-sm max-w-3xl mx-auto transition-all duration-300">
            {destination === 'slack' && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1A1A1A]/8">
                  <div className="w-8 h-8 rounded-lg bg-[#4A154B] text-white flex items-center justify-center font-bold text-xs">
                    #
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">#general-announcements</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50">Slack Workspace • Just now</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[#1A1A1A]/85">
                    Hey team! Here is the link to the updated deck for tomorrow’s client presentation:
                  </p>
                  <div className="bg-[#FAF9F5] border-l-4 border-[#034F46] p-3 rounded-r-xl">
                    <span className="text-sm font-semibold text-[#034F46]">lynx.to/deck-q3</span>
                    <p className="text-xs text-[#1A1A1A]/60 mt-0.5">LynxFlow Presentation Deck • 38ms Edge Redirection</p>
                  </div>
                </div>
              </div>
            )}

            {destination === 'twitter' && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1A1A1A]/8">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs">
                    𝕏
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Alex Rivera (@alexrivera)</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50">Post Composer</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-[#1A1A1A]/85">
                    We just shipped LynxHub 2.0 with sub-50ms edge redirects & privacy-preserving click telemetry! Try it live here: <span className="text-[#034F46] font-semibold">lynx.to/launch</span> 🚀
                  </p>
                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#1A1A1A]/8 text-xs text-[#1A1A1A]/60 flex items-center justify-between">
                    <span>Card preview loaded cleanly</span>
                    <span className="text-[#034F46] font-semibold">224 chars remaining</span>
                  </div>
                </div>
              </div>
            )}

            {destination === 'claude' && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1A1A1A]/8">
                  <div className="w-8 h-8 rounded-full bg-[#D97706] text-white flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Claude & LLM Workflows</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50">AI Prompt Pipeline</p>
                  </div>
                </div>
                <div className="space-y-3 font-mono text-xs text-[#1A1A1A]/80">
                  <p className="bg-[#FAF9F5] p-3 rounded-xl border border-[#1A1A1A]/6">
                    &quot;Please review the technical documentation at <span className="text-[#034F46] font-bold">lynx.to/docs</span> and summarize the REST API rate limits and authentication headers.&quot;
                  </p>
                  <p className="text-[11px] text-[#10B981] font-semibold">
                    ✓ Clean URL resolves without UTM noise or scraper redirection blocks.
                  </p>
                </div>
              </div>
            )}

            {destination === 'gmail' && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1A1A1A]/8">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-xs">
                    M
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Executive Weekly Digest</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50">Email Newsletter</p>
                  </div>
                </div>
                <div className="space-y-3 text-sm text-[#1A1A1A]/85">
                  <p>Hi Sarah,</p>
                  <p>Here is your personalized access link for the investor briefing:</p>
                  <div>
                    <Button variant="pill-primary" size="sm" onClick={() => {}}>
                      Open Briefing (lynx.to/briefing)
                    </Button>
                  </div>
                  <p className="text-xs text-[#1A1A1A]/50 mt-2">Zero tracking cookies • Salted SHA-256 telemetry</p>
                </div>
              </div>
            )}

            {destination === 'bio' && (
              <div>
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#1A1A1A]/8">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center font-bold text-xs">
                    IG
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A1A1A]">Instagram / TikTok Link-in-Bio</h4>
                    <p className="text-[11px] text-[#1A1A1A]/50">Mobile Profile Integration</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-[#1A1A1A]/80 font-medium">Bio link in profile: <span className="text-[#034F46] font-bold">lynx.to/bio/alex</span></p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl text-center border border-[#1A1A1A]/8">
                      <span className="text-xs font-semibold">🎙️ My Podcast</span>
                    </div>
                    <div className="bg-[#FAF9F5] p-2.5 rounded-xl text-center border border-[#1A1A1A]/8">
                      <span className="text-xs font-semibold">📦 Merch Store</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Interactive Live Shortener & Bio Sandbox ("Try It Live") */}
      <section id="sandbox" className="py-16 sm:py-24 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold mb-3">
            <span>INTERACTIVE PLAYGROUND</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-editorial font-normal text-[#1A1A1A]">
            Experience it <em className="italic text-[#034F46]">in real time</em>
          </h2>
          <p className="text-base sm:text-lg text-[#1A1A1A]/70 max-w-xl mx-auto mt-2">
            Paste any long URL or pick a preset below to see the LynxFlow transformation engine execute.
          </p>
        </div>

        {/* Playground Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#1A1A1A]/10 shadow-lg">
          
          {/* Presets */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-semibold text-[#1A1A1A]/50 mr-1">TRY PRESET:</span>
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#FAF9F5] hover:bg-[#FFFFEB] text-[#1A1A1A]/80 border border-[#1A1A1A]/10 hover:border-[#034F46]/30 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleShorten} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-[#1A1A1A]/60 mb-1.5">
                Destination URL (Long Link)
              </label>
              <input
                type="url"
                required
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://example.com/very/long/url"
                className="w-full px-4 py-3 rounded-2xl bg-[#FAF9F5] border border-[#1A1A1A]/12 focus:outline-none focus:ring-2 focus:ring-[#034F46] text-sm text-[#1A1A1A]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <div className="sm:col-span-8">
                <label className="block text-xs font-semibold uppercase text-[#1A1A1A]/60 mb-1.5">
                  Custom Vanity Slug
                </label>
                <div className="flex items-center rounded-2xl bg-[#FAF9F5] border border-[#1A1A1A]/12 px-4 py-3 focus-within:ring-2 focus-within:ring-[#034F46]">
                  <span className="text-sm font-semibold text-[#034F46] select-none mr-1">lynx.to/</span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-custom-slug"
                    className="w-full bg-transparent text-sm text-[#1A1A1A] focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="sm:col-span-4 sm:self-end">
                <Button
                  type="submit"
                  variant="pill-primary"
                  size="lg"
                  loading={isProcessing}
                  className="w-full"
                >
                  Shorten with Flow
                </Button>
              </div>
            </div>
          </form>

          {/* Result Banner */}
          <div className="mt-8 p-5 sm:p-6 rounded-2xl bg-[#FFFFEB] border border-[#034F46]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#034F46] text-[#FFFFEB] flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#034F46] uppercase">Generated Branded Link</span>
                <p className="text-base sm:text-lg font-mono font-bold text-[#1A1A1A]">
                  https://{generatedLink}
                </p>
                <span className="text-[11px] text-[#10B981] font-medium">⚡ Edge Ping: {latencyPing}ms • Ready to deploy</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="pill-secondary"
                size="sm"
                onClick={() => handleCopy(`https://${generatedLink}`)}
                className="flex-1 sm:flex-none"
              >
                {copiedLink ? <Check className="w-4 h-4 text-[#10B981]" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Copied!' : 'Copy'}</span>
              </Button>
              <Button
                variant="pill-outline"
                size="sm"
                onClick={() => setShowQrModal(true)}
                className="flex-1 sm:flex-none"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </Button>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full border border-[#1A1A1A]/10 shadow-2xl text-center relative">
              <button
                onClick={() => setShowQrModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#1A1A1A]/5 text-[#1A1A1A]/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-[#1A1A1A] mb-1">Instant QR Code</h3>
              <p className="text-xs text-[#1A1A1A]/60 font-mono mb-6">https://{generatedLink}</p>

              <div className="p-4 bg-white rounded-2xl border border-[#1A1A1A]/10 inline-block shadow-xs mb-6">
                <QRCodeSVG
                  value={`https://${generatedLink}`}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="pill-primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    handleCopy(`https://${generatedLink}`);
                    setShowQrModal(false);
                  }}
                >
                  Copy & Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 2-Pane Accordion FAQ Section (Wispr Flow style) */}
      <section id="faq" className="py-16 sm:py-24 px-4 bg-[#FFFFEB]/40 border-t border-[#1A1A1A]/6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8ECE9] text-[#034F46] text-xs font-semibold mb-3">
              <span>FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-editorial font-normal text-[#1A1A1A]">
              Good <em className="italic text-[#034F46]">questions.</em>
            </h2>
          </div>

          {/* 2-Pane FAQ Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Questions List */}
            <div className="md:col-span-5 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-3 px-3">
                Questions
              </h3>
              {faqs.map((faq, idx) => {
                const isActive = activeFaqIndex === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveFaqIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#034F46] text-[#FFFFEB] font-medium shadow-md shadow-[#034F46]/15'
                        : 'bg-white hover:bg-[#FAF9F5] text-[#1A1A1A]/80 border border-[#1A1A1A]/6'
                    }`}
                  >
                    <span className="text-xs sm:text-sm pr-2">{faq.q}</span>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'rotate-90 text-[#FFFFEB]' : 'text-[#1A1A1A]/30'}`} />
                  </button>
                );
              })}
            </div>

            {/* Right Column: Active Answer Display with Wispr Monogram */}
            <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-[#1A1A1A]/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/8 mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-[#034F46]">
                  Answer
                </span>
                <span className="text-xs text-[#1A1A1A]/40 font-mono">
                  Q{activeFaqIndex + 1} of {faqs.length}
                </span>
              </div>

              <h4 className="text-base sm:text-lg font-bold text-[#1A1A1A] mb-3">
                {faqs[activeFaqIndex].q}
              </h4>

              <p className="text-sm sm:text-base text-[#1A1A1A]/75 leading-relaxed">
                {faqs[activeFaqIndex].a}
              </p>

              {/* Watermark brand emblem */}
              <div className="mt-8 pt-4 border-t border-[#1A1A1A]/6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#034F46]/10 text-[#034F46] flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <span className="text-xs font-serif italic text-[#034F46]">LynxHub Verified Response</span>
                </div>
                <Link to="/signup" className="text-xs font-semibold text-[#034F46] hover:underline">
                  Try it now →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pre-CTA Cinematic Motion Banner (Wispr Flow Exact Style) */}
      <section className="py-12 sm:py-20 px-4 max-w-7xl mx-auto">
        <div className="relative rounded-[2.5rem] overflow-hidden min-h-[580px] sm:min-h-[660px] flex flex-col justify-between p-6 sm:p-12 border border-[#1A1A1A]/10 shadow-2xl">
          {/* Motion-blurred runner background generated via nanobanana */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
            style={{ backgroundImage: "url('/motion_runner.jpg')" }}
          />
          {/* Cinematic lighting & contrast overlays */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/20 to-black/60" />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[0.3px]" />

          {/* Floating Pill Mini-Navbar inside Banner */}
          <div className="relative z-20 max-w-4xl mx-auto w-full">
            <div className="bg-[#FFFFEB] text-[#1A1A1A] rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-xl border border-black/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 font-bold font-editorial text-xl text-[#1A1A1A]">
                  <span className="flex items-center gap-0.5 h-4">
                    <span className="w-0.5 h-2.5 bg-[#1A1A1A] rounded-full"></span>
                    <span className="w-0.5 h-4 bg-[#1A1A1A] rounded-full"></span>
                    <span className="w-0.5 h-3 bg-[#1A1A1A] rounded-full"></span>
                    <span className="w-0.5 h-1.5 bg-[#1A1A1A] rounded-full"></span>
                  </span>
                  <span>Flow</span>
                </div>

                <div className="flex items-center bg-[#1A1A1A]/5 p-0.5 rounded-full text-xs font-semibold">
                  <span className="bg-white text-[#1A1A1A] px-3 py-1 rounded-full shadow-xs">Dictation</span>
                  <span className="text-[#1A1A1A]/60 px-3 py-1 rounded-full">Notetaker</span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-6 text-xs font-medium text-[#1A1A1A]/75">
                <span className="hover:text-[#034F46] cursor-pointer">Business</span>
                <span className="hover:text-[#034F46] cursor-pointer">Pricing</span>
                <span className="hover:text-[#034F46] cursor-pointer">Lab</span>
              </div>

              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#EBDDFF] hover:bg-[#E0CCFF] text-[#1A1A1A] text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
                  <path d="M0 2.25L6.5 1.3v6.2H0V2.25zm0 6.15h6.5v6.2L0 13.65V8.4zm7.5-7.25L16 0v7.5H7.5V1.15zm8.5 7.25V16l-8.5-1.15V8.4H16z" />
                </svg>
                <span>Get started on Windows</span>
              </button>
            </div>
          </div>

          {/* Centerpiece Editorial Typography */}
          <div className="relative z-20 text-center my-auto py-10 max-w-3xl mx-auto">
            <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-editorial font-normal text-white tracking-tight leading-[1.05] mb-6 drop-shadow-md">
              You have a way with<br />
              words. Now, <em className="italic font-normal text-white">two.</em>
            </h2>

            <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-xl mx-auto leading-relaxed font-normal mb-8 drop-shadow-sm">
              Talk thoughts into writing with Flow and conversations into meeting notes with Notetaker. Both are now included in one subscription.
            </p>

            <div className="flex justify-center">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#EBDDFF] hover:bg-[#E0CCFF] text-[#1A1A1A] font-semibold text-sm sm:text-base shadow-xl hover:shadow-2xl active:scale-[0.98] transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                  <path d="M0 2.25L6.5 1.3v6.2H0V2.25zm0 6.15h6.5v6.2L0 13.65V8.4zm7.5-7.25L16 0v7.5H7.5V1.15zm8.5 7.25V16l-8.5-1.15V8.4H16z" />
                </svg>
                <span>Get started on Windows</span>
              </button>
            </div>
          </div>

          {/* Bottom space placeholder to balance top navbar */}
          <div className="relative z-20 text-center text-xs text-white/60">
            Available on Mac, Windows, iPhone, and Android
          </div>
        </div>
      </section>

      {/* 2-Product Footer (Wispr Flow Footer style) */}
      <footer className="border-t border-[#1A1A1A]/8 bg-[#FAF9F5] pt-14 pb-12 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* Products Mega Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12 border-b border-[#1A1A1A]/8">
            
            {/* Product Card 1: Short Links */}
            <div className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/8 hover:border-[#034F46]/30 transition-all group flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#034F46]">PRODUCT 01</span>
                <h4 className="text-xl font-editorial font-bold text-[#1A1A1A] mt-1 mb-2">
                  LynxHub Branded Short Links
                </h4>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed mb-4">
                  The voice-to-text AI equivalent for links: turns messy, fragile URLs into clear, sub-50ms branded experiences in every app.
                </p>
              </div>
              <Link
                to="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#034F46] group-hover:translate-x-1 transition-transform"
              >
                <span>Get started free</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Product Card 2: Bio Hub */}
            <div className="bg-white p-6 rounded-3xl border border-[#1A1A1A]/8 hover:border-[#034F46]/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#034F46]">PRODUCT 02</span>
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#034F46]">New</span>
                </div>
                <h4 className="text-xl font-editorial font-bold text-[#1A1A1A] mt-1 mb-2">
                  LynxHub Creator Bio Hub
                </h4>
                <p className="text-sm text-[#1A1A1A]/70 leading-relaxed mb-4">
                  Modern Link-in-Bio profile builder with 3 aesthetic themes, custom social buttons, and real-time mobile canvas preview.
                </p>
              </div>
              <Link
                to="/bio/alex"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#034F46] group-hover:translate-x-1 transition-transform"
              >
                <span>View sample profile</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>

          {/* Navigation Links Directory */}
          <div className="py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs text-[#1A1A1A]/70">
            <div>
              <h5 className="font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">Product</h5>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-[#034F46]">Branded Links</a></li>
                <li><a href="#destinations" className="hover:text-[#034F46]">Link-in-Bio</a></li>
                <li><a href="#sandbox" className="hover:text-[#034F46]">Web Playground</a></li>
                <li><a href="#performance" className="hover:text-[#034F46]">Edge Architecture</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">Developers</h5>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-[#034F46]">REST API</Link></li>
                <li><Link to="/login" className="hover:text-[#034F46]">Rate Limits</Link></li>
                <li><Link to="/login" className="hover:text-[#034F46]">SDK & Webhooks</Link></li>
                <li><Link to="/login" className="hover:text-[#034F46]">SOC 2 Security</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">Security & Privacy</h5>
              <ul className="space-y-2">
                <li><span className="text-[#10B981] font-semibold">✓ SHA-256 Salted</span></li>
                <li><span>✓ Zero PII Stored</span></li>
                <li><span>✓ GDPR & SOC 2 Ready</span></li>
                <li><span>✓ 99.99% Uptime SLA</span></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold uppercase tracking-wider text-[#1A1A1A] mb-3">Account</h5>
              <ul className="space-y-2">
                <li><Link to="/login" className="hover:text-[#034F46]">Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-[#034F46]">Create Free Account</Link></li>
                <li><Link to="/dashboard" className="hover:text-[#034F46]">Dashboard Overview</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-6 border-t border-[#1A1A1A]/8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#1A1A1A]/50 gap-2">
            <p>© 2026 LynxHub Inc. Inspired by Wispr Flow design system & motion aesthetics.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-[#034F46]">Privacy Policy</a>
              <a href="#" className="hover:text-[#034F46]">Terms of Service</a>
              <a href="#" className="hover:text-[#034F46]">Status</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
