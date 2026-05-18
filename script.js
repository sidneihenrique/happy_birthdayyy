/* global Swiper, Fancybox */

/* ================================================
   Confetti de fundo
   ================================================ */
(function createConfetti() {
  const container = document.getElementById('confettiBg');
  const colors = [
    '#FFB3BA', '#FFEAA7', '#A8E6CF', '#DDA0DD',
    '#FFDAC1', '#B5D8F7', '#F7C5D5', '#C3F0CA',
    '#FFD1DC', '#D5AAFF', '#FFFACD', '#B0E0E6',
  ];
  const count = 65;

  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';

    const color    = colors[Math.floor(Math.random() * colors.length)];
    const w        = Math.random() * 8  + 4;   // 4–12 px
    const h        = Math.random() * 10 + 6;   // 6–16 px
    const left     = Math.random() * 100;       // % da largura
    const duration = Math.random() * 9  + 6;   // 6–15 s
    const delay    = -(Math.random() * 18);     // início escalonado
    const radius   = Math.random() > 0.45 ? '50%' : '2px';

    Object.assign(el.style, {
      background:        color,
      width:             w  + 'px',
      height:            h  + 'px',
      left:              left + '%',
      animationDuration: duration + 's',
      animationDelay:    delay    + 's',
      borderRadius:      radius,
    });

    container.appendChild(el);
  }
})();

/* ================================================
   Elementos do DOM
   ================================================ */
const envelope     = document.getElementById('envelope');
const letterOverlay = document.getElementById('letterOverlay');
const overlayBackdrop = document.getElementById('overlayBackdrop');
const closeBtn     = document.getElementById('closeBtn');
const bgMusic      = document.getElementById('bgMusic');

let swiper = null;
let opened = false;

/* ================================================
   Swiper (inicializado ao abrir)
   ================================================ */
function setupScrollLock() {
  document.querySelectorAll('.sheet-scroll').forEach(scrollEl => {
    let startY = 0;

    scrollEl.addEventListener('touchstart', (e) => {
      startY = e.touches[0].clientY;
    }, { passive: true });

    scrollEl.addEventListener('touchmove', (e) => {
      if (!swiper) return;
      const isScrollable = scrollEl.scrollHeight > scrollEl.clientHeight + 2;
      if (!isScrollable) { swiper.allowTouchMove = true; return; }

      const dy       = e.touches[0].clientY - startY;
      const atTop    = scrollEl.scrollTop <= 3;
      const atBottom = scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 3;

      swiper.allowTouchMove = !((dy < 0 && !atBottom) || (dy > 0 && !atTop));
    }, { passive: true });

    scrollEl.addEventListener('touchend', () => {
      setTimeout(() => { if (swiper) swiper.allowTouchMove = true; }, 200);
    }, { passive: true });
  });
}

function initSwiper() {
  if (swiper) return;
  swiper = new Swiper('#letterSwiper', {
    direction: 'vertical',
    slidesPerView: 1,
    mousewheel: { sensitivity: 1, releaseOnEdges: true },
    touchReleaseOnEdges: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    a11y: {
      prevSlideMessage: 'Página anterior',
      nextSlideMessage: 'Próxima página',
    },
  });
  setupScrollLock();
}

/* ================================================
   Música de fundo
   ================================================ */
function tryPlayMusic() {
  if (!bgMusic.src && !bgMusic.querySelector('source[src]')) return;
  bgMusic.play().catch(() => {});
}

/* ================================================
   Abrir carta
   ================================================ */
function openLetter() {
  if (opened) return;
  opened = true;

  /* Inicia música assim que o usuário interage */
  tryPlayMusic();

  /* Abre o lacre do envelope */
  envelope.classList.add('open');

  /* Depois que o lacre animou (~400 ms), exibe a carta */
  setTimeout(() => {
    letterOverlay.classList.add('visible');
    letterOverlay.setAttribute('aria-hidden', 'false');
    initSwiper();
  }, 420);
}

/* ================================================
   Fechar carta
   ================================================ */
function closeLetter() {
  letterOverlay.classList.remove('visible');
  letterOverlay.setAttribute('aria-hidden', 'true');

  /* Recolhe o lacre após a carta sair */
  setTimeout(() => {
    envelope.classList.remove('open');
    opened = false;
  }, 400);
}

/* ================================================
   Eventos
   ================================================ */
envelope.addEventListener('click', openLetter);
envelope.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openLetter();
  }
});

closeBtn.addEventListener('click', closeLetter);

/* Clicar no backdrop também fecha */
overlayBackdrop.addEventListener('click', closeLetter);

/* Tecla Escape fecha */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && opened) closeLetter();
});

/* ================================================
   Fancybox — galeria de fotos com botão de download
   ================================================ */
Fancybox.bind('[data-fancybox="photos"]', {
  Toolbar: {
    display: {
      left:   ['infobar'],
      middle: [],
      right:  ['download', 'close'],
    },
  },
  Images: { zoom: true },
  Carousel: { infinite: true },
});

/* ================================================
   Cortina de abertura + aparição sequencial + música
   ================================================ */
(function initCurtain() {
  const curtain      = document.getElementById('curtain');
  const hero         = document.querySelector('.hero');
  const envelopeArea = document.querySelector('.envelope-area');
  const tableSt      = document.querySelector('.table-stickers');

  /* Pausa inicial — deixa o browser respirar */
  setTimeout(() => {
    curtain.classList.add('open');

    /* Seções aparecem escalonadas enquanto a cortina se abre */
    setTimeout(() => hero.classList.add('revealed'),         900);
    setTimeout(() => envelopeArea.classList.add('revealed'), 1600);
    setTimeout(() => {
      tableSt.classList.add('revealed');

      /* Música tenta tocar assim que os stickers aparecem */
      bgMusic.play().catch(() => {
        /* Bloqueado pelo browser — vai tocar quando o envelope for clicado */
      });
    }, 2300);

    /* Remove a cortina do DOM após a transição terminar */
    setTimeout(() => curtain.remove(), 2800);
  }, 500);
})();
