import Link from 'next/link';
import { PawPrint, Shield, Syringe, Stethoscope, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <div className="landing-logo-icon"><PawPrint size={20} /></div>
            <span className="landing-logo-text">Pet Passport</span>
          </div>
          <div className="landing-nav-links">
            <Link href="/login" className="btn btn-ghost btn-sm">Entrar</Link>
            <Link href="/register" className="btn btn-primary btn-sm">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <div className="hero-badge">
          <Star size={12} /> Mais de 1.000 pets cadastrados
        </div>
        <h1 className="hero-title">
          A saúde do seu pet<br />
          <span className="hero-title-accent">em um só lugar</span>
        </h1>
        <p className="hero-subtitle">
          Registre vacinas, consultas veterinárias e ocorrências dos seus pets.<br />
          Nunca mais perca uma dose de vacina ou consulta importante.
        </p>
        <div className="hero-cta">
          <Link href="/register" className="btn btn-primary btn-lg">
            Criar conta gratuita
          </Link>
          <Link href="/login" className="btn btn-secondary btn-lg">
            Já tenho conta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="landing-features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🐾</div>
            <h3>Múltiplos Pets</h3>
            <p>Cadastre todos os seus pets e acesse o histórico de cada um facilmente.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💉</div>
            <h3>Controle de Vacinas</h3>
            <p>Registre vacinas e receba alertas quando a próxima dose estiver chegando.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🩺</div>
            <h3>Histórico Veterinário</h3>
            <p>Mantenha o histórico completo de consultas, diagnósticos e prescrições.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Ocorrências Gerais</h3>
            <p>Registre compras de ração, tosas, banhos, vômitos e muito mais.</p>
          </div>
        </div>
      </section>

      <style>{`
        .landing {
          min-height: 100vh;
          background: radial-gradient(ellipse at 50% 0%, var(--color-bg-secondary) 0%, var(--color-bg) 60%);
        }
        .landing-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--color-border);
        }
        .landing-nav-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-4) var(--space-6);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .landing-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        .landing-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, var(--color-teal), var(--color-teal-dark));
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .landing-logo-text {
          font-size: 1.1rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-teal-light), white);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .landing-nav-links {
          display: flex;
          gap: var(--space-3);
          align-items: center;
        }
        .landing-hero {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-16) var(--space-6);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          background: rgba(13, 148, 136, 0.1);
          border: 1px solid rgba(13, 148, 136, 0.3);
          color: var(--color-teal-light);
          padding: 6px 16px;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 500;
        }
        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, var(--color-teal-light), var(--color-amber));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.1rem;
          color: var(--color-text-secondary);
          line-height: 1.7;
        }
        .hero-cta {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          justify-content: center;
        }
        .landing-features {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 var(--space-6) var(--space-16);
        }
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: var(--space-5);
        }
        .feature-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-6);
          transition: all var(--transition-base);
        }
        .feature-card:hover {
          border-color: var(--color-teal);
          transform: translateY(-4px);
          box-shadow: 0 8px 32px var(--color-teal-glow);
        }
        .feature-icon {
          font-size: 2rem;
          margin-bottom: var(--space-3);
        }
        .feature-card h3 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-2);
        }
        .feature-card p {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }
        @media (max-width: 600px) {
          .hero-title { font-size: 2.2rem; }
        }
      `}</style>
    </div>
  );
}
