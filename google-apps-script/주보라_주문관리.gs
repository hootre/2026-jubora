/**
 * ╔══════════════════════════════════════════════════════════╗
 *  주보라 주문 관리 시스템 – Google Apps Script
 *  버전: 1.0  |  작성: 2026
 * ╠══════════════════════════════════════════════════════════╣
 *  기능
 *  ① 구글 폼 제출 시 자동 주문번호 부여 (ORD-YYYYMMDD-NNN)
 *  ② 상태 컬럼 자동 추가 + 드롭다운 메뉴
 *  ③ 상태별 행 색상 자동 변경
 *  ④ 새 주문 접수 이메일 알림 (사업자)
 *  ⑤ 상태 변경 시 고객 이메일 알림
 *  ⑥ 대시보드 시트 (오늘 접수 / 상태별 집계)
 * ╠══════════════════════════════════════════════════════════╣
 *  설치 방법 (최초 1회)
 *  1. 구글 폼 연결된 스프레드시트 열기
 *  2. 확장 프로그램 → Apps Script 붙여넣기
 *  3. setupSheet() 실행 → 시트 초기화
 *  4. installTriggers() 실행 → 트리거 등록
 * ╚══════════════════════════════════════════════════════════╝
 */

// ══════════════════════════════════════════════════════════
//  ▶ CONFIG  (← 여기만 수정하세요)
// ══════════════════════════════════════════════════════════
const CONFIG = {
  // 알림 이메일 받을 주소 (사업자)
  OWNER_EMAIL: 'mm1895@naver.com',

  // 시트 이름
  ORDER_SHEET:     '주문목록',
  DASHBOARD_SHEET: '대시보드',

  // 상태 목록 (순서 = 진행 흐름)
  STATUSES: ['접수', '시안발송', '결제완료', '제작중', '배송중', '완료', '취소'],

  // 상태별 배경색
  STATUS_COLORS: {
    '접수':    '#FFF9C4',   // 연노랑
    '시안발송': '#E3F2FD',  // 연파랑
    '결제완료': '#E8F5E9',  // 연초록
    '제작중':  '#FFF3E0',   // 연주황
    '배송중':  '#E0F7FA',   // 연청록
    '완료':    '#F3F4F6',   // 연회색
    '취소':    '#FCE4EC',   // 연분홍
  },

  // 고객 이메일 알림 발송 여부 (상태별)
  NOTIFY_CUSTOMER_ON: ['시안발송', '배송중', '완료'],
};

// ══════════════════════════════════════════════════════════
//  ▶ 컬럼 구조 정의 (구글 폼 항목 순서와 일치시키세요)
//    Forms의 타임스탬프는 항상 A열(index 0)
// ══════════════════════════════════════════════════════════
const COLS = {
  TIMESTAMP:   0,   // A – 타임스탬프 (폼 자동)
  NAME:        1,   // B – 주문자 이름
  PHONE:       2,   // C – 연락처
  EMAIL:       3,   // D – 이메일
  ADDRESS:     4,   // E – 배송지 주소
  PRODUCT:     5,   // F – 제품 종류
  SIZE:        6,   // G – 크기
  MATERIAL:    7,   // H – 재질
  FINISH:      8,   // I – 마감
  QUANTITY:    9,   // J – 수량
  SIDED:       10,  // K – 양면 여부
  MAIN_TEXT:   11,  // L – 메인 문구
  SUB_TEXT:    12,  // M – 서브 문구
  FONT:        13,  // N – 글꼴
  PRICE:       14,  // O – 예상 금액
  REQUEST:     15,  // P – 요청사항
  DEADLINE:    16,  // Q – 희망 납기일

  // 아래 컬럼은 setupSheet()가 자동 추가
  ORDER_NUM:   17,  // R – 주문번호
  STATUS:      18,  // S – 상태
  MEMO:        19,  // T – 담당자 메모
};

