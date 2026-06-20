import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth/Auth.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', senha: '' });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, senha: formData.senha }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagem({
          tipo: 'erro',
          texto: data.erro || 'Erro ao fazer login.',
        });
        setLoading(false);
        return;
      }

      // Salva token e dados do usuário no localStorage
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.usuario));

      // Dispara evento customizado para forçar re-render da Navbar
      window.dispatchEvent(new Event('auth-change'));

      setMensagem({
        tipo: 'sucesso',
        texto: 'Login realizado com sucesso! Redirecionando...',
      });

      setFormData({ email: '', senha: '' });

      setTimeout(() => {
        navigate('/dicionario');
      }, 800);
    } catch {
      setMensagem({
        tipo: 'erro',
        texto: 'Erro de conexão com o servidor. Verifique se o backend está rodando.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-section">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span className="auth-logo-icon">🌿</span>
            </div>
            <h1 className="auth-title">Entrar</h1>
            <p className="auth-subtitle">Bem-vindo de volta ao Green Urban!</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label" htmlFor="email">
                E-mail
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">📧</span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="auth-input"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="senha">
                Senha
              </label>
              <div className="auth-input-wrapper">
                <span className="auth-input-icon">🔒</span>
                <input
                  id="senha"
                  name="senha"
                  type="password"
                  className="auth-input"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={handleChange}
                  required
                  minLength={6}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {mensagem.texto && (
              <div className={`auth-mensagem auth-mensagem--${mensagem.tipo}`}>
                <span className="auth-mensagem-icon">
                  {mensagem.tipo === 'sucesso' ? '✅' : '❌'}
                </span>
                <span>{mensagem.texto}</span>
              </div>
            )}

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  Entrando...
                </span>
              ) : (
                '🌿 Entrar'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span className="auth-toggle-text">Ainda não tem conta?</span>
            <Link to="/cadastro" className="auth-toggle-btn">
              Criar Conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;