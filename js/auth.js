/* =============================================
   주보라 - 인증 시스템 (Auth.js)
   ─────────────────────────────────────────────
   • Firebase 설정 완료 시: Google + 이메일 Firebase 인증
   • Firebase 미설정 시: localStorage 기반 데모 인증
   ============================================= */

const Auth = (() => {

  const USERS_KEY            = 'jubora_users';
  const SESSION_KEY          = 'jubora_session';
  const SESSION_PERSIST_KEY  = 'jubora_session_persist';

  /* ── 관리자 계정 (하드코딩) ── */
  const ADMIN_ACCOUNTS = [
    { id: 'mm1895', pw: '6303', name: '관리자', role: 'admin' },
  ];

  /* ══════════════════════════════════════════
     내부 유틸
  ══════════════════════════════════════════ */

  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
    catch { return []; }
  }
  function saveUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

  function getSession() {
    try {
      const p = localStorage.getItem(SESSION_PERSIST_KEY);
      if (p) return JSON.parse(p);
      const s = sessionStorage.getItem(SESSION_KEY);
      if (s) return JSON.parse(s);
    } catch {}
    return null;
  }

  function saveSession(session, persistent = false) {
    const data = JSON.stringify(session);
    if (persistent) {
      localStorage.setItem(SESSION_PERSIST_KEY, data);
    } else {
      sessionStorage.setItem(SESSION_KEY, data);
    }
  }

  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_PERSIST_KEY);
  }

  /* 간단 해시 (데모용) */
  function simpleHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
    return (h >>> 0).toString(16);
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  /* firebase-config.js 미로드 시 안전 래퍼 */
  function _isFirebaseReady() {
    return typeof isFirebaseReady === 'function' && isFirebaseReady();
  }
  function _getFirebaseAuth() {
    return typeof getFirebaseAuth === 'function' ? getFirebaseAuth() : null;
  }
  function _getGoogleProvider() {
    return typeof getGoogleProvider === 'function' ? getGoogleProvider() : null;
  }

  /* Firebase 세션으로 변환 */
  function firebaseUserToSession(fbUser) {
    return {
      id:         fbUser.uid,
      email:      fbUser.email,
      name:       fbUser.displayName || fbUser.email.split('@')[0],
      phone:      fbUser.phoneNumber || '',
      photoURL:   fbUser.photoURL || '',
      provider:   fbUser.providerData[0]?.providerId || 'password',
      church:     '',
      role:       'member',
      loginAt:    new Date().toISOString(),
    };
  }

  /* ══════════════════════════════════════════
     Google 로그인
  ══════════════════════════════════════════ */

  async function loginWithGoogle() {
    if (!_isFirebaseReady()) {
      return { success: false, message: 'Firebase 설정이 필요합니다. js/firebase-config.js를 확인해주세요.' };
    }
    try {
      const auth     = _getFirebaseAuth();
      const provider = _getGoogleProvider();
      const result   = await auth.signInWithPopup(provider);
      const session  = firebaseUserToSession(result.user);
      saveSession(session, true);
      return { success: true, user: session, isNew: result.additionalUserInfo?.isNewUser };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: null }; // 사용자가 닫은 경우 – 조용히 처리
      }
      console.error('[Auth] Google 로그인 오류:', err);
      return { success: false, message: '구글 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }

  /* ══════════════════════════════════════════
     이메일/비밀번호 로그인
  ══════════════════════════════════════════ */

  async function login(email, password, persistent = false) {
    /* ── 관리자 계정 체크 (username 기반) ── */
    const adminMatch = ADMIN_ACCOUNTS.find(
      a => a.id === email.trim() && a.pw === password
    );
    if (adminMatch) {
      const session = {
        id: 'admin_' + adminMatch.id,
        email: adminMatch.id + '@jubora.admin',
        name: adminMatch.name,
        phone: '', church: '', photoURL: '',
        provider: 'local', role: 'admin',
        loginAt: new Date().toISOString(),
      };
      saveSession(session, persistent);
      return { success: true, user: session };
    }

    /* Firebase 사용 가능 시 */
    if (_isFirebaseReady()) {
      try {
        const fbResult = await _getFirebaseAuth().signInWithEmailAndPassword(email, password);
        const session  = firebaseUserToSession(fbResult.user);
        saveSession(session, persistent);
        return { success: true, user: session };
      } catch (err) {
        const msg = {
          'auth/user-not-found':   '등록되지 않은 이메일입니다.',
          'auth/wrong-password':   '비밀번호가 올바르지 않습니다.',
          'auth/too-many-requests':'잠시 후 다시 시도해주세요.',
          'auth/user-disabled':    '비활성화된 계정입니다.',
        }[err.code] || '로그인에 실패했습니다.';
        return { success: false, message: msg };
      }
    }

    /* localStorage 데모 모드 */
    await delay(500);
    const users = getUsers();
    const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user)                         return { success: false, message: '등록되지 않은 이메일입니다.' };
    if (user.pwHash !== simpleHash(password)) return { success: false, message: '비밀번호가 올바르지 않습니다.' };

    const session = {
      id: user.id, email: user.email, name: user.name,
      phone: user.phone, church: user.church || '',
      photoURL: '', provider: 'password', role: user.role || 'member',
      loginAt: new Date().toISOString(),
    };
    saveSession(session, persistent);
    return { success: true, user: session };
  }

  /* ══════════════════════════════════════════
     회원가입
  ══════════════════════════════════════════ */

  async function register(userData) {
    /* Firebase 사용 가능 시 */
    if (_isFirebaseReady()) {
      try {
        const cred    = await _getFirebaseAuth().createUserWithEmailAndPassword(userData.email, userData.password);
        await cred.user.updateProfile({ displayName: userData.name });

        const session = {
          ...firebaseUserToSession(cred.user),
          name:    userData.name,
          phone:   userData.phone   || '',
          church:  userData.church  || '',
          address: userData.address || '',
        };
        saveSession(session, false);
        return { success: true, user: session };
      } catch (err) {
        const msg = {
          'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
          'auth/weak-password':        '비밀번호는 6자 이상이어야 합니다.',
          'auth/invalid-email':        '올바른 이메일 형식이 아닙니다.',
        }[err.code] || '회원가입에 실패했습니다.';
        return { success: false, message: msg };
      }
    }

    /* localStorage 데모 모드 */
    await delay(600);
    const users = getUsers();
    if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      return { success: false, message: '이미 사용 중인 이메일입니다.' };
    }
    const newUser = {
      id: Date.now().toString(), email: userData.email.toLowerCase().trim(),
      pwHash: simpleHash(userData.password), name: userData.name,
      phone: userData.phone, church: userData.church || '',
      address: userData.address || '', marketing: userData.marketing || false,
      role: 'member', createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveUsers(users);
    const session = {
      id: newUser.id, email: newUser.email, name: newUser.name,
      phone: newUser.phone, church: newUser.church,
      photoURL: '', provider: 'password', role: 'member',
      loginAt: new Date().toISOString(),
    };
    saveSession(session, false);
    return { success: true, user: session };
  }

  /* ══════════════════════════════════════════
     로그아웃
  ══════════════════════════════════════════ */

  async function logout() {
    if (_isFirebaseReady()) {
      try { await (_getFirebaseAuth())?.signOut(); } catch {}
    }
    clearSession();
    location.href = 'index.html';
  }

  /* ══════════════════════════════════════════
     상태 조회
  ══════════════════════════════════════════ */

  function isLoggedIn()    { return getSession() !== null; }
  function getCurrentUser(){ return getSession(); }
  function emailExists(email) {
    return getUsers().some(u => u.email.toLowerCase() === email.toLowerCase());
  }

  /* ══════════════════════════════════════════
     헤더 자동 업데이트
  ══════════════════════════════════════════ */

  function updateHeaderUI() {
    const user     = getCurrentUser();
    const topLinks = document.querySelector('.header-top-links');
    if (!topLinks) return;

    if (user) {
      const displayName = user.name || user.email;
      const avatarHtml  = user.photoURL
        ? `<img src="${user.photoURL}" alt="" style="width:24px;height:24px;border-radius:50%;vertical-align:middle;margin-right:5px;flex-shrink:0;">`
        : '';
      topLinks.innerHTML = `
        <span style="display:inline-flex;align-items:center;opacity:.85;white-space:nowrap;line-height:1;">${avatarHtml}${displayName} 님</span>
        <a href="mypage.html">마이페이지</a>
        <a href="order.html">주문하기</a>
        <a href="#" id="hdr-logout">로그아웃</a>
      `;
      document.getElementById('hdr-logout')?.addEventListener('click', (e) => {
        e.preventDefault(); logout();
      });
    } else {
      topLinks.innerHTML = `
        <a href="login.html">로그인</a>
        <a href="register.html">회원가입</a>
        <a href="#">고객센터</a>
        <a href="order.html">주문조회</a>
      `;
    }

    document.querySelectorAll('.header-action-btn').forEach(btn => {
      if (btn.textContent.includes('마이페이지')) {
        btn.addEventListener('click', () => {
          location.href = user ? 'mypage.html' : 'login.html?redirect=mypage.html';
        });
      }
    });
  }

  /* DOM 준비 후 자동 실행 */
  function _init() {
    // Firebase 초기화 시도
    if (typeof initFirebase === 'function') initFirebase();

    // Firebase auth 상태 변화 감지 (로그인 유지)
    if (_isFirebaseReady()) {
      _getFirebaseAuth().onAuthStateChanged((fbUser) => {
        if (fbUser && !getSession()) {
          const session = firebaseUserToSession(fbUser);
          saveSession(session, true);
          updateHeaderUI();
        }
      });
    }

    updateHeaderUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

  return {
    loginWithGoogle,
    login,
    logout,
    register,
    isLoggedIn,
    getCurrentUser,
    emailExists,
    updateHeaderUI,
  };

})();
