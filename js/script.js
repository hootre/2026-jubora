/* =============================================
   주보라 - 공통 스크립트
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 햄버거 메뉴 ---------- */
  const hamburger = document.querySelector('.hamburger');
  const siteNav   = document.getElementById('site-nav');

  if (hamburger && siteNav) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      siteNav.classList.toggle('open');
      document.body.style.overflow = siteNav.classList.contains('open') ? 'hidden' : '';
    });
  }

  /* ---------- 모바일 드롭다운 토글 ---------- */
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    if (item.querySelector('.nav-dropdown') && link) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          item.classList.toggle('open');
        }
      });
    }
  });

  /* ---------- 헤더 스크롤 효과 ---------- */
  const header = document.getElementById('site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  /* ---------- 현재 메뉴 활성화 ---------- */
  const currentPath = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href.endsWith(currentPath))) {
      link.classList.add('active');
    }
  });

  /* ---------- 윈도우 리사이즈 ---------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && siteNav) {
      siteNav.classList.remove('open');
      if (hamburger) hamburger.classList.remove('open');
      document.body.style.overflow = '';
    }
  });

});

/* ---------- 유틸리티 ---------- */
const Jbora = {
  /** 숫자에 콤마 포맷 */
  formatPrice(num) {
    return Number(num).toLocaleString('ko-KR');
  },

  /** 간단 토스트 알림 */
  toast(msg, type = 'info', duration = 2800) {
    const el = document.createElement('div');
    el.className = `jbora-toast jbora-toast--${type}`;
    el.textContent = msg;
    Object.assign(el.style, {
      position: 'fixed', bottom: '24px', left: '50%',
      transform: 'translateX(-50%) translateY(20px)',
      background: type === 'error' ? '#F22233' : type === 'success' ? '#16a34a' : '#0367A6',
      color: '#fff', padding: '12px 24px', borderRadius: '8px',
      boxShadow: '0 4px 16px rgba(0,0,0,.2)', fontSize: '.92rem',
      fontWeight: '600', zIndex: 9999, opacity: '0',
      transition: 'all .25s ease', whiteSpace: 'nowrap',
    });
    document.body.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  /** 스크롤 맨 위로 */
  scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },
};
