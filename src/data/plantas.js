/**
 * 🌱 Mock de Dados — Plantas para o Assistente de Recomendação Inteligente
 *
 * Cada planta segue a estrutura:
 *   id, nomePopular, nomeCientifico, tipo, condicoesIdeais { sol, agua, espaco }, dicasCuidado
 *
 * `condicoesIdeais.sol`  → "sol" | "sombra"
 * `condicoesIdeais.espaco` → "pouco" | "muito"
 */

const plantas = [
  {
    id: 1,
    nomePopular: 'Samambaia Americana',
    nomeCientifico: 'Nephrolepis exaltata',
    tipo: 'Folhagem',
    condicoesIdeais: {
      sol: 'sombra',
      agua: 'media',
      espaco: 'pouco',
    },
    dicasCuidado:
      'Gosta de ambientes úmidos e iluminação indireta. Borrife água nas folhas em dias secos.',
  },
  {
    id: 2,
    nomePopular: 'Ipê Amarelo',
    nomeCientifico: 'Handroanthus albus',
    tipo: 'Árvore Nativa',
    condicoesIdeais: {
      sol: 'sol',
      agua: 'baixa',
      espaco: 'muito',
    },
    dicasCuidado:
      'Necessita de sol pleno e espaço para as raízes. Regar apenas no primeiro ano após o plantio.',
  },
  {
    id: 3,
    nomePopular: 'Suculenta Echeveria',
    nomeCientifico: 'Echeveria elegans',
    tipo: 'Suculenta',
    condicoesIdeais: {
      sol: 'sol',
      agua: 'baixa',
      espaco: 'pouco',
    },
    dicasCuidado:
      'Regue apenas quando o solo estiver completamente seco. Tolera sol direto meia-período.',
  },
  {
    id: 4,
    nomePopular: 'Jiboia',
    nomeCientifico: 'Epipremnum aureum',
    tipo: 'Trepageira / Pendente',
    condicoesIdeais: {
      sol: 'sombra',
      agua: 'media',
      espaco: 'pouco',
    },
    dicasCuidado:
      'Adapta-se bem a ambientes internos com pouca luz. Suas folhas ficam mais variegadas com luz indireta.',
  },
  {
    id: 5,
    nomePopular: 'Pau-Brasil',
    nomeCientifico: 'Paubrasilia echinata',
    tipo: 'Árvore Nativa',
    condicoesIdeais: {
      sol: 'sol',
      agua: 'media',
      espaco: 'muito',
    },
    dicasCuidado:
      'Árvore símbolo do Brasil. Precisa de sol pleno e solo bem drenado. Aprecia regas regulares.',
  },
  {
    id: 6,
    nomePopular: 'Lavanda',
    nomeCientifico: 'Lavandula angustifolia',
    tipo: 'Arbusto Aromático',
    condicoesIdeais: {
      sol: 'sol',
      agua: 'baixa',
      espaco: 'pouco',
    },
    dicasCuidado:
      'Ama sol pleno e solo seco. Regas esparsas. Seu aroma atrai polinizadores como abelhas.',
  },
  {
    id: 7,
    nomePopular: 'Costela-de-Adão',
    nomeCientifico: 'Monstera deliciosa',
    tipo: 'Folhagem',
    condicoesIdeais: {
      sol: 'sombra',
      agua: 'media',
      espaco: 'pouco',
    },
    dicasCuidado:
      'Folhas grandes e recortadas. Prefere luz indireta e ambientes com boa umidade.',
  },
  {
    id: 8,
    nomePopular: 'Palmeira Jerivá',
    nomeCientifico: 'Syagrus romanzoffiana',
    tipo: 'Palmeira Nativa',
    condicoesIdeais: {
      sol: 'sol',
      agua: 'media',
      espaco: 'muito',
    },
    dicasCuidado:
      'Cresce bem em sol pleno. Ideal para calçadas largas e parques. Atrai pássaros.',
  },
];

export default plantas;
