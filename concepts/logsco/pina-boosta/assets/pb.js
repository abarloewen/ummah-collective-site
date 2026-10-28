/* Pina Boosta — site interactions (v2). No dependencies.
   All content is in the HTML; this file only adds motion and interactivity.
   html.js     = JS available (set inline in <head>)
   html.motion = JS available and prefers-reduced-motion is not "reduce" */
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
  function isMobile(){return W.innerWidth<=760||W.innerWidth/W.innerHeight<.9}

  /* ---------- toast ---------- */
  var toast=$('#toast'), toastDefault=toast?toast.textContent:'', tt;
  function showToast(msg){
    if(!toast)return;
    toast.textContent=msg||toastDefault;
    toast.classList.add('show');clearTimeout(tt);
    tt=setTimeout(function(){toast.classList.remove('show')},3400);
  }

  /* ---------- drawer ---------- */
  var bur=$('#burger'), dr=$('#drawer'), dc=$('#dclose');
  function setDrawer(o,refocus){
    if(!dr)return;
    dr.classList.toggle('open',o);H.classList.toggle('lock',o);
    bur.setAttribute('aria-expanded',o?'true':'false');
    if(o){setTimeout(function(){dc.focus()},50)}else if(refocus){bur.focus()}
  }
  if(bur&&dr){
    bur.addEventListener('click',function(){setDrawer(true)});
    dc.addEventListener('click',function(){setDrawer(false,true)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&dr.classList.contains('open'))setDrawer(false,true)});
    $$('a',dr).forEach(function(a){a.addEventListener('click',function(){setDrawer(false)})});
  }

  /* ---------- reveal on scroll ---------- */
  var rvs=$$('.rv');
  if('IntersectionObserver' in W){
    var rio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rio.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    rvs.forEach(function(el){
      var sib=el.parentNode?Array.prototype.indexOf.call(el.parentNode.children,el):0;
      el.style.transitionDelay=Math.min(sib,4)*70+'ms';rio.observe(el);
    });
  }else{rvs.forEach(function(el){el.classList.add('in')})}

  /* ---------- scroll engine ---------- */
  var subs=[], layouts=[], ticking=false, vh=W.innerHeight, vw=W.innerWidth;
  function frame(){ticking=false;var y=W.pageYOffset;for(var i=0;i<subs.length;i++)subs[i](y)}
  function req(){if(!ticking){ticking=true;W.requestAnimationFrame(frame)}}
  var cb=$('.concept'), navEl=$('#nav'), navH=72;
  function relayout(){vh=W.innerHeight;vw=W.innerWidth;navH=navEl?navEl.offsetHeight:0;H.style.setProperty('--nh',navH+'px');if(cb)H.style.setProperty('--cb',cb.offsetHeight+'px');layouts.forEach(function(f){f()});req()}
  W.addEventListener('scroll',req,{passive:true});
  var rt;W.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(relayout,80)});
  W.addEventListener('load',relayout);
  if(d.fonts&&d.fonts.ready)d.fonts.ready.then(relayout);

  /* scroll progress bar */
  var sp=$('.sprog');
  if(sp)subs.push(function(y){var m=d.documentElement.scrollHeight-vh;sp.style.setProperty('--sp',m>0?(y/m).toFixed(4):0)});

  /* ---------- pointer (for parallax + cursor) ---------- */
  var mx=0,my=0,smx=0,smy=0,px=-100,py=-100,rx=-100,ry=-100;
  if(fine&&motion){
    W.addEventListener('mousemove',function(e){px=e.clientX;py=e.clientY;mx=e.clientX/vw*2-1;my=e.clientY/vh*2-1},{passive:true});
  }

  /* ================= HERO SCROLL SEQUENCE ================= */
  var hx=$('.hx'), hxRender=null;
  if(hx&&motion){
    var q=function(s){return $(s,hx)};
    var hb=q('.hx-bottle'),w1=q('.hw1'),w2=q('.hw2'),kick=q('.hx-intro .kick'),sub=q('.hx-sub'),stk=q('.hx-stk'),sun=q('.hx-sun'),
        r1=q('.hx-out .r1'),r2=q('.hx-out .r2'),calls=$$('.hx-call',hx),outro=q('.hx-outro'),hint=q('.hx-hint'),
        bits=$$('.bit',hx),g1=q('.gl1'),g2=q('.gl2');
    var hTop=0,hLen=1;
    layouts.push(function(){hTop=hx.getBoundingClientRect().top+W.pageYOffset-navH;hLen=Math.max(1,hx.offsetHeight-vh+navH)});
    // [x(vw), y(vh), rotate(deg), scale] for the "burst" (p≈.32) and "exit" (p=1) states. Start = burst * .55
    var BP=[[-28,-20,-25,1],[26,-24,20,1],[-15,22,-35,1.1],[31,18,140,.9],[19,-6,28,1],[-34,8,0,.8],[-10,-30,0,1],[-22,-2,-15,1],[14,30,0,1],[8,-34,200,.9]];
    var EP=[[-40,-70,-80,1.2],[36,-75,120,1.1],[-28,-40,-60,1.3],[48,-30,220,1],[30,-60,60,1],[-50,-45,180,.9],[-12,-80,90,1],[-34,-70,-40,1],[20,-40,120,1],[12,-90,260,1]];
    var DEPTH=[1.2,1,2.2,.8,1.4,2,.6,1.1,1.8,.7];
    var BOT_D=[[0,0,0,0,1],[.25,0,-2,-10,1.12],[.45,-2,0,6,1.08],[.62,2,-1,-4,1.1],[.8,22,2,8,.92],[1,24,-4,12,.88]];
    var BOT_M=[[0,0,0,0,1],[.25,0,-6,-8,.9],[.45,0,-10,5,.82],[.62,0,-10,-4,.82],[.8,0,-17,6,.6],[1,0,-19,10,.56]];
    var CALL_D=[[.27,.33,.68,.74],[.37,.43,.68,.74],[.47,.53,.68,.74]];
    var CALL_M=[[.26,.3,.39,.43],[.43,.47,.55,.59],[.59,.63,.71,.75]];
    function kf(K,p){
      for(var i=1;i<K.length;i++){if(p<=K[i][0]){var a=K[i-1],b=K[i],t=ease(seg(p,a[0],b[0]));return [lerp(a[1],b[1],t),lerp(a[2],b[2],t),lerp(a[3],b[3],t),lerp(a[4],b[4],t)]}}
      var l=K[K.length-1];return [l[1],l[2],l[3],l[4]];
    }
    function op(el,o){el.style.opacity=o.toFixed(3)}
    hxRender=function(y){
      var p=clamp((y-hTop)/hLen,0,1), m=isMobile(), kx=m?1.25:1, ky=m?.85:1;
      // bottle
      var b=kf(m?BOT_M:BOT_D,p);
      hb.style.transform='translate3d(calc('+b[0].toFixed(2)+'vw + '+(smx*10).toFixed(1)+'px),calc('+b[1].toFixed(2)+'vh + '+(smy*8).toFixed(1)+'px),0) rotate('+(b[2]+smx*2).toFixed(2)+'deg) scale('+b[3].toFixed(3)+')';
      // sun follows bottle
      var sIn=ease(seg(p,.06,.34));
      sun.style.transform='translate3d('+b[0].toFixed(2)+'vw,'+b[1].toFixed(2)+'vh,0) scale('+(lerp(.35,1,sIn)+seg(p,.34,1)*.45).toFixed(3)+')';
      op(sun,sIn*.95-seg(p,.7,1)*.35);
      // headline split
      var hs=ease(seg(p,.02,.3));
      w1.style.transform='translate3d('+(-hs*(m?70:42)).toFixed(2)+'vw,'+(-hs*(m?4:8)).toFixed(2)+'vh,0)';
      w2.style.transform='translate3d('+(hs*(m?70:42)).toFixed(2)+'vw,'+(hs*(m?4:8)).toFixed(2)+'vh,0)';
      op(w1,1-seg(p,.12,.3));op(w2,1-seg(p,.12,.3));
      op(kick,1-seg(p,.02,.12));
      var so=1-seg(p,.03,.14);op(sub,so);sub.style.transform='translate3d(0,'+((1-so)*30).toFixed(1)+'px,0)';sub.style.visibility=so<.02?'hidden':'visible';
      op(stk,1-seg(p,.03,.14));stk.style.transform='rotate('+(p*200).toFixed(1)+'deg) scale('+(1-seg(p,.03,.14)*.4).toFixed(3)+')';
      if(hint)op(hint,1-seg(p,0,.05));
      // outline rows
      var ro=seg(p,.14,.3)*(1-seg(p,.88,1)*.6);
      op(r1,ro*.9);op(r2,ro*.9);
      r1.style.transform='translate3d('+(-5-p*38).toFixed(2)+'%,0,0)';
      r2.style.transform='translate3d('+(-40+p*38).toFixed(2)+'%,0,0)';
      // glow
      g1.style.setProperty('--g1',(1+p*.5).toFixed(3));g2.style.opacity=(.4+p*.5).toFixed(3);
      // bits
      var bt=ease(seg(p,0,.32)), et=ease(seg(p,.62,1));
      for(var i=0;i<bits.length;i++){
        var B=BP[i],E=EP[i],dp=DEPTH[i];
        var x=lerp(lerp(B[0]*.55,B[0],bt),E[0],et)*kx, yy=lerp(lerp(B[1]*.55,B[1],bt),E[1],et)*ky,
            r=lerp(lerp(B[2]*.4,B[2],bt),E[2],et), s=lerp(lerp(B[3]*.7,B[3],bt),E[3],et)*(m?.9:1);
        bits[i].style.transform='translate3d(calc('+x.toFixed(2)+'vw + '+(smx*dp*-22).toFixed(1)+'px),calc('+yy.toFixed(2)+'vh + '+(smy*dp*-16).toFixed(1)+'px),0) rotate('+r.toFixed(1)+'deg) scale('+s.toFixed(3)+')';
        op(bits[i],1-seg(p,.9,1));
      }
      // callouts
      var C=m?CALL_M:CALL_D;
      for(var c=0;c<calls.length;c++){
        var k=C[c], inn=ease(seg(p,k[0],k[1])), out=ease(seg(p,k[2],k[3]));
        op(calls[c],inn*(1-out));
        calls[c].style.transform='translate3d('+((1-inn)*(m?0:(c===1?40:-40))).toFixed(1)+'px,'+((1-inn)*30-out*30).toFixed(1)+'px,0)';
        calls[c].style.visibility=inn*(1-out)<.02?'hidden':'visible';
      }
      // outro
      var oi=ease(seg(p,.78,.88));
      op(outro,oi);outro.style.transform='translate3d(0,'+((1-oi)*50).toFixed(1)+'px,0)';
      outro.classList.toggle('live',oi>.5);outro.style.visibility=oi<.02?'hidden':'visible';
    };
    subs.push(function(y){if(y<hTop+hLen+vh)hxRender(y)});
  }

  /* ================= HORIZONTAL FARM-TO-BOTTLE ================= */
  if(motion){
    $$('.hs').forEach(function(hs){
      var tr=$('.hs-track',hs), bar=$('.hs-bar',hs), cnt=$('.hs-count b',hs), imgs=$$('.hs-ph img',hs);
      var top0=0,dist=1,n=$$('.hs-p',hs).length-1,last=-1;
      layouts.push(function(){
        tr.style.transform='';
        dist=Math.max(1,tr.offsetWidth-vw);
        hs.style.height=(dist+vh-navH)+'px';
        top0=hs.getBoundingClientRect().top+W.pageYOffset-navH;
        if(bar)bar.style.setProperty('--bw',bar.clientWidth+'px');
      });
      subs.push(function(y){
        if(y<top0-vh||y>top0+dist+vh)return;
        var p=clamp((y-top0)/dist,0,1);
        tr.style.transform='translate3d('+(-p*dist).toFixed(1)+'px,0,0)';
        hs.style.setProperty('--hp',p.toFixed(4));
        var idx=clamp(Math.round(p*n),1,n);
        if(idx!==last&&cnt){cnt.textContent=(idx<10?'0':'')+idx;last=idx}
        for(var i=0;i<imgs.length;i++){
          var r=imgs[i].parentNode.getBoundingClientRect(), off=(r.left+r.width/2-vw/2)/vw;
          imgs[i].style.transform='scale(1.15) translate3d('+(off*-9).toFixed(2)+'%,0,0)';
        }
      });
    });
  }

  /* ================= PARALLAX + DRIFT ================= */
  if(motion){
    var par=$$('[data-speed]'), dri=$$('[data-drift]');
    subs.push(function(){
      par.forEach(function(el){
        var r=el.parentNode.getBoundingClientRect();if(r.bottom<-100||r.top>vh+100)return;
        var off=(r.top+r.height/2-vh/2)*parseFloat(el.getAttribute('data-speed'));
        el.style.transform='translate3d(0,'+(-off).toFixed(1)+'px,0)';
      });
      dri.forEach(function(el){
        var r=el.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;
        var off=(r.top+r.height/2-vh/2)*parseFloat(el.getAttribute('data-drift'));
        el.style.transform='translate3d('+off.toFixed(1)+'px,0,0)';
      });
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
      var ws=$$('.hlw',el), lastN=-1;
      subs.push(function(){
        var r=el.getBoundingClientRect();if(r.bottom<0||r.top>vh)return;
        var p=clamp((vh*.88-r.top)/(r.height+vh*.4),0,1), nOn=Math.floor(p*ws.length*1.15);
        if(nOn===lastN)return;lastN=nOn;
        for(var i=0;i<ws.length;i++)ws[i].classList.toggle('on',i<nOn);
      });
    });
  }

  /* ================= TIMELINES ================= */
  $$('[data-tl]').forEach(function(tl){
    var items=$$('.tl-i',tl);
    if(!motion){items.forEach(function(i){i.classList.add('passed')});return}
    subs.push(function(){
      var r=tl.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;
      tl.style.setProperty('--tp',clamp((vh*.62-r.top)/r.height,0,1).toFixed(4));
      items.forEach(function(it){it.classList.toggle('passed',it.getBoundingClientRect().top<vh*.62)});
    });
  });

  /* ================= BOTTLE WALL ================= */
  $$('[data-bwall]').forEach(function(w){
    if(!motion)return;
    var bs=$$('i',w), last=-1;
    subs.push(function(){
      var r=w.getBoundingClientRect();if(r.bottom<-50||r.top>vh+50)return;
      var vis=bs.filter(function(b){return b.offsetWidth>0}).length||bs.length;
      var n=Math.floor(clamp((vh*.92-r.top)/(r.height+vh*.25),0,1)*vis);
      if(n===last)return;last=n;
      for(var i=0;i<bs.length;i++)bs[i].classList.toggle('lit',i<n);
    });
  });

  /* ================= COUNTERS ================= */
  var cts=$$('[data-count]');
  if(motion&&'IntersectionObserver' in W&&cts.length){
    var cio=new IntersectionObserver(function(es){es.forEach(function(e){
      if(!e.isIntersecting)return;cio.unobserve(e.target);
      var el=e.target,to=parseInt(el.getAttribute('data-count'),10),pad=parseInt(el.getAttribute('data-pad')||'0',10),t0=null;
      function fmt(v){var s=String(v);while(s.length<pad)s='0'+s;return s}
      function step(ts){if(!t0)t0=ts;var t=clamp((ts-t0)/1300,0,1);el.textContent=fmt(Math.round(to*ease(t)));if(t<1)W.requestAnimationFrame(step)}
      el.textContent=fmt(0);W.requestAnimationFrame(step);
    })},{threshold:.6});
    cts.forEach(function(c){cio.observe(c)});
  }

  /* ================= MOMENT SWITCHER ================= */
  $$('.msw').forEach(function(sw){
    var tabs=$$('.mt',sw), panels=$$('.mp',sw), word=$('.msw-word',sw), clock=$('.msw-clock span',sw), auto=null, touched=false, idx=0;
    function set(i,focus){
      idx=(i+tabs.length)%tabs.length;
      var t=tabs[idx], m=t.getAttribute('data-m');
      sw.setAttribute('data-m',m);
      tabs.forEach(function(b,j){b.setAttribute('aria-selected',j===idx?'true':'false');b.tabIndex=j===idx?0:-1});
      panels.forEach(function(p){p.classList.toggle('on',p.getAttribute('data-m')===m)});
      if(word)word.textContent=$('span',t).textContent;
      if(clock)clock.textContent=$('i',t).textContent;
      if(focus)t.focus();
    }
    tabs.forEach(function(t,i){
      t.addEventListener('click',function(){touched=true;stop();set(i)});
      t.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'||e.key==='ArrowDown'){e.preventDefault();touched=true;stop();set(idx+1,true)}
        if(e.key==='ArrowLeft'||e.key==='ArrowUp'){e.preventDefault();touched=true;stop();set(idx-1,true)}
      });
    });
    function stop(){if(auto){clearInterval(auto);auto=null}}
    set(0);
    if(motion&&'IntersectionObserver' in W){
      new IntersectionObserver(function(es){es.forEach(function(e){
        if(e.isIntersecting&&!touched&&!auto){auto=setInterval(function(){set(idx+1)},6500)}
        else if(!e.isIntersecting)stop();
      })},{threshold:.5}).observe(sw);
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
    function on(k){hots.forEach(function(h){h.classList.toggle('on',h.getAttribute('data-hot')===k)});lis.forEach(function(l){l.classList.toggle('on',l.getAttribute('data-hot')===k)})}
    hots.forEach(function(h){var k=h.getAttribute('data-hot');['mouseenter','focus','click'].forEach(function(ev){h.addEventListener(ev,function(){on(k)})})});
    lis.forEach(function(l){l.addEventListener('mouseenter',function(){on(l.getAttribute('data-hot'))})});
    if(hots[0])on(hots[0].getAttribute('data-hot'));
  });

  /* ================= ODOMETERS ================= */
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
    var str=String(num);while(str.length<4)str='0'+str;
    $$('.odo-d i',o).forEach(function(i,k){
      var s=$('span',i), cur=parseInt(i.getAttribute('data-v'),10)||0, v=parseInt(str[k],10);
      s.style.transition='none';s.style.transform='translateY(-'+cur+'em)';
      void s.offsetWidth;
      s.style.transition='transform '+(1.1+k*.25)+'s cubic-bezier(.2,.8,.2,1)';
      s.style.transform='translateY(-'+(20+v)+'em)';
      i.setAttribute('data-v',v);
      setTimeout(function(){s.style.transition='none';s.style.transform='translateY(-'+v+'em)'},(1.1+k*.25)*1000+60);
    });
    o.setAttribute('aria-label','Bottle number '+str);
  }
  var odos=$$('[data-odo]');
  if(motion){
    odos.forEach(buildOdo);
    if('IntersectionObserver' in W){
      var oio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){oio.unobserve(e.target);rollOdo(e.target,1)}})},{threshold:.6});
      odos.forEach(function(o){oio.observe(o)});
    }
  }
  var spin=$('#spin'), odo=$('#odo');
  if(spin&&odo){
    spin.addEventListener('click',function(){
      var n=1+Math.floor(Math.random()*999);
      if(motion)rollOdo(odo,n);
      else{var s=String(n);while(s.length<4)s='0'+s;$$('.odo-d i',odo).forEach(function(i,k){i.setAttribute('data-v',s[k])});odo.setAttribute('aria-label','Bottle number '+s)}
    });
  }
  var tag=$('[data-tagnum]');
  if(tag&&motion){
    setInterval(function(){
      var n=0,t=setInterval(function(){
        tag.textContent=String(1000+Math.floor(Math.random()*9000)).slice(1).padStart(4,'0');
        if(++n>10){clearInterval(t);var r=String(1+Math.floor(Math.random()*999));while(r.length<4)r='0'+r;tag.textContent=r}
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
        if(e.isIntersecting){scramble();if(!cdT)cdT=setInterval(scramble,5200)}
        else if(cdT){clearInterval(cdT);cdT=null}
      })},{threshold:.5}).observe(cd);
    }
  }

  /* ================= FAQ FILTER ================= */
  var ff=$('.ff');
  if(ff){
    var fq=$('#fsq'), fcs=$$('.fc',ff), groups=$$('.fg'), none=$('.f-none'), cat='all';
    function filt(){
      var t=(fq.value||'').trim().toLowerCase(), any=false;
      groups.forEach(function(g){
        var gc=g.getAttribute('data-cat'), shown=0;
        $$('details',g).forEach(function(dt){
          var ok=(cat==='all'||cat===gc)&&(!t||dt.textContent.toLowerCase().indexOf(t)>-1);
          dt.hidden=!ok;if(ok){shown++;if(t)dt.open=true}
        });
        g.hidden=!shown;if(shown)any=true;
      });
      if(none)none.hidden=any;
    }
    fq.addEventListener('input',filt);
    fcs.forEach(function(b){b.addEventListener('click',function(){cat=b.getAttribute('data-f');fcs.forEach(function(x){x.classList.toggle('on',x===b)});filt()})});
  }

  /* ================= STOCKIST FINDER ================= */
  var fd=$('#finder');
  if(fd){
    fd.addEventListener('submit',function(e){
      e.preventDefault();
      var qv=($('#fq').value||'').trim(), st=$('#fs').value, ty=$('input[name="st"]:checked',fd), tl=ty?$('label[for="'+ty.id+'"]',fd).textContent:'All';
      var where=qv?qv+(st&&st!=='Outside Malaysia'?', '+st:''):st;
      fd.classList.add('searching');
      setTimeout(function(){
        fd.classList.remove('searching');
        $('#fd-title').textContent='Not in '+where+' yet.';
        $('#fd-text').textContent='Pina Boosta hasn’t launched in shops yet. '+(tl==='All'?'Stockists':tl+' stockists')+' in '+where+' will be listed here as soon as they’re confirmed.';
      },motion?900:0);
    });
  }

  /* ================= COPY ================= */
  function copy(text,label){
    function ok(){showToast('Copied: '+label)}
    try{
      if(navigator.clipboard&&W.isSecureContext){navigator.clipboard.writeText(text).then(ok,function(){fallback()})}else fallback();
    }catch(e){fallback()}
    function fallback(){try{var ta=d.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';d.body.appendChild(ta);ta.select();d.execCommand('copy');d.body.removeChild(ta);ok()}catch(e){showToast('Copy not available here')}}
  }
  $$('[data-copy]').forEach(function(b){b.addEventListener('click',function(){var v=b.getAttribute('data-copy');copy(v,v)})});
  $$('[data-copy-el]').forEach(function(b){b.addEventListener('click',function(){var el=d.getElementById(b.getAttribute('data-copy-el'));if(el)copy(el.textContent.trim(),'boilerplate')})});

  /* ================= FORMS (draft) + PINEAPPLE BURST ================= */
  function burst(x,y){
    var c=d.createElement('canvas'),ctx=c.getContext('2d'),dpr=Math.min(W.devicePixelRatio||1,2);
    if(!ctx)return;
    c.className='burst-c';c.width=vw*dpr;c.height=vh*dpr;d.body.appendChild(c);ctx.scale(dpr,dpr);
    var COLS=['#f6c632','#ffdf6e','#ef7d22','#7cc142','#2f8f4e','#fff7e3'], P=[];
    for(var i=0;i<110;i++){
      var a=-Math.PI/2+(Math.random()-.5)*Math.PI*1.3, sp=6+Math.random()*11;
      P.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:Math.random()*6.28,vr:(Math.random()-.5)*.35,s:6+Math.random()*9,
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
  $$('form[data-draft]').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      showToast();
      if(motion&&f.hasAttribute('data-burst')){
        var b=$('button[type="submit"]',f),r=b.getBoundingClientRect();
        burst(r.left+r.width/2,r.top+r.height/2);
      }
    });
  });

  /* ================= MAGNETIC + TILT ================= */
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

  /* ================= CUSTOM CURSOR ================= */
  var cur=$('.cursor');
  if(cur&&fine&&motion){
    H.classList.add('cur');
    var lab=$('b',cur);
    $$('.ben,.duo-c').forEach(function(el){el.setAttribute('data-cursor','Open')});
    $$('.msw-vis,.hx-bottle').forEach(function(el){el.setAttribute('data-cursor','Boosta')});
    $$('.hs-track').forEach(function(el){el.setAttribute('data-cursor','Scroll')});
    d.addEventListener('mouseover',function(e){
      var t=e.target.closest?e.target:null;if(!t)return;
      var l=t.closest('[data-cursor]'), h=t.closest('a,button,summary,label,.hot');
      if(l&&!h){lab.textContent=l.getAttribute('data-cursor');cur.classList.add('lab');cur.classList.remove('hov')}
      else if(h){cur.classList.add('hov');cur.classList.remove('lab')}
      else cur.classList.remove('hov','lab');
      cur.classList.toggle('hide',!!t.closest('input,textarea,select'));
    });
    d.addEventListener('mousedown',function(){cur.classList.add('down')});
    d.addEventListener('mouseup',function(){cur.classList.remove('down')});
    d.addEventListener('mouseleave',function(){cur.classList.add('hide')});
    d.addEventListener('mouseenter',function(){cur.classList.remove('hide')});
  }
  if(fine&&motion){
    (function loop(){
      smx=lerp(smx,mx,.06);smy=lerp(smy,my,.06);
      if(cur&&H.classList.contains('cur')){
        rx=lerp(rx,px,.18);ry=lerp(ry,py,.18);
        $('.c-dot',cur).style.transform='translate3d('+px+'px,'+py+'px,0)';
        $('.c-ring',cur).style.transform='translate3d('+rx.toFixed(1)+'px,'+ry.toFixed(1)+'px,0)';
      }
      if(hxRender&&W.pageYOffset<vh*4&&(Math.abs(smx-mx)>.002||Math.abs(smy-my)>.002))hxRender(W.pageYOffset);
      W.requestAnimationFrame(loop);
    })();
  }

  relayout();
})();