// ══════════════════════════════════════════════════════════
//  ▶ 1. 시트 초기화 (최초 1회 실행)
// ══════════════════════════════════════════════════════════
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // ── 주문목록 시트 ──
  let sheet = ss.getSheetByName(CONFIG.ORDER_SHEET)
    || ss.insertSheet(CONFIG.ORDER_SHEET);

  // 헤더 배열
  const headers = [
    '타임스탬프', '주문자 이름', '연락처', '이메일', '배송지 주소',
    '제품 종류', '크기', '재질', '마감', '수량', '양면 여부',
    '메인 문구', '서브 문구', '글꼴', '예상 금액', '요청사항', '희망 납기일',
    '주문번호', '상태', '담당자 메모',
  ];

  // 헤더 행 설정
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground('#1a2332')
             .setFontColor('#ffffff')
             .setFontWeight('bold')
             .setFontSize(11);

  // 열 너비 설정
  const colWidths = {
    1:130, 2:100, 3:130, 4:160, 5:200,   // A~E
    6:80,  7:120, 8:80,  9:80,  10:60, 11:70, // F~K
    12:180, 13:180, 14:80, 15:100, 16:200, 17:100, // L~Q
    18:140, 19:90, 20:200,                          // R~T
  };
  Object.entries(colWidths).forEach(([col, width]) => {
    sheet.setColumnWidth(Number(col), width);
  });

  // 상태 컬럼 드롭다운 유효성 검사
  _applyStatusDropdown(sheet);

  // 헤더 고정
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(2);

  // ── 대시보드 시트 ──
  setupDashboard();

  SpreadsheetApp.getUi().alert(
    '✅ 주문 시트 초기화 완료!\n\n' +
    '다음으로 installTriggers()를 실행하여 트리거를 등록하세요.'
  );
}

// ══════════════════════════════════════════════════════════
//  ▶ 2. 트리거 등록 (최초 1회 실행)
// ══════════════════════════════════════════════════════════
function installTriggers() {
  const ss = SpreadsheetApp.getActive();

  // 기존 트리거 제거 (중복 방지)
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));

  // ① 폼 제출 트리거
  ScriptApp.newTrigger('onFormSubmit')
    .forSpreadsheet(ss)
    .onFormSubmit()
    .create();

  // ② 편집 트리거 (상태 변경 감지)
  ScriptApp.newTrigger('onEdit')
    .forSpreadsheet(ss)
    .onEdit()
    .create();

  // ③ 매일 오전 9시 – 대시보드 업데이트
  ScriptApp.newTrigger('refreshDashboard')
    .timeBased()
    .atHour(9)
    .everyDays(1)
    .create();

  SpreadsheetApp.getUi().alert(
    '✅ 트리거 등록 완료!\n\n' +
    '· 폼 제출 → 주문번호 자동 부여\n' +
    '· 상태 변경 → 행 색상 변경 + 고객 알림\n' +
    '· 매일 9시 → 대시보드 자동 갱신'
  );
}

// ══════════════════════════════════════════════════════════
//  ▶ 3. 폼 제출 이벤트 핸들러
// ══════════════════════════════════════════════════════════
function onFormSubmit(e) {
  try {
    const sheet = _getOrderSheet();
    const lastRow = sheet.getLastRow();

    // 방금 추가된 행 (폼 제출 = 마지막 행)
    const row = lastRow;

    // ── 주문번호 생성 ──
    const orderNum = _generateOrderNumber(sheet, row);
    sheet.getRange(row, COLS.ORDER_NUM + 1).setValue(orderNum);

    // ── 초기 상태: 접수 ──
    sheet.getRange(row, COLS.STATUS + 1).setValue('접수');

    // ── 행 색상 적용 ──
    _colorRow(sheet, row, '접수');

    // ── 주문번호 굵게 ──
    sheet.getRange(row, COLS.ORDER_NUM + 1)
         .setFontWeight('bold')
         .setFontColor('#0367A6');

    // ── 사업자 이메일 알림 ──
    _notifyOwner(sheet, row, orderNum);

    // ── 대시보드 갱신 ──
    refreshDashboard();

  } catch(err) {
    Logger.log('onFormSubmit 오류: ' + err.message);
  }
}

