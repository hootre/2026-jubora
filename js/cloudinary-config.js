/* =============================================
   주보라 - Cloudinary 이미지 관리 시스템
   Cloud Name: dquicfvbk
   ============================================= */

const CLOUDINARY = {
  cloudName: 'dquicfvbk',
  baseUrl: 'https://res.cloudinary.com/dquicfvbk/image/upload',
  defaults: 'f_auto,q_auto',
  presets: {
    thumbnail: 'w_400,h_300,c_fill',
    preview:   'w_800,h_600,c_fill',
    full:      'w_1200,q_90',
    icon:      'w_80,h_80,c_fill',
    hero:      'w_1400,h_500,c_fill',
  }
};

function cloudImg(publicId, preset) {
  const p = CLOUDINARY.presets[preset] || '';
  const transforms = p ? `${CLOUDINARY.defaults},${p}` : CLOUDINARY.defaults;
  return `${CLOUDINARY.baseUrl}/${transforms}/${publicId}`;
}

const PLACEHOLDER_SVG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%23e8f3fb' width='400' height='300'/%3E%3Cg fill='%230367A6' opacity='0.4'%3E%3Crect x='160' y='90' width='80' height='60' rx='4'/%3E%3Ccircle cx='180' cy='110' r='8'/%3E%3Cpolygon points='165,145 200,115 235,145'/%3E%3C/g%3E%3Ctext x='200' y='180' text-anchor='middle' fill='%230367A6' font-family='sans-serif' font-size='14' opacity='0.6'%3E이미지 준비 중%3C/text%3E%3C/svg%3E";

function imgFallback(imgEl) {
  imgEl.onerror = null;
  imgEl.src = PLACEHOLDER_SVG;
  imgEl.alt = '이미지를 불러올 수 없습니다';
}


/* =============================================
   카테고리 / 디자인 데이터 (jubora.co.kr 제품군)
   ============================================= */

/** 카테고리 */
const categories = [
  { id: 'all',        name: '전체',             icon: 'icons/category-all' },
  { id: 'horizontal', name: '가로형 현수막',    icon: 'icons/category-horizontal' },
  { id: 'season',     name: '절기 현수막',      icon: 'icons/category-season' },
  { id: 'worship',    name: '예배·행사 현수막', icon: 'icons/category-worship' },
  { id: 'vertical',   name: '세로형 배너',      icon: 'icons/category-vertical' },
  { id: 'print',      name: '인쇄물',           icon: 'icons/category-print' },
  { id: 'goods',      name: '교회용품',         icon: 'icons/category-goods' },
];

