import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from './pages/authPage';
import Dashboard from './pages/dashboard';
import api from './services/api';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [verificandoSessao, setVerificandoSessao] = useState(Boolean(token));

  useEffect(() => {
    if (!token) return;

    api.get('/api/auth/me')
      .then(({ data }) => setUsuario(data.usuario))
      .catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      })
      .finally(() => setVerificandoSessao(false));
  }, [token]);

  const handleAuthenticated = ({ token: novoToken, usuario: novoUsuario }) => {
    localStorage.setItem('token', novoToken);
    setToken(novoToken);
    setUsuario(novoUsuario);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUsuario(null);
  };

  if (verificandoSessao) {
    return <main className="session-loading">Verificando sua sessão...</main>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" replace /> : <AuthPage modo="login" onAuthenticated={handleAuthenticated} />} />
        <Route path="/cadastro" element={token ? <Navigate to="/" replace /> : <AuthPage modo="cadastro" onAuthenticated={handleAuthenticated} />} />
        <Route path="/" element={token && usuario ? <Dashboard usuario={usuario} onSair={handleLogout} /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to={token ? '/' : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
