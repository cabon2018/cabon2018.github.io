/* ============================================================
   김영범 Photography — 동작 스크립트
   하는 일: 메뉴 열고 닫기, 갤러리 불러오기·분류, 사진 크게 보기,
            문의 버튼 클릭을 GA4로 보내기
   ※ 사진 목록은 이 파일이 아니라 photos.json 에 있습니다.
   ============================================================ */
(function () {
  'use strict';

  /* ── 설정: 자리표시 회색 칸을 몇 개 보여 줄지 ───────────── */
  var EMPTY_SLOTS = 6;

  /* ── 분류 이름 (photos.json 의 category 값 → 화면에 보일 이름) ──
     분류를 더 만들고 싶으면 여기에 한 줄 추가하고,
     index.html 의 분류 버튼도 한 줄 추가하면 됩니다. */
  var LABELS = { portrait: '인물', couple: '커플', street: '거리' };

  /* ── GA4 전환 이벤트 보내기 ───────────────────────────────
     GA4 를 아직 안 붙였으면 아무 일도 하지 않고 조용히 넘어갑니다.
     (오류가 나지 않습니다) */
  function trackLead(label) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          method: label,            // 어떤 버튼인지 구분하는 값
          event_category: 'contact'
        });
      }
      /* ── 네이버 검색광고 전환 추적 ──────────────────────────
         네이버 광고주센터 > 도구 > 전환추적 에서 받은 코드를 쓸 때,
         "버튼 클릭을 전환으로 보낼" 경우 아래 주석을 풀고
         wcs_do 안의 값을 받은 코드대로 고치세요.

         if (typeof window.wcs !== 'undefined' && window.wcs_do) {
           window.wcs.cnv = wcs.cnv('4', '1');   // 전환유형, 전환가치
           window.wcs_do();
         }
      */
    } catch (e) {
      /* 추적이 실패해도 사이트는 그대로 동작해야 하므로 무시합니다 */
    }
  }
  window.trackLead = trackLead;

  /* 문의 관련 버튼(이메일·인스타그램·첫 화면 버튼)에 전환 이벤트 연결 */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-lead]');
    if (el) trackLead(el.getAttribute('data-lead'));
  });

  /* ── 상단 메뉴 ─────────────────────────────────────────── */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    /* 메뉴를 누르면 닫히게 */
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* 화면을 내리면 머리 부분에 선이 생기게 */
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* 지금 보고 있는 섹션을 메뉴에서 표시 */
  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]')) : [];
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id ? 'true' : 'false');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ── 첫 화면 등장 움직임 (한 번만) ──────────────────────── */
  var hero = document.querySelector('.hero');
  if (hero) {
    hero.querySelectorAll('[data-rise]').forEach(function (el, i) {
      el.style.setProperty('--k', i);
    });
    requestAnimationFrame(function () { hero.classList.add('entered'); });
  }

  /* ── 갤러리 ────────────────────────────────────────────── */
  var gallery = document.getElementById('gallery');
  var note = document.getElementById('galleryNote');
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var photos = [];     // photos.json 에서 읽은 전체 목록
  var shown = [];      // 지금 화면에 보이는 목록 (크게 보기에서 넘길 때 사용)

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function emptyGrid() {
    var html = '';
    for (var i = 0; i < EMPTY_SLOTS; i++) {
      html += '<div class="shot is-empty" aria-hidden="true"></div>';
    }
    return html;
  }

  function render(filter) {
    if (!gallery) return;

    if (!photos.length) {
      gallery.innerHTML = emptyGrid();
      shown = [];
      if (note) note.textContent = '촬영한 사진을 차례로 올리고 있습니다. 촬영 문의는 이메일로 받습니다.';
      return;
    }

    shown = (filter && filter !== 'all')
      ? photos.filter(function (p) { return p.category === filter; })
      : photos.slice();

    if (!shown.length) {
      gallery.innerHTML = emptyGrid();
      if (note) note.textContent = '이 분류에는 아직 사진이 없습니다.';
      return;
    }

    gallery.innerHTML = shown.map(function (p, i) {
      var thumb = p.thumb || ('images/thumbs/' + p.file);
      var label = LABELS[p.category] || p.category || '';
      var alt = p.alt || (label ? label + ' 촬영 사진' : '촬영 사진');
      return '<button type="button" class="shot" data-index="' + i + '">' +
               '<img src="' + esc(thumb) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
             '</button>';
    }).join('');

    if (note) note.textContent = '';
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      render(btn.getAttribute('data-filter'));
    });
  });

  /* photos.json 읽기 — 없거나 잘못돼도 사이트가 깨지지 않게 */
  if (gallery) {
    render('all');   // 먼저 회색 칸을 보여 주고
    fetch('photos.json', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        var list = data && (Array.isArray(data) ? data : data.photos);
        if (!Array.isArray(list)) return;
        photos = list.filter(function (p) { return p && p.file; });
        var active = document.querySelector('.filter[aria-pressed="true"]');
        render(active ? active.getAttribute('data-filter') : 'all');
      })
      .catch(function () { /* 그대로 회색 칸을 유지합니다 */ });
  }

  /* ── 사진 크게 보기 ────────────────────────────────────── */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCaption');
  var cur = 0;
  var lastFocus = null;

  function open(i) {
    if (!lb || !shown.length) return;
    cur = (i + shown.length) % shown.length;
    var p = shown[cur];
    var label = LABELS[p.category] || p.category || '';
    lbImg.src = p.full || ('images/' + p.file);
    lbImg.alt = p.alt || (label ? label + ' 촬영 사진' : '촬영 사진');
    if (lbCap) lbCap.textContent = (cur + 1) + ' / ' + shown.length + (label ? ' · ' + label : '');
    lastFocus = document.activeElement;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var close = lb.querySelector('.lb-close');
    if (close) close.focus();
  }

  function close() {
    if (!lb) return;
    /* 숨기기 전에 포커스를 먼저 돌려보냅니다.
       (숨긴 창 안에 포커스가 남으면 화면 읽기 프로그램이 길을 잃습니다) */
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();

    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  if (gallery) {
    gallery.addEventListener('click', function (e) {
      var btn = e.target.closest('.shot[data-index]');
      if (btn) open(parseInt(btn.getAttribute('data-index'), 10));
    });
  }

  if (lb) {
    lb.addEventListener('click', function (e) {
      var act = e.target.closest('[data-lb]');
      if (act) {
        var a = act.getAttribute('data-lb');
        if (a === 'close') close();
        if (a === 'prev') open(cur - 1);
        if (a === 'next') open(cur + 1);
        return;
      }
      /* 사진 바깥(어두운 곳)을 누르면 닫기 */
      if (!e.target.closest('figure')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') open(cur - 1);
      if (e.key === 'ArrowRight') open(cur + 1);
    });
  }

  /* 하단 저작권 연도 자동 표시 */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
