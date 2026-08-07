import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Award, Calendar, CheckCircle2, XCircle, Printer, Share2, ExternalLink, MessageCircle } from 'lucide-react';
import { CertificateService } from '@services/firestore/certificates';
import { LoadingState } from '@frontend/components/ui/UIElements';
import { formatDate } from '@shared/lib/dateUtils';

export default function CertificateView() {
  const { certId } = useParams();
  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await CertificateService.verifyCertificate(certId);
        setCert(data);
      } catch (err) {
        console.error('Certificate verification failed:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [certId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingState text="Verifying certificate..." />
      </div>
    );
  }

  if (!cert) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
        <XCircle className="mb-4 h-16 w-16 text-status-danger" />
        <h1 className="mb-2 text-2xl font-bold text-white">Certificate Not Found</h1>
        <p className="text-text-muted">This certificate does not exist or the ID is invalid.</p>
        <Link to="/" className="mt-8 text-accent hover:underline">Return to BeastBuck</Link>
      </div>
    );
  }

  const isActive = cert.status === 'ACTIVE';
  // Use a public free QR code API for simplicity without dependencies
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cert.publicUrl)}&color=00f0ff&bgcolor=000000`;

  // Share functionality
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `I earned the "${cert.title}" certificate from BeastBuck!`;

  const handleLinkedInShare = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(linkedInUrl, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate: ${cert.title}`,
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="mx-auto max-w-4xl">
        {/* Certificate Container */}
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-8 shadow-2xl md:p-16 print:border-none print:shadow-none print:rounded-none">
          {/* Print Background Accents (Hidden in print) */}
          <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-accent/20 blur-3xl print:hidden" />
          <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-accent-alt/20 blur-3xl print:hidden" />

          {/* Header */}
          <div className="relative z-10 flex flex-col items-center justify-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/10">
              <Award className="h-10 w-10 text-accent" />
            </div>
            
            <h1 className="mb-2 font-heading text-4xl font-black uppercase tracking-widest text-white print:text-black">
              Certificate of Achievement
            </h1>
            <p className="mb-12 text-sm font-bold uppercase tracking-widest text-text-soft print:text-gray-500">
              BeastBuck Innovation Ecosystem
            </p>

            <p className="mb-4 text-lg text-text-muted print:text-gray-600">This is to certify that</p>
            <h2 className="mb-8 font-heading text-5xl font-black text-accent print:text-black">
              {cert.user?.displayName || 'Member'}
            </h2>

            <p className="mb-4 text-lg text-text-muted print:text-gray-600">has successfully earned the</p>
            <h3 className="mb-4 text-3xl font-bold text-white print:text-black">
              {cert.title}
            </h3>
            
            <p className="mx-auto max-w-xl text-text-soft print:text-gray-700">
              {cert.description}
            </p>
          </div>

          {/* Footer / Meta details */}
          <div className="relative z-10 mt-20 flex flex-col items-center justify-between gap-8 border-t border-border/40 pt-12 md:flex-row print:border-gray-200 print:text-black">
            
            <div className="flex items-center gap-4 text-left">
              <img src={qrUrl} alt="Verification QR Code" className="h-24 w-24 rounded-lg bg-black p-2 print:border print:border-gray-300" />
              <div>
                <p className="text-xs font-bold uppercase text-text-muted print:text-gray-500">Scan to Verify</p>
                <p className="text-sm font-mono text-white print:text-black">{cert.certificateNumber}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {isActive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-status-success/10 px-2.5 py-1 text-[10px] font-bold text-status-success print:bg-green-100 print:text-green-700">
                      <CheckCircle2 className="h-3 w-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-status-danger/10 px-2.5 py-1 text-[10px] font-bold text-status-danger print:bg-red-100 print:text-red-700">
                      <XCircle className="h-3 w-3" /> REVOKED
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase text-text-muted print:text-gray-500">Issued On</p>
                <p className="flex items-center justify-center gap-2 font-bold text-white md:justify-end print:text-black">
                  <Calendar className="h-4 w-4 text-accent print:hidden" /> {formatDate(cert.issuedAt)}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-text-muted print:text-gray-500">Authorized By</p>
                <p className="font-bold text-white print:text-black">BeastBuck Leadership</p>
              </div>
            </div>

          </div>
        </div>

        {/* Action Buttons (Hidden on print) */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-black transition hover:bg-accent-hover hover:scale-105"
          >
            <Printer className="h-5 w-5" /> Print or Save PDF
          </button>
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3 font-bold text-white transition hover:bg-white/5 hover:scale-105"
          >
            <Share2 className="h-5 w-5 text-accent" /> Share
          </button>
          <button
            onClick={handleLinkedInShare}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3 font-bold text-white transition hover:bg-white/5 hover:scale-105"
          >
            <ExternalLink className="h-5 w-5 text-[#0077b5]" /> LinkedIn
          </button>
          <button
            onClick={handleTwitterShare}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3 font-bold text-white transition hover:bg-white/5 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5 text-[#1da1f2]" /> Twitter
          </button>
          <Link 
            to={cert.user?.username ? `/portfolio/${cert.user.username}` : '/'}
            className="flex items-center gap-2 rounded-xl border border-border bg-surface/50 px-6 py-3 font-bold text-white transition hover:bg-white/5 hover:scale-105"
          >
            <ShieldCheck className="h-5 w-5 text-accent" /> View Member Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