/** 디자인 템플릿 데이터 */
const designs = [

  // ── 가로형 현수막 – 배경 ──
  { id: 1,  name: '교회 배경 기본형',         category: 'horizontal', price: 15000, image: 'templates/h-bg-basic-01',        tags: ['현수막','배경','가로형'] },
  { id: 2,  name: '강단 배경 블루',           category: 'horizontal', price: 15000, image: 'templates/h-bg-altar-01',        tags: ['현수막','강단배경','가로형'] },
  { id: 3,  name: '표어 현수막 기본',         category: 'horizontal', price: 15000, image: 'templates/h-motto-01',           tags: ['현수막','표어','가로형'] },
  { id: 4,  name: '환영 현수막 기본',         category: 'horizontal', price: 15000, image: 'templates/h-welcome-01',         tags: ['현수막','환영','가로형'] },
  { id: 5,  name: '시간표 안내 현수막',       category: 'horizontal', price: 16000, image: 'templates/h-schedule-01',        tags: ['현수막','시간표','가로형'] },
  { id: 6,  name: '성화 배경 현수막',         category: 'horizontal', price: 18000, image: 'templates/h-sacred-01',          tags: ['현수막','성화','가로형'] },

  // ── 절기 현수막 ──
  { id: 7,  name: '부활절 현수막 기본',       category: 'season',     price: 15000, image: 'templates/s-easter-01',          tags: ['현수막','부활절','절기'] },
  { id: 8,  name: '고난주간 현수막',          category: 'season',     price: 15000, image: 'templates/s-passion-01',         tags: ['현수막','고난','사순절','절기'] },
  { id: 9,  name: '맥추감사절 현수막',        category: 'season',     price: 15000, image: 'templates/s-harvest-01',         tags: ['현수막','맥추감사','절기'] },
  { id: 10, name: '추수감사절 현수막',        category: 'season',     price: 15000, image: 'templates/s-thanksgiving-01',    tags: ['현수막','추수감사','절기'] },
  { id: 11, name: '성탄절 현수막 기본',       category: 'season',     price: 15000, image: 'templates/s-christmas-01',       tags: ['현수막','성탄절','절기'] },
  { id: 12, name: '성탄절 현수막 골드',       category: 'season',     price: 18000, image: 'templates/s-christmas-02',       tags: ['현수막','성탄절','절기','고급'] },
  { id: 13, name: '송구영신 현수막',          category: 'season',     price: 15000, image: 'templates/s-newyear-01',         tags: ['현수막','송구영신','절기'] },
  { id: 14, name: '신년감사 현수막',          category: 'season',     price: 15000, image: 'templates/s-newyear-02',         tags: ['현수막','신년감사','절기'] },
  { id: 15, name: '어린이주일 현수막',        category: 'season',     price: 15000, image: 'templates/s-childrens-01',       tags: ['현수막','어린이주일','절기'] },
  { id: 16, name: '어버이주일 현수막',        category: 'season',     price: 15000, image: 'templates/s-parents-01',         tags: ['현수막','어버이주일','절기'] },

  // ── 예배·행사 현수막 ──
  { id: 17, name: '헌신예배 현수막',          category: 'worship',    price: 15000, image: 'templates/w-dedication-01',      tags: ['현수막','헌신예배','예배'] },
  { id: 18, name: '기도회 현수막',            category: 'worship',    price: 15000, image: 'templates/w-prayer-01',          tags: ['현수막','기도회','행사'] },
  { id: 19, name: '부흥회 현수막',            category: 'worship',    price: 15000, image: 'templates/w-revival-01',         tags: ['현수막','부흥회','행사'] },
  { id: 20, name: '창립기념일 현수막',        category: 'worship',    price: 16000, image: 'templates/w-anniversary-01',     tags: ['현수막','창립','행사'] },
  { id: 21, name: '임직식 현수막',            category: 'worship',    price: 16000, image: 'templates/w-ordination-01',      tags: ['현수막','임직','행사'] },
  { id: 22, name: '선교/파송 현수막',         category: 'worship',    price: 15000, image: 'templates/w-mission-01',         tags: ['현수막','선교','파송','행사'] },
  { id: 23, name: '입학/졸업 현수막',         category: 'worship',    price: 15000, image: 'templates/w-graduation-01',      tags: ['현수막','입학','졸업','행사'] },
  { id: 24, name: '전도집회 현수막',          category: 'worship',    price: 15000, image: 'templates/w-evangelism-01',      tags: ['현수막','전도','행사'] },
  { id: 25, name: '여름행사 현수막',          category: 'worship',    price: 16000, image: 'templates/w-summer-01',          tags: ['현수막','여름행사','행사'] },
  { id: 26, name: '성경학교 현수막',          category: 'worship',    price: 16000, image: 'templates/w-bibleschool-01',     tags: ['현수막','성경학교','행사'] },

  // ── 세로형 배너 ──
  { id: 27, name: '환영 세로형 배너',         category: 'vertical',   price: 20000, image: 'templates/v-welcome-01',         tags: ['배너','환영','세로형'] },
  { id: 28, name: '절기 세로형 배너',         category: 'vertical',   price: 20000, image: 'templates/v-season-01',          tags: ['배너','절기','세로형'] },
  { id: 29, name: '행사 세로형 배너',         category: 'vertical',   price: 20000, image: 'templates/v-event-01',           tags: ['배너','행사','세로형'] },
  { id: 30, name: '축하 세로형 배너',         category: 'vertical',   price: 20000, image: 'templates/v-congrats-01',        tags: ['배너','축하','세로형'] },
  { id: 31, name: '선교 세로형 배너',         category: 'vertical',   price: 20000, image: 'templates/v-mission-01',         tags: ['배너','선교','세로형'] },
  { id: 32, name: '기도회 세로형 배너',       category: 'vertical',   price: 20000, image: 'templates/v-prayer-01',          tags: ['배너','기도회','세로형'] },

  // ── 인쇄물 ──
  { id: 33, name: '교회 주보 기본형',         category: 'print',      price: 10000, image: 'templates/p-bulletin-01',        tags: ['주보','인쇄물'] },
  { id: 34, name: '전도지 기본형',            category: 'print',      price: 12000, image: 'templates/p-tract-01',           tags: ['전도지','인쇄물'] },
  { id: 35, name: '교회 명함 기본',           category: 'print',      price: 10000, image: 'templates/p-card-01',            tags: ['명함','인쇄물'] },
  { id: 36, name: '전도 명함',                category: 'print',      price: 10000, image: 'templates/p-evangelism-card-01', tags: ['명함','전도명함','인쇄물'] },
  { id: 37, name: '초대장 기본형',            category: 'print',      price: 15000, image: 'templates/p-invitation-01',      tags: ['초대장','인쇄물'] },
  { id: 38, name: '팜플렛 기본형',            category: 'print',      price: 18000, image: 'templates/p-pamphlet-01',        tags: ['팜플렛','인쇄물'] },
  { id: 39, name: '순서지 기본형',            category: 'print',      price: 10000, image: 'templates/p-program-01',         tags: ['순서지','인쇄물'] },
  { id: 40, name: '교회봉투 기본형',          category: 'print',      price: 12000, image: 'templates/p-envelope-01',        tags: ['봉투','교회봉투','인쇄물'] },

  // ── 교회용품 ──
  { id: 41, name: '실내 배너거치대',          category: 'goods',      price: 35000, image: 'templates/g-stand-indoor-01',    tags: ['배너거치대','교회용품'] },
  { id: 42, name: '실외 배너거치대',          category: 'goods',      price: 45000, image: 'templates/g-stand-outdoor-01',   tags: ['배너거치대','교회용품'] },
  { id: 43, name: '교회 어깨띠',              category: 'goods',      price: 15000, image: 'templates/g-sash-01',            tags: ['어깨띠','교회용품'] },
  { id: 44, name: '교패 기본형',              category: 'goods',      price: 20000, image: 'templates/g-nameplate-01',       tags: ['교패','교회용품'] },
  { id: 45, name: '교회 명찰',                category: 'goods',      price: 8000,  image: 'templates/g-badge-01',           tags: ['명찰','교회용품'] },
];

