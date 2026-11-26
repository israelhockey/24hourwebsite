import json
from base import page
S = {}
# 1 hook
S['s1'] = (6, page(6, """
<h1 class="a" style="--d:.2;top:110px">A neighbor's pool just turned green.</h1>
<div class="sub a" style="--d:1;top:340px">Who do they call?</div>
<div class="card a" style="--d:1.4;left:250px;top:470px;width:580px;height:820px;border-radius:60px;border:14px solid #0B2A3A;background:#F4F9FB">
  <div style="margin:60px 34px 0;background:#fff;border-radius:40px;height:92px;box-shadow:0 6px 20px rgba(0,0,0,.12);display:flex;align-items:center;padding:0 28px;font-size:34px;font-weight:600">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="3"><circle cx="10" cy="10" r="7"/><path d="M15 15l6 6"/></svg>
    <div style="margin-left:18px;overflow:hidden;white-space:nowrap;width:0;animation:type 2.4s steps(20) 2.2s forwards">pool service glendale</div>
  </div>
  <div class="a" style="--d:4.8;margin:40px 34px 0;font-size:30px;color:#4a6573">Searching nearby…</div>
</div>
<style>@keyframes type{to{width:430px}}</style>"""))
# 2 map
rows = [(1,'Pool company A'),(2,'Pool company B'),(3,'Pool company C')]
rowhtml = ''.join('<div class="a" style="--d:%s;display:flex;align-items:center;height:78px;border-bottom:2px solid #E3EEF2;padding:0 30px;font-size:34px;font-weight:600"><span style="width:52px;height:52px;border-radius:50%%;background:#35D0E0;color:#06324A;display:flex;align-items:center;justify-content:center;margin-right:24px;font-weight:700">%d</span>%s<span style="margin-left:auto;color:#7A97A5;font-weight:500;font-size:28px">★★★★★</span></div>'%(1.6+i*.35,n,t) for i,(n,t) in enumerate(rows))
S['s2'] = (8, page(8, """
<h1 class="a" style="--d:.2;top:80px;font-size:62px">Google shows a map.<br>Most people tap <em>one of the first few.</em></h1>
<div class="card a" style="--d:.6;left:90px;top:360px;width:900px;height:430px;overflow:hidden;background:#EAF3F0">
 <svg width="900" height="430" style="position:absolute;inset:0"><g stroke="#fff" stroke-width="16" fill="none"><path d="M0 120 H900"/><path d="M0 300 H900"/><path d="M200 0 V430"/><path d="M620 0 V430"/></g><g stroke="#fff" stroke-width="8"><path d="M0 210 H900"/><path d="M420 0 V430"/><path d="M780 0 V430"/></g><rect x="660" y="140" width="190" height="130" fill="#BFE3F0" rx="20"/></svg>
 <svg class="a" style="--d:1.2;position:absolute;left:300px;top:90px" width="60" height="80" viewBox="0 0 60 80"><path d="M30 78C30 78 4 48 4 28a26 26 0 0152 0c0 20-26 50-26 50z" fill="#1A8FC4"/><circle cx="30" cy="28" r="10" fill="#fff"/></svg>
 <svg class="a" style="--d:1.5;position:absolute;left:450px;top:180px" width="60" height="80" viewBox="0 0 60 80"><path d="M30 78C30 78 4 48 4 28a26 26 0 0152 0c0 20-26 50-26 50z" fill="#1A8FC4"/><circle cx="30" cy="28" r="10" fill="#fff"/></svg>
 <svg class="a" style="--d:1.8;position:absolute;left:210px;top:210px" width="60" height="80" viewBox="0 0 60 80"><path d="M30 78C30 78 4 48 4 28a26 26 0 0152 0c0 20-26 50-26 50z" fill="#1A8FC4"/><circle cx="30" cy="28" r="10" fill="#fff"/></svg>
 <svg class="a" style="--d:4.2;position:absolute;left:740px;top:290px;animation-name:pop,bob;animation-duration:.6s,1.2s;animation-delay:4.2s,4.8s;animation-iteration-count:1,infinite;animation-direction:normal,alternate" width="60" height="80" viewBox="0 0 60 80"><path d="M30 78C30 78 4 48 4 28a26 26 0 0152 0c0 20-26 50-26 50z" fill="#FFC83D"/><circle cx="30" cy="28" r="10" fill="#fff"/></svg>
</div>
<div class="card" style="left:90px;top:830px;width:900px;height:450px;overflow:hidden">"""+rowhtml+"""
 <div class="a" style="--d:3.4;text-align:center;font-size:40px;color:#7A97A5;height:50px;line-height:44px">⋮</div>
 <div class="a" style="--d:4;display:flex;align-items:center;height:96px;background:#FFF3CC;padding:0 30px;font-size:35px;font-weight:700"><span style="width:52px;height:52px;border-radius:50%;background:#FFC83D;color:#06324A;display:flex;align-items:center;justify-content:center;margin-right:24px">8</span>Gold Standard Pool Service<span style="margin-left:auto;font-size:26px;color:#8a6a00;font-weight:600">you’re here</span></div>
</div>
<style>@keyframes bob{from{transform:translateY(0)}to{transform:translateY(-12px)}}</style>
<div class="sub a" style="--d:5.6;top:1295px;font-size:26px;color:#fff;text-shadow:0 2px 6px #041F30;padding:0">Google Maps check for “pool service Glendale AZ”, Nov 2026</div>"""))
# 3 compliment
S['s3'] = (6, page(6, """
<h1 class="a" style="--d:.2;top:110px">Search your name and you <em>shine.</em></h1>
<div class="card a" style="--d:.8;left:100px;top:420px;width:880px;height:560px;padding:50px 56px">
 <div style="font-family:Poppins;font-weight:700;font-size:48px;line-height:1.1">Gold Standard Pool Service</div>
 <div style="display:flex;align-items:center;gap:16px;margin-top:26px;font-size:36px;font-weight:600"><span style="color:#E8A400;letter-spacing:4px;font-size:46px">★★★★★</span> 5.0 <span style="color:#5B7886;font-weight:500">(10 reviews)</span></div>
 <div style="margin-top:24px;font-size:32px;color:#3F5E6C;line-height:1.5">Pool cleaning service<br>13517 W Glendale Ave, Glendale</div>
 <div style="margin-top:20px;font-size:32px"><b style="color:#1E8E3E">Open</b> · Closes 7 PM</div>
 <div style="margin-top:34px;display:flex;gap:18px"><span style="padding:16px 34px;border-radius:40px;background:#1A8FC4;color:#fff;font-size:30px;font-weight:700">Call</span><span style="padding:16px 34px;border-radius:40px;background:#E5F2F8;color:#14688F;font-size:30px;font-weight:700">Website</span></div>
</div>
<div class="sub a" style="--d:2.4;top:1050px">When people already know you, they find you.<br><b style="color:#fff">That part is working.</b></div>"""))
# 4 fixes
S['f1'] = (6, page(6, """
<h1 class="a" style="--d:.2;top:90px;font-size:62px">Next: reach people who <em>don’t know you yet.</em></h1>
<div class="sub a" style="--d:.9;top:360px;font-size:44px;color:#fff;font-weight:700">Give Google words to show</div>
<div class="card" style="left:90px;top:520px;width:900px;height:430px;padding:46px 50px">
 <div style="font-size:26px;color:#5B7886">goldstandardpoolservice.com</div>
 <div style="position:relative;height:130px;margin-top:10px">
  <div style="position:absolute;left:0;right:0;font-size:42px;color:#1A0DAB;line-height:1.2;animation:out .5s ease 2.2s both">Home - Gold Standard Pool Service</div>
  <div style="position:absolute;left:0;right:0;font-size:42px;color:#1A0DAB;line-height:1.2;opacity:0;animation:in .5s ease 2.4s both">Pool Service in Glendale, AZ | Gold Standard Pool Service</div>
 </div>
 <div style="font-size:30px;color:#4A5B64;line-height:1.4;margin-top:6px;opacity:0;animation:in .6s ease 3.2s both">Weekly pool cleaning and repair in Glendale. 5-star rated. Call or text (602) 695-9095.</div>
 <div style="font-size:26px;color:#8A9AA3;margin-top:22px;position:absolute;bottom:30px;opacity:0;animation:in .4s ease 1s both,out .4s ease 2.2s both">Today: a plain title and no description</div>
</div>
<style>@keyframes out{to{opacity:0}}@keyframes in{to{opacity:1}}</style>
<div class="sub a" style="--d:4.2;top:1030px">A clear title and a short description<br>so searchers know why to pick you.</div>""", dots=0))
S['f2'] = (5, page(5, """
<h1 class="a" style="--d:.2;top:90px;font-size:62px">A call button <em>on every page</em></h1>
<div class="card a" style="--d:.8;left:300px;top:340px;width:480px;height:820px;border-radius:56px;border:12px solid #0B2A3A;background:#F4F9FB;overflow:hidden">
  <div style="height:150px;background:#06324A;color:#fff;font-family:Poppins;font-weight:700;font-size:34px;padding:56px 30px">Gold Standard</div>
  <div style="padding:30px"><div style="height:24px;border-radius:12px;background:#D6E6EC;width:90%"></div><div style="height:24px;border-radius:12px;background:#D6E6EC;width:70%;margin-top:18px"></div><div style="height:180px;border-radius:24px;background:#BFE3F0;margin-top:30px"></div><div style="height:24px;border-radius:12px;background:#D6E6EC;width:80%;margin-top:30px"></div></div>
  <div style="position:absolute;left:24px;right:24px;bottom:30px;height:96px;border-radius:48px;background:#FFC83D;color:#06324A;font-weight:700;font-size:38px;display:flex;align-items:center;justify-content:center;gap:14px;transform:translateY(160px);animation:up .6s cubic-bezier(.2,.9,.2,1.1) 1.6s forwards">
   <svg width="40" height="40" viewBox="0 0 24 24" fill="#06324A"><path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11 11 0 003.5.56 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.56 3.5a1 1 0 01-.25 1z"/></svg>Call now</div>
</div>
<style>@keyframes up{to{transform:none}}</style>
<div class="sub a" style="--d:2.6;top:1200px;font-size:36px">One tap to reach you, on any phone.</div>""", dots=1))
S['f3'] = (5, page(5, """
<h1 class="a" style="--d:.2;top:90px;font-size:62px">More reviews, <em>one text at a time</em></h1>
<div class="card a" style="--d:.7;left:150px;top:380px;width:780px;height:520px;padding:50px;text-align:center">
 <div style="font-size:30px;color:#5B7886">Google reviews</div>
 <div id="n" style="font-family:Poppins;font-weight:700;font-size:200px;line-height:1.1;color:#0B2A3A">10</div>
 <div style="color:#E8A400;font-size:70px;letter-spacing:8px">★★★★★</div>
</div>
<div class="a" style="--d:1.6;position:absolute;left:150px;top:960px;width:780px;background:#fff;color:#0B2A3A;border-radius:30px 30px 30px 6px;padding:30px 36px;font-size:32px;line-height:1.35;box-shadow:0 20px 50px rgba(0,0,0,.3)">Thanks for choosing Gold Standard! Would you leave us a quick review? <span style="color:#1A8FC4;font-weight:700">tap here</span></div>
<div class="sub a" style="--d:3.2;top:1190px;font-size:34px">A simple link to ask every happy customer.</div>
<script>window.__tick=(t)=>{const x=Math.min(1,Math.max(0,(t-1800)/2000));document.getElementById('n').textContent=10+Math.round(x*5)};</script>""", dots=2))
S['f4'] = (5, page(5, """
<h1 class="a" style="--d:.2;top:90px;font-size:62px">See what’s <em>working</em></h1>
<div class="card a" style="--d:.7;left:100px;top:360px;width:880px;height:640px;padding:50px 56px">
 <div style="font-size:30px;color:#5B7886">This month (example)</div>
 <div style="display:flex;gap:26px;align-items:flex-end;height:360px;margin-top:40px;border-bottom:4px solid #D6E6EC">
  <div style="flex:1;background:#1A8FC4;border-radius:14px 14px 0 0;height:0;animation:g 1s ease 1.2s forwards;--h:300px"></div>
  <div style="flex:1;background:#35D0E0;border-radius:14px 14px 0 0;height:0;animation:g 1s ease 1.5s forwards;--h:180px"></div>
  <div style="flex:1;background:#FFC83D;border-radius:14px 14px 0 0;height:0;animation:g 1s ease 1.8s forwards;--h:90px"></div>
 </div>
 <div style="display:flex;gap:26px;margin-top:18px;font-size:32px;font-weight:600;text-align:center"><div style="flex:1">Visits</div><div style="flex:1">Calls</div><div style="flex:1">Quotes</div></div>
</div>
<style>@keyframes g{to{height:var(--h)}}</style>
<div class="sub a" style="--d:3;top:1080px;font-size:36px">How many visit, how many call, and from where,<br>so every dollar goes further.</div>""", dots=3))
# 5 ladder
lad = ''.join('<div style="height:86px;border-bottom:2px solid #E3EEF2;display:flex;align-items:center;padding:0 30px;font-size:32px;color:#6E8794;font-weight:600"><span style="width:50px">%d</span>Other pool companies</div>'%i for i in range(1,9))
S['s5'] = (7, page(7, """
<h1 class="a" style="--d:.2;top:90px">Climb toward <em>the top 3.</em></h1>
<div class="card a" style="--d:.7;left:130px;top:340px;width:820px;height:700px;overflow:hidden">"""+lad+"""
 <div style="position:absolute;left:0;right:0;top:602px;height:86px;background:#FFC83D;display:flex;align-items:center;padding:0 30px;font-size:34px;font-weight:700;color:#06324A;box-shadow:0 8px 24px rgba(0,0,0,.3);animation:climb 3s cubic-bezier(.6,0,.2,1) 1.8s forwards"><span style="width:50px" id="rk">8</span>Gold Standard Pool Service</div>
</div>
<style>@keyframes climb{to{top:172px}}</style>
<div class="sub a" style="--d:5;top:1090px;font-size:36px;color:#fff">Better title, call button, reviews, and tracking<br>all push the same direction.</div>
<div class="sub a" style="--d:5.6;top:1215px;font-size:27px;color:#fff;text-shadow:0 2px 6px #041F30">Goal, not a promise. Rankings move daily.</div>
<script>window.__tick=(t)=>{const x=Math.min(1,Math.max(0,(t-1800)/3000));const e=x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;document.getElementById('rk').textContent=8-Math.round(e*5)};</script>"""))
# 6 CTA
S['s6'] = (7, page(7, """
<h1 class="a" style="--d:.2;top:150px">Want to see it on <em>your own site?</em></h1>
<div class="sub a" style="--d:1;top:420px;font-size:44px;color:#fff">A 10-minute screen share.<br>No cost, no pressure.</div>
<div class="a" style="--d:2;position:absolute;left:150px;right:150px;top:640px;background:#FFC83D;color:#06324A;border-radius:60px;text-align:center;padding:40px 20px;font-family:Poppins;font-weight:700;font-size:62px;box-shadow:0 20px 50px rgba(0,0,0,.35)">(972) 388-1759</div>
<div class="sub a" style="--d:2.8;top:850px;font-size:40px;color:#fff;font-weight:700">Tom, 24 Hour AI Solutions</div>
<div class="sub a" style="--d:3.2;top:920px;font-size:30px">Or just reply to my email.</div>"""))
json.dump({k: v[0] for k, v in S.items()}, open('durs.json', 'w'))
for k, (d, h) in S.items():
    open('scenes/%s.html' % k, 'w').write(h)
print({k: v[0] for k, v in S.items()}, sum(v[0] for v in S.values()))
