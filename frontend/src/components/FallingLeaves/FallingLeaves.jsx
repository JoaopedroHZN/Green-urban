import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './FallingLeaves.css';

// Gera uma textura de folha procedural (canvas 2D -> textura Three.js),
// evitando depender de imagens externas.
function criarTexturaFolha(cor) {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = cor;
  ctx.beginPath();
  ctx.moveTo(32, 4);
  ctx.bezierCurveTo(58, 20, 58, 44, 32, 60);
  ctx.bezierCurveTo(6, 44, 6, 20, 32, 4);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(32, 8);
  ctx.lineTo(32, 56);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const CORES = [0x1b5e20, 0x2e7d32, 0x388e3c, 0x0d5302, 0x1b5e20];

/**
 * Fundo animado com folhas caindo em 3D via Three.js.
 * Uso: <FallingLeaves quantidade={40} />
 * Renderiza um <canvas> fixo cobrindo a tela, atrás do conteúdo.
 */
const FallingLeaves = ({ quantidade = 80 }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const largura = container.clientWidth;
    const altura = container.clientHeight;

    // Cena, câmera e renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, largura / altura, 0.1, 100);
    camera.position.z = 20;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(largura, altura);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Texturas (uma por cor, reaproveitadas entre as folhas)
    const texturas = CORES.map((cor) => criarTexturaFolha(`#${cor.toString(16).padStart(6, '0')}`));

    // Cria as folhas como planos com textura transparente
    const folhas = [];
    for (let i = 0; i < quantidade; i++) {
      const textura = texturas[i % texturas.length];
      const material = new THREE.MeshBasicMaterial({
        map: textura,
        transparent: true,
        opacity: 1.0, // folhas totalmente opacas para máximo contraste
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const tamanho = 1.2 + Math.random() * 1.6; // folhas maiores para mais contraste
      const geometry = new THREE.PlaneGeometry(tamanho, tamanho);
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(
        (Math.random() - 0.9) * 24, // x: forte viés para esquerda (mais folhas no canto esquerdo)
        Math.random() * 28 - 4, // y: mais folhas no topo, cobrindo a tela inteira
        (Math.random() - 0.5) * 10 // z (profundidade)
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      // Dados de animação individuais de cada folha
      mesh.userData = {
        velocidadeQueda: 0.02 + Math.random() * 0.03,
        velocidadeDiagonal: 0.01 + Math.random() * 0.05, // algumas folhas bem mais rápidas para a esquerda
        velocidadeRotX: (Math.random() - 0.5) * 0.02,
        velocidadeRotY: (Math.random() - 0.5) * 0.02,
        velocidadeRotZ: (Math.random() - 0.5) * 0.03,
        amplitudeBalanco: 0.5 + Math.random() * 1.5,
        fase: Math.random() * Math.PI * 2,
      };

      scene.add(mesh);
      folhas.push(mesh);
    }

    let frameId;
    const relogio = new THREE.Clock();

    const animar = () => {
      const tempo = relogio.getElapsedTime();

      folhas.forEach((folha) => {
        const dados = folha.userData;

        folha.position.y -= dados.velocidadeQueda;
        folha.position.x -= dados.velocidadeDiagonal; // deriva constante para a diagonal
        folha.position.x += Math.sin(tempo + dados.fase) * 0.008 * dados.amplitudeBalanco; // balanço sutil somado à deriva

        folha.rotation.x += dados.velocidadeRotX;
        folha.rotation.y += dados.velocidadeRotY;
        folha.rotation.z += dados.velocidadeRotZ;

        // Quando sai da tela por baixo, volta pro topo (loop infinito)
        if (folha.position.y < -15) {
          folha.position.y = 14;
          folha.position.x = (Math.random() - 0.3) * 24; // nasce com leve viés à esquerda também
        }
        if (folha.position.x < -16) {
          folha.position.x = 16;
        }
      });

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animar);
    };
    animar();

    // Responsividade
    const aoRedimensionar = () => {
      const novaLargura = container.clientWidth;
      const novaAltura = container.clientHeight;
      camera.aspect = novaLargura / novaAltura;
      camera.updateProjectionMatrix();
      renderer.setSize(novaLargura, novaAltura);
    };
    window.addEventListener('resize', aoRedimensionar);

    // Limpeza ao desmontar o componente
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', aoRedimensionar);
      folhas.forEach((folha) => {
        folha.geometry.dispose();
        folha.material.dispose();
      });
      texturas.forEach((t) => t.dispose());
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [quantidade]);

  return <div ref={mountRef} className="leaves-canvas-container" aria-hidden="true" />;
};

export default FallingLeaves;