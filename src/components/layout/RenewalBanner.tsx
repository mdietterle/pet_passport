'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, X } from 'lucide-react';

interface RenewalBannerProps {
  paymentMethod: string | null;
  planExpiresAt: string | null;
  subscriptionStatus: string | null;
}

export default function RenewalBanner({ paymentMethod, planExpiresAt, subscriptionStatus }: RenewalBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    // Only show for active subscriptions paid via PIX that have an expiration date
    if (subscriptionStatus === 'active' && paymentMethod === 'PIX' && planExpiresAt) {
      const expirationDate = new Date(planExpiresAt);
      const today = new Date();
      
      // Calculate difference in days
      const diffTime = expirationDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Show warning if 7 or fewer days remaining
      if (diffDays <= 7 && diffDays >= 0) {
        setDaysRemaining(diffDays);
        
        // Check local storage so we don't annoy the user if they dismissed it today
        const lastDismissed = localStorage.getItem('renewalBannerDismissed');
        if (lastDismissed) {
          const dismissedDate = new Date(lastDismissed);
          // If dismissed on a different day, show it again
          if (dismissedDate.toDateString() !== today.toDateString()) {
            setIsVisible(true);
          }
        } else {
          setIsVisible(true);
        }
      } else if (diffDays < 0) {
          // It's already expired, they need to renew urgently (or maybe a webhook is delayed)
          setDaysRemaining(0);
          setIsVisible(true);
      }
    }
  }, [paymentMethod, planExpiresAt, subscriptionStatus]);

  if (!isVisible || daysRemaining === null) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('renewalBannerDismissed', new Date().toISOString());
  };

  return (
    <div className="renewal-banner">
      <div className="renewal-banner-content">
        <AlertCircle size={20} className="renewal-icon" />
        <div className="renewal-text">
          {daysRemaining === 0 ? (
            <span><strong>Atenção:</strong> Sua assinatura via PIX expirou ou vence hoje. <Link href="/dashboard/plans" className="renewal-link">Renove agora</Link> para não perder o acesso!</span>
          ) : (
            <span><strong>Atenção:</strong> Sua assinatura via PIX vence em <strong>{daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}</strong>. <Link href="/dashboard/plans" className="renewal-link">Renove agora</Link> para garantir seus benefícios.</span>
          )}
        </div>
        <button onClick={handleDismiss} className="renewal-close" aria-label="Fechar aviso">
          <X size={18} />
        </button>
      </div>

      <style jsx>{`
        .renewal-banner {
          background-color: #fffbeb;
          border-bottom: 1px solid #fde68a;
          color: #92400e;
          padding: 12px 16px;
          margin-bottom: 16px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        .renewal-banner-content {
          display: flex;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
          gap: 12px;
        }
        .renewal-icon {
          color: #d97706;
          flex-shrink: 0;
        }
        .renewal-text {
          flex: 1;
          font-size: 0.95rem;
          line-height: 1.4;
        }
        .renewal-link {
          font-weight: 600;
          text-decoration: underline;
          color: #b45309;
        }
        .renewal-link:hover {
          color: #92400e;
        }
        .renewal-close {
          background: none;
          border: none;
          color: #b45309;
          cursor: pointer;
          padding: 4px;
          display: flex;
          border-radius: 4px;
        }
        .renewal-close:hover {
          background-color: #fef3c7;
        }
      `}</style>
    </div>
  );
}
