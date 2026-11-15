/* Giriş kapısı. Fikirler yalnızca giriş yapan ve izni olan kişiye yüklenir.
   SAÜ personeli sakarya.edu.tr adresiyle, diğerleri yönetici davetiyle girer. */
(function () {
  var L = (document.documentElement.lang || 'tr').slice(0, 2) === 'en' ? 'en' : 'tr';
  var T = {
    tr: {
      brand: 'Fikir <span>Sepeti</span>', eyebrow: 'Sakarya Teknokent · Kurum içi',
      lead: 'Sakarya Teknokent’in kurum içi fikir dosyası. Fikirleri görmek için giriş yapın.',
      google: 'Google ile giriş yap', or: 'ya da e-posta bağlantısıyla', email: 'E-posta adresiniz', send: 'Giriş bağlantısı gönder',
      sent: '{e} adresine bir giriş bağlantısı gönderildi. E-postadaki bağlantıya bu cihazdan dokunun. Birkaç dakika içinde gelmezse gereksiz (spam) klasörüne bakın.',
      who: 'SAÜ personeli sakarya.edu.tr adresiyle girebilir. Teknokent dışından katılımcılar davetle girer.',
      denied: '{e} hesabının bu dosyaya erişim izni yok. Davet için Sakarya Teknokent Özel Kalem’e başvurun.',
      other: 'Başka hesapla giriş yap', wait: 'Giriş yapılıyor…', err: 'Giriş yapılamadı. Yeniden deneyin.',
      confirm: 'Bağlantıyı açtığınız e-posta adresini yazın; giriş tamamlansın.', finish: 'Girişi tamamla',
      empty: 'İçerik henüz yüklenmedi. Yönetici panelinden içerik dosyasını yükleyin.', load: 'Fikirler yükleniyor…',
      offline: 'Bağlantı yok; bu cihazda daha önce açılan sürüm gösteriliyor.', out: 'Çıkış yap', signed: 'Giriş:',
      bad: 'Geçerli bir e-posta adresi yazın.', demo: 'Deneme modu: e-posta gönderilmeden giriş yapıldı.',
      privacy: 'Kişisel veriler', lang: 'EN', langHref: 'en.html', langTitle: 'English version'
    },
    en: {
      brand: 'Idea <span>Basket</span>', eyebrow: 'Sakarya Teknokent · Internal',
      lead: 'Sakarya Teknokent’s internal idea file. Sign in to see the ideas.',
      google: 'Sign in with Google', or: 'or with an email link', email: 'Your email address', send: 'Send sign-in link',
      sent: 'A sign-in link has been sent to {e}. Tap the link in the email on this device. If it does not arrive within a few minutes, check your spam folder.',
      who: 'SAÜ staff can sign in with their sakarya.edu.tr address. Participants from outside Teknokent sign in by invitation.',
      denied: 'The account {e} does not have access to this file. Contact the Sakarya Teknokent Private Office for an invitation.',
      other: 'Sign in with another account', wait: 'Signing in…', err: 'Sign-in failed. Please try again.',
      confirm: 'Type the email address you opened the link from to finish signing in.', finish: 'Finish signing in',
      empty: 'The content has not been uploaded yet. Upload the content file from the admin panel.', load: 'Loading ideas…',
      offline: 'No connection; showing the version last opened on this device.', out: 'Sign out', signed: 'Signed in:',
      bad: 'Please enter a valid email address.', demo: 'Demo mode: signed in without sending an email.',
      privacy: 'Privacy', lang: 'TR', langHref: './', langTitle: 'Türkçe sürüm'
    }
  }[L];

  var css = '' +
    'html.gated body>*:not(#gate){display:none!important}' +
    '#gate{display:none;min-height:100vh;min-height:100dvh;place-items:center;padding-block:32px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}' +
    'html.gated #gate{display:grid}' +
    '#gate .gc{width:min(460px,100%);background:var(--surface);border:1px solid var(--line2);border-radius:22px;padding:30px 28px;display:flex;flex-direction:column;gap:16px;box-shadow:0 20px 60px rgba(0,0,0,.25)}' +
    '#gate .gt{display:flex;justify-content:space-between;align-items:center;gap:12px}' +
    '#gate h1{font-size:clamp(36px,8vw,48px);line-height:.95;font-weight:900;letter-spacing:-.02em;margin:4px 0 0}#gate h1 span{color:var(--sky)}' +
    '#gate .lead{font-size:16px;color:var(--muted);line-height:1.5}' +
    '#gate .gb{display:flex;flex-direction:column;gap:10px}' +
    '#gate .btn{justify-content:center;min-height:46px;font-size:15px}' +
    '#gate .or{display:flex;align-items:center;gap:10px;font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}' +
    '#gate .or:before,#gate .or:after{content:"";flex:1;border-top:1px solid var(--line2)}' +
    '#gate input{width:100%;background:var(--bg);border:1px solid var(--line2);border-radius:12px;padding:12px 14px;font:inherit;color:var(--fg);min-width:0}' +
    '#gate input:focus{outline:none;border-color:var(--sky)}' +
    '#gate .msg{font-size:14.5px;line-height:1.5;border-radius:12px;padding:12px 14px;background:var(--skysoft);color:var(--fg)}' +
    '#gate .msg:empty{display:none}' +
    '#gate .note{font-size:13px;color:var(--muted);line-height:1.5}' +
    '#gate .gf{display:flex;gap:14px;flex-wrap:wrap;font-size:13px}' +
    '#gate .spin{width:22px;height:22px;border-radius:50%;border:3px solid var(--line2);border-top-color:var(--sky);animation:gsp 1s linear infinite;margin:6px auto}' +
    '@keyframes gsp{to{transform:rotate(360deg)}}' +
    '.gate-user{margin-top:10px;font-size:13px;color:var(--muted);display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
    '.gate-user button{background:none;border:1px solid var(--line2);border-radius:999px;padding:4px 12px;color:var(--fg);cursor:pointer;font:inherit;font-size:12.5px}';

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  var root, started = false, loaded = false, completing = false, lang = L, onContent = null, user = null;

  function ui() {
    if (root) return;
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    root = document.createElement('div'); root.id = 'gate';
    root.innerHTML = '<main class="gc" aria-labelledby="g-h">' +
      '<div class="gt"><p class="eyebrow">' + T.eyebrow + '</p><a class="lang" href="' + T.langHref + '" title="' + T.langTitle + '">' + T.lang + '</a></div>' +
      '<h1 id="g-h">' + T.brand + '</h1><p class="lead">' + T.lead + '</p>' +
      '<div id="g-body"></div>' +
      '<p class="msg" id="g-msg" role="status" aria-live="polite"></p>' +
      '<div class="gf"><a href="kvkk.html' + (L === 'en' ? '#en' : '') + '">' + T.privacy + '</a></div>' +
      '</main>';
    document.body.insertBefore(root, document.body.firstChild);
  }
  function msg(t) { ui(); $('g-msg').textContent = t || ''; }
  function body(h) { ui(); $('g-body').innerHTML = h; }
  function waiting(t) { body('<div class="spin" aria-hidden="true"></div><p class="note" style="text-align:center">' + esc(t || T.wait) + '</p>'); }

  function showLogin() {
    body('<div class="gb">' +
      '<button class="btn pri" type="button" id="g-google">' + T.google + '</button>' +
      '<div class="or">' + T.or + '</div>' +
      '<form id="g-form" class="gb" novalidate><label class="sr" for="g-email">' + T.email + '</label>' +
      '<input id="g-email" type="email" autocomplete="email" inputmode="email" placeholder="' + T.email + '" required>' +
      '<button class="btn" type="submit">' + T.send + '</button></form>' +
      '<p class="note">' + T.who + '</p></div>');
    $('g-google').addEventListener('click', function () {
      msg(''); var b = this; b.disabled = true;
      Store.signInGoogle().catch(function (e) {
        b.disabled = false;
        if (e && (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')) return;
        msg(T.err + (e && e.code ? ' (' + e.code + ')' : ''));
      });
    });
    $('g-form').addEventListener('submit', function (ev) {
      ev.preventDefault(); var e = $('g-email').value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { msg(T.bad); return; }
      var b = this.querySelector('[type=submit]'); b.disabled = true; msg('');
      try { localStorage.setItem('fs-link-email', e); } catch (x) { }
      Store.sendLink(e, location.origin + location.pathname).then(function (r) {
        b.disabled = false;
        if (r && r.demo) return;
        msg(T.sent.replace('{e}', e));
      }, function (x) { b.disabled = false; msg(T.err + (x && x.code ? ' (' + x.code + ')' : '')); });
    });
  }
  function showDenied(email) {
    body('<div class="gb"><button class="btn" type="button" id="g-other">' + T.other + '</button></div>');
    msg(T.denied.replace('{e}', email || ''));
    $('g-other').addEventListener('click', function () { Store.signOut().then(function () { msg(''); loaded = false; showLogin(); }); });
  }
  function showConfirm() {
    body('<form id="g-cf" class="gb" novalidate><p class="note">' + T.confirm + '</p><label class="sr" for="g-ce">' + T.email + '</label>' +
      '<input id="g-ce" type="email" autocomplete="email" placeholder="' + T.email + '" required><button class="btn pri" type="submit">' + T.finish + '</button></form>');
    $('g-cf').addEventListener('submit', function (ev) { ev.preventDefault(); var e = $('g-ce').value.trim().toLowerCase(); if (!e) { msg(T.bad); return; } complete(e); });
  }
  function complete(email) {
    completing = true; waiting();
    Store.completeLink(email, location.href).then(function () {
      completing = false;
      try { localStorage.removeItem('fs-link-email'); history.replaceState(null, '', location.pathname + location.hash.replace(/[?&].*$/, '')); } catch (x) { }
    }, function (e) { completing = false; msg(T.err + (e && e.code ? ' (' + e.code + ')' : '')); showLogin(); });
  }

  function cacheKey() { return 'fs-c-' + lang; }
  function load(u) {
    if (loaded) return; loaded = true; user = u; waiting(T.load); msg('');
    Store.getContent(lang).then(function (c) {
      try { localStorage.setItem(cacheKey(), JSON.stringify({ e: u.email, c: c })); } catch (x) { }
      onContent(c);
    }, function (e) {
      var code = e && e.code || '';
      if (code === 'permission-denied') { loaded = false; try { localStorage.removeItem(cacheKey()); } catch (x) { } showDenied(u.email); return; }
      if (code === 'not-found') { loaded = false; body(''); msg(T.empty); return; }
      var hit = null; try { hit = JSON.parse(localStorage.getItem(cacheKey()) || 'null'); } catch (x) { }
      if (hit && hit.e === u.email && hit.c) { onContent(hit.c); setTimeout(function () { var t = document.querySelector('.toast'); if (t) { t.textContent = T.offline; t.classList.add('on'); } }, 600); return; }
      loaded = false; msg(T.err + (code ? ' (' + code + ')' : '')); showLogin();
    });
  }

  window.Gate = {
    start: function (lg, cb) {
      if (started) return; started = true; lang = lg || L; onContent = cb;
      document.documentElement.classList.add('gated'); ui(); waiting();
      if (Store.isLink && Store.isLink(location.href)) {
        var e = ''; try { e = localStorage.getItem('fs-link-email') || ''; } catch (x) { }
        if (e) complete(e); else { completing = true; showConfirm(); }
      }
      Store.onAuth(function (u) {
        if (!u) { if (!completing) { loaded = false; showLogin(); } return; }
        if (!completing || u) load(u);
      });
    },
    open: function () {
      document.documentElement.classList.remove('gated');
      var f = document.querySelector('footer'), p = document.createElement('p');
      if (!user || document.querySelector('.gate-user')) return;
      p.className = 'gate-user';
      p.innerHTML = '<span>' + T.signed + ' ' + esc(user.email) + '</span><button type="button">' + T.out + '</button>';
      p.querySelector('button').addEventListener('click', function () {
        try { localStorage.removeItem('fs-c-tr'); localStorage.removeItem('fs-c-en'); } catch (x) { }
        Store.signOut().then(function () { location.reload(); });
      });
      (f || document.body).appendChild(p);
    }
  };
})();