// ══════════════════════════════════════════════════════════
//  ▶ 4. 편집 이벤트 핸들러 (상태 변경 감지)
// ══════════════════════════════════════════════════════════
function onEdit(e) {
  try {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== CONFIG.ORDER_SHEET) return;

    const col = e.range.getColumn();
    const row = e.range.getRow();

    // 상태 컬럼(S열) 변경 시에만 처리
    if (col !== COLS.STATUS + 1) return;
    if (row <= 1) return; // 헤더 제외

    const newStatus = e.range.getValue();
    if (!CONFIG.STATUSES.includes(newStatus)) return;

    // ── 행 색상 변경 ──
    _colorRow(sheet, row, newStatus);

    // ── 고객 이메일 알림 ──
    if (CONFIG.NOTIFY_CUSTOMER_ON.includes(newStatus)) {
      const email     = sheet.getRange(row, COLS.EMAIL + 1).getValue();
      const orderNum  = sheet.getRange(row, COLS.ORDER_NUM + 1).getValue();
      const name      = sheet.getRange(row, COLS.NAME + 1).getValue();
      if (email) {
        _notifyCustomer(email, name, orderNum, newStatus);
      }
    }

    // ── 대시보드 갱신 ──
    refreshDashboard();

  } catch(err) {
    Logger.log('onEdit 오류: ' + err.message);
  }
}

// ══════════════════════════════════════════════════════════
//  ▶ 5. 대시보드 시트 설정 및 갱신
// ══════════════════════════════════════════════════════════
function setupDashboard() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let dash    = ss.getSheetByName(CONFIG.DASHBOARD_SHEET);
  if (!dash)  dash = ss.insertSheet(CONFIG.DASHBOARD_SHEET, 0);

  dash.clear();
  dash.setColumnWidth(1, 160);
  dash.setColumnWidth(2, 100);
  dash.setColumnWidth(3, 100);
  dash.setColumnWidth(4, 160);

  // 타이틀
  const title = dash.getRange('A1:D1');
  title.merge()
       .setValue('📊 주보라 주문 대시보드')
       .setBackground('#1a2332')
       .setFontColor('#FEE500')
       .setFontSize(16)
       .setFontWeight('bold')
       .setHorizontalAlignment('center')
       .setVerticalAlignment('middle');
  dash.setRowHeight(1, 50);

  refreshDashboard();
}

