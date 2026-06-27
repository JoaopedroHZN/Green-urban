// ============================================================
//  Componente Avatar — Green Urban
//  Renderização condicional:
//    - Se tiver fotoPerfil → <img> com fallback para letra
//    - Se não tiver → círculo com letra inicial + cor de fundo
// ============================================================
import './Avatar.css';

const API_BASE = 'http://localhost:4000';

/**
 * @param {Object} props
 * @param {string} props.fotoUrl  — caminho relativo da foto (ex: '/uploads/perfil/abc.jpg')
 * @param {string} props.nome     — nome do usuário (usa primeira letra como fallback)
 * @param {string} props.tamanho  — 'sm' | 'md' | 'lg' (default: 'md')
 * @param {string} props.className — classes adicionais
 */
const Avatar = ({ fotoUrl, nome, tamanho = 'md', className = '' }) => {
  const inicial = nome ? nome.charAt(0).toUpperCase() : '?';
  const temFoto = fotoUrl && fotoUrl.trim().length > 0;
  const src = temFoto ? `${API_BASE}${fotoUrl}` : null;

  const classes = `avatar avatar--${tamanho} ${className}`.trim();

  return (
    <div className={classes}>
      {temFoto ? (
        <img
          className="avatar-img"
          src={src}
          alt={nome || 'Avatar'}
          onError={(e) => {
            // Se a imagem falhar ao carregar, mostra a letra
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement.classList.add('avatar--fallback');
            e.currentTarget.parentElement.setAttribute('data-inicial', inicial);
          }}
        />
      ) : (
        <span className="avatar-inicial">{inicial}</span>
      )}
    </div>
  );
};

export default Avatar;