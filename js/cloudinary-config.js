/* =============================================
   주보라 - Cloudinary 이미지 관리 시스템
   Cloud Name: dquicfvbk
   ============================================= */

const CLOUDINARY = {
  cloudName: 'dquicfvbk',
  baseUrl: 'https://res.cloudinary.com/dquicfvbk/image/upload',
  // 자동 최적화 옵션
  defaults: 'f_auto,q_auto',
  // 용도별 이미지 변환 프리셋
  presets: {
    thumbnail: 'w_400,h_300,c_fill',    // 목록 카드용 썸네일
    preview:   'w_800,h_600,c_fill',    // 편집기 미리보기용
    full:      'w_1200,q_90',           // 상세보기 원본
    icon:      'w_80,h_80,c_fill',      // 카테고리 아이콘
    hero:      'w_1400,h_500,c_fill',   // 메인 히어로 배너
  }
};

/**
 * Cloudinary 이미지 URL 생성 헬퍼
 * @param {string} publicId - Cloudinary public ID (예: 'templates/opening-basic-01')
 * @param {string} preset   - 프리셋 이름 (thumbnail | preview | full | icon | hero)
 * @returns {string} 최적화된 Cloudinary 이미지 URL
 *
 * 사용 예:
 *   cloudImg('templates/opening-basic-01', 'thumbnail')
 *   → https://res.cloudinary.com/dquicfvbk/image/upload/f_auto,q_auto,w_400,h_300,c_fill/templates/opening-basic-01
 */
function cloudImg(publicId, preset) {
  const p = CLOUDINARY.presets[preset] || '';
  const transforms = p ? `${CLOUDINARY.defaults},${p}` : CLOUDINARY.defaults;
  return `${CLOUDINARY.baseUrl}/${transforms}/${publicId}`;
}

/**
 * SVG 플레이스홀더 (이미지 로딩 실패 시 대체 이미지)
 * 밝은 회색 배경 + 아이콘 + "이미지 준비 중" 텍스트
 */
const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e8f3fb' width='400' height='300'/%3E%3Cg fill='%230367A6' opacity='0.4'%3E%3Crect x='160' y='90' width='80' height='60' rx='4'/%3E%3Ccircle cx='180' cy='110' r='8'/%3E%3Cpolygon points='165,145 200,115 235,145'/%3E%3C/g%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%230367A6' font-family='sans-serif' font-size='14' opacity='0.6'%3E이미지 준비 중%3C/text%3E%3C/svg%3E";

/**
 * 이미지 onerror 핸들러 – 로딩 실패 시 플레이스홀더로 교체
 * HTML에서 사용: onerror="imgFallback(this)"
 */
function imgFallback(imgEl) {
  imgEl.onerror = null; // 무한 루프 방지
  imgEl.src = PLACEHOLDER_SVG;
  imgEl.alt = '이미지를 불러올 수 없습니다';
}


/* =============================================
   디자인 데이터 (Cloudinary public ID 기반)
   ============================================= */

/** 카테고리 목록 */
const categories = [
  { id: 'all',       name: '전체',         icon: 'icons/category-all' },
  { id: 'opening',   name: '개업축하',     icon: 'icons/category-opening' },
  { id: 'event',     name: '행사·축제',    icon: 'icons/category-event' },
  { id: 'sale',      name: '세일·할인',    icon: 'icons/category-sale' },
  { id: 'election',  name: '선거·캠페인',  icon: 'icons/category-election' },
  { id: 'realestate',name: '부동산·분양',  icon: 'icons/category-realestate' },
  { id: 'school',    name: '학교·학원',    icon: 'icons/category-school' },
  { id: 'food',      name: '음식·요식업',  icon: 'icons/category-food' },
  { id: 'church',    name: '교회·종교',    icon: 'icons/category-church' },
  { id: 'sports',    name: '스포츠·체육',  icon: 'icons/category-sports' },
  { id: 'general',   name: '기타·일반',    icon: 'icons/category-general' },
];

