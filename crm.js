/* 24 Hour Website: sign-in, pipeline (CRM), call list and run queue for the public floor.
   Reads/writes Supabase with the signed-in user's session; row-level security only lets admins see private data. */
(function () {
  const SB_URL = window.__SB_URL, SB_KEY = window.__SB_KEY;
  if (!window.supabase || !SB_URL) return;
  const sb = window.supabase.createClient(SB_URL, SB_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  window.__sb = sb;
  const STATUSES = [['found', 'Found'], ['pack_ready', 'Pack ready'], ['approved', 'Approved'], ['sent', 'Sent'], ['opened', 'Opened email'], ['viewed', 'Viewed pack'], ['called', 'Called'], ['replied', 'Replied'], ['meeting', 'Meeting set'], ['won', 'Won'], ['lost', 'Lost'], ['do_not_contact', 'Do not contact']];
  const SL = Object.fromEntries(STATUSES);
  const HOT = { call_click: 40, reply_click: 40, email_click: 25, pack_view: 15, email_open: 8, pack_time: 0, cta_click: 10 };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ago = t => { const s = (Date.now() - new Date(t)) / 1000; if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400) return Math.round(s / 3600) + ' h ago'; const d = Math.round(s / 86400); return d === 1 ? 'yesterday' : d + ' days ago' };
  const tel = p => p ? 'tel:' + p.replace(/[^\d+]/g, '') : null;

  // ---------------------------------------------------------------- styles
  const css = document.createElement('style');
  css.textContent = `
.crm-btn{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;color:var(--fg);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:8px 14px;cursor:pointer}
.crm-btn:hover{border-color:var(--fg)} .crm-btn.pri{background:var(--fg);color:#fff;border-color:var(--fg)} .crm-btn .n{background:#ff5b5b;color:#fff;border-radius:999px;font-size:11px;padding:1px 7px}
.crm-btns{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.crm-veil{position:fixed;inset:0;background:rgba(22,26,43,.32);z-index:60}
.crm-panel{position:fixed;top:0;right:0;bottom:0;width:min(560px,100vw);background:var(--bg);z-index:61;display:flex;flex-direction:column;box-shadow:-20px 0 60px rgba(22,26,43,.18)}
.crm-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:16px 18px 10px}
.crm-head h2{margin:0;font-size:19px;font-weight:800} .crm-x{border:0;background:var(--card);width:36px;height:36px;border-radius:50%;font-size:18px;cursor:pointer}
.crm-tabs{display:flex;gap:6px;padding:0 18px 12px;flex-wrap:wrap} .crm-tab{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:7px 13px;font-weight:700;font-size:12.5px;cursor:pointer;color:var(--fg)}
.crm-tab[aria-selected=true]{background:var(--fg);color:#fff;border-color:var(--fg)}
.crm-body{overflow:auto;padding:0 18px 24px;flex:1;display:grid;gap:10px;align-content:start}
.crm-card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:14px 16px}
.crm-row{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
.crm-row h3{margin:0;font-size:15.5px;font-weight:800} .crm-sub{color:var(--muted);font-size:12.5px;margin-top:2px}
.crm-pill{font-size:11.5px;font-weight:800;border-radius:999px;padding:3px 9px;background:#eef0f5;white-space:nowrap}
.crm-pill.viewed,.crm-pill.opened{background:#e6f7f5;color:#0f766e} .crm-pill.replied,.crm-pill.meeting{background:#e8ecff;color:#2f47d9} .crm-pill.won{background:#dcfce7;color:#166534} .crm-pill.lost,.crm-pill.do_not_contact{background:#f3f4f6;color:#6b7280} .crm-pill.sent,.crm-pill.approved{background:#fff4dd;color:#92600a}
.crm-sig{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px} .crm-sig span{font-size:12px;font-weight:700;background:#f6f7fb;border-radius:8px;padding:3px 8px}
.crm-sig span.hot{background:#fff1ec;color:#c2410c}
.crm-acts{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.crm-a{font:inherit;font-size:12.5px;font-weight:700;border:1px solid var(--line);background:#fff;border-radius:10px;padding:7px 11px;cursor:pointer;color:var(--fg);text-decoration:none;display:inline-flex;gap:6px;align-items:center}
.crm-a.pri{background:var(--fg);color:#fff;border-color:var(--fg)} .crm-a.go{background:#14b8a6;color:#fff;border-color:#14b8a6} .crm-a:disabled{opacity:.5;cursor:not-allowed}
.crm-f{display:grid;gap:5px;margin-top:10px} .crm-f label{font-size:12px;font-weight:700;color:var(--muted)}
.crm-f input,.crm-f select,.crm-f textarea{font:inherit;font-size:14px;border:1px solid var(--line);border-radius:10px;padding:9px 11px;background:#fff;color:var(--fg);width:100%}
.crm-f textarea{min-height:76px;resize:vertical}
.crm-msg{white-space:pre-wrap;background:#f6f7fb;border-radius:12px;padding:12px;font-size:13px;line-height:1.5;margin-top:8px;max-height:260px;overflow:auto}
.crm-tl{list-style:none;margin:8px 0 0;padding:0;display:grid;gap:6px} .crm-tl li{font-size:12.5px;display:flex;justify-content:space-between;gap:10px;border-bottom:1px dashed var(--line);padding-bottom:6px} .crm-tl small{color:var(--muted);white-space:nowrap}
.crm-empty{color:var(--muted);text-align:center;padding:30px 10px}
.crm-filter{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px}
.crm-toast{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);background:var(--fg);color:#fff;padding:10px 16px;border-radius:999px;font-weight:700;z-index:70}
.crm-note{font-size:12.5px;color:var(--muted);margin-top:6px}
.st-kpis{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.st-k{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px}
.st-k b{display:block;font-size:26px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums} .st-k span{font-size:12.5px;color:var(--muted);font-weight:700} .st-k small{display:block;font-size:12px;color:var(--muted);margin-top:2px}
.st-fun{display:grid;gap:7px;margin-top:6px} .st-fr{display:grid;grid-template-columns:110px minmax(0,1fr) 34px;gap:8px;align-items:center;font-size:12.5px;font-weight:700}
.st-bar{height:12px;border-radius:999px;background:#eef0f5;overflow:hidden} .st-bar i{display:block;height:100%;border-radius:999px;background:#3d5afe}
.st-fr:nth-child(n+4) .st-bar i{background:#14b8a6} .st-fr:last-child .st-bar i{background:#16a34a} .st-fr em{font-style:normal;text-align:right;font-variant-numeric:tabular-nums}
.st-tbl{width:100%;border-collapse:collapse;font-size:12.5px} .st-tbl th{text-align:left;color:var(--muted);font-weight:700;padding:6px 4px;border-bottom:1px solid var(--line);white-space:nowrap}
.st-tbl td{padding:8px 4px;border-bottom:1px solid var(--line);vertical-align:top} .st-tbl tr[data-open]{cursor:pointer} .st-tbl tr[data-open]:hover td{background:#f6f7fb}
.st-y{color:#0f766e;font-weight:800} .st-n{color:#b8bdd1} .st-h{margin:0 0 8px;font-size:15px;font-weight:800}
@media (min-width:520px){.st-kpis{grid-template-columns:repeat(4,minmax(0,1fr))}}
`;
  document.head.appendChild(css);

  // ---------------------------------------------------------------- toolbar
  const bar = document.querySelector('.bar'); if (!bar) return;
  const box = document.createElement('div'); box.className = 'crm-btns';
  box.innerHTML = `<button class="crm-btn" id="crmStats" type="button" hidden>📈 <span class="t">Stats</span></button>
<button class="crm-btn" id="crmCall" type="button" hidden>📞 <span class="t">Call list</span> <span class="n" id="crmCallN" hidden></span></button>
<button class="crm-btn" id="crmPipe" type="button" hidden>🗂️ <span class="t">Pipeline</span></button>
<button class="crm-btn pri" id="crmQueue" type="button" hidden>➕ <span class="t">Queue run</span></button>
<button class="crm-btn" id="crmSign" type="button">🔑 <span class="t">Sign in</span></button>`;
  const pill = bar.querySelector('.pillbar'); pill ? pill.after(box) : bar.prepend(box);
  const $ = id => document.getElementById(id);
  let session = null, isAdmin = false, data = { companies: [], events: [], outreach: [], requests: [] }, open = null, filt = 'active', expanded = null;

  function toast(t) { const d = document.createElement('div'); d.className = 'crm-toast'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.remove(), 2600) }

  // ---------------------------------------------------------------- panel shell
  function panel(title, tabs) {
    close();
    const v = document.createElement('div'); v.className = 'crm-veil'; v.onclick = close;
    const p = document.createElement('aside'); p.className = 'crm-panel'; p.setAttribute('role', 'dialog'); p.setAttribute('aria-label', title);
    p.innerHTML = `<div class="crm-head"><h2>${esc(title)}</h2><button class="crm-x" type="button" aria-label="Close">×</button></div>${tabs ? `<div class="crm-tabs" role="tablist">${tabs.map(([k, l]) => `<button class="crm-tab" role="tab" data-k="${k}" aria-selected="${k === open}">${l}</button>`).join('')}</div>` : ''}<div class="crm-body" id="crmBody"></div>`;
    p.querySelector('.crm-x').onclick = close;
    p.querySelectorAll('.crm-tab').forEach(b => b.onclick = () => { open = b.dataset.k; showAdmin() });
    document.body.append(v, p); document.addEventListener('keydown', escKey);
    return p.querySelector('#crmBody');
  }
  function escKey(e) { if (e.key === 'Escape') close() }
  function close() { document.querySelectorAll('.crm-veil,.crm-panel').forEach(n => n.remove()); document.removeEventListener('keydown', escKey) }

  // ---------------------------------------------------------------- auth
  function showSignIn(mode) {
    open = null; const body = panel(mode === 'up' ? 'Create your account' : 'Sign in');
    body.innerHTML = `<div class="crm-card"><p class="crm-sub" style="margin:0">Only you can use the pipeline, call list and run queue. Everyone else with the link just sees the floor.</p>
<form id="crmAuth"><div class="crm-f"><label for="crmEm">Email</label><input id="crmEm" type="email" autocomplete="email" required></div>
<div class="crm-f"><label for="crmPw">Password</label><input id="crmPw" type="password" autocomplete="${mode === 'up' ? 'new-password' : 'current-password'}" minlength="8" required></div>
<div class="crm-acts"><button class="crm-a pri" type="submit">${mode === 'up' ? 'Create account' : 'Sign in'}</button><button class="crm-a" type="button" id="crmSwap">${mode === 'up' ? 'I already have an account' : 'Create an account'}</button></div>
<p class="crm-note" id="crmAuthMsg" role="status"></p></form></div>`;
    $('crmSwap').onclick = () => showSignIn(mode === 'up' ? 'in' : 'up');
    $('crmAuth').onsubmit = async e => {
      e.preventDefault(); const email = $('crmEm').value.trim(), password = $('crmPw').value, m = $('crmAuthMsg'); m.textContent = 'One moment…';
      const r = mode === 'up' ? await sb.auth.signUp({ email, password, options: { emailRedirectTo: location.origin + location.pathname } }) : await sb.auth.signInWithPassword({ email, password });
      if (r.error) { m.textContent = r.error.message; return }
      if (mode === 'up' && !r.data.session) { m.textContent = 'Check your email and click the confirmation link, then come back and sign in.'; return }
      close(); await refreshAuth(); if (isAdmin) { open = 'calls'; showAdmin() }
    };
  }
  async function refreshAuth() {
    const { data: s } = await sb.auth.getSession(); session = s.session;
    isAdmin = false;
    if (session) { const r = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle(); isAdmin = !!(r.data) }
    $('crmSign').innerHTML = session ? `👤 <span class="t">${esc(session.user.email.split('@')[0])}</span>` : '🔑 <span class="t">Sign in</span>';
    ['crmStats', 'crmCall', 'crmPipe', 'crmQueue'].forEach(id => $(id).hidden = !isAdmin);
    if (isAdmin) await load();
  }
  $('crmSign').onclick = async () => {
    if (!session) return showSignIn('in');
    open = null; const body = panel('Account');
    body.innerHTML = `<div class="crm-card"><h3 style="margin:0 0 4px">${esc(session.user.email)}</h3><p class="crm-sub">${isAdmin ? 'You have full access.' : 'Signed in, waiting for access. Ask Claude to give this account admin access.'}</p><p class="crm-sub" style="word-break:break-all">Account ID: ${esc(session.user.id)}</p><div class="crm-acts"><button class="crm-a" id="crmOut" type="button">Sign out</button></div></div>`;
    $('crmOut').onclick = async () => { await sb.auth.signOut(); close(); await refreshAuth() };
  };
  $('crmCall').onclick = () => { open = 'calls'; showAdmin() };
  $('crmPipe').onclick = () => { open = 'all'; showAdmin() };
  $('crmQueue').onclick = () => { open = 'queue'; showAdmin() };
  $('crmStats').onclick = () => { open = 'stats'; showAdmin() };

  // ---------------------------------------------------------------- data
  async function load() {
    const [c, e, o, q] = await Promise.all([
      sb.from('companies').select('*').order('updated_at', { ascending: false }),
      sb.from('events').select('*').order('created_at', { ascending: false }).limit(2000),
      sb.from('outreach').select('*').order('created_at', { ascending: false }),
      sb.from('run_requests').select('*').order('created_at', { ascending: false }).limit(50)]);
    data = { companies: c.data || [], events: e.data || [], outreach: o.data || [], requests: q.data || [] };
    const n = callList().length; $('crmCallN').hidden = !n; $('crmCallN').textContent = n;
  }
  function signals(key) {
    const ev = data.events.filter(x => x.company_key === key);
    const views = ev.filter(x => x.type === 'pack_view').length, secs = ev.filter(x => x.type === 'pack_time').reduce((a, x) => a + (+(x.meta || {}).seconds || 0), 0);
    const calls = ev.filter(x => x.type === 'call_click').length, opens = ev.filter(x => x.type === 'email_open').length, clicks = ev.filter(x => x.type === 'email_click').length;
    const last = ev[0] ? ev[0].created_at : null;
    const score = ev.reduce((a, x) => a + (HOT[x.type] || 0) * Math.max(.2, 1 - (Date.now() - new Date(x.created_at)) / (14 * 864e5)), 0);
    return { ev, views, secs, calls, opens, clicks, last, score };
  }
  function callList() {
    const today = new Date().toISOString().slice(0, 10);
    return data.companies.filter(c => !['won', 'lost', 'do_not_contact'].includes(c.status)).map(c => ({ c, s: signals(c.key), due: c.follow_up && c.follow_up <= today }))
      .filter(x => x.due || x.s.score >= 10).sort((a, b) => (b.due - a.due) || (b.s.score - a.s.score));
  }
  function sigHtml(s) {
    const out = [];
    if (s.calls) out.push(`<span class="hot">📞 tapped Call ${s.calls}×</span>`);
    if (s.views) out.push(`<span class="${s.views > 1 ? 'hot' : ''}">👀 viewed pack ${s.views}×</span>`);
    if (s.secs >= 20) out.push(`<span>⏱ ${s.secs >= 120 ? Math.round(s.secs / 60) + ' min' : s.secs + ' s'} on page</span>`);
    if (s.opens) out.push(`<span>✉️ opened email ${s.opens}×</span>`);
    if (s.clicks) out.push(`<span class="hot">🔗 clicked email link ${s.clicks}×</span>`);
    if (s.last) out.push(`<span>last ${ago(s.last)}</span>`);
    return out.length ? `<div class="crm-sig">${out.join('')}</div>` : '';
  }

  // ---------------------------------------------------------------- views
  async function showAdmin() {
    if (!isAdmin) return showSignIn('in');
    const body = panel('Pipeline', [['stats', '📈 Stats'], ['calls', '📞 Call list'], ['all', '🗂️ Companies'], ['queue', '➕ Run queue']]);
    body.innerHTML = '<p class="crm-empty">Loading…</p>';
    await load();
    if (open === 'stats') renderStats(body); else if (open === 'calls') renderCalls(body); else if (open === 'queue') renderQueue(body); else renderAll(body);
  }

  let range = 30;
  function renderStats(body) {
    const since = range ? Date.now() - range * 864e5 : 0, inR = t => new Date(t).getTime() >= since;
    const ev = data.events.filter(e => inR(e.created_at) && e.company_key !== 'test-tal');
    const sent = data.outreach.filter(o => o.status === 'sent' && o.sent_at && inR(o.sent_at) && o.company_key !== 'test-tal');
    const sentEmails = sent.filter(o => o.channel === 'email');
    const uniq = (type, keys) => new Set(ev.filter(e => e.type === type && (!keys || keys.has(e.company_key))).map(e => e.company_key)).size;
    const emailKeys = new Set(sentEmails.map(o => o.company_key));
    const delivered = uniq('email_delivered', emailKeys), opened = uniq('email_open', emailKeys), clicked = uniq('email_click', emailKeys), bounced = uniq('email_bounce', emailKeys);
    const viewers = uniq('pack_view'), callers = uniq('call_click');
    const secs = ev.filter(e => e.type === 'pack_time').map(e => +(e.meta || {}).seconds || 0).filter(x => x > 0);
    const avg = secs.length ? Math.round(secs.reduce((a, b) => a + b, 0) / secs.length) : 0;
    const cs = data.companies.filter(c => c.key !== 'test-tal');
    const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '–';
    const won = cs.filter(c => c.status === 'won').length, talking = cs.filter(c => ['replied', 'meeting'].includes(c.status)).length;
    const k = (v, l, sub) => `<div class="st-k"><b>${v}</b><span>${l}</span>${sub ? `<small>${sub}</small>` : ''}</div>`;
    // funnel (all time, by current stage reached)
    const ORDER = ['found', 'pack_ready', 'approved', 'sent', 'opened', 'viewed', 'called', 'replied', 'meeting', 'won'];
    const reached = st => cs.filter(c => ORDER.indexOf(c.status) >= ORDER.indexOf(st)).length;
    const fun = [['Found', cs.filter(c => c.status !== 'do_not_contact').length], ['Pack built', reached('pack_ready')], ['Contacted', reached('sent')], ['Opened / viewed', reached('opened')], ['Talking', reached('replied')], ['Won', won]];
    const max = Math.max(1, fun[0][1]);
    const cName = key => (cs.find(c => c.key === key) || {}).name || key;
    const rows = sent.sort((a, b) => b.sent_at.localeCompare(a.sent_at)).map(o => {
      const e = data.events.filter(x => x.company_key === o.company_key && new Date(x.created_at) >= new Date(o.sent_at));
      const has = t => e.filter(x => x.type === t).length;
      const y = n => n ? `<span class="st-y">✓${n > 1 ? ' ' + n + '×' : ''}</span>` : '<span class="st-n">–</span>';
      const mail = o.channel === 'email';
      return `<tr data-open="${esc(o.company_key)}"><td><b>${esc(cName(o.company_key))}</b><br><span class="crm-sub">${mail ? 'Email' : o.channel === 'text' ? 'Text' : 'Form'} · ${ago(o.sent_at)}</span></td><td>${mail ? (has('email_bounce') ? '<span style="color:#c2410c;font-weight:800">bounced</span>' : y(has('email_delivered'))) : '<span class="st-n">n/a</span>'}</td><td>${mail ? y(has('email_open')) : '<span class="st-n">n/a</span>'}</td><td>${mail ? y(has('email_click')) : '<span class="st-n">n/a</span>'}</td><td>${y(has('pack_view'))}</td><td>${y(has('call_click'))}</td></tr>`;
    }).join('');
    const feed = ev.slice(0, 15).map(e => `<li><span><b>${esc(cName(e.company_key))}</b> · ${({ pack_view: 'viewed the pack', pack_time: 'spent ' + ((e.meta || {}).seconds || 0) + ' s on the pack', call_click: 'tapped Call', reply_click: 'tapped email/text', cta_click: 'opened the homepage preview', email_sent: 'email sent', email_delivered: 'email delivered', email_open: 'opened the email', email_click: 'clicked the link', email_bounce: 'email bounced', email_reply: 'replied', note: esc((e.meta || {}).text || 'note') })[e.type] || esc(e.type)}</span><small>${ago(e.created_at)}</small></li>`).join('');
    body.innerHTML = `<div class="crm-filter">${[[7, 'Last 7 days'], [30, 'Last 30 days'], [0, 'All time']].map(([d, l]) => `<button class="crm-tab" data-r="${d}" aria-selected="${d === range}">${l}</button>`).join('')}</div>
<div class="st-kpis">${k(sent.length, 'Messages sent', `${sentEmails.length} email · ${sent.length - sentEmails.length} text/form`)}${k(pct(opened, sentEmails.length), 'Email open rate', `${opened} of ${sentEmails.length} opened`)}${k(pct(clicked, sentEmails.length), 'Click rate', `${clicked} clicked the link`)}${k(viewers, 'Viewed their pack', avg ? `avg ${avg >= 60 ? Math.round(avg / 60) + ' min' : avg + ' s'} on page` : 'no views yet')}${k(callers, 'Tapped Call', 'from the pack page')}${k(pct(delivered, sentEmails.length), 'Delivered', bounced ? `${bounced} bounced` : 'no bounces')}${k(talking, 'Talking', 'replied or meeting set')}${k(won, 'Won', won ? '$' + (won * 250).toLocaleString() + ' at $250' : 'first one soon')}</div>
<div class="crm-card"><h3 class="st-h">Pipeline</h3><div class="st-fun">${fun.map(([l, n]) => `<div class="st-fr"><span>${l}</span><div class="st-bar"><i style="width:${Math.max(n ? 3 : 0, 100 * n / max)}%"></i></div><em>${n}</em></div>`).join('')}</div><p class="crm-note">Every company counts toward the furthest step it has reached. All time.</p></div>
<div class="crm-card"><h3 class="st-h">Every message sent</h3>${rows ? `<div style="overflow-x:auto"><table class="st-tbl"><thead><tr><th>Company</th><th>Delivered</th><th>Opened</th><th>Clicked</th><th>Viewed pack</th><th>Tapped Call</th></tr></thead><tbody>${rows}</tbody></table></div><p class="crm-note">Tap a row to open that company.</p>` : '<p class="crm-empty" style="padding:14px">Nothing sent in this period yet.</p>'}</div>
<div class="crm-card"><h3 class="st-h">Latest activity</h3>${feed ? `<ul class="crm-tl">${feed}</ul>` : '<p class="crm-empty" style="padding:14px">No activity in this period yet.</p>'}</div>
<p class="crm-note">Email opens are an estimate: some inboxes (Apple Mail, Gmail) open emails automatically or block the tracking image. Clicks, pack views and Call taps are exact.</p>`;
    body.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { range = +b.dataset.r; renderStats(body) });
    body.querySelectorAll('tr[data-open]').forEach(r => r.onclick = () => { open = 'all'; filt = 'all'; expanded = r.dataset.open; showAdmin() });
  }
  function renderCalls(body) {
    const list = callList();
    if (!list.length) { body.innerHTML = '<div class="crm-card crm-empty">Nobody to call yet. When a company opens its pack, taps Call or has a follow-up due, it shows up here.</div>'; return }
    body.innerHTML = list.map(({ c, s, due }) => `<div class="crm-card"><div class="crm-row"><div><h3>${esc(c.name)}</h3><div class="crm-sub">${esc(c.industry || '')} · ${esc(c.city || '')}${due ? ` · <b style="color:#c2410c">follow-up due ${esc(c.follow_up)}</b>` : ''}</div></div><span class="crm-pill ${c.status}">${SL[c.status]}</span></div>${sigHtml(s)}
<div class="crm-acts">${c.phone ? `<a class="crm-a go" href="${tel(c.phone)}">📞 ${esc(c.phone)}</a>` : ''}<button class="crm-a" data-open="${esc(c.key)}">Details</button>${c.pack_url ? `<a class="crm-a" href="${esc(c.pack_url)}?from=floor" target="_blank" rel="noopener">Pack</a>` : ''}</div></div>`).join('');
    body.querySelectorAll('[data-open]').forEach(b => b.onclick = () => { open = 'all'; filt = 'all'; expanded = b.dataset.open; showAdmin() });
  }
  function renderAll(body) {
    const groups = [['active', 'Active'], ['pack_ready', 'Pack ready'], ['sent', 'Sent'], ['viewed', 'Viewed'], ['won', 'Won'], ['all', 'All']];
    const inF = c => filt === 'all' || (filt === 'active' ? !['found', 'won', 'lost', 'do_not_contact'].includes(c.status) : filt === 'sent' ? ['approved', 'sent', 'opened'].includes(c.status) : filt === 'viewed' ? ['viewed', 'called', 'replied', 'meeting'].includes(c.status) : c.status === filt);
    const list = data.companies.filter(inF);
    body.innerHTML = `<div class="crm-filter">${groups.map(([k, l]) => `<button class="crm-tab" data-f="${k}" aria-selected="${k === filt}">${l} · ${data.companies.filter(c => { const f = filt; filt = k; const r = inF(c); filt = f; return r }).length}</button>`).join('')}</div>` +
      (list.length ? list.map(c => card(c)).join('') : '<div class="crm-card crm-empty">No companies here yet.</div>');
    body.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filt = b.dataset.f; renderAll(body) });
    body.querySelectorAll('[data-x]').forEach(b => b.onclick = () => { expanded = expanded === b.dataset.x ? null : b.dataset.x; renderAll(body) });
    wire(body);
    if (expanded) { const el = body.querySelector(`[data-card="${CSS.escape(expanded)}"]`); el && el.scrollIntoView({ block: 'start' }) }
  }
  function card(c) {
    const s = signals(c.key), ex = expanded === c.key, drafts = data.outreach.filter(o => o.company_key === c.key);
    let h = `<div class="crm-card" data-card="${esc(c.key)}"><div class="crm-row"><div><h3>${esc(c.name)}</h3><div class="crm-sub">${esc(c.industry || '')} · ${esc(c.city || '')}${c.rating ? ` · ${c.rating}★ (${c.reviews || 0})` : ''}</div></div><span class="crm-pill ${c.status}">${SL[c.status]}</span></div>${sigHtml(s)}
<div class="crm-acts">${c.phone ? `<a class="crm-a go" href="${tel(c.phone)}">📞 Call</a>` : ''}${c.pack_url ? `<a class="crm-a" href="${esc(c.pack_url)}?from=floor" target="_blank" rel="noopener">Pack</a>` : ''}<button class="crm-a" data-x="${esc(c.key)}" aria-expanded="${ex}">${ex ? 'Close' : 'Open'}</button></div>`;
    if (ex) {
      h += `<div class="crm-f"><label>How to reach them</label><div class="crm-sub" style="font-size:13px;color:var(--fg)">${esc(c.contact_note || 'No notes yet.')}${c.email ? `<br>Email: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : ''}${c.website ? `<br>Website: ${esc(c.website)}` : ''}</div></div>
<div class="crm-f"><label for="st-${esc(c.key)}">Status</label><select id="st-${esc(c.key)}" data-status="${esc(c.key)}">${STATUSES.map(([k, l]) => `<option value="${k}" ${k === c.status ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
<div class="crm-f"><label for="fu-${esc(c.key)}">Follow up on</label><input type="date" id="fu-${esc(c.key)}" data-fu="${esc(c.key)}" value="${esc(c.follow_up || '')}"></div>
<div class="crm-f"><label for="nt-${esc(c.key)}">Notes</label><textarea id="nt-${esc(c.key)}" data-notes="${esc(c.key)}" placeholder="Call notes, who you spoke to, what they said">${esc(c.notes || '')}</textarea><div class="crm-acts"><button class="crm-a" data-save="${esc(c.key)}">Save notes</button></div></div>`;
      drafts.forEach(o => {
        const canEmail = o.channel === 'email' && o.to_address;
        h += `<div class="crm-f"><label>${o.channel === 'email' ? 'Email' : o.channel === 'text' ? 'Text message' : o.channel === 'form' ? 'Contact-form message' : o.channel} · ${o.status === 'draft' ? 'draft' : esc(o.status)}${o.sent_at ? ' ' + ago(o.sent_at) : ''}</label>${o.subject ? `<div style="font-weight:800;font-size:13.5px">${esc(o.subject)}</div>` : ''}<div class="crm-msg">${esc(o.body)}</div>
<div class="crm-acts"><button class="crm-a" data-copy="${o.id}">Copy message</button>${o.status !== 'sent' ? (canEmail ? `<button class="crm-a pri" data-send="${o.id}">Approve & send to ${esc(o.to_address)}</button>` : `<button class="crm-a pri" data-mark="${o.id}">I sent it</button>`) : ''}</div>${canEmail && o.status !== 'sent' ? '<p class="crm-note">Sends from your Resend address. Nothing goes out until you press it.</p>' : ''}</div>`;
      });
      if (s.ev.length) h += `<div class="crm-f"><label>Activity</label><ul class="crm-tl">${s.ev.slice(0, 25).map(e => `<li><span>${({ pack_view: '👀 Viewed the ' + ((e.meta || {}).page === 'mock' ? 'homepage preview' : 'pack'), pack_time: '⏱ Spent ' + ((e.meta || {}).seconds || 0) + ' s on the ' + ((e.meta || {}).page === 'mock' ? 'preview' : 'pack'), call_click: '📞 Tapped a Call button', reply_click: '✉️ Tapped an email/text link', cta_click: '🖱 Opened the homepage preview', email_sent: '📤 Email sent', email_delivered: '📬 Email delivered', email_open: '✉️ Opened the email', email_click: '🔗 Clicked a link in the email', email_bounce: '⚠️ Email bounced', email_reply: '💬 Replied', note: '📝 ' + esc((e.meta || {}).text || 'Note') })[e.type] || esc(e.type)}</span><small>${ago(e.created_at)}</small></li>`).join('')}</ul></div>`;
    }
    return h + '</div>';
  }
  async function upd(key, patch, msg) {
    patch.updated_at = new Date().toISOString();
    const r = await sb.from('companies').update(patch).eq('key', key); if (r.error) { toast('Couldn’t save: ' + r.error.message); return false }
    const c = data.companies.find(x => x.key === key); Object.assign(c, patch); msg && toast(msg); return true;
  }
  function wire(body) {
    body.querySelectorAll('[data-status]').forEach(s => s.onchange = () => upd(s.dataset.status, { status: s.value }, 'Status saved'));
    body.querySelectorAll('[data-fu]').forEach(s => s.onchange = () => upd(s.dataset.fu, { follow_up: s.value || null }, s.value ? 'Follow-up set' : 'Follow-up cleared'));
    body.querySelectorAll('[data-save]').forEach(b => b.onclick = () => upd(b.dataset.save, { notes: body.querySelector(`[data-notes="${CSS.escape(b.dataset.save)}"]`).value }, 'Notes saved'));
    body.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => { const o = data.outreach.find(x => x.id == b.dataset.copy); try { await navigator.clipboard.writeText((o.subject ? 'Subject: ' + o.subject + '\n\n' : '') + o.body); toast('Copied') } catch (e) { toast('Select the text and copy it') } });
    body.querySelectorAll('[data-mark]').forEach(b => b.onclick = async () => {
      const o = data.outreach.find(x => x.id == b.dataset.mark), now = new Date().toISOString();
      const r = await sb.from('outreach').update({ status: 'sent', sent_at: now, approved_at: now }).eq('id', o.id); if (r.error) return toast(r.error.message);
      await sb.from('events').insert({ company_key: o.company_key, type: 'note', meta: { text: (o.channel === 'text' ? 'Text' : o.channel === 'form' ? 'Contact-form message' : 'Message') + ' sent by you' } });
      const c = data.companies.find(x => x.key === o.company_key); if (['found', 'pack_ready', 'approved'].includes(c.status)) await upd(c.key, { status: 'sent' });
      toast('Marked as sent'); showAdmin();
    });
    body.querySelectorAll('[data-send]').forEach(b => b.onclick = async () => {
      const o = data.outreach.find(x => x.id == b.dataset.send);
      if (!confirmInline(b, `Send to ${o.to_address}?`)) return;
      b.disabled = true; b.textContent = 'Sending…';
      const r = await sb.functions.invoke('send-outreach', { body: { outreach_id: o.id } });
      if (r.error || (r.data && r.data.error)) { b.disabled = false; b.textContent = 'Approve & send'; return toast((r.data && r.data.error) || 'Sending isn’t set up yet') }
      toast('Sent'); showAdmin();
    });
  }
  function confirmInline(b, q) { if (b.dataset.armed) return true; b.dataset.armed = '1'; const t = b.textContent; b.textContent = '✅ ' + q + ' Tap again to send'; b.style.background = '#14b8a6'; b.style.borderColor = '#14b8a6'; toast('Tap the green button again to send'); setTimeout(() => { delete b.dataset.armed; if (!b.disabled) { b.textContent = t; b.style.background = ''; b.style.borderColor = '' } }, 12000); return false }
  function renderQueue(body) {
    body.innerHTML = `<div class="crm-card"><h3 style="margin:0">Queue a new run</h3><p class="crm-sub">Pick a city and an industry. Claude starts queued runs the next time you open the chat, and the agents show up working here.</p>
<form id="crmQ"><div class="crm-f"><label for="qCity">City</label><input id="qCity" required placeholder="Mesa, AZ"></div><div class="crm-f"><label for="qInd">Industry</label><input id="qInd" required placeholder="Pool cleaning"></div>
<div class="crm-f"><label for="qNote">Notes (optional)</label><input id="qNote" placeholder="e.g. only companies with no website"></div><div class="crm-acts"><button class="crm-a pri" type="submit">Queue run</button></div></form></div>` +
      (data.requests.length ? `<div class="crm-card"><h3 style="margin:0 0 6px">Queue</h3><ul class="crm-tl">${data.requests.map(r => `<li><span><b>${esc(r.industry)}</b> · ${esc(r.city)}${r.notes ? ' · ' + esc(r.notes) : ''}</span><small>${esc(r.status)} · ${ago(r.created_at)}</small></li>`).join('')}</ul></div>` : '');
    $('crmQ').onsubmit = async e => {
      e.preventDefault(); const r = await sb.from('run_requests').insert({ city: $('qCity').value.trim(), industry: $('qInd').value.trim(), notes: $('qNote').value.trim() || null });
      if (r.error) return toast(r.error.message); toast('Run queued'); showAdmin();
    };
  }

  // never await Supabase calls inside the auth callback (it deadlocks the client); defer instead
  let lastUid; sb.auth.onAuthStateChange((ev, s) => { const uid = s && s.user ? s.user.id : null; if (uid !== lastUid) { lastUid = uid; setTimeout(refreshAuth, 0) } });
  setInterval(() => { if (isAdmin) load() }, 30000);
})();
