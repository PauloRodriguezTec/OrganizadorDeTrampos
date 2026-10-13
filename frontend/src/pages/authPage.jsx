import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import '../styles/authPage.css';

function AuthPage({ modo, onAuthenticated }) {
  const cadastro = modo === 'cadastro';
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const endpoint = cadastro ? '/api/auth/cadastro' : '/api/auth/login';
      const { data } = await api.post(endpoint, cadastro ? { nome, email, senha } : { email, senha });
      onAuthenticated(data);
    } catch (error) {
      setErro(error.response?.data?.error || 'Não foi possível conectar ao servidor.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand" aria-label="Organizador de Trâmpos">
        <div className="brand-mark">OT<span>.</span></div>
        <div className="brand-copy">
          <p className="brand-kicker">ORGANIZAÇÃO, NO SEU RITMO</p>
          <h1>Seus trabalhos.<br />Seu espaço.</h1>
          <p>Reúna registros, acompanhe resultados e mantenha cada detalhe organizado em um só lugar.</p>
        </div>
        <span className="brand-foot">ORGANIZADOR DE TRAMPOS · 2026</span>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-mark">OT<span>.</span></div>
          <p className="auth-eyebrow">{cadastro ? 'COMECE POR AQUI' : 'BEM-VINDA DE VOLTA'}</p>
          <h2>{cadastro ? 'Crie sua conta' : 'Acesse sua conta'}</h2>
          <p className="auth-description">
            {cadastro ? 'Seus registros ficam privados e ligados à sua conta.' : 'Entre para continuar de onde parou.'}
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {cadastro && (
              <label>
                Seu nome
                <input autoComplete="name" value={nome} onChange={(event) => setNome(event.target.value)} required />
              </label>
            )}
            <label>
              E-mail
              <input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label>
              Senha
              <input
                type="password"
                autoComplete={cadastro ? 'new-password' : 'current-password'}
                minLength={cadastro ? 8 : undefined}
                value={senha}
                onChange={(event) => setSenha(event.target.value)}
                required
              />
              {cadastro && <span className="input-hint">Use pelo menos 8 caracteres.</span>}
            </label>

            {erro && <p className="auth-error" role="alert">{erro}</p>}

            <button className="auth-submit" type="submit" disabled={enviando}>
              {enviando ? 'Aguarde...' : cadastro ? 'Criar conta' : 'Entrar'}
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="auth-switch">
            {cadastro ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <Link to={cadastro ? '/login' : '/cadastro'}>{cadastro ? 'Fazer login' : 'Cadastre-se'}</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;