/** 디자인 템플릿 데이터 */
const designs = [
  // ── 개업축하 ──
  { id: 1,  name: '개업축하 기본형',        category: 'opening',    price: 15000, image: 'templates/opening-basic-01',      tags: ['현수막','개업'] },
  { id: 2,  name: '개업축하 꽃 테마',       category: 'opening',    price: 18000, image: 'templates/opening-flower-01',     tags: ['현수막','개업','꽃'] },
  { id: 3,  name: '개업축하 모던',          category: 'opening',    price: 20000, image: 'templates/opening-modern-01',     tags: ['배너','개업','모던'] },
  { id: 4,  name: '개업축하 레드 골드',      category: 'opening',    price: 22000, image: 'templates/opening-redgold-01',    tags: ['현수막','개업','고급'] },

  // ── 행사·축제 ──
  { id: 5,  name: '체육대회 응원',          category: 'event',      price: 15000, image: 'templates/event-sports-01',       tags: ['현수막','체육대회'] },
  { id: 6,  name: '축제 포스터형',          category: 'event',      price: 18000, image: 'templates/event-festival-01',     tags: ['배너','축제'] },
  { id: 7,  name: '바자회 안내',            category: 'event',      price: 16000, image: 'templates/event-bazaar-01',       tags: ['현수막','바자회'] },
  { id: 8,  name: '송년회·신년회',          category: 'event',      price: 17000, image: 'templates/event-yearend-01',      tags: ['현수막','송년회'] },

  // ── 세일·할인 ──
  { id: 9,  name: '대박 세일 레드',         category: 'sale',       price: 15000, image: 'templates/sale-red-01',           tags: ['현수막','세일','할인'] },
  { id: 10, name: '시즌 오프 블루',         category: 'sale',       price: 16000, image: 'templates/sale-blue-01',          tags: ['배너','할인','시즌오프'] },
  { id: 11, name: '오픈 기념 특가',         category: 'sale',       price: 18000, image: 'templates/sale-special-01',       tags: ['현수막','특가'] },
  { id: 12, name: '클리어런스 세일',        category: 'sale',       price: 15000, image: 'templates/sale-clearance-01',     tags: ['현수막','클리어런스'] },

  // ── 선거·캠페인 ──
  { id: 13, name: '선거 기본 블루',         category: 'election',   price: 20000, image: 'templates/election-blue-01',      tags: ['현수막','선거'] },
  { id: 14, name: '선거 그린 내추럴',       category: 'election',   price: 20000, image: 'templates/election-green-01',     tags: ['현수막','선거','친환경'] },

  // ── 부동산·분양 ──
  { id: 15, name: '분양 안내 기본',         category: 'realestate', price: 22000, image: 'templates/realestate-basic-01',   tags: ['현수막','분양','아파트'] },
  { id: 16, name: '임대 안내 심플',         category: 'realestate', price: 18000, image: 'templates/realestate-rent-01',    tags: ['배너','임대'] },

  // ── 학교·학원 ──
  { id: 17, name: '입학 축하',              category: 'school',     price: 15000, image: 'templates/school-entrance-01',    tags: ['현수막','입학','학교'] },
  { id: 18, name: '학원 홍보',              category: 'school',     price: 16000, image: 'templates/school-academy-01',     tags: ['배너','학원','홍보'] },

  // ── 음식·요식업 ──
  { id: 19, name: '맛집 오픈',              category: 'food',       price: 18000, image: 'templates/food-open-01',          tags: ['현수막','맛집','오픈'] },
  { id: 20, name: '카페 메뉴판',            category: 'food',       price: 20000, image: 'templates/food-cafe-01',          tags: ['배너','카페','메뉴'] },

  // ── 교회·종교 ──
  { id: 21, name: '교회 부활절',            category: 'church',     price: 18000, image: 'templates/church-easter-01',      tags: ['현수막','교회','부활절'] },
  { id: 22, name: '성탄절 안내',            category: 'church',     price: 18000, image: 'templates/church-christmas-01',   tags: ['현수막','성탄절'] },

  // ── 스포츠·체육 ──
  { id: 23, name: '마라톤 대회',            category: 'sports',     price: 16000, image: 'templates/sports-marathon-01',    tags: ['현수막','마라톤'] },
  { id: 24, name: '풋살 리그',              category: 'sports',     price: 16000, image: 'templates/sports-futsal-01',      tags: ['배너','풋살'] },
];

