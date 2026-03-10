'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, PawPrint, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Email ou senha incorretos. Tente novamente.');
            setLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <PawPrint size={28} />
                    </div>
                    <span className="auth-logo-text">Pet Passport</span>
                </div>

                <div className="auth-card">
                    <h1 className="auth-title">Bem-vindo de volta</h1>
                    <p className="auth-subtitle">Entre na sua conta para continuar</p>

                    <form onSubmit={handleSubmit} className="auth-form">
                        {error && (
                            <div className="alert alert-error">
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                className="form-input"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Senha</label>
                            <div className="input-with-icon">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="input-icon-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%', justifyContent: 'center' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Entrando...
                                </>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Não tem uma conta?{' '}
                        <Link href="/register" className="auth-link">
                            Cadastre-se grátis
                        </Link>
                    </p>
                </div>
            </div>

            <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(ellipse at top, #1a2744 0%, var(--color-bg) 60%);
          padding: var(--space-4);
        }

        .auth-container {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-6);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .auth-logo-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--color-teal), var(--color-teal-dark));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: var(--shadow-teal);
        }

        .auth-logo-text {
          font-size: 1.4rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-teal-light), white);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .auth-card {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          width: 100%;
          box-shadow: var(--shadow-lg);
        }

        .auth-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-1);
        }

        .auth-subtitle {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-bottom: var(--space-6);
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .input-with-icon {
          position: relative;
        }

        .input-with-icon .form-input {
          padding-right: 44px;
        }

        .input-icon-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          transition: color var(--transition-fast);
        }

        .input-icon-btn:hover {
          color: var(--color-text-secondary);
        }

        .auth-footer {
          text-align: center;
          margin-top: var(--space-5);
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .auth-link {
          color: var(--color-teal-light);
          font-weight: 500;
          transition: color var(--transition-fast);
        }

        .auth-link:hover {
          color: var(--color-teal);
        }
      `}</style>
        </div>
    );
}
