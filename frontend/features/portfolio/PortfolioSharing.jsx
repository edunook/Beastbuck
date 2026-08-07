import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link as LinkIcon, QrCode, FileText, Printer, Share2, Copy, CheckCircle, Link, MessageSquare, Users, Mail, Download, X } from 'lucide-react';
import { PageContainer } from '@frontend/components/layout/LayoutWrappers';
import { PageHeader } from '@frontend/components/ui/UIElements';
import { Card, CardContent, CardHeader, CardTitle } from '@frontend/components/ui/Card';
import Button from '@frontend/components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { PortfolioService } from '@services/firestore/portfolio';

export default function PortfolioSharing() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const publicLink = `https://beastbuck.com/portfolio/${user?.uid || 'username'}`;

  const handleCopyLink = async () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    if (user?.uid) {
      try {
        await PortfolioService.trackShareEvent(user.uid, 'link');
      } catch (error) {
        console.error('Failed to track share event:', error);
      }
    }
  };

  const handleQRCode = () => {
    setShowQRModal(true);
  };

  const handleDownloadQR = async () => {
    const svg = document.getElementById('qr-code-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `portfolio-qr-${user?.uid || 'username'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }

    if (user?.uid) {
      try {
        await PortfolioService.trackShareEvent(user.uid, 'qr');
      } catch (error) {
        console.error('Failed to track share event:', error);
      }
    }
  };

  const handlePDF = async () => {
    try {
      const pdf = new jsPDF();
      
      pdf.setFillColor(124, 58, 237);
      pdf.rect(0, 0, 210, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.text('Portfolio', 105, 25, { align: 'center' });
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.text(user?.displayName || 'User Name', 20, 60);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(user?.email || 'email@example.com', 20, 70);
      pdf.text(publicLink, 20, 80);
      
      let yPosition = 100;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPosition - 10, 210, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Skills', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('React, Firebase, JavaScript, UI Design, Research, Innovation', 20, yPosition + 10);
      yPosition += 30;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPosition - 10, 210, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Projects', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('• BeastBuck Digital Ecosystem - Full-stack development', 20, yPosition + 10);
      pdf.text('• Research Platform - Interactive research tools', 20, yPosition + 18);
      yPosition += 30;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPosition - 10, 210, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Research', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('• Published research papers on digital innovation', 20, yPosition + 10);
      pdf.text('• Collaborative research projects', 20, yPosition + 18);
      yPosition += 30;
      
      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, yPosition - 10, 210, 10, 'F');
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Achievements', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('• XP Level: Advanced', 20, yPosition + 10);
      pdf.text('• Badges: Researcher, Innovator, Creator', 20, yPosition + 18);
      
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text('Generated by BeastBuck Portfolio', 105, 285, { align: 'center' });
      
      pdf.save(`portfolio-resume-${user?.uid || 'username'}.pdf`);

      if (user?.uid) {
        try {
          await PortfolioService.trackShareEvent(user.uid, 'pdf');
        } catch (error) {
          console.error('Failed to track share event:', error);
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handlePrint = async () => {
    window.print();

    if (user?.uid) {
      try {
        await PortfolioService.trackShareEvent(user.uid, 'print');
      } catch (error) {
        console.error('Failed to track share event:', error);
      }
    }
  };

  const handleSocialShare = async (platform) => {
    const shareUrls = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(publicLink)}&text=Check out my portfolio on BeastBuck!`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`,
      email: `mailto:?subject=Check out my portfolio&body=Check out my portfolio on BeastBuck: ${publicLink}`
    };
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');

      if (user?.uid) {
        try {
          await PortfolioService.trackShareEvent(user.uid, 'social', platform);
        } catch (error) {
          console.error('Failed to track share event:', error);
        }
      }
    }
  };

  const sharingOptions = [
    { id: 'link', name: 'Public Link', icon: LinkIcon, color: 'purple', action: handleCopyLink },
    { id: 'qr', name: 'QR Code', icon: QrCode, color: 'cyan', action: handleQRCode },
    { id: 'pdf', name: 'PDF Resume', icon: FileText, color: 'emerald', action: handlePDF },
    { id: 'print', name: 'Printable Version', icon: Printer, color: 'amber', action: handlePrint },
  ];

  const socialPlatforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: Link, color: 'blue' },
    { id: 'twitter', name: 'Twitter', icon: MessageSquare, color: 'cyan' },
    { id: 'facebook', name: 'Facebook', icon: Users, color: 'indigo' },
    { id: 'email', name: 'Email', icon: Mail, color: 'red' },
  ];

  const getColorClass = (color) => {
    const colors = {
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400',
      emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
      amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      indigo: 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400',
      red: 'bg-red-500/20 border-red-500/30 text-red-400',
    };
    return colors[color] || colors.purple;
  };

  return (
    <PageContainer>
      <PageHeader 
        title="Portfolio Sharing" 
        description="Sharing features including public link, QR code, PDF resume, printable version, share button, and copy link."
        hero={true}
      />

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <LinkIcon className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Public Link</h3>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={publicLink}
              readOnly
              className="flex-1 bg-surface border border-border rounded-lg px-4 py-3 text-white focus:outline-none"
            />
            <Button onClick={handleCopyLink} className="bg-purple-600 hover:bg-purple-700">
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {sharingOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card key={option.id} className="hover:border-accent/50 transition-all cursor-pointer" onClick={option.action}>
              <CardContent className="p-6">
                <div className={`p-3 rounded-xl ${getColorClass(option.color)} mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-white">{option.name}</h3>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Share2 className="h-5 w-5 text-accent" />
            <h3 className="font-bold text-white text-xl">Share on Social Media</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <Button
                  key={platform.id}
                  variant="secondary"
                  className={`flex items-center gap-2 ${getColorClass(platform.color)}`}
                  onClick={() => handleSocialShare(platform.id)}
                >
                  <Icon className="h-4 w-4" />
                  {platform.name}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="h-5 w-5 text-accent" />
                  <span>Portfolio QR Code</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowQRModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="bg-white p-6 rounded-xl">
                  <QRCodeSVG
                    id="qr-code-svg"
                    value={publicLink}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="text-text-muted text-sm text-center">
                  Scan this QR code to view the portfolio
                </p>
                <Button onClick={handleDownloadQR} className="w-full bg-purple-600 hover:bg-purple-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}