/** 인기 디자인 (index.html 베스트셀러용) */
const bestDesigns = designs.filter(d => [1, 5, 9, 15].includes(d.id));

/** 추천 디자인 (index.html 추천 섹션용) */
const recommendedDesigns = designs.filter(d => [2, 6, 10, 19, 21, 23].includes(d.id));

/** 히어로 배너 데이터 */
const heroBanners = [
  { id: 1, image: 'banners/hero-main',    alt: '현수막·배너 전문 제작 주보라',      link: 'templates.html' },
  { id: 2, image: 'banners/hero-event',   alt: '봄맞이 특별 할인 이벤트',          link: '#' },
  { id: 3, image: 'banners/hero-newuser', alt: '신규회원 첫 주문 20% 할인',        link: '#' },
];

/** 고객 후기 데이터 */
const reviews = [
  { id: 1, author: '김OO', rating: 5, text: '빠른 제작에 품질도 좋아요! 개업식 현수막 잘 받았습니다.',               image: 'reviews/review-01', category: '개업축하' },
  { id: 2, author: '이OO', rating: 5, text: '온라인 편집기가 너무 편해요. 디자인 감각 없어도 멋지게 완성!',          image: 'reviews/review-02', category: '행사' },
  { id: 3, author: '박OO', rating: 4, text: '가격대비 훌륭합니다. 학교 체육대회 현수막으로 딱이었어요.',              image: 'reviews/review-03', category: '학교' },
  { id: 4, author: '최OO', rating: 5, text: '매년 교회 행사때마다 이용하는데 항상 만족스럽습니다.',                   image: 'reviews/review-04', category: '교회' },
];


/* =============================================
   동적 렌더링 유틸리티
   ============================================= */

/**
 * 디자인 카드 HTML 생성
 * @param {object} design - 디자인 데이터 객체
 * @param {string} preset - Cloudinary 프리셋 (기본: thumbnail)
 * @returns {string} 카드 HTML 문자열
 */
function renderDesignCard(design, preset = 'thumbnail') {
  return `
    <div class="card" data-id="${design.id}" data-category="${design.category}">
      <div class="card-img-wrap">
        <img class="card-img"
             src="${cloudImg(design.image, preset)}"
             alt="${design.name}"
             loading="lazy"
             onerror="imgFallback(this)" />
        <div class="card-overlay">
          <a href="editor.html?design=${design.id}" class="btn btn-sm btn-primary">편집하기</a>
          <a href="order.html?design=${design.id}"  class="btn btn-sm btn-outline">바로 주문</a>
        </div>
      </div>
      <div class="card-body">
        <span class="card-category">${getCategoryName(design.category)}</span>
        <h3 class="card-title">${design.name}</h3>
        <p class="card-price">${Jbora.formatPrice(design.price)}원~</p>
      </div>
    </div>`;
}

/**
 * 카테고리 아이콘 HTML 생성
 * @param {object} cat - 카테고리 객체
 * @returns {string} 카테고리 아이콘 HTML
 */
function renderCategoryIcon(cat) {
  return `
    <a href="templates.html?category=${cat.id}" class="quick-cat-item">
      <img src="${cloudImg(cat.icon, 'icon')}"
           alt="${cat.name}"
           loading="lazy"
           onerror="imgFallback(this)" />
      <span>${cat.name}</span>
    </a>`;
}

/**
 * 리뷰 카드 HTML 생성
 */
function renderReviewCard(review) {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  return `
    <div class="review-card">
      <img class="review-img"
           src="${cloudImg(review.image, 'thumbnail')}"
           alt="${review.author} 후기"
           loading="lazy"
           onerror="imgFallback(this)" />
      <div class="review-body">
        <div class="review-stars">${stars}</div>
        <p class="review-text">${review.text}</p>
        <span class="review-author">${review.author} · ${review.category}</span>
      </div>
    </div>`;
}

/** 카테고리 ID → 이름 변환 헬퍼 */
function getCategoryName(catId) {
  const found = categories.find(c => c.id === catId);
  return found ? found.name : catId;
}