function refreshDashboard() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const dash  = ss.getSheetByName(CONFIG.DASHBOARD_SHEET);
  const oSht  = _getOrderSheet();

  if (!dash || !oSht) return;

  const now   = new Date();
  const today = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');

  // 전체 데이터 읽기 (헤더 제외)
  const lastRow = oSht.getLastRow();
  const orders  = lastRow > 1
    ? oSht.getRange(2, 1, lastRow - 1, headers_count()).getValues()
    : [];

  // ── 오늘 접수 수 ──
  const todayOrders = orders.filter(r => {
    const ts = r[COLS.TIMESTAMP];
    if (!ts) return false;
    return Utilities.formatDate(new Date(ts), 'Asia/Seoul', 'yyyy-MM-dd') === today;
  });

  // ── 상태별 집계 ──
  const statusCount = {};
  CONFIG.STATUSES.forEach(s => { statusCount[s] = 0; });
  orders.forEach(r => {
    const st = r[COLS.STATUS];
    if (statusCount.hasOwnProperty(st)) statusCount[st]++;
  });

  // ── 이번 주 매출 합계 ──
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0,0,0,0);
  const weekRevenue = orders
    .filter(r => r[COLS.TIMESTAMP] && new Date(r[COLS.TIMESTAMP]) >= weekStart)
    .reduce((sum, r) => {
      const p = String(r[COLS.PRICE] || '').replace(/[^0-9]/g, '');
      return sum + (Number(p) || 0);
    }, 0);

  // ── 전체 누적 ──
  const totalRevenue = orders.reduce((sum, r) => {
    const p = String(r[COLS.PRICE] || '').replace(/[^0-9]/g, '');
    return sum + (Number(p) || 0);
  }, 0);

  // ── 대시보드 쓰기 ──
  const style = (range, bg, color, bold, size) => {
    range.setBackground(bg).setFontColor(color)
         .setFontWeight(bold ? 'bold' : 'normal')
         .setFontSize(size || 11)
         .setVerticalAlignment('middle');
  };

  // 갱신 시각
  dash.getRange('A2:D2').merge()
      .setValue('마지막 갱신: ' + Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'))
      .setFontColor('#888888').setFontSize(10)
      .setHorizontalAlignment('right');

  // 섹션 헤더 – 오늘 통계
  _dashSection(dash, 3, '📅 오늘 (' + today + ')');
  _dashRow(dash, 4, '신규 접수',    todayOrders.length + '건', '#FFF9C4');
  _dashRow(dash, 5, '미처리 접수',  statusCount['접수'] + '건', '#FFF9C4');

  _dashSection(dash, 7, '📦 상태별 현황');
  let r = 8;
  CONFIG.STATUSES.forEach(s => {
    _dashRow(dash, r++, s, statusCount[s] + '건',
             CONFIG.STATUS_COLORS[s] || '#ffffff');
  });

  _dashSection(dash, r + 1, '💰 매출 현황');
  _dashRow(dash, r + 2, '이번 주 예상 매출', _fmtKRW(weekRevenue),  '#E8F5E9');
  _dashRow(dash, r + 3, '누적 예상 매출',    _fmtKRW(totalRevenue), '#E8F5E9');
  _dashRow(dash, r + 4, '전체 주문 수',      orders.length + '건',  '#F3F4F6');

  _dashSection(dash, r + 6, '🔥 최근 5건');
  const recent = orders.slice(-5).reverse();
  let rr = r + 7;
  recent.forEach(ord => {
    const ordNum = ord[COLS.ORDER_NUM] || '-';
    const name   = ord[COLS.NAME]      || '-';
    const status = ord[COLS.STATUS]    || '-';
    const price  = String(ord[COLS.PRICE] || '').replace(/[^0-9]/g, '');
    dash.getRange(rr, 1).setValue(ordNum);
    dash.getRange(rr, 2).setValue(name);
    dash.getRange(rr, 3).setValue(status);
    dash.getRange(rr, 4).setValue(price ? _fmtKRW(Number(price)) : '-');
    dash.getRange(rr, 1, 1, 4)
        .setBackground(CONFIG.STATUS_COLORS[status] || '#f8f9fa')
        .setFontSize(10);
    rr++;
  });
}

// ── 대시보드 헬퍼 ──
function _dashSection(sheet, row, label) {
  const r = sheet.getRange(row, 1, 1, 4);
  r.merge().setValue(label)
   .setBackground('#334155').setFontColor('#fff')
   .setFontWeight('bold').setFontSize(12)
   .setVerticalAlignment('middle');
  sheet.setRowHeight(row, 36);
}

function _dashRow(sheet, row, key, val, bg) {
  sheet.getRange(row, 1, 1, 2).merge().setValue(key)
       .setBackground(bg || '#f8f9fa')
       .setFontWeight('bold').setFontSize(11)
       .setVerticalAlignment('middle');
  sheet.getRange(row, 3, 1, 2).merge().setValue(val)
       .setBackground(bg || '#f8f9fa')
       .setHorizontalAlignment('right').setFontSize(12)
       .setFontWeight('bold').setVerticalAlignment('middle');
  sheet.setRowHeight(row, 34);
}

// ══════════════════════════════════════════════════════════
//  ▶ 6. 이메일 알림 함수
// ══════════════════════════════════════════════════════════

