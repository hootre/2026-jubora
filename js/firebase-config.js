/* =============================================
   주보라 - Firebase 설정
   ─────────────────────────────────────────────
   ★ 사용 전 아래 단계를 완료하세요:

   1. https://console.firebase.google.com 접속
   2. 프로젝트 만들기 → 이름: jubora (또는 원하는 이름)
   3. 왼쪽 메뉴 빌드 → Authentication → 시작하기
   4. 로그인 제공업체 → Google → 사용 설정 (이메일도 함께 활성화)
   5. 프로젝트 설정(⚙️) → 내 앱 → </> 웹 앱 추가
   6. 아래 firebaseConfig 값을 Firebase 콘솔에서 복사해 교체
   ============================================= */

const firebaseConfig = {
  apiKey: "AIzaSyCfyaPlilhIuN0MTvdzEYuGRKvI1n2znFQ",
  authDomain: "jubora-bc3fb.firebaseapp.com",
  projectId: "jubora-bc3fb",
  storageBucket: "jubora-bc3fb.firebasestorage.app",
  messagingSenderId: "385156149053",
  appId: "1:385156149053:web:19daaba5322333a6b3df54",
  measurementId: "G-Y7TLNW6V94"
};
/* ── Firebase 초기화 ── */
let _firebaseApp  = null;
let _firebaseAuth = null;
let _googleProvider = null;
let _firebaseReady  = false;

function initFirebase() {
  try {
    // 설정 값이 채워지지 않았으면 초기화 건너뜀
    if (firebaseConfig.apiKey.includes('여기에')) {
      console.warn('[주보라] Firebase 설정이 필요합니다. js/firebase-config.js를 수정해주세요.');
      return false;
    }

    // Firebase compat SDK (CDN 로드 방식)
    if (typeof firebase === 'undefined') {
      console.warn('[주보라] Firebase SDK가 로드되지 않았습니다.');
      return false;
    }

    if (!firebase.apps.length) {
      _firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      _firebaseApp = firebase.app();
    }

    _firebaseAuth    = firebase.auth();
    _googleProvider  = new firebase.auth.GoogleAuthProvider();

    // 한국어 설정
    _googleProvider.setCustomParameters({ hl: 'ko' });
    _firebaseAuth.languageCode = 'ko';

    _firebaseReady = true;
    console.log('[주보라] Firebase 초기화 완료');
    return true;

  } catch (err) {
    console.error('[주보라] Firebase 초기화 오류:', err);
    return false;
  }
}

/* ── 외부에서 사용하는 getter ── */
function getFirebaseAuth()     { return _firebaseAuth; }
function getGoogleProvider()   { return _googleProvider; }
function isFirebaseReady()     { return _firebaseReady; }
