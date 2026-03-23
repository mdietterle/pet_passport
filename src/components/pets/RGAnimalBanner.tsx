import React from 'react';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export default function RGAnimalBanner() {
  return (
    <div className="rg-animal-banner">
      <div className="rg-banner-icon">
        <ShieldCheck size={28} />
      </div>
      
      <div className="rg-banner-content">
        <h3 className="rg-banner-title">RG Animal Oficial (Sinpatinhas)</h3>
        <p className="rg-banner-desc">
          O Governo Federal oferece a emissão oficial do RG do seu pet pelo sistema Sinpatinhas.
          Aproveite para manter a documentação do seu melhor amigo em dia.
        </p>
      </div>

      <a 
        href="https://sinpatinhas.mma.gov.br/login" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="btn btn-primary btn-sm rg-banner-btn"
      >
        <span>Emitir no Sinpatinhas</span>
        <ExternalLink size={14} />
      </a>

      <style>{`
        .rg-animal-banner {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          background: linear-gradient(to right, rgba(16, 185, 129, 0.1), rgba(4, 120, 87, 0.05));
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--space-4);
          margin-bottom: var(--space-5);
        }
        .rg-banner-icon {
          color: var(--color-orange);
          background: rgba(16, 185, 129, 0.15);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .rg-banner-content {
          flex: 1;
        }
        .rg-banner-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-orange-dark);
          margin-bottom: 2px;
        }
        .rg-banner-desc {
          font-size: 0.85rem;
          line-height: 1.4;
          color: var(--color-text-secondary);
        }
        .rg-banner-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
        }
        
        @media (max-width: 600px) {
          .rg-animal-banner {
            flex-direction: column;
            text-align: center;
            padding: var(--space-5) var(--space-4);
          }
          .rg-banner-btn {
            width: 100%;
            justify-content: center;
            margin-top: var(--space-2);
          }
        }
      `}</style>
    </div>
  );
}