/** 사업자 알림 이메일 */
function _notifyOwner(sheet, row, orderNum) {
  const vals = sheet.getRange(row, 1, 1, headers_count()).getValues()[0];

  const name     = vals[COLS.NAME]     || '-';
  const phone    = vals[COLS.PHONE]    || '-';
  const email    = vals[COLS.EMAIL]    || '-';
  const product  = vals[COLS.PRODUCT]  || '-';
  const size     = vals[COLS.SIZE]     || '-';
  const material = vals[COLS.MATERIAL] || '-';
  const finish   = vals[COLS.FINISH]   || '-';
  const qty      = vals[COLS.QUANTITY] || '-';
  const sided    = vals[COLS.SIDED]    || '-';
  const mainText = vals[COLS.MAIN_TEXT]|| '-';
  const subText  = vals[COLS.SUB_TEXT] || '-';
  const price    = vals[COLS.PRICE]    || '-';
  const request  = vals[COLS.REQUEST]  || '-';
  const deadline = vals[COLS.DEADLINE] || '-';
  const ts       = Utilities.formatDate(new Date(vals[COLS.TIMESTAMP]),
                     'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  const subject = '[주보라] 새 주문 접수 – ' + orderNum + ' / ' + name + '님';

  const body = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 새 주문이 접수되었습니다
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[주문 정보]
주문번호: ${orderNum}
접수 시각: ${ts}

[고객 정보]
이름:     ${name}
연락처:   ${phone}
이메일:   ${email}

[제품 옵션]
제품 종류: ${product}
크기:      ${size}
재질:      ${material}  /  마감: ${finish}
수량:      ${qty}개  /  인쇄: ${sided}
예상 금액: ${price}
희망 납기: ${deadline}

[디자인 내용]
메인 문구: ${mainText}
서브 문구: ${subText}

[요청사항]
${request}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ 스프레드시트에서 확인: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

  // HTML 버전
  const htmlBody = `
<div style="font-family:'Apple SD Gothic Neo',sans-serif;max-width:560px;margin:0 auto;">
  <div style="background:#1a2332;padding:24px;border-radius:12px 12px 0 0;text-align:center;">
    <h1 style="color:#FEE500;margin:0;font-size:20px;">📦 새 주문 접수</h1>
    <p style="color:rgba(255,255,255,.7);margin:6px 0 0;font-size:13px;">${ts}</p>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;">

    <div style="background:#eff6ff;border-left:4px solid #0367A6;padding:14px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
      <p style="margin:0;font-size:13px;color:#64748b;">주문번호</p>
      <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#0367A6;font-family:monospace;">${orderNum}</p>
    </div>

    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr style="background:#f8fafc;">
        <th colspan="2" style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">고객 정보</th>
      </tr>
      ${_tr('이름',     name)}
      ${_tr('연락처',   phone)}
      ${_tr('이메일',   email)}
      <tr style="background:#f8fafc;">
        <th colspan="2" style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">제품 옵션</th>
      </tr>
      ${_tr('제품',     product)}
      ${_tr('크기',     size)}
      ${_tr('재질/마감', material + ' / ' + finish)}
      ${_tr('수량',     qty + '개 (' + sided + ')')}
      ${_tr('희망납기', deadline)}
      ${_tr('예상금액', '<strong style="color:#e11d48;font-size:16px;">' + price + '</strong>')}
      <tr style="background:#f8fafc;">
        <th colspan="2" style="padding:10px 12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:.05em;">디자인 내용</th>
      </tr>
      ${_tr('메인 문구', mainText)}
      ${_tr('서브 문구', subText || '-')}
      ${_tr('요청사항',  request || '-')}
    </table>

    <div style="margin-top:20px;text-align:center;">
      <a href="${SpreadsheetApp.getActiveSpreadsheet().getUrl()}"
         style="display:inline-block;background:#0367A6;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        📊 스프레드시트에서 확인하기
      </a>
    </div>

  </div>
</div>`;

  GmailApp.sendEmail(CONFIG.OWNER_EMAIL, subject, body, {
    htmlBody: htmlBody,
    name: '주보라 주문 시스템',
  });
}

function _tr(key, val) {
  return `<tr>
    <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600;width:100px;">${key}</td>
    <td style="padding:9px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b;">${val}</td>
  </tr>`;
}

/** 고객 알림 이메일 (상태 변경 시) */
function _notifyCustomer(email, name, orderNum, status) {
  const messages = {
    '시안발송': {
      subject: '[주보라] 시안을 발송했습니다 – ' + orderNum,
      body: `${name}님, 안녕하세요! 주보라입니다.\n\n` +
            `주문번호 ${orderNum}의 시안을 카카오톡으로 발송했습니다.\n` +
            `카카오톡 채널(@jubora)에서 확인해 주세요.\n\n` +
            `수정 사항이 있으시면 카카오톡으로 알려주세요.\n\n감사합니다.`,
      color: '#0367A6',
      icon: '📐',
    },
    '배송중': {
      subject: '[주보라] 배송이 시작되었습니다 – ' + orderNum,
      body: `${name}님, 안녕하세요! 주보라입니다.\n\n` +
            `주문번호 ${orderNum}의 제품이 배송 시작되었습니다.\n` +
            `배송 조회는 카카오톡으로 안내드리겠습니다.\n\n감사합니다.`,
      color: '#0e7490',
      icon: '🚚',
    },
    '완료': {
      subject: '[주보라] 주문이 완료되었습니다 – ' + orderNum,
      body: `${name}님, 안녕하세요! 주보라입니다.\n\n` +
            `주문번호 ${orderNum}의 모든 과정이 완료되었습니다.\n` +
            `이용해 주셔서 감사합니다! 다음에 또 찾아주세요.\n\n주보라 드림.`,
      color: '#15803d',
      icon: '✅',
    },
  };

  const msg = messages[status];
  if (!msg) return;

  const htmlBody = `
<div style="font-family:'Apple SD Gothic Neo',sans-serif;max-width:480px;margin:0 auto;">
  <div style="background:${msg.color};padding:28px;border-radius:12px 12px 0 0;text-align:center;">
    <div style="font-size:2.5rem;">${msg.icon}</div>
    <h1 style="color:#fff;margin:8px 0 0;font-size:18px;">${msg.subject.replace('[주보라] ','')}</h1>
  </div>
  <div style="border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:24px;text-align:center;">
    <p style="font-size:14px;color:#475569;line-height:1.8;">${msg.body.replace(/\n/g,'<br>')}</p>
    <div style="margin-top:20px;padding:14px;background:#f8fafc;border-radius:8px;display:inline-block;">
      <p style="margin:0;font-size:12px;color:#94a3b8;">주문번호</p>
      <p style="margin:4px 0 0;font-size:18px;font-weight:800;color:${msg.color};font-family:monospace;">${orderNum}</p>
    </div>
    <div style="margin-top:20px;">
      <a href="https://pf.kakao.com/jubora"
         style="display:inline-block;background:#FEE500;color:#391B1B;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;">
        💬 카카오톡 채널 확인
      </a>
    </div>
    <p style="font-size:11px;color:#cbd5e1;margin-top:20px;">
      주보라 | 경기도 하남시 미사강변한강로 135 | 010-7737-1895
    </p>
  </div>
</div>`;

  GmailApp.sendEmail(email, msg.subject, msg.body, {
    htmlBody: htmlBody,
    name: '주보라',
  });
}

// ══════════════════════════════════════════════════════════
//  ▶ 유틸리티 함수
// ══════════════════════════════════════════════════════════

/** 주문번호 생성: ORD-YYYYMMDD-NNN */
function _generateOrderNumber(sheet, currentRow) {
  const today   = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyyMMdd');
  const prefix  = 'ORD-' + today + '-';

  // 오늘 날짜의 기존 주문 수 카운트
  const lastRow = sheet.getLastRow();
  let todayCount = 0;

  if (lastRow > 1) {
    const orderNums = sheet.getRange(2, COLS.ORDER_NUM + 1, lastRow - 1, 1).getValues();
    todayCount = orderNums.filter(r => String(r[0]).startsWith(prefix)).length;
  }

  // 현재 행은 아직 주문번호 없으므로 +1
  const seq = String(todayCount + 1).padStart(3, '0');
  return prefix + seq;
}

/** 상태에 따라 행 배경색 변경 */
function _colorRow(sheet, row, status) {
  const bg   = CONFIG.STATUS_COLORS[status] || '#ffffff';
  const cols = headers_count();
  sheet.getRange(row, 1, 1, cols).setBackground(bg);
  // 주문번호 열 색상은 유지
  sheet.getRange(row, COLS.ORDER_NUM + 1)
       .setFontColor('#0367A6')
       .setFontWeight('bold');
}

/** 상태 컬럼 드롭다운 적용 */
function _applyStatusDropdown(sheet) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(CONFIG.STATUSES, true)
    .setAllowInvalid(false)
    .build();
  // 2행부터 1000행까지 상태 컬럼에 적용
  sheet.getRange(2, COLS.STATUS + 1, 999, 1).setDataValidation(rule);
}