/** 인기 디자인 */
const bestDesigns = designs.filter(d => [11, 7, 10, 17].includes(d.id));

/** 추천 디자인 */
const recommendedDesigns = designs.filter(d => [1, 8, 19, 27, 33, 41].includes(d.id));

/** 히어로 배너 */
const heroBanners = [
  { id: 1, image: 'banners/hero-main',    alt: '교회 현수막·배너 전문 주보라',    link: 'templates.html' },
  { id: 2, image: 'banners/hero-season',  alt: '절기 현수막 시즌 특가',           link: 'templates.html?cat=season' },
  { id: 3, image: 'banners/hero-print',   alt: '교회 인쇄물 한 번에 주문',        link: 'templates.html?cat=print' },
];

/** 고객 후기 */
const reviews = [
  { id: 1, author: '김OO 집사', rating: 5, text: '성탄절 현수막 매년 주문하는데 품질이 정말 좋아요. 올해도 만족스럽습니다.',        image: 'reviews/review-01', category: '절기' },
  { id: 2, author: '이OO 권사', rating: 5, text: '헌신예배 현수막 당일 발송으로 제때 받았어요. 인쇄 색감이 선명합니다.',           image: 'reviews/review-02', category: '예배' },
  { id: 3, author: '박OO 목사', rating: 5, text: '주보, 명함, 전도지까지 한 번에 주문했는데 배송도 빠르고 퀄리티 최고예요.',      image: 'reviews/review-03', category: '인쇄물' },
  { id: 4, author: '최OO 장로', rating: 5, text: '창립기념 현수막과 배너거치대 함께 주문했습니다. 교회 분위기가 달라졌어요!',       image: 'reviews/review-04', category: '교회용품' },
];


/* =============================================
   동적 렌더링 유틸리티
   ============================================= */

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

function renderCategoryIcon(cat) {
  return `
    <a href="templates.html?cat=${cat.id}" class="quick-cat-item">
      <img src="${cloudImg(cat.icon, 'icon')}"
           alt="${cat.name}"
           loading="lazy"
           onerror="imgFallback(this)" />
      <span>${cat.name}</span>
    </a>`;
}

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

/** 카테고리 ID → 이름 변환 */
function getCategoryName(catId) {
  const found = categories.find(c => c.id === catId);
  return found ? found.name : catId;
}
