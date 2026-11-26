CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1350px;overflow:hidden}
body{font-family:'DM Sans',sans-serif;color:#fff;background:radial-gradient(1200px 900px at 20% 0%,#0F5E7E 0%,#06324A 55%,#041F30 100%);position:relative;
 animation:sceneout .4s linear calc(var(--D)*1s - .4s) both}
@keyframes sceneout{to{opacity:0}}
.wave{position:absolute;left:-200px;bottom:-40px;width:1480px;height:220px;opacity:.5;animation:drift 8s linear infinite}
.wave.w2{bottom:-70px;opacity:.3;animation-duration:12s;animation-direction:reverse}
@keyframes drift{to{transform:translateX(-200px)}}
.a{opacity:0;animation:pop .6s cubic-bezier(.2,.8,.2,1) calc(var(--d)*1s) both}
@keyframes pop{from{opacity:0;transform:translateY(36px) scale(.97)}to{opacity:1;transform:none}}
h1{font-family:'Poppins',sans-serif;font-weight:700;font-size:70px;line-height:1.08;letter-spacing:-1px;text-align:center;padding:0 70px;position:absolute;left:0;right:0}
h1 em{font-style:normal;color:#FFC83D}
.sub{font-size:36px;color:#BFE9F2;text-align:center;position:absolute;left:0;right:0;padding:0 90px;line-height:1.3}
.card{position:absolute;background:#fff;color:#0B2A3A;border-radius:34px;box-shadow:0 30px 70px rgba(0,0,0,.35)}
.dots{position:absolute;bottom:70px;left:0;right:0;display:flex;justify-content:center;gap:16px;z-index:5}
.dots i{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.25)}
.dots i.on{background:#FFC83D}
"""
WAVE = '<svg class="wave" viewBox="0 0 1480 220"><path d="M0 100 Q 92 40 185 100 T 370 100 T 555 100 T 740 100 T 925 100 T 1110 100 T 1295 100 T 1480 100 V220 H0Z" fill="#35D0E0"/></svg><svg class="wave w2" viewBox="0 0 1480 220"><path d="M0 100 Q 92 40 185 100 T 370 100 T 555 100 T 740 100 T 925 100 T 1110 100 T 1295 100 T 1480 100 V220 H0Z" fill="#6FE3E8"/></svg>'
def page(D, body, dots=None):
    d = ''
    if dots is not None:
        d = '<div class="dots">' + ''.join('<i class="%s"></i>' % ('on' if i == dots else '') for i in range(4)) + '</div>'
    return ('<html><head><meta charset="utf8"><style>:root{--D:%s}%s</style></head><body>%s%s%s</body></html>' % (D, CSS, body, WAVE if dots is None else '', d))