/** 주문목록 시트 반환 */
function _getOrderSheet() {
  return SpreadsheetApp.getActiveSpreadsheet()
           .getSheetByName(CONFIG.ORDER_SHEET);
}

/** 헤더 컬럼 수 */
function headers_count() {
  return Object.keys(COLS).length;
}

/** 금액 포맷 */
function _fmtKRW(num) {
  return num.toLocaleString('ko-KR') + '원';
}

// ══════════════════════════════════════════════════════════
//  ▶ 메뉴 추가 (스프레드시트 열 때 자동 생성)
// ══════════════════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🏷 주보라 관리')
    .addItem('① 시트 초기화 (최초 1회)', 'setupSheet')
    .addItem('② 트리거 등록 (최초 1회)', 'installTriggers')
    .addSeparator()
    .addItem('대시보드 새로고침', 'refreshDashboard')
    .addItem('상태 드롭다운 재적용', '_applyStatusDropdownMenu')
    .addSeparator()
    .addItem('테스트: 샘플 알림 이메일 발송', 'testEmail')
    .addToUi();
}

function _applyStatusDropdownMenu() {
  _applyStatusDropdown(_getOrderSheet());
  SpreadsheetApp.getUi().alert('상태 드롭다운이 재적용되었습니다.');
}

// ══════════════════════════════════════════════════════════
//  ▶ 테스트 함수
// ══════════════════════════════════════════════════════════
function testEmail() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    '테스트 이메일 발송',
    CONFIG.OWNER_EMAIL + ' 으로 샘플 알림 이메일을 보내시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  if (result !== ui.Button.YES) return;

  GmailApp.sendEmail(
    CONFIG.OWNER_EMAIL,
    '[주보라] 테스트 이메일 – 스크립트 정상 작동 확인',
    '주보라 Apps Script가 정상적으로 설치되었습니다!\n\n이제 구글 폼 제출 시 자동으로 주문 알림이 발송됩니다.',
    {
      name: '주보라 주문 시스템',
      htmlBody: `<div style="font-family:sans-serif;padding:24px;text-align:center;">
        <h2 style="color:#0367A6;">✅ 주보라 Apps Script 설치 완료!</h2>
        <p>구글 폼 제출 시 자동으로 주문 알림이 발송됩니다.</p>
        <p style="color:#888;font-size:12px;">수신 주소: ${CONFIG.OWNER_EMAIL}</p>
      </div>`,
    }
  );
  ui.alert('✅ 테스트 이메일을 발송했습니다.\n받은편지함을 확인해주세요.');
}
