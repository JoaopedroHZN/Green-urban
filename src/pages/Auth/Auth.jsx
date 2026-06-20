import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const Auth = () => {
  const navigate = useNavigate();
  const [isCadastro, setIsCadastro] = useState(true);
  const [formData, setFormData] = useState({ nome: '', email: '', senha: '' });
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const alternarModo = () => {
    setIsCadastro((prev) => !prev);
    setMensagem({ tipo: '', texto: '' });
    setFormData({ nome: '', email: '', senha: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem({ tipo: '', texto: '' });
    setLoading(true);

    try {
      const endpoint = isCadastro ? '/api/auth/registrar' : '/api/auth/login';
      const url = `${API_BASE}${endpoint}`;
      const payload = isCadastro
        ? { nome: formData.nome, email: formData.email, senha: formData.senha }
        : { email: formData.email, senha: formData.senha };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensagem({
          tipo: 'erro',
          texto: data.erro || data.message || 'Algo deu errado. Tente novamente.',
        });
        return;
      }

      // Armazena o token JWT no localStorage para usar nas demais requisições
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setMensagem({
        tipo: 'sucesso',
        texto: isCadastro
          ? 'Cadastro realizado com sucesso! Redirecionando...'
          : 'Login realizado com sucesso! Redirecionando...',
      });

      setFormData({ nome: '', email: '', senha: '' });

      // Redireciona para a Home após 1.5s
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
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
            <h1 className="auth-title">
              {isCadastro ? 'Criar Conta' : 'Entrar'}
            </h1>
            <p className="auth-subtitle">
              {isCadastro
                ? 'Junte-se ao Green Urban e faça parte da mudança!'
                : 'Bem-vindo de volta ao Green Urban!'}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {isCadastro && (
              <div className="auth-field">
                <label className="auth-label" htmlFor="nome">
                  Nome
                </label>
                <div className="auth-input-wrapper">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    className="auth-input"
                    placeholder="Seu nome completo"
                    value={formData.nome}
                    onChange={handleChange}
                    required={isCadastro}
                    autoComplete="name"
                  />
                </div>
              </div>
            )}

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
                  autoComplete={isCadastro ? 'new-password' : 'current-password'}
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

            <button
              type="submit"
              className="auth-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="auth-btn-loading">
                  <span className="auth-spinner" />
                  {isCadastro ? 'Cadastrando...' : 'Entrando...'}
                </span>
              ) : isCadastro ? (
                '🌿 Cadastrar'
              ) : (
                '🌿 Entrar'
              )}
            </button>
          </form>

          <div className="auth-toggle">
            <span className="auth-toggle-text">
              {isCadastro ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
            </span>
            <button
              type="button"
              className="auth-toggle-btn"
              onClick={alternarModo}
            >
              {isCadastro ? 'Fazer Login' : 'Criar Conta'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;