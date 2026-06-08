import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Copy, CheckCircle2, ArrowLeft } from 'lucide-react';
import { PortfolioService } from '../../services/firebase/portfolio';
import { LoadingState } from '../../components/ui/UIElements';

export default function PortfolioShare() {
  const { username } = useParams();
  const [data, setData] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await PortfolioService.getPortfolioData(username);
        setData(result);
      } catch (err) {
        console.error('Failed to load portfolio:', err);
      }
    }
    load();
  }, [username]);

  if (!data) return <div className="flex min-h-screen items-center justify-center bg-background"><LoadingState text="Loading share card..." /></div>;

  const url = `${window.location.origin}/portfolio/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Link to={`/portfolio/${username}`} className="mb-8 flex items-center gap-2 text-sm font-bold text-text-muted hover:text-white transition">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Link>
      
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/40 bg-surface shadow-2xl">
        {/* Social Card Preview */}
        <div className="relative h-48 bg-gradient-to-br from-accent/20 via-surface to-background p-6">
          <div className="absolute right-6 top-6 rounded-lg bg-accent/20 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-accent">
            BeastBuck Portfolio
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-xl border border-accent/30 bg-black">
              {data.profile.avatar ? (
                <img src={data.profile.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-accent">
                  {(data.profile.displayName || username)[0].toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h2 className="font-heading text-xl font-black text-white">{data.profile.displayName || username}</h2>
              <p className="text-sm text-text-muted">@{username}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <p className="text-xs font-bold text-white"><span className="text-accent">{data.stats.totalXP}</span> XP</p>
            <p className="text-xs font-bold text-white"><span className="text-accent">{data.certificates.length}</span> Certificates</p>
            <p className="text-xs font-bold text-white"><span className="text-accent">{data.stats.projectsJoined}</span> Projects</p>
          </div>
        </div>

        {/* Share Actions */}
        <div className="p-6">
          <p className="mb-4 text-center text-sm font-bold text-text-soft">Share this portfolio</p>
          
          <div className="mb-6 flex items-center justify-center gap-4">
            {/* X (formerly Twitter) */}
            <a 
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`Check out ${username}'s BeastBuck Portfolio!`)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 hover:scale-110"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            {/* LinkedIn */}
            <a 
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A66C2]/10 text-[#0A66C2] transition hover:bg-[#0A66C2]/20 hover:scale-110"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-black/40 p-2">
            <input 
              readOnly 
              value={url} 
              className="flex-1 bg-transparent px-2 text-sm text-text-muted focus:outline-none" 
            />
            <button 
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/20"
            >
              {copied ? <CheckCircle2 className="h-4 w-4 text-status-success" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
