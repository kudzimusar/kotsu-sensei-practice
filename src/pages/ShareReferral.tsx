import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Share2, Copy, QrCode as QrCodeIcon, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/lib/supabase/profiles';
import { generateReferralCode } from '@/lib/supabase/affiliates';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const APP_NAME = "Kōtsū Sensei";
const PWA_BASE_URL = "https://kudzimusar.github.io/kotsu-sensei-practice";

const ShareReferral = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrModalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => getProfile(user!.id),
    enabled: !!user,
  });

  const { data: referralData } = useQuery({
    queryKey: ["referralCode", user?.id],
    queryFn: generateReferralCode,
    enabled: !!user,
  });

  const referralCode = referralData?.referralCode || '';
  const shareUrl = `${PWA_BASE_URL}/?ref=${referralCode}`;
  const shortUrl = `kotsu.me/${referralCode}`;

  // Generate QR Code for main canvas
  useEffect(() => {
    if (qrCanvasRef.current && referralCode && !qrGenerated) {
      QRCode.toCanvas(qrCanvasRef.current, shareUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#1a73e8', light: '#ffffff' }
      }, (err) => {
        if (err) {
          console.error('QR Code generation error:', err);
        } else {
          setQrGenerated(true);
        }
      });
    }
  }, [shareUrl, referralCode, qrGenerated]);

  // Generate QR Code for modal when opened
  useEffect(() => {
    if (showQR && qrModalCanvasRef.current && referralCode) {
      QRCode.toCanvas(qrModalCanvasRef.current, shareUrl, {
        width: 280,
        margin: 2,
        color: { dark: '#1a73e8', light: '#ffffff' }
      }, (err) => {
        if (err) {
          console.error('QR Code modal generation error:', err);
        }
      });
    }
  }, [showQR, shareUrl, referralCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    const shareData = {
      title: `${APP_NAME} – Driving Test Practice`,
      text: `Master Japan's driving test! Install via my link: ${shareUrl}`,
      url: shareUrl
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error(err);
      }
    } else {
      // Fallback: Copy to clipboard
      handleCopy();
    }
  };

  const downloadQR = () => {
    const canvas = qrModalCanvasRef.current || qrCanvasRef.current;
    if (canvas) {
      try {
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `kotsu-sensei-qr-${referralCode}.png`;
        link.href = dataUrl;
        link.click();
        toast({
          title: "QR Code Downloaded",
          description: "Share it anywhere!",
        });
      } catch (err) {
        console.error('Download error:', err);
        toast({
          title: "Download failed",
          description: "Please try again",
          variant: "destructive",
        });
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 bg-card border-b border-border">
        <Button 
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Share Your Referral</h1>
      </header>

      <div className="flex flex-col items-center px-6 py-8">
        {/* Avatar + Name + Short Link */}
        <div className="text-center mb-10">
          <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-card shadow-xl bg-muted">
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary">
              {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
            </div>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {profile?.full_name || 'User'}
          </h2>
          <p className="text-lg text-primary font-mono px-4 py-2 bg-card rounded-lg border border-border">
            {shortUrl}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-6 mb-12 w-full max-w-md">
          <button
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-all border border-border hover:border-primary"
          >
            <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Share2 className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-foreground">Share</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-all border border-border hover:border-primary"
          >
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center">
              {copied ? (
                <Check className="w-7 h-7 text-green-600" />
              ) : (
                <Copy className="w-7 h-7 text-green-600" />
              )}
            </div>
            <span className="text-sm font-medium text-foreground">
              {copied ? 'Copied!' : 'Copy'}
            </span>
          </button>

          <button
            onClick={() => setShowQR(true)}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card shadow-md hover:shadow-lg transition-all border border-border hover:border-primary"
          >
            <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center">
              <QrCodeIcon className="w-7 h-7 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-foreground">QR Code</span>
          </button>
        </div>

        {/* QR Canvas (Hidden but rendered) */}
        <div className="sr-only" style={{ position: 'absolute', left: '-9999px' }}>
          <canvas ref={qrCanvasRef} width={280} height={280} />
        </div>

        {/* Info Text */}
        <div className="text-center px-6 max-w-lg">
          <p className="text-muted-foreground leading-relaxed mb-2">
            Share your link so others can install <strong className="text-foreground">{APP_NAME}</strong> and you earn commission!
          </p>
          <p className="text-sm text-primary font-semibold">
            $1.00 per install • Min payout: $10
          </p>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="p-4 bg-white rounded-xl shadow-sm">
              <canvas ref={qrModalCanvasRef} width={280} height={280} />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan this code to install {APP_NAME}
            </p>
            <Button onClick={downloadQR} variant="outline" className="w-full">
              Download QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShareReferral;
