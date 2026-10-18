(function () {
  var S = window.SITE || { links: {}, donate: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(function () { t.remove(); }, 3800);
  }
  window.SiteToast = toast;

  /* menu */
  var mb = $('.menu-btn'), nav = $('#nav');
  if (mb) {
    mb.addEventListener('click', function () {
      var o = nav.classList.toggle('open'); mb.setAttribute('aria-expanded', o); mb.textContent = o ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { mb.click(); mb.focus(); } });
  }

  /* configurable links */
  $$('[data-link]').forEach(function (a) {
    var url = (S.links || {})[a.getAttribute('data-link')];
    if (url) { a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
    else if (a.hasAttribute('data-optional')) { a.hidden = true; }
    else if (a.getAttribute('data-fallback')) { a.href = a.getAttribute('data-fallback'); }
    else { a.addEventListener('click', function (e) { e.preventDefault(); toast('This link is coming soon.'); }); }
  });
  $$('[data-social-row]').forEach(function (r) { r.hidden = !$$('[data-link]', r).some(function (a) { return !a.hidden; }); });
  $$('[data-share]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      if (navigator.share) navigator.share({ title: document.title, url: location.href }).catch(function () {});
      else if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { toast('Link copied'); });
    });
  });

  /* welcome word */
  var words = $$('.welcome .w');
  if (words.length) {
    var i = 0; words[0].classList.add('on');
    if (!reduce) setInterval(function () { words[i].classList.remove('on'); i = (i + 1) % words.length; words[i].classList.add('on'); }, 2600);
  }

  /* tabs */
  $$('[role=tablist]').forEach(function (list) {
    var tabs = $$('[role=tab]', list);
    function sel(t, focus) {
      tabs.forEach(function (x) {
        var on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') sel(tabs[(k + 1) % tabs.length], true);
        if (e.key === 'ArrowLeft') sel(tabs[(k + tabs.length - 1) % tabs.length], true);
      });
    });
  });

  /* rail */
  $$('[data-rail]').forEach(function (r) {
    var rail = $(r.getAttribute('data-rail'));
    $$('[data-dir]', r).forEach(function (b) {
      b.addEventListener('click', function () { rail.scrollBy({ left: b.getAttribute('data-dir') * 360, behavior: reduce ? 'auto' : 'smooth' }); });
    });
  });

  /* filter + search lists */
  $$('[data-filter]').forEach(function (root) {
    var cat = 'All', q = '';
    var count = $('[data-count]', root), empty = $('[data-empty]', root);
    var search = $('[data-search]', root);
    function run() {
      var n = 0, items = $$('[data-cat]', root);
      items.forEach(function (it) {
        var ok = (cat === 'All' || it.getAttribute('data-cat') === cat) && (!q || it.textContent.toLowerCase().indexOf(q) > -1);
        it.hidden = !ok; if (ok) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' result' : ' results');
      if (empty) empty.hidden = n > 0;
    }
    $$('.chip', root).forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip', root).forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
        cat = c.getAttribute('data-value'); run();
      });
    });
    if (search) search.addEventListener('input', function () { q = search.value.trim().toLowerCase(); run(); });
    root.addEventListener('refresh', run);
    run();
  });

  /* forms */
  $$('form[data-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var kind = form.getAttribute('data-form'), data = { form: kind, page: location.href }, lines = [];
      $$('input[id],textarea[id],select[id]', form).forEach(function (f) {
        var lab = $('label[for="' + f.id + '"]', form), name = lab ? lab.textContent.replace('*', '').trim() : f.id;
        data[name] = f.value; lines.push(name + ': ' + f.value);
      });
      var st = $('.form-status', form);
      st.className = 'form-status';
      if (S.formEndpoint) {
        st.textContent = 'Sending...';
        fetch(S.formEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw 0; st.textContent = kind === 'newsletter' ? 'You are on the list. Thank you.' : 'Message sent. We will be in touch soon.'; form.reset(); })
          .catch(function () { st.className = 'form-status err'; st.textContent = 'That did not send. Email us at ' + S.email + ' instead.'; });
      } else {
        location.href = 'mailto:' + S.email + '?subject=' + encodeURIComponent(kind === 'newsletter' ? 'Add me to event updates' : 'Message from the website') + '&body=' + encodeURIComponent(lines.join('\n'));
        st.textContent = 'Opening your email app so you can send this to us.';
      }
    });
  });

  /* contact topic from link */
  var tp = $('#topic');
  if (tp) { var want = new URLSearchParams(location.search).get('topic'); if (want) $$('option', tp).forEach(function (o) { if (o.textContent === want) tp.value = o.value || o.textContent; }); }

  /* give */
  var gv = $('#give');
  if (gv) {
    var qs = new URLSearchParams(location.search);
    var st = { freq: qs.get('freq') === 'monthly' ? 'monthly' : 'once', amount: qs.get('amount') || '50' };
    var other = $('#other'), msg = $('#give-msg'), cta = $('#give-cta');
    function paint() {
      $$('[data-freq]', gv).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-freq') === st.freq); });
      $$('[data-amt]', gv).forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-amt') === st.amount); });
      $('#other-wrap').hidden = st.amount !== 'other';
      cta.textContent = st.amount === 'other' ? 'Give' : 'Give $' + st.amount + (st.freq === 'monthly' ? ' every month' : '');
      msg.hidden = true;
    }
    $$('[data-freq]', gv).forEach(function (b) { b.addEventListener('click', function () { st.freq = b.getAttribute('data-freq'); paint(); }); });
    $$('[data-amt]', gv).forEach(function (b) { b.addEventListener('click', function () { st.amount = b.getAttribute('data-amt'); paint(); if (st.amount === 'other') other.focus(); }); });
    cta.addEventListener('click', function () {
      var amt = st.amount === 'other' ? parseFloat(String(other.value).replace(/[^0-9.]/g, '')) : parseFloat(st.amount);
      msg.hidden = false;
      if (!amt || amt < 1) { msg.textContent = 'Enter an amount of at least $1.'; return; }
      var tpl = (S.donate || {})[st.freq];
      if (!tpl) { msg.textContent = 'Online giving is being connected. To give today, email ' + S.email + ' or call +1 (815) 516-7469.'; return; }
      msg.hidden = true;
      window.open(tpl.replace('{amount}', amt).replace('{fund}', $('#fund').value), '_blank', 'noopener');
    });
    paint();
  }

  /* YouTube: latest videos with thumbnails, filled in automatically */
  var YT = S.youtube || {};
  var ytLists = $$('[data-yt-list]'), ytFeat = $('[data-yt-feature]');
  function ytCat(t) { return /youth/i.test(t) ? 'Youth' : /podcast|conversation/i.test(t) ? 'Podcast' : 'Sermon'; }
  function ytDate(d) { try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); } catch (e) { return ''; } }
  function ytThumb(v, big) { return 'https://i.ytimg.com/vi/' + v.id + (big ? '/maxresdefault.jpg' : '/mqdefault.jpg'); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function ytModal(id) {
    var m = el('div', 'yt-modal'); m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Video player');
    var box = el('div', 'yt-box'), x = el('button', 'yt-close', 'Close'); x.type = 'button';
    var f = document.createElement('iframe'); f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0'; f.title = 'Sermon video'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    box.appendChild(f); box.appendChild(x); m.appendChild(box); document.body.appendChild(m); x.focus();
    function close() { m.remove(); document.removeEventListener('keydown', key); }
    function key(e) { if (e.key === 'Escape') close(); }
    x.addEventListener('click', close); m.addEventListener('click', function (e) { if (e.target === m) close(); }); document.addEventListener('keydown', key);
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-vid]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault(); ytModal(a.getAttribute('data-vid'));
  });
  function ytRender(vids) {
    if (!vids.length) return;
    ytLists.forEach(function (list) {
      var skip = +list.getAttribute('data-skip') || 0, lim = +list.getAttribute('data-limit') || 6;
      var rows = vids.slice(skip, skip + lim); if (!rows.length) return;
      list.textContent = '';
      rows.forEach(function (v) {
        var cat = ytCat(v.title), a = el('a'); a.setAttribute('data-cat', cat); a.setAttribute('data-vid', v.id); a.href = 'https://www.youtube.com/watch?v=' + v.id; a.target = '_blank'; a.rel = 'noopener';
        var im = el('img', 'yt-th'); im.src = ytThumb(v); im.alt = ''; im.loading = 'lazy'; im.width = 128; im.height = 72;
        var d = el('div'); d.appendChild(el('span', 'tag', cat)); d.appendChild(el('h3', null, v.title)); d.appendChild(el('p', null, ytDate(v.date)));
        a.appendChild(im); a.appendChild(d); list.appendChild(a);
      });
      var root = list.closest('[data-filter]'); if (root) root.dispatchEvent(new Event('refresh'));
    });
    if (ytFeat) {
      var v = vids[0]; ytFeat.setAttribute('data-vid', v.id); ytFeat.href = 'https://www.youtube.com/watch?v=' + v.id; ytFeat.target = '_blank'; ytFeat.rel = 'noopener';
      ytFeat.style.backgroundImage = 'linear-gradient(180deg,rgba(20,32,20,.1) 30%,rgba(20,32,20,.85)),url(' + ytThumb(v, false).replace('mqdefault', 'hqdefault') + ')'; ytFeat.style.backgroundSize = 'cover'; ytFeat.style.backgroundPosition = 'center';
      var t = $('h3', ytFeat), m = $('.meta span:last-child', ytFeat), tg = $('.tag', ytFeat);
      if (t) t.textContent = v.title; if (m) m.textContent = ytDate(v.date); if (tg) tg.textContent = ytCat(v.title);
    }
  }
  if ((ytLists.length || ytFeat) && YT.channelId && YT.apiKey) {
    var ck = 'imjc-yt', cached = null;
    try { var c = JSON.parse(sessionStorage.getItem(ck) || 'null'); if (c && Date.now() - c.t < 600000) cached = c.v; } catch (e) {}
    if (cached) ytRender(cached);
    else {
      var pl = 'UU' + String(YT.channelId).slice(2);
      fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=30&playlistId=' + pl + '&key=' + encodeURIComponent(YT.apiKey))
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (j) {
          var vids = (j.items || []).filter(function (i) { return i.snippet && i.snippet.resourceId && i.snippet.title !== 'Private video' && i.snippet.title !== 'Deleted video'; })
            .map(function (i) { return { id: i.snippet.resourceId.videoId, title: i.snippet.title, date: i.snippet.publishedAt }; });
          try { sessionStorage.setItem(ck, JSON.stringify({ t: Date.now(), v: vids })); } catch (e) {}
          ytRender(vids);
        }).catch(function () { /* keep the built-in list */ });
    }
  }

  /* photo gallery lightbox */
  $$('[data-gal] .gal-i').forEach(function (b) {
    b.addEventListener('click', function () {
      var im = $('img', b), m = el('div', 'lightbox'), big = document.createElement('img'), x = el('button', 'yt-close', 'Close');
      big.src = im.src; big.alt = im.alt; x.type = 'button'; m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', 'Photo viewer');
      m.appendChild(big); m.appendChild(x); document.body.appendChild(m); x.focus();
      function close() { m.remove(); document.removeEventListener('keydown', key); b.focus(); }
      function key(e) { if (e.key === 'Escape') close(); }
      x.addEventListener('click', close); m.addEventListener('click', function (e) { if (e.target === m) close(); }); document.addEventListener('keydown', key);
    });
  });

  /* welcome video + hero video */
  var W = S.welcome || {};
  $$('[data-welcome-play]').forEach(function (b) {
    b.addEventListener('click', function () { if (W.videoId) ytModal(W.videoId); else toast('The welcome video is coming soon.'); });
  });
  var hv = $('.hero');
  if (hv && W.heroVideo && !reduce) {
    var v = document.createElement('video'); v.className = 'hero-video'; v.src = W.heroVideo; v.muted = true; v.loop = true; v.autoplay = true; v.playsInline = true; v.setAttribute('aria-hidden', 'true'); v.preload = 'metadata';
    hv.insertBefore(v, hv.firstChild); v.play().catch(function () {});
  }

  /* gentle reveal on scroll */
  document.documentElement.classList.add('js');
  var rv = $$('.tile,.ev,.card,.sun,.leader,.team>div,.list>a,.welcome-v,.facts>*,.sect-head,.big-quote');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rv.forEach(function (n, k) { n.classList.add('rv'); n.style.setProperty('--d', k % 4); io.observe(n); });
  }

  /* livestream */
  var lv = $('#live');
  if (lv) {
    var L = S.live || {}, src = '';
    if (L.channelId) src = 'https://www.youtube-nocookie.com/embed/live_stream?channel=' + encodeURIComponent(L.channelId) + '&rel=0';
    else if (L.videoId) src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(L.videoId) + '?rel=0';
    if (src) {
      var f = document.createElement('iframe');
      f.src = src; f.title = 'I Met Jesus Community live service'; f.allow = 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
      $('#live-frame').appendChild(f); lv.classList.add('on');
    }
  }

  /* music */
  var pl = $('#player');
  if (pl) {
    var tracks = $$('.tracks button'), audio = new Audio(), cur = 0, loaded = -1, playing = false;
    audio.preload = 'none';
    var titleEl = $('#now'), prog = $('#prog'), tl = $('#tlabel'), tg = $('#toggle');
    function fmt(s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function paint() {
      tracks.forEach(function (b, k) { b.setAttribute('aria-current', k === cur); });
      titleEl.textContent = tracks[cur].getAttribute('data-title');
      tg.setAttribute('aria-label', playing ? 'Pause' : 'Play');
      $('.i-play', tg).hidden = playing; $('.i-pause', tg).hidden = !playing;
    }
    function select(k, play) {
      k = (k + tracks.length) % tracks.length; cur = k;
      var src = (S.audio || [])[k];
      if (!src) { audio.pause(); playing = false; paint(); toast("Audio files haven't been added yet."); return; }
      if (loaded !== k) { audio.src = src; loaded = k; prog.style.width = '0'; }
      if (play) { audio.play().catch(function () {}); } else audio.pause();
      playing = !!play; paint();
    }
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) prog.style.width = (audio.currentTime / audio.duration * 100) + '%';
      tl.textContent = fmt(audio.currentTime) + ' / ' + (audio.duration ? fmt(audio.duration) : tracks[cur].getAttribute('data-dur'));
    });
    audio.addEventListener('ended', function () { select(cur + 1, true); });
    audio.addEventListener('error', function () { playing = false; paint(); toast('That track could not be loaded.'); });
    tracks.forEach(function (b, k) { b.addEventListener('click', function () { select(k, true); }); });
    tg.addEventListener('click', function () { if (playing) { audio.pause(); playing = false; paint(); } else select(cur, true); });
    $('#prev').addEventListener('click', function () { select(cur - 1, playing); });
    $('#next').addEventListener('click', function () { select(cur + 1, playing); });
    paint();
  }
})();
