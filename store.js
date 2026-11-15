/* Veri katmanı. Firebase ayarı varsa Firestore ve Authentication kullanır;
   yoksa "deneme modu"nda her şeyi bu tarayıcının yerel deposunda tutar. */
(function () {
  var cfg = window.FIREBASE_CONFIG, fb = window.firebase;
  var live = !!(cfg && fb && fb.initializeApp);

  if (live) {
    fb.initializeApp(cfg);
    var db = fb.firestore(), auth = fb.auth();
    /* Firestore iç içe dizi saklayamaz: "kimlerle birlikte" satırları nesneye çevrilir. */
    var toDb = function (i) { var o = {}; for (var k in i) if (k !== 'hay' && k !== '_id') o[k] = i[k]; if (o.r) o.r = o.r.map(function (r) { return { a: r[0], b: r[1] }; }); return o; };
    var fromDb = function (x) { delete x._id; if (x.r) x.r = x.r.map(function (r) { return [r.a || '', r.b || '']; }); return x; };
    var docs = function (snap) { return snap.docs.map(function (d) { var x = d.data(); x._id = d.id; return x; }); };
    window.Store = {
      mode: 'firebase',
      listIdeas: function () { return db.collection('ideas').get().then(function (s) { return docs(s).map(fromDb); }); },
      sendBasket: function (b) {
        var col = db.collection('sepetler'), base = { ids: b.ids, names: b.names, ad: b.ad || '', not: b.not || '', done: false, ts: fb.firestore.FieldValue.serverTimestamp() };
        if (!b.birim) return col.add(base);
        var full = {}; for (var k in base) full[k] = base[k]; full.birim = b.birim;
        /* eski kurallar "birim" alanını kabul etmezse birimi ada ekleyip yeniden dener */
        return col.add(full).catch(function (e) {
          if (!e || e.code !== 'permission-denied') throw e;
          var u = (window.SEED && (SEED.B[b.birim] || (b.birim === 'dis' ? SEED.OUT : ''))) || b.birim;
          base.ad = (u + (base.ad ? ' · ' + base.ad : '')).slice(0, 120);
          return col.add(base);
        });
      },
      sendSuggestion: function (o) { return db.collection('oneriler').add({ baslik: o.baslik, aciklama: o.aciklama, birim: o.birim || '', ad: o.ad || '', done: false, ts: fb.firestore.FieldValue.serverTimestamp() }); },
      listSuggestions: function () { return db.collection('oneriler').orderBy('ts', 'desc').get().then(function (s) { return docs(s).map(function (x) { x.ts = x.ts && x.ts.toMillis ? x.ts.toMillis() : 0; return x; }); }); },
      updateSuggestion: function (id, patch) { return db.collection('oneriler').doc(id).update(patch); },
      deleteSuggestion: function (id) { return db.collection('oneriler').doc(id).delete(); },
      /* isimsiz ilgi sayacı: ac = açıldı, is = işaretlendi */
      bump: function (id, k) { var o = {}; o[k] = fb.firestore.FieldValue.increment(1); return db.collection('ilgi').doc(String(id)).set(o, { merge: true }).catch(function () { }); },
      listInterest: function () { return db.collection('ilgi').get().then(function (s) { var m = {}; s.docs.forEach(function (d) { m[d.id] = d.data(); }); return m; }); },
      onAuth: function (cb) { auth.onAuthStateChanged(function (u) { cb(u ? { email: (u.email || '').toLowerCase() } : null); }); },
      /* site girişi: Google ya da e-posta bağlantısı */
      signInGoogle: function () {
        var p = new fb.auth.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
        return auth.signInWithPopup(p).catch(function (e) {
          if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) return auth.signInWithRedirect(p);
          throw e;
        });
      },
      sendLink: function (email, url) { return auth.sendSignInLinkToEmail(email, { url: url, handleCodeInApp: true }); },
      isLink: function (href) { return auth.isSignInWithEmailLink(href); },
      completeLink: function (email, href) { return auth.signInWithEmailLink(email, href); },
      /* fikir içeriği: yalnızca izinli kullanıcı okur (Firestore iç içe dizi tutamadığı için metin olarak saklanır) */
      getContent: function (lang) {
        return db.collection('icerik').doc(lang).get().then(function (d) {
          if (!d.exists) throw { code: 'not-found' };
          var x = d.data(), c = JSON.parse(x.json); c.v = x.v || ''; return c;
        });
      },
      setContent: function (lang, obj, v) { return db.collection('icerik').doc(lang).set({ json: JSON.stringify(obj), v: v || '' }); },
      listInvites: function () { return db.collection('davetli').get().then(function (s) { return s.docs.map(function (d) { var x = d.data(); return { email: d.id, ad: x.ad || '', ts: x.ts && x.ts.toMillis ? x.ts.toMillis() : 0 }; }); }); },
      addInvite: function (email, ad) { return db.collection('davetli').doc(email.toLowerCase()).set({ ad: ad || '', ts: fb.firestore.FieldValue.serverTimestamp() }); },
      removeInvite: function (email) { return db.collection('davetli').doc(email.toLowerCase()).delete(); },
      signIn: function (email, pw) { return auth.signInWithEmailAndPassword(email, pw); },
      signOut: function () { return auth.signOut(); },
      listBaskets: function () {
        return db.collection('sepetler').orderBy('ts', 'desc').get().then(function (s) {
          return docs(s).map(function (x) { x.ts = x.ts && x.ts.toMillis ? x.ts.toMillis() : 0; return x; });
        });
      },
      updateBasket: function (id, patch) { return db.collection('sepetler').doc(id).update(patch); },
      deleteBasket: function (id) { return db.collection('sepetler').doc(id).delete(); },
      saveIdea: function (idea) { return db.collection('ideas').doc(String(idea.id)).set(toDb(idea)); },
      deleteIdea: function (id) { return db.collection('ideas').doc(String(id)).delete(); },
      addIdeas: function (list) { return this.seedIdeas(list); },
      seedIdeas: function (list) {
        var batch = db.batch();
        list.forEach(function (i) { batch.set(db.collection('ideas').doc(String(i.id)), toDb(i)); });
        return batch.commit();
      }
    };
    return;
  }

  /* ---- deneme modu ---- */
  var get = function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  var set = function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
  var ok = function (v) { return Promise.resolve(v); };
  var authCb = null, user = get('fsd-user', null);
  window.Store = {
    mode: 'demo',
    listIdeas: function () { return ok(get('fsd-ideas', null)); },
    sendBasket: function (b) {
      var l = get('fsd-baskets', []);
      l.unshift({ _id: 'b' + Date.now(), ids: b.ids, names: b.names, birim: b.birim || '', ad: b.ad || '', not: b.not || '', done: false, ts: Date.now() });
      set('fsd-baskets', l); return ok();
    },
    sendSuggestion: function (o) { var l = get('fsd-oneri', []); l.unshift({ _id: 'o' + Date.now(), baslik: o.baslik, aciklama: o.aciklama, birim: o.birim || '', ad: o.ad || '', done: false, ts: Date.now() }); set('fsd-oneri', l); return ok(); },
    listSuggestions: function () { return ok(get('fsd-oneri', [])); },
    updateSuggestion: function (id, patch) { var l = get('fsd-oneri', []); l.forEach(function (x) { if (x._id === id) for (var k in patch) x[k] = patch[k]; }); set('fsd-oneri', l); return ok(); },
    deleteSuggestion: function (id) { set('fsd-oneri', get('fsd-oneri', []).filter(function (x) { return x._id !== id; })); return ok(); },
    bump: function (id, k) { var m = get('fsd-ilgi', {}); m[id] = m[id] || {}; m[id][k] = (m[id][k] || 0) + 1; set('fsd-ilgi', m); return ok(); },
    listInterest: function () { return ok(get('fsd-ilgi', {})); },
    onAuth: function (cb) { authCb = cb; setTimeout(function () { cb(user); }, 0); },
    signIn: function (email, pw) {
      if (pw !== 'demo') return Promise.reject({ code: 'auth/wrong-password' });
      user = { email: (email || 'deneme').toLowerCase(), admin: true }; set('fsd-user', user); if (authCb) authCb(user); return ok();
    },
    signInGoogle: function () { user = { email: 'deneme@sakarya.edu.tr' }; set('fsd-user', user); if (authCb) authCb(user); return ok(); },
    sendLink: function (email) { user = { email: email.toLowerCase() }; set('fsd-user', user); if (authCb) authCb(user); return ok({ demo: true }); },
    isLink: function () { return false; },
    completeLink: function () { return ok(); },
    getContent: function (lang) {
      var c = get('fsd-icerik-' + lang, null);
      if (!c) return Promise.reject({ code: 'not-found' });
      var e = user && user.email || '', inv = get('fsd-davetli', []);
      if (!(user && (user.admin || /@sakarya\.edu\.tr$/.test(e) || inv.some(function (x) { return x.email === e; })))) return Promise.reject({ code: 'permission-denied' });
      return ok(c);
    },
    setContent: function (lang, obj, v) { var c = JSON.parse(JSON.stringify(obj)); c.v = v || ''; set('fsd-icerik-' + lang, c); return ok(); },
    listInvites: function () { return ok(get('fsd-davetli', [])); },
    addInvite: function (email, ad) { var l = get('fsd-davetli', []).filter(function (x) { return x.email !== email.toLowerCase(); }); l.unshift({ email: email.toLowerCase(), ad: ad || '', ts: Date.now() }); set('fsd-davetli', l); return ok(); },
    removeInvite: function (email) { set('fsd-davetli', get('fsd-davetli', []).filter(function (x) { return x.email !== email; })); return ok(); },
    signOut: function () { user = null; set('fsd-user', null); if (authCb) authCb(null); return ok(); },
    listBaskets: function () { return ok(get('fsd-baskets', [])); },
    updateBasket: function (id, patch) {
      var l = get('fsd-baskets', []); l.forEach(function (b) { if (b._id === id) for (var k in patch) b[k] = patch[k]; });
      set('fsd-baskets', l); return ok();
    },
    deleteBasket: function (id) { set('fsd-baskets', get('fsd-baskets', []).filter(function (b) { return b._id !== id; })); return ok(); },
    saveIdea: function (idea) {
      var l = get('fsd-ideas', null) || (window.SEED.ideas || []).slice(), hit = false;
      l = l.map(function (i) { if (i.id === idea.id) { hit = true; return idea; } return i; });
      if (!hit) l.push(idea);
      set('fsd-ideas', l); return ok();
    },
    deleteIdea: function (id) {
      var l = get('fsd-ideas', null) || (window.SEED.ideas || []).slice();
      set('fsd-ideas', l.filter(function (i) { return i.id !== id; })); return ok();
    },
    addIdeas: function (list) {
      var l = get('fsd-ideas', null) || [], m = {};
      list.forEach(function (i) { m[i.id] = i; });
      l = l.filter(function (i) { return !m[i.id]; }).concat(list);
      set('fsd-ideas', l); return ok();
    },
    seedIdeas: function (list) { set('fsd-ideas', list); return ok(); }
  };
})();
