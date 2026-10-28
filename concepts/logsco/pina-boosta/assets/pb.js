/* Pina Boosta — site interactions (v2.1). No dependencies.
   All content is in the HTML; this file only adds motion and interactivity.
   html.js     = JS available (set inline in <head>)
   html.motion = JS available and prefers-reduced-motion is not "reduce"
   Scroll engine: every geometry read happens in relayout() (on load, resize, font load,
   content resize). The per-frame scroll handlers only do arithmetic and write
   transform / opacity, so scrolling never forces a synchronous layout. */
(function(){
  'use strict';
  var d=document, H=d.documentElement, W=window;
  var motion=H.classList.contains('motion');
  var fine=false; try{fine=W.matchMedia('(hover:hover) and (pointer:fine)').matches}catch(e){}
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  function clamp(v,a,b){return v<a?a:v>b?b:v}
  function lerp(a,b,t){return a+(b-a)*t}
  function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
  function seg(p,a,b){return clamp((p-a)/(b-a),0,1)}
  function pad(n,l){var s=String(n);while(s.length<l)s='0'+s;return s}
  function docTop(el){var t=0;while(el){t+=el.offsetTop;el=el.offsetParent}return t}

  /* ---------- toast ---------- */
  var toast=$('#toast'), toastDefault=toast?toast.textContent:'', tt;
  function showToast(msg){
    if(!toast)return;
    toast.textContent=msg||toastDefault;
    toast.classList.add('show');clearTimeout(tt);
    tt=setTimeout(function(){toast.classList.remove('show')},3600);
  }

  /* ---------- drawer (focus trap, Esc, scroll lock) ---------- */
  var bur=$('#burger'), dr=$('#drawer'), dc=$('#dclose'), lockY=0;
  function drawerOpen(){return dr&&dr.classList.contains('open')}
  function setDrawer(o,refocus){
    if(!dr||o===drawerOpen())return;
    dr.classList.toggle('open',o);
    bur.setAttribute('aria-expanded',o?'true':'false');
    if(o){lockY=W.pageYOffset;H.classList.add('lock');setTimeout(function(){dc.focus()},60)}
    else{H.classList.remove('lock');if(refocus)bur.focus()}
    $$('main,footer,.concept,.nav .wrap>:not(.burger)').forEach(function(el){if(o)el.setAttribute('inert','');else el.removeAttribute('inert')});
  }
  if(bur&&dr){
    bur.addEventListener('click',function(){setDrawer(true)});
    dc.addEventListener('click',function(){setDrawer(false,true)});
    d.addEventListener('keydown',function(e){
      if(!drawerOpen())return;
      if(e.key==='Escape'){e.preventDefault();setDrawer(false,true);return}
      if(e.key==='Tab'){
        var f=$$('a[href],button:not([disabled])',dr).filter(function(x){return x.offsetParent!==null});
        if(!f.length)return;
        var first=f[0], last=f[f.length-1];
        if(e.shiftKey&&(d.activeElement===first||!dr.contains(d.activeElement))){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&(d.activeElement===last||!dr.contains(d.activeElement))){e.preventDefault();first.focus()}
      }
    });
    $$('a',dr).forEach(function(a){a.addEventListener('click',function(){setDrawer(false)})});
    W.addEventListener('resize',function(){if(drawerOpen()&&W.innerWidth>1100)setDrawer(false)});
  }

  /* ---------- reveal on scroll ---------- */
  var rvs=$$('.rv');
  if('IntersectionObserver' in W){
    var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{threshold:.08,rootMargin:'0px 0px -4% 0px'});
    rvs.forEach(function(el){
      var sib=el.parentNode?Array.prototype.indexOf.call(el.parentNode.children,el):0;
      el.style.transitionDelay=Math.min(sib,4)*70+'ms';rio.observe(el);
    });
  }else{rvs.forEach(function(el){el.classList.add('in')})}
  // safety net: anything above the current viewport (e.g. after a jump link) is revealed at once
  function revealAbove(){var lim=W.innerHeight;for(var i=0;i<rvs.length;i++){if(!rvs[i].classList.contains('in')&&rvs[i].getBoundingClientRect().top<lim)rvs[i].classList.add('in')}}
  W.addEventListener('hashchange',function(){setTimeout(revealAbove,50)});

  /* ---------- scroll engine ---------- */
  var subs=[], layouts=[], ticking=false, vh=W.innerHeight, vw=W.innerWidth, docH=1;
  function frame(){ticking=false;var y=W.pageYOffset;for(var i=0;i<subs.length;i++)subs[i](y)}
  function req(){if(!ticking){ticking=true;W.requestAnimationFrame(frame)}}
  var cb=$('.concept'), navEl=$('#nav'), navH=72;
  function relayout(){
    vh=W.innerHeight;vw=d.documentElement.clientWidth||W.innerWidth;
    navH=navEl?navEl.offsetHeight:0;H.style.setProperty('--nh',navH+'px');
    if(cb)H.style.setProperty('--cb',cb.offsetHeight+'px');
    for(var i=0;i<layouts.length;i++)layouts[i]();
    docH=d.documentElement.scrollHeight;
    frame();
  }
  var rt;function relayoutSoon(){clearTimeout(rt);rt=setTimeout(relayout,60)}
  W.addEventListener('scroll',req,{passive:true});
  W.addEventListener('resize',relayoutSoon);
  W.addEventListener('orientationchange',function(){setTimeout(relayout,250)});
  W.addEventListener('load',relayout);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(relayout);
  if('ResizeObserver' in W){var lastBH=0;new ResizeObserver(function(){var h=d.body.offsetHeight;if(Math.abs(h-lastBH)>2){lastBH=h;relayoutSoon()}}).observe(d.body)}

  /* scroll progress bar */
  var sp=$('.sprog i');
  if(sp)subs.push(function(y){var m=docH-vh;sp.style.transform='scaleX('+(m>0?clamp(y/m,0,1):0).toFixed(4)+')'});

  /* ---------- pointer (for parallax + cursor) ---------- */
  var mx=0,my=0,smx=0,smy=0,px=-100,py=-100,rx=-100,ry=-100;
  if(fine&&motion){
    W.addEventListener('mousemove',function(e){px=e.clientX;py=e.clientY;mx=e.clientX/vw*2-1;my=e.clientY/vh*2-1},{passive:true});
  }

  /* ================= HERO SCROLL SEQUENCE ================= */
  var hx=$('.hx'), hxRender=null;
  if(hx&&motion){
    var q=function(s){return $(s,hx)};
    var stage=q('.hx-stage'),hb=q('.hx-bottle'),w1=q('.hw1'),w2=q('.hw2'),i1=q('.hw1 .hwi'),i2=q('.hw2 .hwi'),kick=q('.hx-intro .kick'),
        sub=q('.hx-sub'),stk=q('.hx-stk'),sun=q('.hx-sun'),r1=q('.hx-out .r1'),r2=q('.hx-out .r2'),calls=$$('.hx-call',hx),
        outro=q('.hx-outro'),hint=q('.hx-hint'),bits=$$('.bit',hx),g1=q('.gl1'),g2=q('.gl2'),hxLinks=$$('a',hx);
    var hTop=0,hLen=1,mob=false;
    // [x(vw), y(vh), rotate(deg), scale] for the "burst" (p≈.32) and "exit" (p=1) states. Start = burst * .55
    var BP=[[-28,-20,-25,1],[26,-24,20,1],[-15,22,-35,1.1],[31,18,140,.9],[19,-6,28,1],[-34,8,0,.8],[-10,-30,0,1],[-22,-2,-15,1],[14,30,0,1],[8,-34,200,.9]];
    var EP=[[-40,-70,-80,1.2],[36,-75,120,1.1],[-28,-40,-60,1.3],[48,-30,220,1],[30,-60,60,1],[-50,-45,180,.9],[-12,-80,90,1],[-34,-70,-40,1],[20,-40,120,1],[12,-90,260,1]];
    var DEPTH=[1.2,1,2.2,.8,1.4,2,.6,1.1,1.8,.7];
    // bottle keyframes [p, x(vw), y(vh), rotate, scale]; the last two rows are recomputed in layout so the
    // bottle (and the sun behind it) clear the outro copy at every viewport size.
    var BOT_D=[[0,0,0,0,1],[.25,0,-2,-10,1.12],[.45,-2,0,6,1.08],[.62,2,-1,-4,1.1],[.78,22,2,8,.92],[1,24,-4,12,.88]];
    var BOT_M=[[0,0,0,0,1],[.25,0,-6,-8,.9],[.45,0,-10,5,.82],[.62,0,-10,-4,.82],[.78,0,-17,6,.6],[1,0,-19,10,.56]];
    // callouts: [in start, in end, out start, out end]
    var CALL_D=[[.27,.33,.66,.72],[.37,.43,.66,.72],[.47,.53,.66,.72]];
    var CALL_M=[[.2,.24,.36,.4],[.38,.42,.52,.56],[.54,.58,.68,.72]];
    var OUT_IN=[.72,.84], SUN_END=1;
    function isMob(){return vw<=760||vw/vh<.9}
    layouts.push(function(){
      mob=isMob();
      hTop=docTop(hx)-navH;hLen=Math.max(1,hx.offsetHeight-vh+navH);
      var sh=stage.clientHeight||vh-navH, bh=hb.offsetHeight||vh*.5, bw=hb.offsetWidth||bh*.405, sunW=sun.offsetWidth||vh*.7;
      if(!mob){
        // keep the sun's visible disc right of the outro text
        var rg=d.createRange();rg.selectNodeContents(outro);var orc=rg.getBoundingClientRect(), src=stage.getBoundingClientRect();
        var oRight=orc.width?orc.right-src.left:vw*.45;
        var sEnd=.9, rVis=sunW/2*sEnd*.68, cx=Math.max(vw*.74,oRight+28+rVis);
        var cxMax=vw-24-bw*.88/2; if(cx>cxMax){cx=cxMax;sEnd=Math.max(.6,(cx-oRight-28)/(sunW/2*.68))}
        SUN_END=sEnd;
        var xv=(cx-vw/2)/vw*100;
        BOT_D[4][1]=xv-2;BOT_D[5][1]=xv;
      }else{
        // stack: bottle centred in the space above the outro block
        var oh=outro.offsetHeight||sh*.4, oTop=sh-26-oh, s=clamp((oTop-28)/bh,.34,.6);
        var cy=Math.max(12+bh*s/2,oTop/2+4), yv=(cy-sh*.53)/vh*100;
        BOT_M[4][2]=yv+2;BOT_M[4][4]=s*1.06;BOT_M[5][2]=yv;BOT_M[5][4]=s;SUN_END=.62;
      }
    });
    function kf(K,p){
      for(var i=1;i<K.length;i++){if(p<=K[i][0]){var a=K[i-1],b=K[i],t=ease(seg(p,a[0],b[0]));return [lerp(a[1],b[1],t),lerp(a[2],b[2],t),lerp(a[3],b[3],t),lerp(a[4],b[4],t)]}}
      var l=K[K.length-1];return [l[1],l[2],l[3],l[4]];
    }
    function op(el,o){el.style.opacity=o.toFixed(3)}
    function vis(el,o){el.style.visibility=o<.02?'hidden':'visible'}
    var hxLinksOn=true;
    hxRender=function(y){
      var p=clamp((y-hTop)/hLen,0,1), m=mob, kx=m?1.25:1, ky=m?.85:1;
      // bottle
      var b=kf(m?BOT_M:BOT_D,p);
      hb.style.transform='translate3d(calc('+b[0].toFixed(2)+'vw + '+(smx*10).toFixed(1)+'px),calc('+b[1].toFixed(2)+'vh + '+(smy*8).toFixed(1)+'px),0) rotate('+(b[2]+smx*2).toFixed(2)+'deg) scale('+b[3].toFixed(3)+')';
      // sun follows bottle: grows in, holds, settles smaller under the outro
      var sIn=ease(seg(p,.06,.34)), sOut=ease(seg(p,OUT_IN[0]-.04,OUT_IN[1]));
      sun.style.transform='translate3d('+b[0].toFixed(2)+'vw,'+b[1].toFixed(2)+'vh,0) scale('+(lerp(.35,1,sIn)+seg(p,.34,.62)*.15-sOut*(1.15-SUN_END)).toFixed(3)+')';
      op(sun,sIn*.95-sOut*(m?.5:.15));
      // headline: words wipe up inside their masks (no half-words drifting over the bottle)
      var e1=ease(seg(p,.025,.15)), e2=ease(seg(p,.045,.17));
      i1.style.transform='translate3d(0,'+(-e1*112).toFixed(2)+'%,0)';
      i2.style.transform='translate3d(0,'+(-e2*112).toFixed(2)+'%,0)';
      op(i1,1-seg(e1,.45,.9));op(i2,1-seg(e2,.45,.9));
      w1.style.transform=m?'none':'translate3d('+(-e1*5).toFixed(2)+'vw,0,0)';
      w2.style.transform=m?'none':'translate3d('+(e2*5).toFixed(2)+'vw,0,0)';
      op(kick,1-seg(p,.01,.08));
      var so=1-seg(p,.02,.11);op(sub,so);sub.style.transform='translate3d(0,'+((1-so)*24).toFixed(1)+'px,0)';vis(sub,so);
      op(stk,so);stk.style.transform='rotate('+(p*200).toFixed(1)+'deg) scale('+(1-(1-so)*.4).toFixed(3)+')';
      if(hint)op(hint,1-seg(p,0,.05));
      // outline rows (fade back while the outro copy is on screen)
      var oi=ease(seg(p,OUT_IN[0],OUT_IN[1]));
      var ro=seg(p,.14,.3)*(1-oi*.8);
      op(r1,ro*.9);op(r2,ro*.9);
      r1.style.transform='translate3d('+(-5-p*38).toFixed(2)+'%,0,0)';
      r2.style.transform='translate3d('+(-40+p*38).toFixed(2)+'%,0,0)';
      // glow
      g1.style.transform='scale('+(1+p*.5).toFixed(3)+')';g2.style.opacity=(.4+p*.5).toFixed(3);
      // bits
      var bt=ease(seg(p,0,.32)), et=ease(seg(p,.62,1));
      for(var i=0;i<bits.length;i++){
        var B=BP[i],E=EP[i],dp=DEPTH[i];
        var x=lerp(lerp(B[0]*.55,B[0],bt),E[0],et)*kx, yy=lerp(lerp(B[1]*.55,B[1],bt),E[1],et)*ky,
            r=lerp(lerp(B[2]*.4,B[2],bt),E[2],et), s=lerp(lerp(B[3]*.7,B[3],bt),E[3],et)*(m?.9:1);
        bits[i].style.transform='translate3d(calc('+x.toFixed(2)+'vw + '+(smx*dp*-22).toFixed(1)+'px),calc('+yy.toFixed(2)+'vh + '+(smy*dp*-16).toFixed(1)+'px),0) rotate('+r.toFixed(1)+'deg) scale('+s.toFixed(3)+')';
        op(bits[i],1-seg(p,.86,.98));
      }
      // callouts
      var C=m?CALL_M:CALL_D;
      for(var c=0;c<calls.length;c++){
        var k=C[c], inn=ease(seg(p,k[0],k[1])), out=ease(seg(p,k[2],k[3])), o=inn*(1-out);
        op(calls[c],o);vis(calls[c],o);
        calls[c].style.transform='translate3d('+((1-inn)*(m?0:(c===1?40:-40))).toFixed(1)+'px,'+((1-inn)*30-out*30).toFixed(1)+'px,0)';
      }
      // outro
      op(outro,oi);outro.style.transform='translate3d(0,'+((1-oi)*44).toFixed(1)+'px,0)';vis(outro,oi);
      outro.classList.toggle('live',oi>.5);
      // keep hidden links out of the tab order
      var linksOn=so>.5;if(linksOn!==hxLinksOn){hxLinksOn=linksOn;$$('a',sub).forEach(function(a){if(linksOn)a.removeAttribute('tabindex');else a.tabIndex=-1})}
    };
    subs.push(function(y){if(y<hTop+hLen+vh)hxRender(y)});
    // keyboard users tabbing into the outro CTA: scroll it into its visible state
    $$('a',outro).forEach(function(a){a.addEventListener('focus',function(){if(!outro.classList.contains('live'))W.scrollTo(0,hTop+hLen*.9)})});
  }

  /* ================= HORIZONTAL FARM-TO-BOTTLE ================= */
  if(motion){
    $$('.hs').forEach(function(hs){
      var tr=$('.hs-track',hs), bar=$('.hs-bar',hs), cnt=$('.hs-count b',hs), imgs=$$('.hs-ph img',hs);
      var top0=0,dist=1,n=$$('.hs-p',hs).length-1,last=-1,cx=[];
      layouts.push(function(){
        tr.style.transform='';
        dist=Math.max(1,tr.scrollWidth-vw);
        hs.style.height=(dist+vh-navH)+'px';
        top0=docTop(hs)-navH;
        if(bar)bar.style.setProperty('--bw',bar.clientWidth+'px');
        var tl=tr.getBoundingClientRect().left;
        cx=imgs.map(function(im){var r=im.parentNode.getBoundingClientRect();return r.left-tl+r.width/2});
        last=-1;
      });
      subs.push(function(y){
        if(y<top0-vh||y>top0+dist+vh)return;
        var p=clamp((y-top0)/dist,0,1), shift=-p*dist;
        tr.style.transform='translate3d('+shift.toFixed(1)+'px,0,0)';
        hs.style.setProperty('--hp',p.toFixed(4));
        var idx=clamp(Math.round(p*n),1,n);
        if(idx!==last&&cnt){cnt.textContent=pad(idx,2);last=idx}
        for(var i=0;i<imgs.length;i++){
          var off=(cx[i]+shift-vw/2)/vw;
          imgs[i].style.transform='scale(1.15) translate3d('+(off*-9).toFixed(2)+'%,0,0)';
        }
      });
    });
  }

  /* ================= PARALLAX + DRIFT ================= */
  if(motion){
    var par=$$('[data-speed]').map(function(el){return {el:el,k:parseFloat(el.getAttribute('data-speed')),t:0,h:0}}),
        dri=$$('[data-drift]').map(function(el){return {el:el,k:parseFloat(el.getAttribute('data-drift')),t:0,h:0}});
    layouts.push(function(){
      par.forEach(function(o){var pn=o.el.parentNode;o.t=docTop(pn);o.h=pn.offsetHeight});
      dri.forEach(function(o){o.t=docTop(o.el);o.h=o.el.offsetHeight});
    });
    subs.push(function(y){
      for(var i=0;i<par.length;i++){var o=par[i],top=o.t-y;if(top+o.h<-100||top>vh+100)continue;
        o.el.style.transform='translate3d(0,'+(-(top+o.h/2-vh/2)*o.k).toFixed(1)+'px,0)'}
      for(var j=0;j<dri.length;j++){var r=dri[j],t2=r.t-y;if(t2+r.h<-200||t2>vh+200)continue;
        r.el.style.transform='translate3d('+((t2+r.h/2-vh/2)*r.k).toFixed(1)+'px,0,0)'}
    });
  }

  /* ================= SCROLL-HIGHLIGHT WORDS ================= */
  if(motion){
    $$('[data-hl]').forEach(function(el){
      (function wrap(node){
        Array.prototype.slice.call(node.childNodes).forEach(function(ch){
          if(ch.nodeType===3){
            var parts=ch.textContent.split(/(\s+)/), frag=d.createDocumentFragment();
            parts.forEach(function(t){
              if(!t)return;
              if(/^\s+$/.test(t)){frag.appendChild(d.createTextNode(t))}
              else{var s=d.createElement('span');s.className='hlw';s.textContent=t;frag.appendChild(s)}
            });
            node.replaceChild(frag,ch);
          }else if(ch.nodeType===1){wrap(ch)}
        });
      })(el);
      var ws=$$('.hlw',el), lastN=-1, top=0, h=1, done=false;
      layouts.push(function(){top=docTop(el);h=el.offsetHeight});
      subs.push(function(y){
        if(done)return;
        var t=top-y;
        // arm the dim state only shortly before the paragraph enters the viewport, and light words
        // once only: scrolled-past copy stays fully readable.
        el.classList.toggle('hl-arm',t<vh*1.4);
        if(t+h<0||t>vh)return;
        var p=clamp((vh*.9-t)/(h+vh*.35),0,1), nOn=Math.max(lastN,Math.floor(p*ws.length*1.15));
        if(nOn===lastN)return;lastN=nOn;
        for(var i=0;i<ws.length;i++)ws[i].classList.toggle('on',i<nOn);
        if(nOn>=ws.length){done=true;el.classList.add('hl-done')}
      });
    });
  }

  /* ================= TIMELINES ================= */
  $$('[data-tl]').forEach(function(tl){
    var items=$$('.tl-i',tl), lines=$('.tl-line',tl);
    if(!motion){items.forEach(function(i){i.classList.add('passed')});return}
    var top=0,h=1,its=[];
    layouts.push(function(){top=docTop(tl);h=tl.offsetHeight;its=items.map(function(it){return docTop(it)})});
    subs.push(function(y){
      var t=top-y;if(t+h<-50||t>vh+50)return;
      tl.style.setProperty('--tp',clamp((vh*.62-t)/h,0,1).toFixed(4));
      for(var i=0;i<items.length;i++)items[i].classList.toggle('passed',its[i]-y<vh*.62);
    });
  });

  /* ================= BOTTLE WALL ================= */
  $$('[data-bwall]').forEach(function(w){
    if(!motion)return;
    var bs=$$('i',w), last=-1, top=0, h=1, visN=bs.length;
    layouts.push(function(){top=docTop(w);h=w.offsetHeight;visN=bs.filter(function(b){return b.offsetWidth>0}).length||bs.length;last=-1});
    subs.push(function(y){
      var t=top-y;if(t+h<-50||t>vh+50)return;
      var n=Math.floor(clamp((vh*.92-t)/(h+vh*.25),0,1)*visN);
      if(n===last)return;last=n;
      for(var i=0;i<bs.length;i++)bs[i].classList.toggle('lit',i<n);
    });
  });

  /* ================= COUNTERS ================= */
  var cts=$$('[data-count]');
  if(motion&&'IntersectionObserver' in W&&cts.length){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;cio.unobserve(e.target);
      var el=e.target,to=parseInt(el.getAttribute('data-count'),10),pd=parseInt(el.getAttribute('data-pad')||'0',10),t0=null;
      function step(ts){if(!t0)t0=ts;var t=clamp((ts-t0)/1300,0,1);el.textContent=pad(Math.round(to*ease(t)),pd);if(t<1)W.requestAnimationFrame(step)}
      el.textContent=pad(0,pd);W.requestAnimationFrame(step);
    })},{threshold:.6});
    cts.forEach(function(c){cio.observe(c)});
  }

  /* ================= MOMENT SWITCHER ================= */
  $$('.msw').forEach(function(sw){
    var tabs=$$('.mt',sw), panels=$$('.mp',sw), word=$('.msw-word',sw), clock=$('.msw-clock span',sw), auto=null, touched=false, idx=0, inView=false, paused=false;
    function set(i,focus){
      idx=(i+tabs.length)%tabs.length;
      var t=tabs[idx], m=t.getAttribute('data-m');
      sw.setAttribute('data-m',m);
      tabs.forEach(function(b,j){b.setAttribute('aria-selected',j===idx?'true':'false');b.tabIndex=j===idx?0:-1});
      panels.forEach(function(p){var on=p.getAttribute('data-m')===m;p.classList.toggle('on',on);p.hidden=false;p.setAttribute('aria-hidden',on?'false':'true');p.tabIndex=on?0:-1});
      if(word)word.textContent=$('span',t).textContent;
      if(clock)clock.textContent=$('i',t).textContent;
      if(focus)t.focus();
    }
    function stop(){if(auto){clearInterval(auto);auto=null}}
    function maybeStart(){if(motion&&inView&&!touched&&!paused&&!auto&&!d.hidden)auto=setInterval(function(){set(idx+1)},6500)}
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){touched=true;stop();set(i)});
      t.addEventListener('keydown',function(e){
        var k=e.key, n=null;
        if(k==='ArrowRight'||k==='ArrowDown')n=idx+1;else if(k==='ArrowLeft'||k==='ArrowUp')n=idx-1;else if(k==='Home')n=0;else if(k==='End')n=tabs.length-1;
        if(n!==null){e.preventDefault();touched=true;stop();set(n,true)}
      });
    });
    // pause auto-cycling while the reader is pointing at or inside the switcher
    sw.addEventListener('mouseenter',function(){paused=true;stop()});
    sw.addEventListener('mouseleave',function(){paused=false;maybeStart()});
    sw.addEventListener('focusin',function(){paused=true;stop()});
    sw.addEventListener('focusout',function(e){if(!sw.contains(e.relatedTarget)){paused=false;maybeStart()}});
    d.addEventListener('visibilitychange',function(){if(d.hidden)stop();else maybeStart()});
    set(0);
    if(motion&&'IntersectionObserver' in W){
      new IntersectionObserver(function(es){es.forEach(function(e){inView=e.isIntersecting;if(inView)maybeStart();else stop()})},{threshold:.5}).observe(sw);
    }
  });

  /* ================= STICKY BENEFITS ================= */
  $$('.sb').forEach(function(sb){
    var ps=$$('.sb-p',sb);
    sb.setAttribute('data-b',ps[0].getAttribute('data-b'));ps[0].classList.add('on');
    if(!('IntersectionObserver' in W))return;
    var io=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;
      ps.forEach(function(p){p.classList.toggle('on',p===e.target)});
      sb.setAttribute('data-b',e.target.getAttribute('data-b'));
    })},{rootMargin:'-45% 0px -45% 0px'});
    ps.forEach(function(p){io.observe(p)});
  });

  /* ================= BOTTLE HOTSPOTS ================= */
  $$('.anat').forEach(function(a){
    var hots=$$('.hot',a), lis=$$('.hot-list li',a);
    function on(k){
      hots.forEach(function(h){var o=h.getAttribute('data-hot')===k;h.classList.toggle('on',o);h.setAttribute('aria-pressed',o?'true':'false')});
      lis.forEach(function(l){l.classList.toggle('on',l.getAttribute('data-hot')===k)});
    }
    hots.forEach(function(h){var k=h.getAttribute('data-hot');['mouseenter','focus','click'].forEach(function(ev){h.addEventListener(ev,function(){on(k)})})});
    lis.forEach(function(l){l.addEventListener('mouseenter',function(){on(l.getAttribute('data-hot'))})});
    if(hots[0])on(hots[0].getAttribute('data-hot'));
  });

  /* ================= ODOMETERS ================= */
  function setOdoText(o,str){var t=$('[data-odo-sr]',o);if(t)t.textContent=str}
  function buildOdo(o){
    $$('.odo-d i',o).forEach(function(i){
      var s=d.createElement('span');
      for(var r=0;r<3;r++)for(var n=0;n<10;n++){var b=d.createElement('b');b.textContent=n;s.appendChild(b)}
      i.appendChild(s);i.classList.add('built');
      var v=parseInt(i.getAttribute('data-v'),10)||0;
      s.style.transition='none';s.style.transform='translateY(-'+v+'em)';
    });
  }
  function rollOdo(o,num){
    var str=pad(num,4);
    $$('.odo-d i',o).forEach(function(i,k){
      var s=$('span',i), cur=parseInt(i.getAttribute('data-v'),10)||0, v=parseInt(str[k],10);
      clearTimeout(i._t);
      s.style.transition='none';s.style.transform='translateY(-'+cur+'em)';
      void s.offsetWidth;
      s.style.transition='transform '+(1.1+k*.25)+'s cubic-bezier(.2,.8,.2,1)';
      s.style.transform='translateY(-'+(20+v)+'em)';
      i.setAttribute('data-v',v);
      i._t=setTimeout(function(){s.style.transition='none';s.style.transform='translateY(-'+v+'em)'},(1.1+k*.25)*1000+60);
    });
    setOdoText(o,str);
  }
  var odos=$$('[data-odo]');
  if(motion){
    odos.forEach(buildOdo);
    if('IntersectionObserver' in W){
      var oio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){oio.unobserve(e.target);rollOdo(e.target,1)}})},{threshold:.6});
      odos.forEach(function(o){oio.observe(o)});
    }
  }
  var spin=$('#spin'), odo=$('#odo'), lastSpin=1;
  if(spin&&odo){
    spin.addEventListener('click',function(){
      var n;do{n=1+Math.floor(Math.random()*999)}while(n===lastSpin);lastSpin=n;
      if(motion)rollOdo(odo,n);
      else{var s=pad(n,4);$$('.odo-d i',odo).forEach(function(i,k){i.setAttribute('data-v',s[k])});setOdoText(odo,s)}
    });
  }
  var tag=$('[data-tagnum]');
  if(tag&&motion){
    setInterval(function(){
      if(d.hidden)return;
      var n=0,t=setInterval(function(){
        tag.textContent=pad(Math.floor(Math.random()*10000),4);
        if(++n>10){clearInterval(t);tag.textContent=pad(1+Math.floor(Math.random()*999),4)}
      },45);
    },3200);
  }

  /* ================= COUNTDOWN (date TBA) ================= */
  var cd=$('.cd');
  if(cd&&motion){
    var cdb=$$('[data-cd]',cd), cdT=null;
    function scramble(){
      var n=0,t=setInterval(function(){
        cdb.forEach(function(b){var G='?✦–?';b.textContent=G[Math.floor(Math.random()*4)]+G[Math.floor(Math.random()*4)]});
        if(++n>14){clearInterval(t);cdb.forEach(function(b){b.textContent='--'})}
      },50);
    }
    if('IntersectionObserver' in W){
      new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting){scramble();if(!cdT)cdT=setInterval(function(){if(!d.hidden)scramble()},5200)}
        else if(cdT){clearInterval(cdT);cdT=null}
      })},{threshold:.5}).observe(cd);
    }
  }

  /* ================= FAQ FILTER ================= */
  var ff=$('.ff');
  if(ff){
    var fq=$('#fsq'), fcs=$$('.fc',ff), groups=$$('.fg'), none=$('.f-none'), cnt=$('.f-count'), cat='all', openState=null;
    function filt(){
      var t=(fq.value||'').trim().toLowerCase(), any=false, total=0;
      if(t&&!openState)openState=$$('.fgs details').map(function(x){return x.open});
      groups.forEach(function(g){
        var gc=g.getAttribute('data-cat'), shown=0;
        $$('details',g).forEach(function(dt){
          var ok=(cat==='all'||cat===gc)&&(!t||dt.textContent.toLowerCase().indexOf(t)>-1);
          dt.hidden=!ok;if(ok){shown++;if(t)dt.open=true}
        });
        g.hidden=!shown;if(shown)any=true;total+=shown;
      });
      if(!t&&openState){$$('.fgs details').forEach(function(x,i){x.open=openState[i]});openState=null}
      if(none)none.hidden=any;
      if(cnt)cnt.textContent=total===1?'1 question shown':total+' questions shown';
    }
    fq.addEventListener('input',filt);
    fq.addEventListener('keydown',function(e){if(e.key==='Escape'&&fq.value){fq.value='';filt()}});
    fcs.forEach(function(b){b.addEventListener('click',function(){cat=b.getAttribute('data-f');fcs.forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false')});filt()})});
  }

  /* ================= FORMS: validation, draft toast, burst ================= */
  function burst(x,y){
    var c=d.createElement('canvas'),ctx=c.getContext('2d'),dpr=Math.min(W.devicePixelRatio||1,2);
    if(!ctx)return;
    c.className='burst-c';c.setAttribute('aria-hidden','true');c.width=vw*dpr;c.height=vh*dpr;d.body.appendChild(c);ctx.scale(dpr,dpr);
    var COLS=['#f6c632','#ffdf6e','#ef7d22','#7cc142','#2f8f4e','#fff7e3'], P=[];
    for(var i=0;i<110;i++){
      var a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.3, spd=6+Math.random()*11;
      P.push({x:x,y:y,vx:Math.cos(a)*spd,vy:Math.sin(a)*spd,r:Math.random()*6.28,vr:(Math.random()-.5)*.35,s:6+Math.random()*9,
        k:i%9===0?'wedge':i%7===0?'leaf':i%2?'sq':'dot',c:COLS[i%COLS.length]});
    }
    var t0=null;
    function draw(ts){
      if(!t0)t0=ts;var t=(ts-t0)/1000;ctx.clearRect(0,0,vw,vh);
      P.forEach(function(p){
        p.vy+=.32;p.vx*=.985;p.vy*=.985;p.x+=p.vx;p.y+=p.vy;p.r+=p.vr;
        ctx.save();ctx.globalAlpha=clamp(2.4-t,0,1);ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.fillStyle=p.c;
        if(p.k==='sq'){ctx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2)}
        else if(p.k==='dot'){ctx.beginPath();ctx.arc(0,0,p.s/3,0,6.28);ctx.fill()}
        else if(p.k==='leaf'){ctx.fillStyle='#2f8f4e';ctx.beginPath();ctx.ellipse(0,0,p.s*.35,p.s*1.3,0,0,6.28);ctx.fill()}
        else{var s=p.s*1.6;ctx.fillStyle='#f6c632';ctx.beginPath();ctx.moveTo(0,-s);ctx.lineTo(s*.9,s*.6);ctx.quadraticCurveTo(0,s*1.1,-s*.9,s*.6);ctx.closePath();ctx.fill();ctx.fillStyle='#b3701a';ctx.beginPath();ctx.moveTo(s*.9,s*.6);ctx.quadraticCurveTo(0,s*1.1,-s*.9,s*.6);ctx.quadraticCurveTo(0,s*.8,s*.9,s*.6);ctx.fill()}
        ctx.restore();
      });
      if(t<2.6)W.requestAnimationFrame(draw);else c.remove();
    }
    W.requestAnimationFrame(draw);
  }
  var errN=0;
  function fieldMsg(f){
    var v=f.validity;
    if(v.valueMissing)return (f.type==='email'?'Please enter your email address.':'Please fill in this field.');
    if(v.typeMismatch&&f.type==='email')return 'Please enter a valid email address, e.g. name@email.com.';
    if(v.rangeUnderflow)return 'Please enter a number of 1 or more.';
    if(v.badInput)return 'Please enter a number.';
    return f.validationMessage||'Please check this field.';
  }
  function setErr(f,msg){
    var id=f.getAttribute('data-err');
    var box=id?d.getElementById(id):null;
    if(msg){
      if(!box){id='err-'+(++errN);box=d.createElement('span');box.className='err';box.id=id;f.setAttribute('data-err',id);
        (f.closest('.fd-in')||f).insertAdjacentElement('afterend',box);
        var db=(f.getAttribute('aria-describedby')||'').trim();f.setAttribute('aria-describedby',(db?db+' ':'')+id)}
      box.textContent=msg;f.setAttribute('aria-invalid','true');
    }else if(box){box.textContent='';f.removeAttribute('aria-invalid')}
  }
  $$('form[data-draft]').forEach(function(f){
    f.noValidate=true;
    var fields=$$('input:not([type=radio]),select,textarea',f);
    fields.forEach(function(x){
      // only re-check fields already flagged by a submit attempt (a new message on blur would shift the
      // layout under the pointer as someone clicks the submit button)
      x.addEventListener('blur',function(){if(x.getAttribute('aria-invalid')==='true')setErr(x,x.checkValidity()?'':fieldMsg(x))});
      x.addEventListener('input',function(){if(x.getAttribute('aria-invalid')==='true'&&x.checkValidity())setErr(x,'')});
    });
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var bad=null;
      fields.forEach(function(x){var ok=x.checkValidity();setErr(x,ok?'':fieldMsg(x));if(!ok&&!bad)bad=x});
      if(bad){bad.focus();return}
      showToast();
      if(motion&&f.hasAttribute('data-burst')){
        var b=$('button[type="submit"]',f),r=b.getBoundingClientRect();
        burst(r.left+r.width/2,r.top+r.height/2);
      }
    });
  });
  // submit buttons ship disabled so a JS-less visit can't send form data anywhere
  $$('form button[type="submit"][disabled]').forEach(function(b){b.disabled=false});

  /* ================= STOCKIST FINDER ================= */
  var fd=$('#finder');
  if(fd){
    fd.addEventListener('submit',function(e){
      e.preventDefault();
      var qv=($('#fq').value||'').trim(), st=$('#fs').value, ty=$('input[name="st"]:checked',fd), tl=ty?$('label[for="'+ty.id+'"]',fd).textContent:'All';
      var where=qv?qv+(st&&st!=='Outside Malaysia'&&qv.toLowerCase().indexOf(st.toLowerCase())<0?', '+st:''):st;
      if(where==='Outside Malaysia')where='your area';
      fd.classList.add('searching');
      setTimeout(function(){
        fd.classList.remove('searching');
        $('#fd-title').textContent='Not in '+where+' yet.';
        $('#fd-text').textContent='Pina Boosta hasn’t launched in shops yet. '+(tl==='All'?'Stockists':tl+' stockists')+' in '+where+' will be listed here as soon as they’re confirmed.';
      },motion?700:0);
    });
  }

  /* ================= COPY ================= */
  function copy(text,label){
    function ok(){showToast('Copied: '+label)}
    function fallback(){try{var ta=d.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.opacity='0';d.body.appendChild(ta);ta.select();var r=d.execCommand('copy');d.body.removeChild(ta);if(r)ok();else showToast('Copy not available here')}catch(e){showToast('Copy not available here')}}
    try{
      if(navigator.clipboard&&W.isSecureContext){navigator.clipboard.writeText(text).then(ok,fallback)}else fallback();
    }catch(e){fallback()}
  }
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-copy');copy(v,v)})});
  $$('[data-copy-el]').forEach(function(b){b.addEventListener('click',function(){var el=d.getElementById(b.getAttribute('data-copy-el'));if(el)copy(el.textContent.trim(),'boilerplate')})});

  /* ================= MAGNETIC + TILT (fine pointer only) ================= */
  if(fine&&motion){
    $$('.mag').forEach(function(m){
      var inner=$('span',m);
      m.addEventListener('mousemove',function(e){
        var r=m.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);
        m.style.transition='transform .15s ease-out';
        m.style.transform='translate('+(dx*.28).toFixed(1)+'px,'+(dy*.4).toFixed(1)+'px)';
        if(inner)inner.style.transform='translate('+(dx*.1).toFixed(1)+'px,'+(dy*.12).toFixed(1)+'px)';
      });
      m.addEventListener('mouseleave',function(){
        m.style.transition='transform .6s cubic-bezier(.2,.8,.2,1)';m.style.transform='';
        if(inner){inner.style.transition='transform .6s cubic-bezier(.2,.8,.2,1)';inner.style.transform=''}
      });
    });
    $$('.tilt').forEach(function(t){
      t.addEventListener('mousemove',function(e){
        var r=t.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        t.style.transition='transform .2s ease-out';
        t.style.transform='perspective(900px) rotateX('+(-y*7).toFixed(2)+'deg) rotateY('+(x*9).toFixed(2)+'deg) translateZ(0)';
      });
      t.addEventListener('mouseleave',function(){t.style.transition='transform .7s cubic-bezier(.2,.8,.2,1)';t.style.transform=''});
    });
  }

  /* ================= CUSTOM CURSOR (fine pointer only) ================= */
  var cur=$('.cursor');
  if(cur&&fine&&motion){
    H.classList.add('cur');cur.classList.add('hide');
    W.addEventListener('mousemove',function(){cur.classList.remove('hide')},{once:true,passive:true});
    var lab=$('b',cur), cdot=$('.c-dot',cur), cring=$('.c-ring',cur);
    $$('.ben,.duo-c').forEach(function(el){el.setAttribute('data-cursor','Open')});
    $$('.msw-vis,.hx-bottle').forEach(function(el){el.setAttribute('data-cursor','Boosta')});
    $$('.hs-track').forEach(function(el){el.setAttribute('data-cursor','Scroll')});
    d.addEventListener('mouseover',function(e){
      var t=e.target.closest?e.target:null;if(!t)return;
      var l=t.closest('[data-cursor]'), h=t.closest('a,button,summary,label,.hot');
      if(l&&!h){lab.textContent=l.getAttribute('data-cursor');cur.classList.add('lab');cur.classList.remove('hov')}
      else if(h){cur.classList.add('hov');cur.classList.remove('lab')}
      else cur.classList.remove('hov','lab');
      cur.classList.toggle('hide',!!t.closest('input,textarea,select,.drawer'));
    });
    d.addEventListener('mousedown',function(){cur.classList.add('down')});
    d.addEventListener('mouseup',function(){cur.classList.remove('down')});
    d.documentElement.addEventListener('mouseleave',function(){cur.classList.add('hide')});
    d.documentElement.addEventListener('mouseenter',function(){cur.classList.remove('hide')});
  }
  if(fine&&motion){
    (function loop(){
      smx=lerp(smx,mx,.06);smy=lerp(smy,my,.06);
      if(cur&&H.classList.contains('cur')){
        rx=lerp(rx,px,.18);ry=lerp(ry,py,.18);
        cdot.style.transform='translate3d('+px+'px,'+py+'px,0)';
        cring.style.transform='translate3d('+rx.toFixed(1)+'px,'+ry.toFixed(1)+'px,0)';
      }
      if(hxRender&&W.pageYOffset<vh*4&&(Math.abs(smx-mx)>.002||Math.abs(smy-my)>.002))hxRender(W.pageYOffset);
      W.requestAnimationFrame(loop);
    })();
  }

  relayout();
})();
