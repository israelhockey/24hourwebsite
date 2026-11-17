/* Floor views: a territory map (main screen), a full business dashboard, and the 3D office shrunk to a corner window.
   Reads data through window.CRM (crm.js). Public visitors see covered areas; signed-in admins see every company. */
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const app = document.querySelector('.app'), main = document.querySelector('.main'), stage = $('stage');
  if (!app || !main || !stage) return;
  const GROUP = s => ['won'].includes(s) ? 'won' : ['replied', 'meeting', 'called'].includes(s) ? 'talk' : ['opened', 'viewed'].includes(s) ? 'warm' : ['sent'].includes(s) ? 'sent' : ['lost', 'do_not_contact'].includes(s) ? 'lost' : 'new';
  const COL = { new: '#94a3b8', sent: '#3d5afe', warm: '#f59e0b', talk: '#ea580c', won: '#16a34a', lost: '#475569' };
  const LBL = { new: 'Not contacted', sent: 'Contacted', warm: 'Opened / viewed', talk: 'Talking', won: 'Won', lost: 'Closed' };

  const css = document.createElement('style');
  css.textContent = `
.fv-bar{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 0}
.fv-bar button{flex:none;border:1px solid var(--line,#e3e6f0);background:#fff;border-radius:999px;padding:9px 16px;font:inherit;font-weight:800;font-size:14px;cursor:pointer;color:#172036}
.fv-bar button[aria-pressed=true]{background:#172036;color:#fff;border-color:#172036}
.app{grid-template-columns:minmax(0,1fr)!important}.fv-view{position:relative;border-radius:22px;overflow:hidden;background:#eef1f7;min-height:560px;max-width:100%;min-height:480px}.fv-view.dash{min-height:0;overflow:visible;background:none}
#fvMap{position:absolute;inset:0;z-index:0}
.fv-legend{position:absolute;z-index:500;left:12px;bottom:12px;background:#fff;border-radius:14px;padding:10px 12px;font-size:12.5px;box-shadow:0 6px 20px rgba(0,0,0,.12);display:grid;gap:4px}
.fv-legend i{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;vertical-align:-1px}
.fv-tip{position:absolute;z-index:500;right:12px;top:12px;background:#172036;color:#fff;border-radius:14px;padding:10px 14px;font-size:13px;max-width:260px;font-weight:600}
.fv-pop b{font-size:14px}.fv-pop .s{color:#5d6580;font-size:12.5px;margin:2px 0 8px}.fv-pop button,.fv-pop a{display:inline-block;margin:2px 4px 0 0;border:0;border-radius:999px;padding:6px 12px;font:inherit;font-weight:800;font-size:12.5px;cursor:pointer;text-decoration:none;background:#eef1ff;color:#172036}
.fv-pop .p{background:#3d5afe;color:#fff}.fv-pop input{width:100%;margin:4px 0;padding:7px 9px;border:1px solid #d5d9e6;border-radius:9px;font:inherit;font-size:13px}
#fvDash{padding:4px 0}
.db-grid{display:grid;gap:12px;grid-template-columns:repeat(4,minmax(0,1fr))}
.db-k{background:#fff;border:1px solid #e3e6f0;border-radius:16px;padding:14px}.db-k b{display:block;font-size:30px;font-weight:800;line-height:1.1;color:#172036}.db-k span{font-size:13px;font-weight:700;color:#5d6580}.db-k small{display:block;font-size:12px;color:#8a91a8;margin-top:2px}
.db-card{background:#fff;border:1px solid #e3e6f0;border-radius:18px;padding:16px;margin-top:12px}.db-card h3{margin:0 0 10px;font-size:16px;font-weight:800}
.db-two{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}
.db-fun div{display:grid;grid-template-columns:120px minmax(0,1fr) 44px;gap:10px;align-items:center;margin:6px 0;font-size:13.5px;font-weight:600}.db-fun i{display:block;height:14px;border-radius:7px;background:#3d5afe}.db-fun em{font-style:normal;font-weight:800;text-align:right}
.db-days{display:flex;align-items:flex-end;gap:4px;height:120px;padding-top:6px}.db-days div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;align-items:stretch;min-width:0}
.db-days i{display:block;border-radius:4px 4px 0 0}.db-days .a{background:#3d5afe}.db-days .b{background:#f59e0b}.db-days small{font-size:10px;color:#8a91a8;text-align:center;overflow:hidden}
.db-tbl{width:100%;border-collapse:collapse;font-size:13.5px}.db-tbl th{text-align:left;color:#5d6580;font-weight:700;font-size:12px;padding:6px 8px;border-bottom:1px solid #e3e6f0}.db-tbl td{padding:8px;border-bottom:1px solid #f0f2f7}.db-tbl tr[data-k]{cursor:pointer}.db-tbl tr[data-k]:hover{background:#f6f7fb}
.db-key{display:flex;gap:14px;font-size:12px;color:#5d6580;margin-top:6px}.db-key i{display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:5px}
.db-empty{color:#8a91a8;font-size:13.5px}
.db-lock{display:grid;place-items:center;min-height:420px;text-align:center;color:#5d6580}.db-lock button{margin-top:10px;border:0;background:#3d5afe;color:#fff;border-radius:999px;padding:10px 18px;font:inherit;font-weight:800;cursor:pointer}
/* office as a corner window */
body.fv-mini #stage{position:fixed!important;right:14px;bottom:14px;width:260px!important;height:170px!important;min-height:0!important;z-index:900;border-radius:18px;box-shadow:0 14px 40px rgba(0,0,0,.28);overflow:hidden}
body.fv-mini #stage .ov:not(.fv-keep),body.fv-mini #stage .tags,body.fv-mini #stage .empty{display:none!important}
.fv-open{position:absolute;z-index:20;left:8px;top:8px;border:0;border-radius:999px;background:rgba(23,32,54,.85);color:#fff;font:inherit;font-weight:800;font-size:12px;padding:6px 10px;cursor:pointer}
body:not(.fv-mini) .fv-open{display:none}
@media (max-width:900px){html,body{overflow-x:hidden}.db-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.db-two{grid-template-columns:minmax(0,1fr)}.fv-view{min-height:62vh}
 body.fv-mini #stage{display:none!important}.db-days div:nth-child(even) small{visibility:hidden}.fv-tip{display:none}
 .app{padding-inline:10px!important}.bar{flex-wrap:wrap;gap:8px!important}.crm-btns{max-width:100%;overflow-x:auto;flex-wrap:nowrap!important;-webkit-overflow-scrolling:touch}.crm-btns .crm-btn{flex:none}
 .main{grid-template-columns:minmax(0,1fr)!important}.board{max-height:none!important}.db-fun div{grid-template-columns:96px minmax(0,1fr) 36px}}
`;
  document.head.appendChild(css);

  // ---- layout: view switch + view container (map / dashboard); the office becomes a corner window
  const bar = document.createElement('div'); bar.className = 'fv-bar';
  bar.innerHTML = `<button type="button" data-v="map" aria-pressed="true">🗺️ Territory</button><button type="button" data-v="dash" aria-pressed="false">📊 Dashboard</button><button type="button" data-v="office" aria-pressed="false">🏢 Office ↓</button>`;
  app.insertBefore(bar, main);
  const view = document.createElement('section'); view.className = 'fv-view'; view.setAttribute('aria-label', 'Territory map and dashboard');
  view.innerHTML = `<div id="fvMap"></div><div id="fvDash" hidden></div>`;
  app.insertBefore(view, main);
  const openBtn = document.createElement('button'); openBtn.className = 'fv-open'; openBtn.type = 'button'; openBtn.textContent = '⛶ Office';
  
  let mode = 'map';
  function setView(v) {
    if (v === 'office') { stage.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }
    mode = v; bar.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === v));
    document.body.classList.remove('fv-mini');
    $('fvMap').style.display = v === 'map' ? '' : 'none'; $('fvDash').hidden = v !== 'dash';
    view.classList.toggle('dash', v === 'dash');
    if (v === 'dash') renderDash();
    if (v === 'map' && map) setTimeout(() => map.invalidateSize(), 50);
    try { localStorage.setItem('fv_view', v) } catch (e) {}
  }
  bar.querySelectorAll('button').forEach(b => b.onclick = () => setView(b.dataset.v));
  // the office's own "Stats wall" button now opens the real dashboard
  const wall = $('wallBtn'); if (wall) wall.addEventListener('click', () => setTimeout(() => setView('dash'), 300));

  // ---- map
  let map = null, layer = null, pub = { runs: [], rc: [] };
  function loadLeaflet(cb) {
    if (window.L) return cb();
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l);
    const s = document.createElement('script'); s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = cb; document.head.appendChild(s);
  }
  function initMap() {
    map = L.map('fvMap', { zoomControl: true, worldCopyJump: true }).setView([33.0, -104.5], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap contributors' }).addTo(map);
    layer = L.layerGroup().addTo(map);
    const leg = L.control({ position: 'bottomleft' });
    leg.onAdd = () => { const d = L.DomUtil.create('div', 'fv-legend'); d.innerHTML = Object.keys(LBL).map(k => `<span><i style="background:${COL[k]}"></i>${LBL[k]}</span>`).join('') + '<span style="margin-top:4px;color:#5d6580">Circles = areas we’ve run</span>'; return d };
    leg.addTo(map);
    const tip = L.control({ position: 'topright' });
    tip.onAdd = () => { const d = L.DomUtil.create('div', 'fv-tip'); d.textContent = 'Tap any empty spot on the map to queue a new run there.'; return d };
    tip.addTo(map);
    map.on('click', e => {
      const pop = `<div class="fv-pop"><b>Run a new area here</b><div class="s">${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)}</div>
<input id="fvCity" placeholder="Area name, e.g. Tempe, AZ"><input id="fvInd" placeholder="Industry, e.g. roofers"><button class="p" id="fvGo">Queue this run</button></div>`;
      L.popup().setLatLng(e.latlng).setContent(pop).openOn(map);
      setTimeout(() => { const g = $('fvGo'); if (!g) return; g.onclick = async () => {
        if (!window.CRM || !CRM.admin) { CRM && CRM.signIn(); return }
        const city = $('fvCity').value.trim(), ind = $('fvInd').value.trim();
        if (!city || !ind) { CRM.toast('Add an area name and an industry'); return }
        const r = await CRM.sb.from('run_requests').insert({ city, industry: ind, lat: e.latlng.lat, lng: e.latlng.lng });
        if (r.error) return CRM.toast(r.error.message);
        map.closePopup(); CRM.toast('Queued. Tell Claude “run the queue”.'); await CRM.load();
      } }, 30);
    });
    drawMap(true);
  }
  async function loadPublic() {
    if (!window.CRM) return;
    const [r, rc] = await Promise.all([CRM.sb.from('runs').select('id,title,city,niche,status,lat,lng,radius_km,started_at'), CRM.sb.from('run_companies').select('run_id,company_key')]);
    pub = { runs: r.data || [], rc: rc.data || [] };
  }
  function drawMap(fit) {
    if (!map) return;
    if (!fit && map._popup && map._popup.isOpen && map._popup.isOpen()) return;
    layer.clearLayers();
    const d = (window.CRM && CRM.admin) ? CRM.data : null;
    const runs = (d && d.runs && d.runs.length) ? d.runs : pub.runs, rc = (d && d.runCompanies) ? d.runCompanies : pub.rc;
    const cs = d ? d.companies.filter(c => c.key !== 'test-tal') : [];
    const bounds = [];
    for (const r of runs) {
      if (r.lat == null) continue;
      const keys = new Set(rc.filter(x => x.run_id === r.id).map(x => x.company_key));
      const mine = cs.filter(c => keys.has(c.key)), g = mine.map(c => GROUP(c.status));
      const contacted = g.filter(x => x !== 'new').length, warm = g.filter(x => ['warm', 'talk', 'won'].includes(x)).length;
      const col = warm ? COL.warm : contacted ? COL.sent : '#64748b';
      const circ = L.circle([r.lat, r.lng], { radius: (r.radius_km || 15) * 1000, color: col, weight: 2, fillColor: col, fillOpacity: .08 }).addTo(layer);
      circ.bindTooltip(`<b>${esc((r.city || '').split(',')[0])} · ${esc(r.niche || r.title)}</b><br>${keys.size} companies${d ? ` · ${contacted} contacted · ${warm} opened or viewed` : ''}`, { sticky: true });
      bounds.push([r.lat, r.lng]);
    }
    if (d) for (const q of d.requests.filter(q => q.status === 'queued' && q.lat != null)) {
      L.circle([q.lat, q.lng], { radius: 15000, color: '#7c3aed', dashArray: '6 6', weight: 2, fillOpacity: .04 }).addTo(layer).bindTooltip(`<b>Queued:</b> ${esc(q.industry)} in ${esc(q.city)}`);
    }
    for (const c of cs) {
      if (c.lat == null) continue;
      const g = GROUP(c.status);
      const m = L.circleMarker([c.lat, c.lng], { radius: 7, color: '#fff', weight: 2, fillColor: COL[g], fillOpacity: 1 }).addTo(layer);
      const contact = c.email ? '📧 ' + esc(c.email) : c.phone ? '📱 ' + esc(c.phone) : 'no contact yet';
      m.bindPopup(`<div class="fv-pop"><b>${esc(c.name)}</b><div class="s">${c.rating ? c.rating + '★ (' + (c.reviews || 0) + ') · ' : ''}${LBL[g]}${c.maps_pos ? ' · Maps #' + c.maps_pos : ''}<br>${contact}</div>
<button class="p" data-fvopen="${esc(c.key)}">Open</button>${c.pack_url ? `<a href="${esc(c.pack_url)}?from=floor" target="_blank" rel="noopener">${c.tier === 'snapshot' ? 'Check-up' : 'Pack'}</a>` : ''}</div>`);
      m.on('popupopen', () => setTimeout(() => { const b = document.querySelector(`[data-fvopen="${CSS.escape(c.key)}"]`); if (b) b.onclick = () => CRM.open(c.key) }, 20));
    }
    if (fit && bounds.length) map.fitBounds(L.latLngBounds(bounds).pad(0.6), { maxZoom: 9 });
  }

  // ---- dashboard
  function renderDash() {
    const el = $('fvDash');
    if (!window.CRM || !CRM.admin) { el.innerHTML = `<div class="db-lock"><div><h3>Sign in to see the business dashboard</h3><p>Every company, message, open and view in one place.</p><button type="button" id="dbIn">Sign in</button></div></div>`; const b = $('dbIn'); if (b) b.onclick = () => CRM && CRM.signIn(); return }
    const d = CRM.data, cs = d.companies.filter(c => c.key !== 'test-tal'), ev = d.events.filter(e => e.company_key !== 'test-tal');
    const sent = d.outreach.filter(o => o.status === 'sent' && o.company_key !== 'test-tal'), sentEmail = sent.filter(o => o.channel === 'email');
    const day = 864e5, now = Date.now(), wk = sent.filter(o => o.sent_at && now - new Date(o.sent_at) < 7 * day).length;
    const uniq = (types, keys) => new Set(ev.filter(e => types.includes(e.type) && (!keys || keys.has(e.company_key))).map(e => e.company_key)).size;
    const emailKeys = new Set(sentEmail.map(o => o.company_key)), contactedKeys = new Set(sent.map(o => o.company_key));
    const opened = uniq(['email_open', 'email_click'], emailKeys), viewed = uniq(['pack_view'], contactedKeys), clicked = uniq(['email_click'], emailKeys);
    const talking = cs.filter(c => ['replied', 'meeting', 'called'].includes(c.status)).length, won = cs.filter(c => c.status === 'won').length;
    const sched = d.outreach.filter(o => o.auto && o.status === 'scheduled').sort((a, b) => a.send_after.localeCompare(b.send_after));
    const drafts = d.outreach.filter(o => o.status === 'draft' && !o.auto).length;
    const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '–';
    const K = (v, l, s) => `<div class="db-k"><b>${v}</b><span>${l}</span>${s ? `<small>${s}</small>` : ''}</div>`;
    const ORDER = ['found', 'pack_ready', 'approved', 'sent', 'opened', 'viewed', 'called', 'replied', 'meeting', 'won'];
    const reach = st => cs.filter(c => ORDER.indexOf(c.status) >= ORDER.indexOf(st)).length;
    const fun = [['Checked', cs.filter(c => c.status !== 'do_not_contact').length], ['Check-up or pack', reach('pack_ready')], ['Contacted', contactedKeys.size], ['Opened or viewed', new Set([...ev.filter(e => ['email_open', 'email_click', 'pack_view'].includes(e.type) && contactedKeys.has(e.company_key)).map(e => e.company_key)]).size], ['Talking', talking + won], ['Won', won]];
    const fmax = Math.max(1, fun[0][1]);
    // last 14 days: messages sent vs. opens/views
    const days = [...Array(14)].map((_, i) => { const t = new Date(now - (13 - i) * day); const k = t.toISOString().slice(0, 10);
      return { k, lab: t.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }), a: sent.filter(o => (o.sent_at || '').slice(0, 10) === k).length, b: ev.filter(e => ['email_open', 'email_click', 'pack_view'].includes(e.type) && e.created_at.slice(0, 10) === k).length } });
    const dmax = Math.max(1, ...days.map(x => Math.max(x.a, x.b)));
    // runs table
    const runs = (d.runs || []).map(r => { const keys = new Set(d.runCompanies.filter(x => x.run_id === r.id).map(x => x.company_key)); const m = cs.filter(c => keys.has(c.key));
      const ct = m.filter(c => contactedKeys.has(c.key)).length, op = m.filter(c => ev.some(e => e.company_key === c.key && ['email_open', 'email_click', 'pack_view'].includes(e.type))).length;
      return `<tr><td><b>${esc((r.city || '').split(',')[0])}</b><br><span style="color:#8a91a8">${esc(r.niche || r.title)}</span></td><td>${m.length}</td><td>${m.filter(c => c.email).length}</td><td>${ct}</td><td>${op}</td><td>${m.filter(c => ['replied', 'meeting', 'called', 'won'].includes(c.status)).length}</td><td>${esc(r.status)}</td></tr>` }).join('');
    // findings library
    const lib = {}; for (const f of d.findings || []) { const k = f.industry + '||' + f.title.replace(/\d[\d,]*/g, '#'); lib[k] = (lib[k] || 0) + 1 }
    const libRows = Object.entries(lib).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, n]) => { const [ind, t] = k.split('||'); return `<tr><td>${esc(t)}</td><td>${esc(ind)}</td><td><b>${n}</b></td></tr>` }).join('');
    // team
    const names = [...new Set(sent.map(o => o.sent_by_name).filter(Boolean))];
    const team = names.map(n => { const mine = sent.filter(o => o.sent_by_name === n), keys = new Set(mine.map(o => o.company_key));
      return `<tr><td><b>${esc(n)}</b></td><td>${mine.length}</td><td>${new Set(ev.filter(e => keys.has(e.company_key) && ['email_open', 'email_click', 'pack_view', 'call_click'].includes(e.type)).map(e => e.company_key)).size}</td><td>${cs.filter(c => keys.has(c.key) && c.status === 'won').length}</td></tr>` }).join('');
    const cname = k => (cs.find(c => c.key === k) || {}).name || k;
    const fuRows = sched.slice(0, 10).map(o => `<tr data-k="${esc(o.company_key)}"><td><b>${esc(cname(o.company_key))}</b></td><td>${o.step === 2 ? '2nd email' : '3rd email'}</td><td>${new Date(o.send_after).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td></tr>`).join('');
    el.innerHTML = `<div class="db-grid">${K(cs.length, 'Companies checked', `${cs.filter(c => c.email).length} with an email`)}${K(contactedKeys.size, 'Contacted', `${wk} messages this week`)}${K(pct(opened, emailKeys.size), 'Email open rate', `${opened} of ${emailKeys.size} emails`)}${K(viewed, 'Viewed their page', `${pct(viewed, contactedKeys.size)} of contacted`)}
${K(clicked, 'Clicked the link', 'from the email')}${K(talking, 'Talking', 'replied, called or meeting')}${K(won, 'Won', won ? 'closed deals' : 'first one coming')}${K(sched.length, 'Follow-ups queued', `${drafts} first emails waiting for you`)}</div>
<div class="db-two"><div class="db-card"><h3>Pipeline</h3><div class="db-fun">${fun.map(([l, n]) => `<div><span>${l}</span><i style="width:${Math.max(n ? 3 : 0, 100 * n / fmax)}%;background:${l === 'Won' ? '#16a34a' : l === 'Talking' ? '#ea580c' : l.startsWith('Opened') ? '#f59e0b' : '#3d5afe'}"></i><em>${n}</em></div>`).join('')}</div></div>
<div class="db-card"><h3>Last 14 days</h3><div class="db-days">${days.map(x => `<div title="${x.lab}: ${x.a} sent, ${x.b} opens/views"><i class="a" style="height:${100 * x.a / dmax}px"></i><i class="b" style="height:${100 * x.b / dmax}px"></i><small>${x.lab}</small></div>`).join('')}</div><div class="db-key"><span><i style="background:#3d5afe"></i>Messages sent</span><span><i style="background:#f59e0b"></i>Opens and page views</span></div></div></div>
<div class="db-card"><h3>Every area we’ve run</h3>${runs ? `<div style="overflow-x:auto"><table class="db-tbl"><thead><tr><th>Area</th><th>Companies</th><th>With email</th><th>Contacted</th><th>Opened / viewed</th><th>Talking</th><th>Run</th></tr></thead><tbody>${runs}</tbody></table></div>` : '<p class="db-empty">No runs yet.</p>'}</div>
<div class="db-two"><div class="db-card"><h3>Follow-ups going out next</h3>${fuRows ? `<table class="db-tbl"><thead><tr><th>Company</th><th>Which</th><th>When</th></tr></thead><tbody>${fuRows}</tbody></table><p class="db-empty" style="margin-top:8px">Tap a row to open the company (and stop its follow-ups if they replied).</p>` : '<p class="db-empty">None scheduled. They’re added automatically when you send a first email.</p>'}</div>
<div class="db-card"><h3>Who did what</h3>${team ? `<table class="db-tbl"><thead><tr><th>Person</th><th>Sent</th><th>Got interest</th><th>Won</th></tr></thead><tbody>${team}</tbody></table>` : '<p class="db-empty">Nothing sent yet.</p>'}</div></div>
<div class="db-card"><h3>Most common problems we find</h3>${libRows ? `<div style="overflow-x:auto"><table class="db-tbl"><thead><tr><th>Problem</th><th>Industry</th><th>Times seen</th></tr></thead><tbody>${libRows}</tbody></table></div><p class="db-empty" style="margin-top:8px">Every check-up adds to this library, so future emails get sharper.</p>` : '<p class="db-empty">Fills up as we run check-ups.</p>'}</div>
<p class="db-empty" style="margin-top:12px">Email opens are estimates (some inboxes open or block tracking automatically). Clicks and page views are exact.</p>`;
    el.querySelectorAll('tr[data-k]').forEach(r => r.onclick = () => CRM.open(r.dataset.k));
  }

  // ---- wiring
  let v0 = 'map'; try { v0 = localStorage.getItem('fv_view') || 'map' } catch (e) {}
  setView(['map', 'dash'].includes(v0) ? v0 : 'map');
  loadLeaflet(async () => { await loadPublic(); initMap() });
  document.addEventListener('crm:data', () => { drawMap(false); if (mode === 'dash') renderDash() });
  document.addEventListener('crm:auth', () => { drawMap(true); if (mode === 'dash') renderDash() });
  setInterval(() => { if (window.CRM && CRM.admin && document.visibilityState === 'visible') CRM.load() }, 60000);
})();
