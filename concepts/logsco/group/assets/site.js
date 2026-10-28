/* Logsco Agri Technology corporate site draft. Progressive enhancement: every section is readable without this file. */
(function(){
  'use strict';
  var root=document.documentElement;
  var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var FINE=matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var io=function(cb,opt){return 'IntersectionObserver' in window?new IntersectionObserver(cb,opt||{threshold:.15}):null};

  /* theme */
  var tb=$('#theme');
  if(tb)tb.addEventListener('click',function(){
    var dark=root.dataset.theme?root.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme=dark?'light':'dark';
    try{localStorage.setItem('logsco-theme',root.dataset.theme)}catch(e){}
  });

  /* scroll progress */
  var pb=$('.progress-bar i'),ticking=false;
  function onScroll(){
    if(ticking)return;ticking=true;
    requestAnimationFrame(function(){
      var h=root.scrollHeight-innerHeight;
      if(pb)pb.style.transform='scaleX('+(h>0?Math.min(1,scrollY/h):0)+')';
      plan();
      if(!window.gsap)heroFallback();
      ticking=false;
    });
  }
  addEventListener('scroll',onScroll,{passive:true});

  /* drawer menu */
  var dw=$('#menu'),lastFocus=null;
  function openMenu(e){
    if(!dw)return;if(e)e.preventDefault();
    lastFocus=document.activeElement;dw.classList.add('open');
    $$('.menu-btn').forEach(function(b){b.setAttribute('aria-expanded','true')});
    document.body.style.overflow='hidden';
    var f=$('.dw-g a',dw);if(f)f.focus();
  }
  function closeMenu(e){
    if(!dw)return;if(e)e.preventDefault();
    dw.classList.remove('open');document.body.style.overflow='';
    $$('.menu-btn').forEach(function(b){b.setAttribute('aria-expanded','false')});
    if(location.hash==='#menu')history.replaceState(null,'',location.pathname+location.search);
    if(lastFocus)lastFocus.focus();
  }
  $$('.menu-btn').forEach(function(b){b.addEventListener('click',openMenu)});
  if(dw){
    $('.dw-x',dw).addEventListener('click',closeMenu);
    dw.addEventListener('click',function(e){if(e.target===dw)closeMenu(e)});
    if(location.hash==='#menu'){history.replaceState(null,'',location.pathname+location.search)}
  }
  addEventListener('keydown',function(e){
    if(e.key!=='Escape')return;
    if(dw&&dw.classList.contains('open'))closeMenu();
    $$('.dd').forEach(function(d){if(d.contains(document.activeElement)){d.classList.add('closed');document.activeElement.blur()}});
  });

  /* dropdowns: tap-to-open on touch, Esc to close */
  $$('.dd').forEach(function(d){
    var t=$('.dd-t',d);
    d.addEventListener('mouseleave',function(){d.classList.remove('closed','open')});
    d.addEventListener('focusout',function(){setTimeout(function(){if(!d.contains(document.activeElement))d.classList.remove('closed','open')},0)});
    t.addEventListener('click',function(e){
      if(matchMedia('(hover: none)').matches&&!d.classList.contains('open')){e.preventDefault();d.classList.add('open')}
    });
  });

  /* reveal */
  var rv=io(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rv.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -40px 0px'});
  $$('.rv').forEach(function(el,i){if(rv&&!RM){el.style.transitionDelay=(i%4)*70+'ms';rv.observe(el)}else el.classList.add('in')});

  /* counters */
  var fmt=function(n,d){return n.toLocaleString('en-GB',{minimumFractionDigits:d,maximumFractionDigits:d})};
  var co=io(function(es){es.forEach(function(e){
    if(!e.isIntersecting)return;co.unobserve(e.target);
    var el=e.target,to=parseFloat(el.dataset.count),d=+el.dataset.dec||0,pre=el.dataset.pre||'',suf=el.dataset.suf||'',t0=null,dur=1600;
    if(to>=1900&&to<=2100&&d===0){dur=1100}
    var from=(to>=1900&&to<=2100)?to-25:0;
    function step(ts){if(!t0)t0=ts;var p=Math.min(1,(ts-t0)/dur),v=from+(to-from)*(1-Math.pow(1-p,3));el.textContent=pre+(to>=1900&&to<=2100?Math.round(v):fmt(v,d))+suf;if(p<1)requestAnimationFrame(step)}
    requestAnimationFrame(step);
  })},{threshold:.6});
  if(co&&!RM)$$('[data-count]').forEach(function(el){co.observe(el)});

  /* spotlight, tilt, magnetic */
  if(FINE&&!RM){
    document.addEventListener('pointermove',function(e){
      var s=e.target.closest&&e.target.closest('.spot');
      if(s){var r=s.getBoundingClientRect();s.style.setProperty('--x',(e.clientX-r.left)+'px');s.style.setProperty('--y',(e.clientY-r.top)+'px')}
    },{passive:true});
    $$('.tilt').forEach(function(c){
      c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;c.style.transform='perspective(900px) rotateY('+(x*6)+'deg) rotateX('+(-y*6)+'deg) translateY(-4px)'});
      c.addEventListener('pointerleave',function(){c.style.transform=''});
    });
    $$('.mag').forEach(function(b){
      b.addEventListener('pointermove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.18)+'px,'+((e.clientY-r.top-r.height/2)*.25)+'px)'});
      b.addEventListener('pointerleave',function(){b.style.transform=''});
    });
  }

  /* hero: pointer parallax + scroll parallax */
  var hx=$('.hx-card');
  if(hx&&FINE&&!RM){
    var fl=$$('.hx-f',hx);
    hx.addEventListener('pointermove',function(e){var r=hx.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      fl.forEach(function(f){var d=+f.dataset.depth||10;f.style.transform='translate('+(x*d*2)+'px,'+(y*d*2)+'px)'})});
    hx.addEventListener('pointerleave',function(){fl.forEach(function(f){f.style.transform=''})});
  }
  var hbg=hx&&$('.hx-bg',hx);
  function heroFallback(){if(!hbg||RM)return;var y=Math.min(scrollY,900);hbg.style.transform='translate3d(0,'+(y*.18)+'px,0) scale('+(1+y*.00012)+')'}

  /* CPPC plan line fill */
  var pvl=$('#pvl');
  function plan(){if(!pvl||RM)return;var r=pvl.getBoundingClientRect(),p=(innerHeight*.6-r.top)/r.height;pvl.style.setProperty('--p',Math.max(0,Math.min(1,p)).toFixed(3))}
  if(pvl&&!RM)pvl.style.setProperty('--p',0);

  /* GSAP enhancements (home): scroll-driven hero + pinned horizontal process */
  function gsapInit(){
    if(!window.gsap||!window.ScrollTrigger||RM)return;
    var g=window.gsap;g.registerPlugin(window.ScrollTrigger);
    if(hx){
      var tl=g.timeline({scrollTrigger:{trigger:'.hx',start:'top top',end:'bottom top',scrub:.6}});
      tl.to('.hx-bg',{yPercent:12,scale:1.08,ease:'none'},0)
        .to('.hx-in',{y:-60,opacity:.15,ease:'none'},0)
        .to('.hx-floats',{y:-120,ease:'none'},0)
        .to('.hx-card',{scale:.95,borderRadius:48,ease:'none'},0);
    }
    var mm=g.matchMedia();
    mm.add('(min-width: 1021px)',function(){
      var sec=$('.hs');if(!sec)return;
      var pin=$('.hs-pin',sec),track=$('.hs-track',sec);
      sec.classList.add('pinned');
      var dist=function(){return Math.max(0,track.scrollWidth-pin.clientWidth)};
      var tw=g.to(track,{x:function(){return -dist()},ease:'none',scrollTrigger:{trigger:pin,start:'top top',end:function(){return '+='+dist()},pin:true,scrub:.7,invalidateOnRefresh:true}});
      return function(){sec.classList.remove('pinned');g.set(track,{clearProps:'transform'})};
    });
    g.utils.toArray('.bento .bt, .divs .dv').forEach(function(el,i){
      g.fromTo(el,{y:40},{y:0,ease:'none',scrollTrigger:{trigger:el,start:'top bottom',end:'top 60%',scrub:.5}});
    });
  }
  if(document.readyState==='complete')gsapInit();else addEventListener('load',gsapInit);

  /* Kulim line */
  $$('.kline').forEach(function(kl){
    var svg=$('.kl-svg',kl),stations=$$('.kl-st',kl),tabs=$$('.kl-tab',kl),ds=$$('.kl-d',kl),pine=$('#kl-pine',svg),fg=$('.kl-fruits',svg);
    var X0=110,DX=163,Y=232,cx=function(k){return X0+k*DX};
    function sel(k){
      stations.forEach(function(s){s.classList.toggle('sel',+s.dataset.k===k)});
      tabs.forEach(function(t){var on=+t.dataset.k===k;t.classList.toggle('on',on);t.setAttribute('aria-pressed',on?'true':'false')});
      ds.forEach(function(d){d.classList.toggle('on',+d.dataset.k===k)});
    }
    stations.forEach(function(s){
      var k=+s.dataset.k;
      s.addEventListener('click',function(){sel(k)});
      if(FINE)s.addEventListener('mouseenter',function(){sel(k)});
      s.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();sel(k)}});
    });
    tabs.forEach(function(t){t.addEventListener('click',function(){sel(+t.dataset.k)})});
    sel(0);
    if(RM||!pine||!fg)return;
    // replace static fruit with animated clones
    fg.innerHTML='';
    var NS='http://www.w3.org/2000/svg',fruits=[],gates=$$('.kl-gate',svg),last=0,acc=999,running=false,raf=0;
    function spawn(){
      var g=document.createElementNS(NS,'g');g.setAttribute('class','kl-fr');
      g.innerHTML=pine.innerHTML+'<circle class="kl-tag" cx="15" cy="34" r="0"/>';
      fg.appendChild(g);
      var r=Math.random();fruits.push({el:g,x:-10,grade:r<.6?0:r<.9?1:2,gl:g.querySelector('.kl-gloss'),tag:g.querySelector('.kl-tag'),done:{}});
    }
    var COL=['#8dbb42','#f2b705','#e9742b'];
    function frame(ts){
      if(!running)return;
      var dt=last?Math.min(.05,(ts-last)/1000):0;last=ts;acc+=dt*70;
      if(acc>=118){acc=0;spawn()}
      var busy=[0,0,0,0,0,0,0];
      for(var i=fruits.length-1;i>=0;i--){
        var f=fruits[i];f.x+=dt*70;var c=f.x+15;
        for(var k=0;k<7;k++){if(Math.abs(c-cx(k))<48)busy[k]=1}
        if(c>cx(1)&&!f.done.s){f.done.s=1;f.gl.style.opacity='.65'}
        if(c>cx(5)&&!f.done.g){f.done.g=1;f.tag.setAttribute('r','5');f.tag.setAttribute('fill',COL[f.grade]);var gt=gates[f.grade];if(gt){gt.classList.add('lit');setTimeout(function(gt){return function(){gt.classList.remove('lit')}}(gt),500)}}
        var op=1,sc=1;
        if(c>cx(6)){var p=Math.min(1,(c-cx(6))/50);op=1-p;sc=1-p*.5}
        f.el.setAttribute('transform','translate('+f.x.toFixed(1)+' '+(Y+(1-sc)*30).toFixed(1)+') scale('+sc.toFixed(3)+')');
        f.el.style.opacity=op;
        if(c>cx(6)+52){f.el.remove();fruits.splice(i,1)}
      }
      stations.forEach(function(s,k){s.classList.toggle('busy',!!busy[k])});
      raf=requestAnimationFrame(frame);
    }
    // prefill so the line looks busy straight away
    for(var x=cx(6)-20;x>-10;x-=118){spawn();var f=fruits[fruits.length-1];f.x=x;if(x+15>cx(1)){f.done.s=1;f.gl.style.opacity='.65'}if(x+15>cx(5)){f.done.g=1;f.tag.setAttribute('r','5');f.tag.setAttribute('fill',COL[f.grade])}f.el.setAttribute('transform','translate('+x+' '+Y+')')}
    acc=0;
    var o=io(function(es){es.forEach(function(e){if(e.isIntersecting&&!running){running=true;last=0;raf=requestAnimationFrame(frame)}else if(!e.isIntersecting){running=false;cancelAnimationFrame(raf)}})},{threshold:0});
    if(o)o.observe(kl);else{running=true;raf=requestAnimationFrame(frame)}
    document.addEventListener('visibilitychange',function(){if(document.hidden){running=false;cancelAnimationFrame(raf)}});
  });

  /* find your solution */
  var fd=$('#finder');
  if(fd){
    var tpl=$('#fd-tpl',fd),list=$('#fd-list',fd),title=$('#fd-title',fd),cta=$('#fd-cta',fd);
    var NEED={clean:[['washing','Clean, wax and dry before grading'],['sorting','Grade the fruit once it’s prepared']],
      grade:[['sorting','Size and weight grading for export packs'],['weighing','Weigh, scan and pack every fruit'],['washing','Prepare fruit in the wet section first']],
      quality:[['weighing','Internal scanning for water core and translucency'],['smart','AI-vision grading and traceability']],
      field:[['machinery','HUAYO AGRO field and production machinery'],['smart','Sensors and drones to plan field work']],
      monitor:[['smart','Soil and climate sensors, drones, dashboards'],['machinery','Act on the data with the right machinery']],
      centre:[['cppc','Plan volumes, layout and line'],['sorting','The grading line at the heart of the centre'],['support','Commissioning, training and spares']]};
    var WHO={estate:'s-estate',packer:'s-packer',agency:'s-agency',processor:'s-processor'};
    var NEEDTXT={clean:'clean, wax and dry fruit',grade:'grade and pack for export',quality:'check internal quality',field:'mechanise field work',monitor:'monitor crops and climate',centre:'plan a new centre'};
    function upd(){
      var w=($('input[name=fd-who]:checked',fd)||{}).value,n=($('input[name=fd-need]:checked',fd)||{}).value;
      if(!w||!n||!tpl)return;
      var items=(NEED[n]||[]).concat([[WHO[w],'Your sector: what we hear and where to start']]);
      list.innerHTML='';
      items.forEach(function(it,i){var src=tpl.content.querySelector('[data-key="'+it[0]+'"]');if(!src)return;var a=src.cloneNode(true);a.querySelector('em').textContent=it[1];a.style.animationDelay=(i*70)+'ms';list.appendChild(a)});
      title.textContent='Recommended for you · '+items.length+' matches';
      cta.href='contact.html?topic=machinery&need='+n+'&who='+w;
    }
    $$('input',fd).forEach(function(i){i.addEventListener('change',upd)});
    upd();
  }

  /* line sizing tool */
  var sz=$('#sizer');
  if(sz){
    var I=function(id){return $('#'+id,sz)},tpd=I('sz-tpd'),hrs=I('sz-hrs'),days=I('sz-days'),crop=I('sz-crop');
    var REF=7,MAXR=21;
    var nf=function(n,d){return n.toLocaleString('en-GB',{minimumFractionDigits:d||0,maximumFractionDigits:d||0})};
    function fill(r){r.style.setProperty('--fill',((r.value-r.min)/(r.max-r.min)*100)+'%')}
    function calc(){
      [tpd,hrs,days].forEach(fill);
      var t=+tpd.value,h=+hrs.value,d=+days.value,rate=t/h,pct=rate/REF*100;
      I('sz-tpd-o').textContent=t+' t';I('sz-hrs-o').textContent=h+' h';I('sz-days-o').textContent=d+' days';
      I('sz-rate').textContent=nf(rate,1);
      I('sz-bar').style.width=Math.min(100,rate/MAXR*100)+'%';
      $('.sz-ref',sz).style.left=(REF/MAXR*100)+'%';
      var cmp;
      if(Math.abs(pct-100)<=10)cmp='Close to the Kulim reference line (7 MT/hr).';
      else if(pct<100)cmp='About '+Math.round(pct)+'% of the Kulim reference line (7 MT/hr).';
      else cmp='About '+nf(rate/REF,1)+'× the Kulim reference line (7 MT/hr): likely more lanes or more than one line.';
      I('sz-cmp').textContent=cmp;
      I('sz-lines').textContent=Math.max(1,Math.ceil(rate/REF-0.05));
      var yr=t*d;I('sz-year').textContent=nf(yr)+' t';
      if(crop.value==='pineapple'){I('sz-share').textContent=nf(yr/76000*100,1)+'%';I('sz-share-l').textContent='Of Malaysia’s 2025 pineapple exports by volume'}
      else{I('sz-share').textContent='–';I('sz-share-l').textContent='Export share shown for pineapple only'}
      var secs=$$('.sz-sec input',sz).filter(function(c){return c.checked}).map(function(c){return c.value});
      $$('.sz-m',sz).forEach(function(m){m.classList.toggle('off',secs.indexOf(m.dataset.k)<0)});
      I('sz-send').href='contact.html?topic=machinery&tpd='+t+'&hrs='+h+'&days='+d+'&crop='+crop.value+'&sec='+secs.join('');
    }
    $$('input,select',sz).forEach(function(i){i.addEventListener('input',calc);i.addEventListener('change',calc)});
    calc();
  }

  /* illustrative dashboard */
  var db=$('#dash');
  if(db&&!RM){
    var tiles=$$('.db-t',db),series=tiles.map(function(){var a=[];for(var i=0;i<9;i++)a.push(10+Math.random()*12);return a}),dtimer=0;
    var base={temp:[29.4,1],soil:[34,0],light:[62,0],hum:[78,0]};
    function tick(){tiles.forEach(function(t,i){var s=series[i];s.shift();s.push(Math.max(4,Math.min(28,s[s.length-1]+(Math.random()-.5)*8)));
      t.querySelector('path').setAttribute('d',s.map(function(v,j){return (j?'L':'M')+(j*15)+' '+(32-v).toFixed(1)}).join(' '));
      var b=base[t.dataset.kind];if(b){var v=b[0]+(Math.random()-.5)*(b[1]?1.2:4);t.querySelector('.db-v').textContent=v.toFixed(b[1])}})}
    var dio=io(function(es){es.forEach(function(e){clearInterval(dtimer);if(e.isIntersecting){tick();dtimer=setInterval(tick,2200)}})},{threshold:.2});
    if(dio)dio.observe(db);
  }

  /* values rail */
  var rail=$('#rail'),prog=$('#prog');
  if(rail){
    var step=function(d){var c=rail.querySelector('.v');rail.scrollBy({left:d*(c.offsetWidth+14),behavior:RM?'auto':'smooth'})};
    $('#next').onclick=function(){step(1)};$('#prev').onclick=function(){step(-1)};
    rail.addEventListener('scroll',function(){var m=rail.scrollWidth-rail.clientWidth;prog.style.width=(m>0?14+86*rail.scrollLeft/m:100)+'%'},{passive:true});
  }

  /* enquiry form: preselect topic and prefill from tools */
  var q=new URLSearchParams(location.search),t=q.get('topic');
  if(t){var r=$('.topic input[value="'+t+'"]');if(r)r.checked=true}
  var msg=$('#m');
  if(msg){
    var lines=[];
    if(q.get('line'))lines.push('Interested in: '+q.get('line').replace(/-/g,' ')+'.');
    if(q.get('tpd'))lines.push('Line sizing (indicative): '+q.get('tpd')+' t/day, '+q.get('hrs')+' h/day, '+q.get('days')+' days/year, crop: '+q.get('crop')+'. That is about '+(q.get('tpd')/q.get('hrs')).toFixed(1)+' MT/hr.');
    if(q.get('need'))lines.push('From the solution finder: '+q.get('who')+', need: '+q.get('need')+'.');
    if(lines.length)msg.value=lines.join('\n');
  }
  var toast=$('#toast');
  $$('form[data-draft]').forEach(function(f){
    f.addEventListener('submit',function(e){e.preventDefault();toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},3000)});
  });

  onScroll();
})();
