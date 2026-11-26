import sys,json,subprocess,os
from playwright.sync_api import sync_playwright
k=sys.argv[1]; D=json.load(open('durs.json'))[k]; fps=30; n=int(D*fps)
out='out/%s.tmp.mp4'%k; os.makedirs('out',exist_ok=True)
ff=subprocess.Popen(['ffmpeg','-y','-loglevel','error','-f','image2pipe','-framerate',str(fps),'-i','-','-c:v','libx264','-crf','19','-preset','veryfast','-pix_fmt','yuv420p','-r',str(fps),out],stdin=subprocess.PIPE)
only=[int(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1080,'height':1350})
    pg.goto('file://'+os.path.abspath('scenes/%s.html'%k)); pg.wait_for_timeout(300)
    pg.evaluate("async()=>{document.getAnimations().forEach(a=>a.pause());await Promise.all(document.getAnimations().map(a=>a.ready))}")
    frames=only if only else range(n)
    for i in frames:
        t=i/fps*1000
        pg.evaluate("async t=>{document.getAnimations().forEach(a=>{a.currentTime=t});if(window.__tick)window.__tick(t);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))}",t)
        jpg=pg.screenshot(type='jpeg',quality=92)
        if only: open('out/%s_f%d.jpg'%(k,i),'wb').write(jpg)
        else: ff.stdin.write(jpg)
    b.close()
ff.stdin.close(); rc=ff.wait()
if rc==0 and not only: os.rename(out,'out/%s.mp4'%k)
