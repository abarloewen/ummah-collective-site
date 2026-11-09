/* ============================================================
   UMMAH COLLECTIVE — Aurora engine: shader + i18n + booking + motion
   Requires three.js, gsap, ScrollTrigger, lenis loaded first.
   ============================================================ */
(function(){
  'use strict';
  /* GA4 conversion events (2026-10-14). Safe no-op when gtag is absent or consent denied (Consent Mode handles it). */
  function ucEv(n,p){try{if(typeof window.gtag==='function')window.gtag('event',n,p||{});}catch(e){}}
  window.ucEv=ucEv;  /* 2026-11-07: global so page scripts (contact #briefForm, audit.html, meet.html) can fire GA4 events */
  /* Lead measurement for forms we don't own: any formsubmit.co AJAX POST that really succeeds fires generate_lead once.
     uc.js's own sends set UC_SELF so they are not double-counted (they fire their own event). */
  var UC_SELF=false;
  function ucLeadType(){ var p=location.pathname; return /audit\.html/.test(p)?'free-audit':/meet\.html/.test(p)?'meet':/contact\.html/.test(p)?'contact':/founders-club/.test(p)?'founders-club':/ummah-hub/.test(p)?'hub':'form'; }
  (function(){ if(!window.fetch) return; var of=window.fetch;
    window.fetch=function(u,o){ var self=UC_SELF, pr=of.apply(this,arguments);
      try{ var url=typeof u==='string'?u:((u&&u.url)||''), meth=(o&&o.method)||(u&&u.method)||'GET';
        if(!self&&/formsubmit\.co\/ajax\//i.test(url)&&/post/i.test(meth)){
          pr.then(function(r){ if(!r.ok) return; var fire=function(){ ucEv('generate_lead',{lead_type:ucLeadType(),page:location.pathname}); };
            r.clone().json().then(function(j){ if(j&&(j.success===false||j.success==='false')) return; fire(); },fire); },function(){});
        } }catch(e){}
      return pr; };
  })();
  /* POST JSON and resolve true only when the endpoint really accepted it (Formsubmit answers 200 + success:"false" before activation) */
  function ucPost(url,payload){ var pr; UC_SELF=true;
    try{ pr=fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(payload)}); }catch(e){ pr=Promise.reject(e); } finally{ UC_SELF=false; }
    return pr.then(function(r){ if(!r.ok) return false; return r.json().then(function(j){ return !(j&&(j.success===false||j.success==='false')); },function(){ return true; }); }).catch(function(){ return false; }); }
  document.addEventListener('click',function(e){
    var a=e.target&&e.target.closest?e.target.closest('a[href]'):null; if(!a) return;
    var h=a.getAttribute('href')||'';
    if(/^https?:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(h)) ucEv('whatsapp_click',{link_url:h,page:location.pathname});
    else if(/^tel:/i.test(h)) ucEv('phone_click',{page:location.pathname});
    else if(/^mailto:/i.test(h)) ucEv('email_click',{page:location.pathname});
  },true);
  var hasG=window.gsap&&window.ScrollTrigger; if(hasG) gsap.registerPlugin(ScrollTrigger);
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.UC_REDUCE=reduce; if(reduce) document.documentElement.classList.add('uc-reduce');
  var softGL=(function(){ /* skip WebGL on software renderers (Lighthouse/SwiftShader, GPU-less devices) */
    try{var c=document.createElement('canvas');var gl=c.getContext('webgl')||c.getContext('experimental-webgl');
      if(!gl)return true;var x=gl.getExtension('WEBGL_debug_renderer_info');
      var r=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):'';
      return /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(String(r));
    }catch(e){return true;}
  })();
  var noGL=softGL; /* 2026-07-27: aurora RE-ENABLED on mobile (DPR-capped 1) — only software-GL/lab skips WebGL */
  if(softGL){var _sg=document.getElementById('gl'); if(_sg)_sg.style.display='none'; document.querySelectorAll('.liquid-canvas,[data-gl]').forEach(function(e){e.style.display='none'});}
  var UC_SEC=0,UC_SECT=0,UC_BOOST=0,UC_LASTY=0;  // section hue + scroll-velocity (drive the aurora)

  /* ---------- per-page aurora colours ---------- */
  var THEMES={
    'default':[[0.03,0.40,0.26],[0.10,0.85,0.54],[0.30,0.80,0.62]],
    'services':[[0.03,0.44,0.34],[0.10,0.86,0.62],[0.36,0.88,0.74]],
    'work':[[0.03,0.42,0.40],[0.10,0.80,0.72],[0.34,0.86,0.80]],
    'ventures':[[0.03,0.46,0.36],[0.14,0.88,0.62],[0.46,0.88,0.55]],
    'insights':[[0.04,0.42,0.30],[0.12,0.85,0.56],[0.40,0.86,0.66]],
    'contact':[[0.05,0.46,0.22],[0.17,0.92,0.40],[0.55,0.95,0.46]],
    'about':[[0.03,0.40,0.42],[0.12,0.78,0.74],[0.30,0.85,0.78]],
    'market':[[0.03,0.44,0.32],[0.12,0.86,0.58],[0.42,0.86,0.62]]
  };
  function theme(){ return THEMES[document.body.getAttribute('data-aurora')]||THEMES['default']; }

  /* ---------- aurora shader ---------- */
  var VERT='varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }';
  var FRAG=[
    'precision highp float; varying vec2 vUv;',
    'uniform float uTime; uniform float uScroll; uniform vec2 uMouse; uniform vec2 uRes; uniform float uBoost;',
    'uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uC4;',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
    ' float a=hash(i),b=hash(i+vec2(1.0,0.0)),c=hash(i+vec2(0.0,1.0)),d=hash(i+vec2(1.0,1.0));',
    ' return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}',
    'float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}',
    'void main(){vec2 uv=vUv;float asp=uRes.x/uRes.y;vec2 p=uv*vec2(asp,1.0)*2.2;',
    ' vec2 mo=uMouse*vec2(asp,1.0)*2.2;',
    ' float md=distance(uv,uMouse);',
    ' float infl=1.0-smoothstep(0.0,0.55,md);',
    ' p+=(mo-p)*0.20*infl;',
    ' p+=0.09*infl*vec2(sin(md*20.0-uTime*2.6),cos(md*20.0-uTime*2.6));',
    ' float t=uTime*0.05+uScroll*2.2;',
    ' vec2 q=vec2(fbm(p+vec2(0.0,t)),fbm(p+vec2(5.2,1.3)-t*0.6));',
    ' vec2 r=vec2(fbm(p+3.5*q+vec2(1.7,9.2)+t*0.4),fbm(p+3.5*q+vec2(8.3,2.8)));',
    ' float f=fbm(p+3.5*r);',
    ' vec3 c1=vec3(0.015,0.04,0.03);',
    ' vec3 col=mix(c1,uC2,smoothstep(0.0,0.7,f));',
    ' col=mix(col,uC3,smoothstep(0.45,1.0,r.x));',
    ' col=mix(col,uC4,smoothstep(0.78,1.0,q.y)*0.55);',
    ' col+=uC3*smoothstep(0.5,0.0,md)*0.32;',
    ' col+=uC4*infl*0.10;',
    ' col+=uC3*pow(f,4.0)*0.18;',
    ' col*=1.0+uBoost*0.4;',
    ' col=pow(col,vec3(0.92));',
    ' col=min(col,vec3(0.56));',   /* 2026-11-07 M19: cap the brightest hue so body copy keeps >=4.5:1 under the .veil */
    ' col*=1.0-0.48*distance(uv,vec2(0.5,0.5));',
    ' col+=(hash(uv*uRes+vec2(uTime))-0.5)*0.02;',
    ' gl_FragColor=vec4(col,1.0);}'
  ].join('\n');

  function initGL(){
    if(reduce||noGL||!window.THREE) return;
    var canvas=document.getElementById('gl'); if(!canvas) return;
    var THREE=window.THREE, sc=new THREE.Scene(), cam=new THREE.Camera();
    var rnd=new THREE.WebGLRenderer({canvas:canvas,antialias:true});
    rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<=820?1:2));
    var tc=theme();
    var uni={uTime:{value:0},uScroll:{value:0},uBoost:{value:0},uMouse:{value:new THREE.Vector2(.5,.5)},
      uRes:{value:new THREE.Vector2(innerWidth,innerHeight)},
      uC2:{value:new THREE.Vector3().fromArray(tc[0])},uC3:{value:new THREE.Vector3().fromArray(tc[1])},uC4:{value:new THREE.Vector3().fromArray(tc[2])}};
    var mat=new THREE.ShaderMaterial({uniforms:uni,vertexShader:VERT,fragmentShader:FRAG});
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),mat));
    // per-page base hue: home stays jade-family; every other subpage gets its own hue across the FULL spectrum (path hash) + per-load jitter
    var _seed=Math.random();
    function _phash(){var s=location.pathname||'/',h=2166136261;for(var i=0;i<s.length;i++){h=((h^s.charCodeAt(i))*16777619)>>>0;}return h%360;}
    var _last=(location.pathname.split('/').pop()||'');
    var _isHome=(_last===''||_last==='index.html');
    var _pageHue=_isHome?(150+_seed*26):((_phash()+(_seed*30-15))%360+360)%360;  // home locked to jade band; other subpages span the full wheel
    var baseh=((_pageHue%360+360)%360)/360, tmp=new THREE.Color();
    var _ph=_seed*6.2831;  // random phase so each load's colour drift starts differently
    function setH(u,dh,s,l){tmp.setHSL(((baseh+dh)%1+1)%1,s,l);u.value.set(tmp.r,tmp.g,tmp.b);}
    var intro=(_seed<0.5?1:-1);
    var _hz=-1,_rootS=document.documentElement.style;  // publishes live aurora hue to CSS (--auraH) so thumbnails track the background
    var mxv=.5,myv=.5,mX=.5,mY=.5,t0=performance.now();
    addEventListener('mousemove',function(e){mxv=e.clientX/innerWidth;myv=1-e.clientY/innerHeight});
    addEventListener('resize',function(){rnd.setSize(innerWidth,innerHeight);uni.uRes.value.set(innerWidth,innerHeight)});
    (function tick(){requestAnimationFrame(tick);
      var tt=(performance.now()-t0)/1000; uni.uTime.value=tt;
      var p=window.scrollY/((document.body.scrollHeight-innerHeight)||1); p=Math.max(0,Math.min(1,p)); uni.uScroll.value=p;
      intro+=(0-intro)*0.012;   // eases out over ~1.5s on each page load -> colour sweeps in
      UC_SEC+=(UC_SECT-UC_SEC)*0.05;            // section-driven hue, eased
      uni.uBoost.value+=(UC_BOOST-uni.uBoost.value)*0.12; UC_BOOST*=0.92;  // scroll-velocity intensity
      var _wander=Math.sin(tt*0.08+_ph)*0.13 + p*0.18 + intro*0.16 + UC_SEC;
      var drift=_isHome?_wander*0.24:_wander;  // home barely wanders -> stays jade; subpages roam the full spectrum
      setH(uni.uC2,drift,0.72,0.30); setH(uni.uC3,drift+0.07,0.85,0.58); setH(uni.uC4,drift-0.08,0.60,0.70);
      if(tt-_hz>0.1){_hz=tt; _rootS.setProperty('--auraH',((((baseh+drift)%1+1)%1)*360).toFixed(0)); _rootS.setProperty('--auraH2',((((baseh+drift+0.07)%1+1)%1)*360).toFixed(0));}
      mX+=(mxv-mX)*.05;mY+=(myv-mY)*.05;uni.uMouse.value.set(mX,mY);
      rnd.render(sc,cam);})();
  }

  /* ---------- i18n ---------- */
  var I18N={
    en:{work:"Work",services:"Services",solutions:"Solutions",ventures:"Ventures",about:"About",insights:"Insights",contact:"Contact",products:"Products",company:"Company",club:"Founders Club",exploreclub:"Explore the Founders Club",clubeyebrow:"Community · Founders Club",clubh:"Build alongside founders who <em>mean it.</em>",clubp:"A free community of Muslim and values-aligned founders — meeting online and in person in Kuala Lumpur.",clubtag:"Free to join · KL & Online",clubwhatson:"What’s on",clubev1:"<span>01</span> KL mixers & dinners",clubev2:"<span>02</span> Masterclasses & workshops",clubev3:"<span>03</span> Online webinars & AMAs",clubev4:"<span>04</span> Demo & pitch nights",homequote:"“They built our entire ecosystem — brand, site, tracking and a flagship store. <em>Not a campaign. An asset.</em>”",homequoteby:"ANAAKA — Halal Skincare · Flagship @ TRX, Kuala Lumpur",connect:"Connect",
      start:"Start a project",book:"Book a call",brief:"Send a brief",audit:"Free AI audit",whatsapp:"WhatsApp",email:"Email",menu:"Menu",allsol:"All solutions &rarr;",imprint:"Legal notice",f_privacy:"Privacy Policy",f_terms:"Terms of Use",
      tag1:"Intelligence,",tag2:"with integrity.",herosub:"We build the software, AI agents and systems modern companies run on — engineered fast, grounded in a decade of trust.",
      ftag:"Intelligence, with integrity. An applied-AI studio for the trust economy — the software, agents and systems modern companies run on.",
      letsbuild:"Let's build",ctah2:"Build something<br>worth <em>trusting.</em>",ctalead:"Tell us what's slowing your business down. We'll show you the system that fixes it — and how fast.",lblphone:"Phone",lblstudio:"Studio",
      abadge:"No-risk front door",audith2:"Get a <em>free AI audit</em> of your business",auditp:"A 30-minute teardown: where AI agents, automation and a better site would save you the most time and money. No pitch, just the map.",
      shifteyebrow:"(01) — The shift",shifth2:"Anyone can <em>use</em> AI now. Almost no one turns it into systems you actually <em>trust.</em>",whatwebuild:"What we build",selwork:"Selected work",st_proj:"Projects",st_cli:"Clients",st_yrs:"Years",st_lang:"Languages"},
    de:{work:"Arbeiten",services:"Leistungen",solutions:"Lösungen",ventures:"Ventures",about:"Über uns",insights:"Insights",contact:"Kontakt",products:"Produkte",company:"Unternehmen",club:"Founders Club",exploreclub:"Founders Club entdecken",clubeyebrow:"Community · Founders Club",clubh:"Bauen Sie mit Gründern, die es <em>ernst meinen.</em>",clubp:"Eine kostenlose Community muslimischer und werteorientierter Gründer — online und persönlich in Kuala Lumpur.",clubtag:"Kostenlos · KL & Online",clubwhatson:"Was läuft",clubev1:"<span>01</span> KL-Mixer & Dinner",clubev2:"<span>02</span> Masterclasses & Workshops",clubev3:"<span>03</span> Online-Webinare & AMAs",clubev4:"<span>04</span> Demo- & Pitch-Nights",homequote:"„Sie haben unser gesamtes Ökosystem aufgebaut — Marke, Website, Tracking und einen Flagship-Store. <em>Keine Kampagne. Ein Asset.</em>“",homequoteby:"ANAAKA — Halal-Hautpflege · Flagship @ TRX, Kuala Lumpur",connect:"Kontakt",
      start:"Projekt starten",book:"Termin buchen",brief:"Briefing senden",audit:"Kostenloses KI-Audit",whatsapp:"WhatsApp",email:"E-Mail",menu:"Menü",allsol:"Alle Lösungen &rarr;",imprint:"Impressum",f_privacy:"Datenschutz",f_terms:"Nutzungsbedingungen",
      tag1:"Intelligenz,",tag2:"mit Integrität.",herosub:"Wir bauen die Software, KI-Agenten und Systeme, auf denen moderne Unternehmen laufen — schnell entwickelt, gegründet auf einem Jahrzehnt Vertrauen.",
      ftag:"Intelligenz, mit Integrität. Ein Applied-AI-Studio für die Vertrauensökonomie — die Software, Agenten und Systeme, auf denen moderne Unternehmen laufen.",
      letsbuild:"Lass uns bauen",ctah2:"Bauen wir etwas,<br>dem man <em>vertraut.</em>",ctalead:"Sagen Sie uns, was Ihr Geschäft ausbremst. Wir zeigen Ihnen das System, das es löst — und wie schnell.",lblphone:"Telefon",lblstudio:"Studio",
      abadge:"Risikofreier Einstieg",audith2:"Holen Sie sich ein <em>kostenloses KI-Audit</em>",auditp:"Eine 30-minütige Analyse: wo KI-Agenten, Automatisierung und eine bessere Website am meisten Zeit und Geld sparen. Kein Pitch, nur die Landkarte.",
      shifteyebrow:"(01) — Der Wandel",shifth2:"Jeder kann KI heute <em>nutzen</em>. Fast niemand macht daraus Systeme, denen man wirklich <em>vertraut.</em>",whatwebuild:"Was wir bauen",selwork:"Ausgewählte Arbeiten",st_proj:"Projekte",st_cli:"Kunden",st_yrs:"Jahre",st_lang:"Sprachen"},
    ms:{work:"Kerja",services:"Perkhidmatan",solutions:"Penyelesaian",ventures:"Usaha",about:"Tentang",insights:"Wawasan",contact:"Hubungi",products:"Produk",company:"Syarikat",club:"Kelab Pengasas",exploreclub:"Terokai Kelab Pengasas",clubeyebrow:"Komuniti · Kelab Pengasas",clubh:"Membina bersama pengasas yang <em>bersungguh-sungguh.</em>",clubp:"Komuniti percuma pengasas Muslim dan sehaluan nilai — secara dalam talian dan bersemuka di Kuala Lumpur.",clubtag:"Sertai percuma · KL & Dalam Talian",clubwhatson:"Apa yang ada",clubev1:"<span>01</span> Mixer & makan malam KL",clubev2:"<span>02</span> Masterclass & bengkel",clubev3:"<span>03</span> Webinar & AMA dalam talian",clubev4:"<span>04</span> Malam demo & pitch",homequote:"“Mereka membina seluruh ekosistem kami — jenama, laman, penjejakan dan kedai utama. <em>Bukan kempen. Satu aset.</em>”",homequoteby:"ANAAKA — Penjagaan Kulit Halal · Flagship @ TRX, Kuala Lumpur",connect:"Hubungi",
      start:"Mulakan projek",book:"Tempah panggilan",brief:"Hantar taklimat",audit:"Audit AI percuma",whatsapp:"WhatsApp",email:"E-mel",menu:"Menu",allsol:"Semua penyelesaian &rarr;",imprint:"Notis undang-undang",f_privacy:"Dasar Privasi",f_terms:"Terma Penggunaan",
      tag1:"Kecerdasan,",tag2:"dengan integriti.",herosub:"Kami membina perisian, ejen AI dan sistem yang digunakan syarikat moden — dibina pantas, berasaskan kepercayaan sedekad.",
      ftag:"Kecerdasan, dengan integriti. Studio AI gunaan untuk ekonomi kepercayaan — perisian, ejen dan sistem yang digunakan syarikat moden.",
      letsbuild:"Mari bina",ctah2:"Bina sesuatu yang<br><em>dipercayai.</em>",ctalead:"Beritahu kami apa yang melambatkan perniagaan anda. Kami tunjukkan sistem yang membaikinya — dan secepat mana.",lblphone:"Telefon",lblstudio:"Studio",
      abadge:"Pintu masuk tanpa risiko",audith2:"Dapatkan <em>audit AI percuma</em> untuk perniagaan anda",auditp:"Analisis 30 minit: di mana ejen AI, automasi dan laman yang lebih baik menjimatkan paling banyak masa dan wang. Tiada jualan, hanya peta.",
      shifteyebrow:"(01) — Peralihan",shifth2:"Sesiapa boleh <em>guna</em> AI sekarang. Hampir tiada yang menjadikannya sistem yang anda benar-benar <em>percayai.</em>",whatwebuild:"Apa yang kami bina",selwork:"Kerja terpilih",st_proj:"Projek",st_cli:"Pelanggan",st_yrs:"Tahun",st_lang:"Bahasa"},
    ar:{work:"أعمالنا",services:"خدماتنا",solutions:"الحلول",ventures:"مشاريعنا",about:"من نحن",insights:"مقالات",contact:"تواصل",products:"المنتجات",company:"الشركة",club:"نادي المؤسّسين",exploreclub:"اكتشف نادي المؤسّسين",clubeyebrow:"مجتمع · نادي المؤسّسين",clubh:"ابنِ إلى جانب مؤسّسين <em>جادّين فعلاً.</em>",clubp:"مجتمع مجاني من المؤسّسين المسلمين وأصحاب القيم — عبر الإنترنت وحضوريًا في كوالالمبور.",clubtag:"انضمام مجاني · كوالالمبور وأونلاين",clubwhatson:"ما الذي يجري",clubev1:"<span>01</span> لقاءات وعشاء كوالالمبور",clubev2:"<span>02</span> ورش وماستر كلاس",clubev3:"<span>03</span> ندوات وأسئلة مفتوحة أونلاين",clubev4:"<span>04</span> أمسيات عروض وبيتشينغ",homequote:"«لقد بنوا منظومتنا بالكامل — العلامة والموقع والتتبّع ومتجرًا رئيسيًا. <em>ليست حملة. بل أصل.</em>»",homequoteby:"ANAAKA — عناية بشرة حلال · المتجر الرئيسي @ TRX، كوالالمبور",connect:"تواصل",
      start:"ابدأ مشروعًا",book:"احجز مكالمة",brief:"أرسل موجزًا",audit:"تدقيق ذكاء اصطناعي مجاني",whatsapp:"واتساب",email:"البريد",menu:"القائمة",allsol:"كل الحلول &larr;",imprint:"إشعار قانوني",f_privacy:"سياسة الخصوصية",f_terms:"شروط الاستخدام",
      tag1:"الذكاء،",tag2:"مع النزاهة.",herosub:"نبني البرمجيات ووكلاء الذكاء الاصطناعي والأنظمة التي تعتمد عليها الشركات الحديثة — بسرعة، وبثقة بُنيت على مدى عقد.",
      ftag:"الذكاء، مع النزاهة. استوديو ذكاء اصطناعي تطبيقي لاقتصاد الثقة — البرمجيات والوكلاء والأنظمة التي تعتمد عليها الشركات الحديثة.",
      letsbuild:"لِنبدأ البناء",ctah2:"لنبنِ شيئًا<br><em>جديرًا بالثقة.</em>",ctalead:"أخبرنا بما يُبطئ أعمالك، وسنُريك النظام الذي يُصلحه — وبأي سرعة.",lblphone:"الهاتف",lblstudio:"الاستوديو",
      abadge:"بداية بلا مخاطر",audith2:"احصل على <em>تدقيق ذكاء اصطناعي مجاني</em> لأعمالك",auditp:"جلسة 30 دقيقة: أين يوفّر وكلاء الذكاء الاصطناعي والأتمتة وموقع أفضل أكبر قدر من الوقت والمال. بلا عروض بيع، مجرد خارطة طريق.",
      shifteyebrow:"(٠١) — التحوّل",shifth2:"يستطيع الجميع <em>استخدام</em> الذكاء الاصطناعي الآن، وقلّة من يحوّله إلى أنظمة <em>تثق</em> بها فعلًا.",whatwebuild:"ما الذي نبنيه",selwork:"أعمال مختارة",st_proj:"مشاريع",st_cli:"عملاء",st_yrs:"سنوات",st_lang:"لغات"},
    zh:{work:"作品",services:"服务",solutions:"解决方案",ventures:"自有业务",about:"关于",insights:"洞察",contact:"联系",products:"产品",company:"公司",club:"创始人俱乐部",exploreclub:"探索创始人俱乐部",clubeyebrow:"社群 · 创始人俱乐部",clubh:"与<em>真正用心</em>的创始人并肩前行。",clubp:"一个面向穆斯林及价值观一致创始人的免费社群——线上与吉隆坡线下同步进行。",clubtag:"免费加入 · 吉隆坡与线上",clubwhatson:"活动内容",clubev1:"<span>01</span> 吉隆坡聚会与晚宴",clubev2:"<span>02</span> 大师课与工作坊",clubev3:"<span>03</span> 线上网络研讨与问答",clubev4:"<span>04</span> 演示与路演之夜",homequote:"“他们打造了我们的整个生态——品牌、网站、追踪和旗舰店。<em>不是一场活动，而是一项资产。</em>”",homequoteby:"ANAAKA — 清真护肤 · 旗舰店 @ 吉隆坡 TRX",connect:"联系",
      start:"启动项目",book:"预约通话",brief:"发送需求",audit:"免费 AI 审计",whatsapp:"WhatsApp",email:"邮箱",menu:"菜单",allsol:"全部方案 &rarr;",imprint:"法律声明",f_privacy:"隐私政策",f_terms:"使用条款",
      tag1:"智能，",tag2:"兼具诚信。",herosub:"我们构建现代企业赖以运行的软件、AI 智能体与系统——快速交付，建立在十年信任之上。",
      ftag:"智能，兼具诚信。面向信任经济的应用型 AI 工作室——为现代企业打造软件、智能体与系统。",
      letsbuild:"一起打造",ctah2:"打造<br>值得<em>信赖</em>的产品。",ctalead:"告诉我们是什么拖慢了你的业务，我们会展示解决它的系统——以及多快见效。",lblphone:"电话",lblstudio:"工作室",
      abadge:"零风险的第一步",audith2:"为你的业务获取<em>免费 AI 审计</em>",auditp:"30 分钟拆解：AI 智能体、自动化与更好的网站在哪里最能为你省时省钱。不推销，只给路线图。",
      shifteyebrow:"(01) — 转变",shifth2:"如今人人都能<em>使用</em> AI，却几乎没人把它变成你真正<em>信赖</em>的系统。",whatwebuild:"我们构建什么",selwork:"精选作品",st_proj:"项目",st_cli:"客户",st_yrs:"年",st_lang:"语言"},
    tr:{work:"Projeler",services:"Hizmetler",solutions:"Çözümler",ventures:"Girişimler",about:"Hakkımızda",insights:"İçgörüler",contact:"İletişim",products:"Ürünler",company:"Şirket",club:"Founders Club",exploreclub:"Founders Club'ı keşfedin",clubeyebrow:"Topluluk · Founders Club",clubh:"Gerçekten <em>inanan</em> kurucularla birlikte inşa edin.",clubp:"Müslüman ve değer odaklı kurucuların ücretsiz topluluğu — Kuala Lumpur'da çevrim içi ve yüz yüze buluşuyoruz.",clubtag:"Katılım ücretsiz · KL & Online",clubwhatson:"Neler var",clubev1:"<span>01</span> KL buluşmaları & akşam yemekleri",clubev2:"<span>02</span> Ustalık sınıfları & atölyeler",clubev3:"<span>03</span> Online webinarlar & soru-cevaplar",clubev4:"<span>04</span> Demo & sunum geceleri",homequote:"“Tüm ekosistemimizi kurdular — marka, site, takip ve amiral mağaza. <em>Bir kampanya değil. Bir varlık.</em>”",homequoteby:"ANAAKA — Helal Cilt Bakımı · Amiral Mağaza @ TRX, Kuala Lumpur",connect:"Bağlantı",
      start:"Proje başlat",book:"Görüşme planla",brief:"Brief gönderin",audit:"Ücretsiz AI denetimi",whatsapp:"WhatsApp",email:"E-posta",menu:"Menü",allsol:"Tüm çözümler &rarr;",imprint:"Yasal bildirim",f_privacy:"Gizlilik Politikası",f_terms:"Kullanım Şartları",
      tag1:"Zekâ,",tag2:"dürüstlükle.",herosub:"Modern şirketlerin üzerinde çalıştığı yazılımları, AI ajanlarını ve sistemleri inşa ediyoruz — hızla geliştirilmiş, on yıllık güvene dayalı.",
      ftag:"Zekâ, dürüstlükle. Güven ekonomisi için uygulamalı yapay zekâ stüdyosu — modern şirketlerin üzerinde çalıştığı yazılımlar, ajanlar ve sistemler.",
      letsbuild:"Birlikte inşa edelim",ctah2:"Güvenmeye<br><em>değer</em> bir şey inşa edin.",ctalead:"İşinizi neyin yavaşlattığını anlatın. Bunu çözen sistemi — ve ne kadar hızlı çözdüğünü — gösterelim.",lblphone:"Telefon",lblstudio:"Stüdyo",
      abadge:"Risksiz başlangıç",audith2:"İşletmeniz için <em>ücretsiz AI denetimi</em> alın",auditp:"30 dakikalık analiz: AI ajanları, otomasyon ve daha iyi bir sitenin size en çok zaman ve para kazandıracağı yerler. Satış konuşması yok, sadece yol haritası.",
      shifteyebrow:"(01) — Dönüşüm",shifth2:"Artık herkes AI <em>kullanabiliyor.</em> Ama neredeyse hiç kimse onu gerçekten <em>güvendiğiniz</em> sistemlere dönüştüremiyor.",whatwebuild:"Ne inşa ediyoruz",selwork:"Seçilmiş işler",st_proj:"Proje",st_cli:"Müşteri",st_yrs:"Yıl",st_lang:"Dil"},
  };
  var _CTA={
    en:{cta_results:'Want results<br>like <em>these?</em>',cta_first:'What should we<br>build <em>first?</em>',cta_studio:'Work with<br>the <em>studio.</em>',cta_noon:'Be first on<br><em>Noon OS.</em>',cta_launch:'Claim your<br><em>launch slot.</em>',c_shifth2:'Anyone can <em>use</em> AI now. Almost no one turns it into systems you can <em>trust.</em>',c_closeh2:'See what&rsquo;s <em>leaking</em> before you spend.',c_seesvc:'See our services <span class="ar">&rarr;</span>',c_svch1:'Four pillars.<br><em>One accountable team.</em>'},
    de:{cta_results:'Wollen Sie<br>solche <em>Ergebnisse?</em>',cta_first:'Was bauen wir<br><em>zuerst?</em>',cta_studio:'Mit dem<br><em>Studio</em> arbeiten.',cta_noon:'Seien Sie zuerst auf<br><em>Noon OS.</em>',cta_launch:'Sichern Sie sich<br>einen <em>Slot.</em>',c_shifth2:'Jeder kann KI heute <em>nutzen</em>. Fast niemand macht daraus Systeme, denen man <em>vertrauen</em> kann.',c_closeh2:'Erkennen Sie, wo Umsatz <em>versickert</em>, bevor Sie investieren.',c_seesvc:'Unsere Leistungen <span class="ar">&rarr;</span>',c_svch1:'Vier Säulen.<br><em>Ein verantwortliches Team.</em>'},
    ms:{cta_results:'Mahukan hasil<br><em>seperti ini?</em>',cta_first:'Apa patut kami<br>bina <em>dahulu?</em>',cta_studio:'Bekerja dengan<br><em>studio.</em>',cta_noon:'Jadi yang pertama di<br><em>Noon OS.</em>',cta_launch:'Tempah<br><em>slot anda.</em>',c_shifth2:'Sesiapa boleh <em>guna</em> AI sekarang. Hampir tiada yang menjadikannya sistem yang anda boleh <em>percayai.</em>',c_closeh2:'Lihat apa yang <em>bocor</em> sebelum anda berbelanja.',c_seesvc:'Lihat perkhidmatan kami <span class="ar">&rarr;</span>',c_svch1:'Empat tonggak.<br><em>Satu pasukan yang bertanggungjawab.</em>'},
    ar:{cta_results:'تريد نتائج<br><em>كهذه؟</em>',cta_first:'ماذا نبني<br><em>أولًا؟</em>',cta_studio:'اعمل مع<br><em>الاستوديو.</em>',cta_noon:'كن أول من يجرّب<br><em>Noon OS.</em>',cta_launch:'احجز<br><em>مكانك.</em>',c_shifth2:'يستطيع الجميع <em>استخدام</em> الذكاء الاصطناعي الآن، وقلّة من يحوّله إلى أنظمة يمكنك <em>الوثوق</em> بها.',c_closeh2:'اكتشف أين <em>يتسرّب</em> نموّك قبل أن تنفق.',c_seesvc:'تعرّف على خدماتنا <span class="ar">&rarr;</span>',c_svch1:'أربع ركائز.<br><em>فريق واحد مسؤول.</em>'},
    zh:{cta_results:'想要<br><em>这样的成果？</em>',cta_first:'我们先<br>构建<em>什么？</em>',cta_studio:'与<br><em>工作室</em>合作。',cta_noon:'抢先体验<br><em>Noon OS。</em>',cta_launch:'<em>预约</em><br>名额。',c_shifth2:'如今人人都能<em>使用</em> AI，却几乎没人把它变成你可以<em>信赖</em>的系统。',c_closeh2:'花钱之前，先看清哪里在<em>流失</em>。',c_seesvc:'查看我们的服务 <span class="ar">&rarr;</span>',c_svch1:'四大支柱。<br><em>一支负责到底的团队。</em>'},
    tr:{cta_results:'Böyle sonuçlar<br>ister <em>misiniz?</em>',cta_first:'Önce ne<br>inşa <em>edelim?</em>',cta_studio:'Stüdyo ile<br><em>çalışın.</em>',cta_noon:"Noon OS'ta<br><em>ilk siz olun.</em>",cta_launch:'Lansman yerinizi<br><em>ayırtın.</em>',c_shifth2:'Artık herkes AI <em>kullanabiliyor.</em> Ama neredeyse hiç kimse onu <em>güvenebileceğiniz</em> sistemlere dönüştüremiyor.',c_closeh2:'Harcamadan önce nerede <em>kaybettiğinizi</em> görün.',c_seesvc:'Hizmetlerimizi görün <span class="ar">&rarr;</span>',c_svch1:'Dört sütun.<br><em>Tek bir sorumlu ekip.</em>'}
  };
  for(var _l in _CTA){ if(I18N[_l]) for(var _k in _CTA[_l]) I18N[_l][_k]=_CTA[_l][_k]; }
  function setLang(l){
    if(!I18N[l]) l='en';
    try{localStorage.setItem('uc_lang',l)}catch(e){}
    document.documentElement.lang=l;
    document.body.setAttribute('dir', l==='ar'?'rtl':'ltr');
    document.body.setAttribute('lang', l);
    var d=I18N[l];
    document.querySelectorAll('[data-i18n]').forEach(function(el){var k=el.getAttribute('data-i18n'); if(d[k]!=null) el.innerHTML=d[k];});
    var TR=(window.TR&&window.TR[l])||null;
    document.querySelectorAll('[data-en]').forEach(function(el){var en=el.getAttribute('data-en'); el.textContent=(TR&&TR[en])||en;});
    var lc=document.getElementById('langCur'); if(lc) lc.textContent=l.toUpperCase();
    if(window.UC_heroAnchor) window.UC_heroAnchor(l);   // re-anchor the cycling hero title to the chosen language
  }
  /* snapshot translatable body text once, so window.TR can swap it per language */
  function snapTR(){
    var sel='main p, main li, main b, main h2, main h3, main h4, main .nm, main .res, main .ti, main .de, main .cat, main summary, main .quote-by, main .cap, main .prodcard .pt span, main .pc-tags span, main .pc-meta, main .pc-go, main blockquote, main figcaption, main .badge, main .eyebrow .mono, .phero h1, .phero p, nav .mega-col .h6, nav .mega-link b, nav .mega-link span span, nav .mega-preview .pk, nav .mega-preview .lab, nav .mega-preview .dsc, nav .mega-btns a, nav .subnav a, footer .h6, footer a, footer p, .overlay .ov-h, .overlay .ov-item b, .overlay .ov-tx>span, .overlay .ov-clink, .overlay .ov-cta-k, .overlay .ov-cta-h, main .flow .ftitle, main .flow .ftag, main .fstep .ftx span, main .funnel .fl, main .road .rstep span, main .serp .stx span, main .dpc-k, main .dpc-b, main .svc .svc-l, main .svc .svc-b, main .svc-foot';
    document.querySelectorAll(sel).forEach(function(el){
      if(el.hasAttribute('data-i18n')||el.hasAttribute('data-en')||el.children.length) return;
      var t=el.textContent.trim(); if(t&&t.length<=600) el.setAttribute('data-en',t);
    });
  }
  /* ---------- newsletter signup (footer, Brevo; 2026-07-05) ---------- */
  var UC_NL_ENDPOINT=window.UC_NL_ENDPOINT||'https://214e3e8d.sibforms.com/serve/MUIFAHLZzGL3LT1x21yQlKM9GKWkHUEJ2vPga1uEIB2doKuBGr-jU48VVpkZIwYy5cGOgSFOLSQHQa8Tbtsijocq09mbXntKWSmYvhxnbuE1vYTNvUVJZDSv2rZuVUuNLjXjHJuXwk3wAkOlyNLYyfb-mrBklnYhWFJLdTeJpzkTCVeJWJwqgtL2S0WE9UWlXKB2VEw4I70kJUoHwA==';  /* Brevo: UC Newsletter list #7 */  /* set to Brevo form action URL; empty = mailto-less fallback via Formsubmit */
  function initNewsletter(){
    var col=document.querySelector('footer .f-grid>div:first-child'); if(!col) return;
    var L=(document.documentElement.getAttribute('lang')||'en').slice(0,2);
    var T={
      en:{h:'Newsletter',p:'Systems, AI and the trust economy — once a month, no noise.',ph:'you@company.com',b:'Subscribe',ok:'Subscribed — welcome.',err:'Something went wrong — try again.'},
      de:{h:'Newsletter',p:'Systeme, KI und die Vertrauensökonomie — einmal im Monat, ohne Lärm.',ph:'sie@firma.de',b:'Abonnieren',ok:'Angemeldet — willkommen.',err:'Etwas ging schief — bitte erneut versuchen.'},
      ms:{h:'Surat berita',p:'Sistem, AI dan ekonomi amanah — sebulan sekali, tanpa bising.',ph:'anda@syarikat.com',b:'Langgan',ok:'Berjaya melanggan — selamat datang.',err:'Ada masalah — cuba lagi.'},
      ar:{h:'النشرة البريدية',p:'الأنظمة والذكاء الاصطناعي واقتصاد الثقة — مرة في الشهر، بلا ضجيج.',ph:'you@company.com',b:'اشترك',ok:'تم الاشتراك — أهلاً بك.',err:'حدث خطأ — حاول مجددًا.'},
      zh:{h:'订阅通讯',p:'系统、AI 与信任经济 — 每月一期，无噪音。',ph:'you@company.com',b:'订阅',ok:'订阅成功 — 欢迎。',err:'出错了 — 请重试。'},
      tr:{h:'Bülten',p:'Sistemler, AI ve güven ekonomisi — ayda bir, gürültüsüz.',ph:'siz@sirket.com',b:'Abone ol',ok:'Abone oldunuz — hoş geldiniz.',err:'Bir şeyler ters gitti — tekrar deneyin.'}
    }[L]||{h:'Newsletter',p:'',ph:'you@company.com',b:'Subscribe',ok:'Subscribed.',err:'Error.'};
    var w=document.createElement('div'); w.className='nlf';
    w.innerHTML='<div class="h6">'+T.h+'</div><p class="nlf-p">'+T.p+'</p><form class="nlf-f" novalidate><input type="email" required placeholder="'+T.ph+'" aria-label="Email"><button type="submit" class="btn btn-fill">'+T.b+'</button></form><div class="nlf-msg" hidden></div>';
    col.appendChild(w);
    var f=w.querySelector('form'),msg=w.querySelector('.nlf-msg');
    f.addEventListener('submit',function(e){e.preventDefault();
      var em=f.querySelector('input').value.trim(); if(!em||em.indexOf('@')<0) return;
      var done=function(ok){msg.hidden=false;msg.textContent=ok?T.ok:T.err;if(ok){f.hidden=true;ucEv('sign_up',{method:'newsletter'});}};
      if(UC_NL_ENDPOINT){
        var fd=new FormData(); fd.append('EMAIL',em); fd.append('email',em); fd.append('locale',L);
        fetch(UC_NL_ENDPOINT,{method:'POST',body:fd,mode:'no-cors'}).then(function(){done(true)}).catch(function(){done(false)});
      }else{
        fetch('https://formsubmit.co/ajax/info@ummah-collective.com',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({_subject:'Newsletter signup ('+L+')',email:em,source:'ummah-collective site footer'})}).then(function(r){done(r.ok)}).catch(function(){done(false)});
      }
    });
  }

  function initLang(){
    /* Static language trees (2026-07-05): pages are pre-translated at /de/ /ms/ /ar/ /zh/ /tr/.
       The switcher now NAVIGATES between trees instead of swapping text client-side. */
    var pageLang=(document.documentElement.getAttribute('lang')||'en').slice(0,2);
    try{localStorage.setItem('uc_lang',pageLang)}catch(e){}
    document.body.setAttribute('lang',pageLang);
    var lc=document.getElementById('langCur'); if(lc) lc.textContent=pageLang.toUpperCase();
    if(window.UC_heroAnchor) window.UC_heroAnchor(pageLang);
    // hreflang in the head is the source of truth (some articles exist only in en + ms); hide languages the page lacks
    var alts=document.querySelectorAll('link[rel="alternate"][hreflang]');
    function alt(code){ for(var i=0;i<alts.length;i++){ if(alts[i].getAttribute('hreflang')===code) return alts[i].getAttribute('href'); } return null; }
    function target(code){
      var a=alt(code); if(a) return a.replace(/^https?:\/\/[^\/]+/,'');
      var p=location.pathname.replace(/^\/(de|ms|ar|zh|tr)(?=\/)/,'');
      if(p==='')p='/';
      return code==='en'? p : '/'+code+(p==='/'?'/':p);
    }
    var box=document.getElementById('lang');
    if(box){var btn=box.querySelector('button');
      btn.setAttribute('aria-haspopup','true'); btn.setAttribute('aria-expanded','false'); if(!btn.getAttribute('aria-label')) btn.setAttribute('aria-label','Language');
      function lset(on){ box.classList.toggle('open',on); btn.setAttribute('aria-expanded',on?'true':'false'); }
      btn.onclick=function(e){e.stopPropagation();lset(!box.classList.contains('open'))};
      box.addEventListener('keydown',function(e){ if(e.key==='Escape'&&box.classList.contains('open')){ e.preventDefault(); lset(false); btn.focus(); } });
      box.addEventListener('focusout',function(){ setTimeout(function(){ if(!box.contains(document.activeElement)) lset(false); },0); });
      box.querySelectorAll('.lang-menu button').forEach(function(b){var c=b.getAttribute('data-l'); b.setAttribute('lang',c); if(c===pageLang) b.setAttribute('aria-current','true'); if(alts.length && !alt(c)){ b.style.display='none'; return; } b.onclick=function(){location.href=target(c);}});
      document.addEventListener('click',function(){lset(false)});
    }
  }

  /* ---------- GA4 + Consent Mode v2 (guarded: loader skips when head snippet present) ---------- */
  (function(){
    if(!window.gtag){
      window.dataLayer=window.dataLayer||[];
      window.gtag=function(){dataLayer.push(arguments);};
      gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});
      try{if(localStorage.getItem('uc_consent')==='granted')gtag('consent','update',{analytics_storage:'granted'});}catch(e){}
      gtag('js',new Date()); gtag('config','G-HWF39V3XM0');
      var s=document.createElement('script'); s.async=true;
      s.src='https://www.googletagmanager.com/gtag/js?id=G-HWF39V3XM0';
      document.head.appendChild(s);
    }
    var C=null; try{C=localStorage.getItem('uc_consent');}catch(e){}
    if(C) return;
    var T={
      en:{m:"We use minimal analytics to improve this site. No ads, no data resale.",a:"Accept",d:"Essentials only"},
      de:{m:"Wir nutzen minimale Analyse-Cookies, um diese Seite zu verbessern. Keine Werbung, kein Datenverkauf.",a:"Akzeptieren",d:"Nur Essenzielles"},
      ms:{m:"Kami menggunakan analitik minimum untuk menambah baik laman ini. Tiada iklan, tiada penjualan data.",a:"Terima",d:"Asas sahaja"},
      ar:{m:"نستخدم تحليلات بسيطة لتحسين هذا الموقع. لا إعلانات ولا بيع للبيانات.",a:"موافق",d:"الأساسيات فقط"},
      zh:{m:"我们使用最少的分析数据来改进本网站。无广告，不出售数据。",a:"接受",d:"仅必要项"},
      tr:{m:"Bu siteyi geliştirmek için asgari analiz kullanıyoruz. Reklam yok, veri satışı yok.",a:"Kabul et",d:"Yalnızca gerekli"}
    };
    function show(){
      var l=(document.documentElement.lang||'en').slice(0,2); var t=T[l]||T.en;
      var b=document.createElement('div'); b.className='ccb'; b.setAttribute('role','dialog'); b.setAttribute('aria-label','Cookies');
      b.innerHTML='<span class="ccb-dot"></span><p>'+t.m+'</p><div class="ccb-btns"><button class="ccb-ok">'+t.a+'</button><button class="ccb-no">'+t.d+'</button></div>';
      document.body.appendChild(b);
      requestAnimationFrame(function(){requestAnimationFrame(function(){b.classList.add('on');});});
      function close(v){
        try{localStorage.setItem('uc_consent',v);}catch(e){}
        if(v==='granted')gtag('consent','update',{analytics_storage:'granted'});
        b.classList.remove('on'); setTimeout(function(){b.remove();},450);
      }
      b.querySelector('.ccb-ok').onclick=function(){close('granted');};
      b.querySelector('.ccb-no').onclick=function(){close('denied');};
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',show);else show();
  })();

  /* ---------- hero title: one pass through the six languages, starting and ending on the page language (2026-11-07) ---------- */
  function initHeroCycle(){
    var order=['en','de','ms','ar','zh','tr'];
    var pl=(document.documentElement.getAttribute('lang')||'en').slice(0,2);
    window.UC_heroAnchor=function(){};   /* defined up front so initLang/setLang never hit undefined */
    var h1=document.querySelector('header.hero h1.hero-cycle'); if(!h1) return;
    var t1=h1.querySelector('.ht1'), t2=h1.querySelector('.ht2'); if(!t1||!t2) return;
    var base=order.indexOf(pl); if(base<0) base=0;
    var i=base, own1=t1.innerHTML, own2=t2.innerHTML;   /* the baked page-language wording (build.py) wins over the I18N copy */
    function apply(l){ var d=I18N[l]; if(!d) return; if(l===pl){ t1.innerHTML=own1; t2.innerHTML=own2; } else { if(d.tag1!=null) t1.innerHTML=d.tag1; if(d.tag2!=null) t2.innerHTML=d.tag2; }
      [t1,t2].forEach(function(t){ t.setAttribute('lang',l); }); h1.setAttribute('dir', l==='ar'?'rtl':'ltr'); }
    [t1,t2].forEach(function(t){ if(!t.getAttribute('lang')) t.setAttribute('lang',pl); });
    /* the baked page-language H1 stays untouched on load (no apply) so LCP text and the page language are right from first paint */
    window.UC_heroAnchor=function(l){ var k=order.indexOf(l); if(k<0) return; i=k; apply(l); };
    if(reduce) return;
    h1.style.transition='opacity .55s cubic-bezier(.16,1,.3,1), filter .55s ease, transform .55s cubic-bezier(.16,1,.3,1)';
    var n=0, timer=null;
    var tick=function(){
      n++; i=(base+n)%order.length;
      h1.style.opacity='.001'; h1.style.filter='blur(7px)'; h1.style.transform='translateY(12px)';
      setTimeout(function(){ apply(order[i]); h1.style.opacity='1'; h1.style.filter='none'; h1.style.transform='none'; },560);
      if(n>=order.length){ clearInterval(timer); }   /* full loop done: we are back on the page language */
    };
    var started=false;
    function startCycle(){ if(started)return; started=true; setTimeout(function(){ tick(); timer=setInterval(tick,3000); },1200); }
    ['scroll','pointerdown','pointermove','keydown','touchstart'].forEach(function(ev){ addEventListener(ev,startCycle,{once:true,passive:true}); }); /* humans move; lab runs don't — keeps LCP stable */
  }

  /* ---------- chrome: nav, menu, cursor, magnetic ---------- */
  function initChrome(){
    var nav=document.getElementById('nav'); if(nav) addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>40)});
    /* legal footer links (2026-07-11): older baked pages only have the imprint link -> add Privacy/Terms */
    (function(){ var imp=document.querySelector('footer a[href$="imprint.html"]'); if(!imp) return;
      if(!document.querySelector('footer a[href$="privacy.html"]')){
        var L=(document.documentElement.lang||'en').slice(0,2); var d=I18N[L]||I18N.en;
        var p=document.createElement('a'); p.href='privacy.html'; p.setAttribute('data-i18n','f_privacy'); p.textContent=d.f_privacy||'Privacy Policy'; imp.after(p);
        var t=document.createElement('a'); t.href='terms.html'; t.setAttribute('data-i18n','f_terms'); t.textContent=d.f_terms||'Terms of Use'; p.after(t);
        if(d.imprint) imp.innerHTML=d.imprint;
      }
    })();
    document.querySelectorAll('.fab a').forEach(function(x){ if(!x.getAttribute('aria-label')) x.setAttribute('aria-label',x.getAttribute('title')||(x.classList.contains('wa')?'WhatsApp':'Book a call')); });  /* S5 */
    var ov=document.getElementById('overlay'),ob=document.getElementById('menuOpen'),oc=document.getElementById('menuClose'),ovOpener=null;
    addEventListener('pageshow',function(){ if(ov){ ov.classList.remove('open'); try{ if(window.__lenis) window.__lenis.start(); }catch(e){} document.documentElement.style.overflow=''; } });
    function ovLock(on){ try{ if(window.__lenis){ on?window.__lenis.stop():window.__lenis.start(); } }catch(e){} document.documentElement.style.overflow=on?'hidden':''; }
    /* works whether #menuOpen/#menuClose are <span> (old build) or <button> (new build) */
    function btnify(el){ if(!el) return; if(el.tagName!=='BUTTON'){ el.setAttribute('role','button'); if(!el.hasAttribute('tabindex')) el.setAttribute('tabindex','0');
        el.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); } }); }
      else if(!el.getAttribute('type')) el.setAttribute('type','button'); }
    btnify(ob); btnify(oc);
    if(ob&&ov){ ob.setAttribute('aria-controls','overlay'); ob.setAttribute('aria-expanded','false'); if(!ob.getAttribute('aria-label')&&!ob.textContent.trim()) ob.setAttribute('aria-label','Menu'); }
    if(oc&&!oc.getAttribute('aria-label')) oc.setAttribute('aria-label','Close');
    function ovFocusables(){ return [].slice.call(ov.querySelectorAll('a[href],button,summary,[tabindex]:not([tabindex="-1"]),input,select,textarea')).filter(function(x){ return x.offsetParent!==null||x===oc; }); }
    function ovOpen(e){ if(e)e.preventDefault(); ovOpener=document.activeElement; ov.__t=Date.now(); ov.classList.add('open'); ovLock(true); if(ob) ob.setAttribute('aria-expanded','true');
      setTimeout(function(){ var f=ovFocusables().filter(function(x){ return x!==oc&&!x.closest('.ov-top'); })[0]||oc; if(f) try{ f.focus({preventScroll:true}); }catch(_){ f.focus(); } },60); }
    function ovClose(force){ if(!ov||!ov.classList.contains('open')) return; if(!force&&Date.now()-(ov.__t||0)<450) return; /* ignore ghost taps right after opening */
      ov.classList.remove('open'); ovLock(false); if(ob) ob.setAttribute('aria-expanded','false');
      var t=ovOpener&&document.contains(ovOpener)&&ovOpener.offsetParent!==null?ovOpener:ob; if(t&&t.focus) try{ t.focus({preventScroll:true}); }catch(_){} }
    if(ob&&ov) ob.onclick=ovOpen;
    function cl(){ ovClose(false); }
    if(oc)oc.onclick=cl; if(ov)ov.querySelectorAll('a').forEach(function(a){a.onclick=cl});
    if(ov) document.addEventListener('keydown',function(e){ if(!ov.classList.contains('open')) return;
      if(e.key==='Escape'){ e.preventDefault(); ovClose(true); return; }
      if(e.key==='Tab'){ var f=ovFocusables(); if(!f.length) return; var first=f[0], last=f[f.length-1];
        if(!ov.contains(document.activeElement)){ e.preventDefault(); first.focus(); }
        else if(e.shiftKey&&document.activeElement===first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey&&document.activeElement===last){ e.preventDefault(); first.focus(); } } });
    /* mega menu: hover-intent from the nav LINK text (2026-07-06) + keyboard (2026-11-07): opens while focus is inside, Esc closes */
    document.querySelectorAll('.has-mega').forEach(function(m){
      var a=null; for(var i=0;i<m.children.length;i++){ if(m.children[i].tagName==='A'){a=m.children[i];break;} }
      var panel=m.querySelector('.mega'); if(!a||!panel) return;
      var ot,ct;
      a.setAttribute('aria-haspopup','true'); a.setAttribute('aria-expanded','false');
      if(!panel.id) panel.id='mega'+Math.random().toString(36).slice(2,7); a.setAttribute('aria-controls',panel.id);
      function setOpen(on){ m.classList.toggle('mega-open',on); if(on) m.classList.remove('mega-shut'); a.setAttribute('aria-expanded',on?'true':'false'); }
      function doOpen(){ clearTimeout(ct); ot=setTimeout(function(){ setOpen(true); },140); }
      function doClose(){ clearTimeout(ot); ct=setTimeout(function(){ if(!m.contains(document.activeElement)||!m.matches(':focus-within')) setOpen(false); },180); }
      a.addEventListener('mouseenter',doOpen);
      a.addEventListener('mouseleave',doClose);
      panel.addEventListener('mouseenter',function(){ if(m.classList.contains('mega-open')){ clearTimeout(ct); clearTimeout(ot); } });
      panel.addEventListener('mouseleave',doClose);
      m.addEventListener('focusin',function(){ if(m.__escd){ m.__escd=false; return; } if(m.__kbd){ clearTimeout(ct); setOpen(true); } });
      m.addEventListener('focusout',function(){ setTimeout(function(){ if(!m.contains(document.activeElement)){ setOpen(false); m.classList.remove('mega-shut'); } },0); });
      /* Tab / ArrowDown from the trigger goes straight into the panel (deterministic, no wait on the CSS visibility transition) */
      a.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'||(e.key==='Tab'&&!e.shiftKey)){ var f=panel.querySelector('a[href]'); if(!f) return; e.preventDefault(); setOpen(true); panel.style.visibility='visible'; f.focus(); panel.style.visibility=''; } });
      m.addEventListener('keydown',function(e){ if(e.key==='Escape'&&m.classList.contains('mega-open')){ e.preventDefault(); e.stopPropagation(); m.__escd=true; setOpen(false); m.classList.add('mega-shut'); a.focus(); } });
    });
    /* only keyboard focus opens the mega (a mouse click on "Solutions" navigates as before) */
    document.addEventListener('keydown',function(e){ if(e.key==='Tab'){ document.querySelectorAll('.has-mega').forEach(function(m){ m.__kbd=true; }); } },true);
    document.addEventListener('mousedown',function(){ document.querySelectorAll('.has-mega').forEach(function(m){ m.__kbd=false; }); },true);
    /* accordion: only one Solutions group open at a time (2026-07-05) */
    if(ov)ov.querySelectorAll('.ov-acc').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)ov.querySelectorAll('.ov-acc[open]').forEach(function(o){if(o!==d)o.open=false;})})});
    if(!reduce&&!matchMedia('(hover:none)').matches){
      var dot=document.createElement('div');dot.className='cursor';document.body.appendChild(dot);
      var ring=document.createElement('div');ring.className='cursor-ring';document.body.appendChild(ring);
      var x=0,y=0,dx=0,dy=0,rx=0,ry=0;
      addEventListener('mousemove',function(e){x=e.clientX;y=e.clientY});
      (function r(){ dx+=(x-dx)*.35; dy+=(y-dy)*.35; rx+=(x-rx)*.13; ry+=(y-ry)*.13;
        dot.style.left=dx+'px';dot.style.top=dy+'px'; ring.style.left=rx+'px';ring.style.top=ry+'px'; requestAnimationFrame(r); })();
      document.addEventListener('mouseover',function(e){if(e.target.closest('a,.btn,.tile,.card,.menu-btn,.opt,.slot,.idx-row,summary')){dot.classList.add('big');ring.classList.add('big');}});
      document.addEventListener('mouseout',function(e){if(e.target.closest('a,.btn,.tile,.card,.menu-btn,.opt,.slot,.idx-row,summary')){dot.classList.remove('big');ring.classList.remove('big');}});
      document.addEventListener('mousedown',function(){ring.classList.add('down')});
      document.addEventListener('mouseup',function(){ring.classList.remove('down')});
      document.querySelectorAll('.btn').forEach(function(b){b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.3)+'px,'+((e.clientY-r.top-r.height/2)*.4)+'px)'});b.addEventListener('mouseleave',function(){b.style.transform=''})});
    }
  }

  /* ---------- booking wizard ---------- */
  function initWizard(){
    var w=document.getElementById('wiz'); if(!w) return;
    var steps=w.querySelectorAll('.wiz-step'), prog=w.querySelectorAll('.wiz-prog .p'), cur=0;
    var sel={service:'',pkg:'',slot:''};
    // preselect service from ?service=
    var qs=new URLSearchParams(location.search).get('service');
    function show(i){cur=Math.max(0,Math.min(steps.length-1,i));
      steps.forEach(function(s,k){s.classList.toggle('on',k===cur)});
      prog.forEach(function(p,k){p.classList.toggle('on',k<=cur)});}
    w.querySelectorAll('[data-next]').forEach(function(b){b.onclick=function(){show(cur+1)}});
    w.querySelectorAll('[data-prev]').forEach(function(b){b.onclick=function(){show(cur-1)}});
    w.querySelectorAll('.opt').forEach(function(o){o.onclick=function(){
      var grp=o.getAttribute('data-grp'); w.querySelectorAll('.opt[data-grp="'+grp+'"]').forEach(function(x){x.classList.remove('sel')});
      w.querySelectorAll('.opt[data-grp="'+grp+'"]').forEach(function(x){x.setAttribute('aria-pressed','false')});
      o.classList.add('sel'); o.setAttribute('aria-pressed','true'); sel[grp]=o.getAttribute('data-val');}});
    w.querySelectorAll('.slot').forEach(function(s){s.onclick=function(){w.querySelectorAll('.slot').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false')});s.classList.add('sel');s.setAttribute('aria-pressed','true');sel.slot=s.getAttribute('data-val');}});
    if(qs){var pre=w.querySelector('.opt[data-grp="service"][data-val="'+qs+'"]'); if(pre){pre.classList.add('sel');pre.setAttribute('aria-pressed','true');sel.service=qs;}}
    /* --- step 4 -> review: validate, then summarise --- */
    var fin=w.querySelector('#wizFinish');
    if(fin) fin.onclick=function(){
      var nm=w.querySelector('#wizName'), em=w.querySelector('#wizEmail'),
          co=w.querySelector('#wizCompany'), nt=w.querySelector('#wizNotes'),
          err=w.querySelector('#wizErr');
      sel.name=nm?nm.value.trim():''; sel.email=em?em.value.trim():'';
      sel.company=co?co.value.trim():''; sel.notes=nt?nt.value.trim():'';
      /* messages sit in #wizMsgs as real text nodes so the i18n pass translates them */
      function msg(id,fb){ var n=w.querySelector(id); return (n&&n.textContent.trim())||fb; }
      function bad(id,fb){ if(err){err.textContent=msg(id,fb); err.style.display='block';} return false; }
      if(err) err.style.display='none';
      if(!sel.name){ return bad('#wizMsgName','Please add your name so we know who we’re replying to.'); }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(sel.email)){ return bad('#wizMsgMail','That email doesn’t look right — we need it to send your confirmation.'); }
      var sum=w.querySelector('#wizSummary');
      if(sum) sum.textContent=(sel.service||'Project')+' · '+(sel.pkg||'Scope TBD')+' · '+(sel.slot||'Time TBD');
      show(steps.length-1);
    };

    /* --- step 5: actually send it (Formsubmit -> BOOKING.email) --- */
    var send=w.querySelector('#wizSend');
    if(send) send.onclick=function(){
      var btn=send, nav=w.querySelector('#wizNav5'),
          blurb=w.querySelector('#wizBlurb'),
          done=w.querySelector('#wizDone'), fail=w.querySelector('#wizFail');
      btn.disabled=true; var old=btn.textContent;
      btn.textContent=btn.getAttribute('data-sending')||'Sending…';
      var payload={
        _subject:'Booking request — '+(sel.name||'Website')+(sel.company?' ('+sel.company+')':''),
        name:sel.name, email:sel.email, company:sel.company||'—',
        service:sel.service||'—', engagement:sel.pkg||'—',
        preferred_time:sel.slot||'—', notes:sel.notes||'—',
        page:location.href, submitted:new Date().toISOString()
      };
      function ok(){ if(blurb)blurb.style.display='none'; if(nav)nav.style.display='none';
                     if(fail)fail.style.display='none'; if(done)done.style.display='block'; }
      function no(){ btn.disabled=false; btn.textContent=old;
                     if(blurb)blurb.style.display='none'; if(fail)fail.style.display='block'; }
      /* fire-and-verify: Formsubmit needs one-time activation on BOOKING.email */
      UC_SELF=true; var _wp=fetch('https://formsubmit.co/ajax/'+encodeURIComponent(BOOKING.email),{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify(payload)
      }); UC_SELF=false; _wp.then(function(r){ return r.ok?r.json():Promise.reject(r.status); })
        .then(function(j){ if(j&&(j.success===false||j.success==='false')) return Promise.reject('inactive'); return j; })
        .then(function(){ ok(); ucEv('generate_lead',{lead_type:'booking_wizard',service:payload.service||'',page:location.pathname});
          /* optional: mirror into UCpanel when it's wired */
          if(BOOKING.ucp){ try{ fetch(BOOKING.ucp,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}); }catch(e){} }
        })
        .catch(function(){ no(); });
    };
  }

  /* ---------- stat counters (2026-11-07): the final value is baked into the HTML (crawlers, no-JS, reduced motion).
     Animation counts 0 -> target only once the number scrolls into view; until then the baked text stays. ---------- */
  function initCounters(){
    var els=[].slice.call(document.querySelectorAll('.count[data-to]')); if(!els.length) return;
    /* keeps any baked prefix/suffix ("100+") and only swaps the digits */
    function put(el,v){ var t=el.textContent; el.textContent=/\d/.test(t)?t.replace(/\d[\d,.]*/,String(v)):String(v); }
    function fill(el){ var to=el.getAttribute('data-to'); var cur=el.textContent.replace(/[^0-9]/g,''); if(!cur||cur==='0') put(el,to); }
    if(reduce||!('IntersectionObserver' in window)){ els.forEach(fill); return; }
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(!e.isIntersecting) return; io.unobserve(e.target); var el=e.target, to=+el.getAttribute('data-to')||0, t0=null, D=1400;
      put(el,0);
      function f(ts){ if(t0===null) t0=ts; var k=Math.min(1,(ts-t0)/D), v=1-Math.pow(1-k,3); put(el,Math.round(to*v)); if(k<1) requestAnimationFrame(f); }
      requestAnimationFrame(f); }); },{threshold:.6});
    els.forEach(function(el){ fill(el); io.observe(el); });
  }

  /* ---------- lenis + gsap reveals ---------- */
  function start(){
    var isTouch=matchMedia('(hover: none), (pointer: coarse)').matches;
    if(isTouch&&hasG){
      /* phones: pure native momentum scrolling (Lenis can cut iOS momentum short);
         ScrollTrigger listens to native scroll on its own — just keep heights fresh */
      var rzT2;function rz2(){clearTimeout(rzT2);rzT2=setTimeout(function(){try{ScrollTrigger.refresh();}catch(e){}},120);}
      window.addEventListener('load',rz2);window.addEventListener('resize',rz2);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(rz2);
      setTimeout(rz2,600);setTimeout(rz2,1600);setTimeout(rz2,3000);
      if(window.ResizeObserver){try{new ResizeObserver(rz2).observe(document.body);}catch(e){}}
    }
    if(typeof Lenis!=='undefined'&&!isTouch&&!reduce){var l=new Lenis({lerp:0.1});window.__lenis=l;
      if(hasG){l.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){l.raf(t*1000)});gsap.ticker.lagSmoothing(0);}
      else{function raf(t){l.raf(t);requestAnimationFrame(raf)}requestAnimationFrame(raf);}
      /* recompute scrollable height after fonts/lottie/images reflow so the footer is always reachable */
      var rzT;function rz(){clearTimeout(rzT);rzT=setTimeout(function(){try{l.resize();if(hasG)ScrollTrigger.refresh();}catch(e){}},120);}
      window.addEventListener('load',rz);window.addEventListener('resize',rz);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(rz);
      setTimeout(rz,600);setTimeout(rz,1600);setTimeout(rz,3000);
      if(window.ResizeObserver){try{new ResizeObserver(rz).observe(document.body);}catch(e){}}
    }
    initCounters();
    if(!hasG||reduce){document.querySelectorAll('.reveal').forEach(function(e){e.style.opacity=1;e.style.transform='none'});return;}
    gsap.utils.toArray('.reveal').forEach(function(el){gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
    gsap.utils.toArray('.tile').forEach(function(t,i){gsap.fromTo(t,{y:i%2?40:18},{y:i%2?-40:-18,ease:'none',scrollTrigger:{trigger:t,start:'top bottom',end:'bottom top',scrub:1}})});
  }

  /* ---------- imagery: fade-in on load, remove on error (gradient shows) ---------- */
  function initImages(){
    document.querySelectorAll('.ph img,.tphoto img,.art-hero img,.hero-media img,.mega-feat img,.brand .logo').forEach(function(im){
      if(im.complete){ if(im.naturalWidth>0) im.classList.add('ld'); else if(!im.classList.contains('logo')) im.remove(); }
      im.addEventListener('load',function(){im.classList.add('ld')});
      im.addEventListener('error',function(){ if(im.classList.contains('logo')){var w=im.nextElementSibling; if(w)w.style.display='inline'; im.style.display='none';} else im.remove(); });
    });
  }

  /* ---------- Lottie ---------- */
  function initLottie(){ if(!window.lottie) return;
    document.querySelectorAll('.lottie-box[data-src]').forEach(function(el){
      try{ var an=lottie.loadAnimation({container:el,renderer:'svg',loop:!reduce,autoplay:!reduce,path:el.getAttribute('data-src')});
        if(reduce) an.addEventListener('DOMLoaded',function(){ try{ an.goToAndStop(Math.max(0,an.totalFrames-1),true); }catch(_){} }); }catch(e){} }); }

  /* ---------- background effects (per page via data-fx) ---------- */
  function rgbOf(i){ var c=theme()[i]; return Math.round(c[0]*255)+','+Math.round(c[1]*255)+','+Math.round(c[2]*255); }
  function particles2D(c){ var x=c.getContext('2d'),D=Math.min(devicePixelRatio,2),W,H,P=[],col=rgbOf(1);
    function sz(){W=c.width=innerWidth*D;H=c.height=innerHeight*D;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';
      var n=Math.min(120,Math.floor(innerWidth*innerHeight/15000));P=[];for(var i=0;i<n;i++)P.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25*D,vy:(Math.random()-.5)*.25*D,s:(Math.random()*1.6+.4)*D});}
    function tk(){requestAnimationFrame(tk);x.clearRect(0,0,W,H);var i,j;for(i=0;i<P.length;i++){var p=P[i];p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;}
      for(i=0;i<P.length;i++)for(j=i+1;j<P.length;j++){var a=P[i],b=P[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.hypot(dx,dy),m=150*D;if(d<m){x.globalAlpha=(1-d/m)*.16;x.strokeStyle='rgb('+col+')';x.lineWidth=D*.5;x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}}
      x.globalAlpha=.7;x.fillStyle='rgb('+col+')';for(i=0;i<P.length;i++){x.beginPath();x.arc(P[i].x,P[i].y,P[i].s,0,7);x.fill();}x.globalAlpha=1;}
    addEventListener('resize',sz);sz();tk(); }
  function grid2D(c){ var x=c.getContext('2d'),D=Math.min(devicePixelRatio,2),W,H,t=0,col=rgbOf(1);
    function sz(){W=c.width=innerWidth*D;H=c.height=innerHeight*D;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';}
    function tk(){requestAnimationFrame(tk);t+=0.4*D;x.clearRect(0,0,W,H);x.strokeStyle='rgba('+col+',.18)';x.lineWidth=D*.5;var hz=H*.4,i,sp=34*D;
      for(i=0;i<40;i++){var pp=(i*sp+t)% (H);var f=pp/H;if(f<=0)continue;var y=hz+f*f*(H-hz);if(y>H||y<hz)continue;x.globalAlpha=f*.9;x.beginPath();x.moveTo(0,y);x.lineTo(W,y);x.stroke();}
      var cx=W/2;x.globalAlpha=.1;for(var k=-16;k<=16;k++){x.beginPath();x.moveTo(cx+k*44*D,H);x.lineTo(cx+k*5*D,hz);x.stroke();}x.globalAlpha=1;}
    addEventListener('resize',sz);sz();tk(); }
  function mesh2D(c){ var x=c.getContext('2d'),D=Math.min(devicePixelRatio,2),W,H,t=0;
    function rc(i,a){return 'rgba('+rgbOf(i)+','+a+')';}
    function sz(){W=c.width=innerWidth*D;H=c.height=innerHeight*D;c.style.width=innerWidth+'px';c.style.height=innerHeight+'px';}
    function blob(cx,cy,r,cl){var g=x.createRadialGradient(cx,cy,0,cx,cy,r);g.addColorStop(0,cl);g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.beginPath();x.arc(cx,cy,r,0,7);x.fill();}
    function tk(){requestAnimationFrame(tk);t+=0.004;x.clearRect(0,0,W,H);x.globalCompositeOperation='lighter';var R=Math.max(W,H)*.5;
      blob(W*(.3+.12*Math.sin(t)),H*(.35+.1*Math.cos(t*1.1)),R,rc(1,.16));
      blob(W*(.72+.1*Math.cos(t*.8)),H*(.6+.12*Math.sin(t*.9)),R*.9,rc(2,.13));
      blob(W*(.55+.1*Math.sin(t*1.3)),H*(.22+.08*Math.cos(t)),R*.8,rc(0,.2));
      x.globalCompositeOperation='source-over';}
    addEventListener('resize',sz);sz();tk(); }
  function initFX(){ var fx=document.body.getAttribute('data-fx')||'aurora'; if(fx==='aurora'){initGL();return;}
    if(reduce) return; var c=document.getElementById('gl'); if(!c) return;
    if(fx==='particles') particles2D(c); else if(fx==='grid') grid2D(c); else if(fx==='mesh') mesh2D(c); else initGL(); }

  /* ---------- mega menu preview pane ---------- */
  function initMegaPreview(){ /* mega right panel is now a static CTA + socials card — no hover image swap */ }
  function initWorkCar(){
    var c=document.getElementById('workCar'); if(!c) return;
    function rtl(){ return getComputedStyle(c).direction==='rtl'; }  /* RTL: "next" scrolls towards negative scrollLeft */
    function step(dir){ var t=c.querySelector('.tile'); var dx=(t?t.offsetWidth+18:300)*dir*(rtl()?-1:1); c.scrollBy({left:dx,behavior:reduce?'auto':'smooth'}); }
    document.querySelectorAll('.wcar-btn').forEach(function(b){ b.addEventListener('click',function(){ step(parseInt(b.getAttribute('data-dir'),10)||1); }); });
    var down=false,moved=false,sx=0,sl=0;
    c.addEventListener('pointerdown',function(e){ down=true; moved=false; sx=e.clientX; sl=c.scrollLeft; });
    c.addEventListener('pointermove',function(e){ if(!down) return; var d=e.clientX-sx; if(Math.abs(d)>6){ moved=true; c.classList.add('drag'); } c.scrollLeft=sl-d; });
    function up(){ down=false; setTimeout(function(){ c.classList.remove('drag'); },0); }
    window.addEventListener('pointerup',up); window.addEventListener('pointercancel',up);
    c.querySelectorAll('a.tile').forEach(function(a){ a.addEventListener('click',function(e){ if(moved){ e.preventDefault(); } }); });
  }
  function initMicro(){
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if(window.matchMedia&&window.matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.btn-fill').forEach(function(b){
      b.addEventListener('mousemove',function(e){ var r=b.getBoundingClientRect(); var x=(e.clientX-r.left-r.width/2)/r.width, y=(e.clientY-r.top-r.height/2)/r.height; b.style.transform='translate('+(x*7).toFixed(1)+'px,'+(y*7).toFixed(1)+'px)'; });
      b.addEventListener('mouseleave',function(){ b.style.transform=''; });
    });
    document.querySelectorAll('.tile').forEach(function(t){
      var ph=t.querySelector('.ph'); if(!ph) return;
      t.addEventListener('mousemove',function(e){ var r=ph.getBoundingClientRect(); t.style.setProperty('--mx',((e.clientX-r.left)/r.width*100).toFixed(1)+'%'); t.style.setProperty('--my',((e.clientY-r.top)/r.height*100).toFixed(1)+'%'); });
    });
  }

  /* ---------- ⌘K command palette ---------- */
  function initCmdk(){
    var WA='https://wa.me/601133262709';
    var items=[
      ['Solutions','Home','index.html','⌂'],['Solutions','All Solutions','services.html','▦'],['Solutions','Work','work.html','◳'],
      ['Products','Noon OS — CRM','noon-os.html','◆'],['Products','Launch Bundle','launch-bundle.html','★'],
      ['Services','AI Agents','service-ai-agents.html','▸'],['Services','Automation','service-automation.html','▸'],['Services','App Development','service-app-development.html','▸'],['Services','Web Design','service-web-design.html','▸'],['Services','Branding','service-branding.html','▸'],['Services','Graphic Design','service-graphic-design.html','▸'],['Services','SEO & Content','service-seo-content.html','▸'],['Services','Marketing & Ads','service-marketing-ads.html','▸'],['Services','Lead Generation','service-lead-generation.html','▸'],['Services','Strategy & Market Entry','service-strategy.html','▸'],
      ['Company','About','about.html','◷'],['Company','Ventures','ventures.html','◷'],['Company','Insights','insights.html','◷'],['Company','How we work','process.html','◷'],
      ['Actions','Book a call','booking.html','→'],['Actions','Free AI audit','booking.html?service=ai-agents','→'],['Actions','Send a brief','contact.html','→'],['Actions','WhatsApp us',WA,'→']
    ];
    var ov=document.createElement('div'); ov.className='cmdk'; ov.innerHTML=
      '<div class="cmdk-box"><div class="cmdk-in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg><input type="text" placeholder="Search pages, services, or actions…" id="cmdkIn"><span class="esc">ESC</span></div><div class="cmdk-list" id="cmdkList"></div></div>';
    document.body.appendChild(ov);
    var inp=ov.querySelector('#cmdkIn'),list=ov.querySelector('#cmdkList'),sel=0,filtered=items.slice();
    function render(){ var q=inp.value.toLowerCase().trim();
      filtered=items.filter(function(i){return (i[0]+' '+i[1]).toLowerCase().indexOf(q)>-1;});
      if(sel>=filtered.length)sel=0; var html='',cat='';
      filtered.forEach(function(i,k){ if(i[0]!==cat){cat=i[0];html+='<div class="cmdk-cat">'+cat+'</div>';}
        html+='<div class="cmdk-item'+(k===sel?' sel':'')+'" data-u="'+i[2]+'" data-k="'+k+'"><span class="ci">'+i[3]+'</span><b>'+i[1]+'</b><span class="ar">↵</span></div>'; });
      list.innerHTML=html||'<div class="cmdk-cat">No results</div>';
      list.querySelectorAll('.cmdk-item').forEach(function(el){ el.onmouseenter=function(){sel=+el.getAttribute('data-k');mark();}; el.onclick=function(){go(el.getAttribute('data-u'));}; });
    }
    function mark(){ list.querySelectorAll('.cmdk-item').forEach(function(el){el.classList.toggle('sel',+el.getAttribute('data-k')===sel);}); var s=list.querySelector('.sel'); if(s)s.scrollIntoView({block:'nearest'}); }
    function go(u){ if(u.indexOf('http')===0){window.open(u,'_blank');close();} else location.href=u; }
    function open(){ ov.classList.add('open'); document.body.style.overflow='hidden'; inp.value='';sel=0;render(); setTimeout(function(){inp.focus();},30); }
    function close(){ ov.classList.remove('open'); document.body.style.overflow=''; }
    inp.addEventListener('input',function(){sel=0;render();});
    inp.addEventListener('keydown',function(e){ if(e.key==='ArrowDown'){e.preventDefault();sel=Math.min(sel+1,filtered.length-1);mark();} else if(e.key==='ArrowUp'){e.preventDefault();sel=Math.max(sel-1,0);mark();} else if(e.key==='Enter'){e.preventDefault(); if(filtered[sel])go(filtered[sel][2]);} });
    ov.addEventListener('click',function(e){if(e.target===ov)close();});
    addEventListener('keydown',function(e){ if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault(); ov.classList.contains('open')?close():open();} else if(e.key==='Escape'&&ov.classList.contains('open'))close(); });
    document.querySelectorAll('[data-cmdk]').forEach(function(b){b.onclick=open;});
  }

  /* ---------- unified 3D colour-shifting background ---------- */
  var BASEHUE={'default':150,'services':168,'work':276,'ventures':158,'insights':40,'contact':132,'about':236,'market':44};
  function initBG(){
    if(reduce||noGL||!window.THREE) return;
    var canvas=document.getElementById('gl'); if(!canvas) return; var THREE=window.THREE;
    var sc=new THREE.Scene(); sc.fog=new THREE.FogExp2(0x050706,0.055);
    var cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,100); cam.position.z=8.2;
    var rnd=new THREE.WebGLRenderer({canvas:canvas,alpha:true,antialias:true});
    rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<=820?1:2));
    var base=BASEHUE[document.body.getAttribute('data-aurora')]||150;
    var g=new THREE.Group(); sc.add(g);
    var S=2.3,T1=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]],T2=[[-1,-1,-1],[-1,1,1],[1,-1,1],[1,1,-1]];
    function edges(T){var p=[],i,j;for(i=0;i<4;i++)for(j=i+1;j<4;j++){p.push(T[i][0]*S,T[i][1]*S,T[i][2]*S,T[j][0]*S,T[j][1]*S,T[j][2]*S);}return p;}
    var lg=new THREE.BufferGeometry(); lg.setAttribute('position',new THREE.Float32BufferAttribute(edges(T1).concat(edges(T2)),3));
    var lmat=new THREE.LineBasicMaterial({transparent:true,opacity:.55}); g.add(new THREE.LineSegments(lg,lmat));
    var nv=T1.concat(T2),np=[]; nv.forEach(function(v){np.push(v[0]*S,v[1]*S,v[2]*S);});
    var ng=new THREE.BufferGeometry(); ng.setAttribute('position',new THREE.Float32BufferAttribute(np,3));
    var nmat=new THREE.PointsMaterial({size:.17,transparent:true}); g.add(new THREE.Points(ng,nmat));
    var N=1500,pp=[],k; for(k=0;k<N;k++){var r=3+Math.random()*5.2,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);pp.push(r*Math.sin(ph)*Math.cos(th),r*Math.sin(ph)*Math.sin(th),r*Math.cos(ph));}
    var pg=new THREE.BufferGeometry(); pg.setAttribute('position',new THREE.Float32BufferAttribute(pp,3));
    var pmat=new THREE.PointsMaterial({size:.032,transparent:true,opacity:.62}); var pts=new THREE.Points(pg,pmat); g.add(pts);
    function hsl(h,s,l){var c=new THREE.Color();c.setHSL((((h%360)+360)%360)/360,s,l);return c;}
    var mx=0,my=0,t=0,vis=true,sp=0;
    addEventListener('mousemove',function(e){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;});
    addEventListener('scroll',function(){sp=scrollY/((document.body.scrollHeight-innerHeight)||1);});
    addEventListener('resize',function(){cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();rnd.setSize(innerWidth,innerHeight);});
    document.addEventListener('visibilitychange',function(){vis=!document.hidden; if(vis)requestAnimationFrame(loop);});
    function loop(){ if(!vis)return; requestAnimationFrame(loop); t+=0.006;
      var hue=base+Math.sin(t*0.25)*46+sp*90;
      lmat.color=hsl(hue,.72,.62); nmat.color=hsl(hue+38,.85,.66); pmat.color=hsl(hue-26,.6,.58);
      g.rotation.y+=0.0017; g.rotation.x+=(my*0.5-g.rotation.x)*0.04; g.rotation.z=Math.sin(t*0.2)*0.12;
      pts.rotation.y-=0.0006; pts.rotation.x=my*0.15;
      cam.position.x+=(mx*1.6-cam.position.x)*0.035; cam.position.y+=(-my*1.3-cam.position.y)*0.035; cam.lookAt(0,0,0);
      rnd.render(sc,cam);
    }
    loop();
  }

  /* ---------- liquid metaball background (variant, jade, mouse-reactive) ---------- */
  function initLiquid(){
    if(reduce||noGL||!window.THREE) return; var canvas=document.getElementById('gl'); if(!canvas) return; var THREE=window.THREE;
    var FR=[
      'precision highp float; varying vec2 vUv; uniform float uTime; uniform vec2 uMouse; uniform vec2 uRes; uniform vec3 uA; uniform vec3 uB;',
      'void main(){ float asp=uRes.x/uRes.y; vec2 p=vec2(vUv.x*asp,vUv.y); float m=0.0; int i;',
      ' for(i=0;i<6;i++){ float f=float(i); vec2 c=vec2(0.5*asp+sin(uTime*0.3+f*1.7)*0.36*asp,0.5+cos(uTime*0.24+f*2.1)*0.33); float r=0.15+0.05*sin(uTime*0.5+f); vec2 d=p-c; m+=r*r/dot(d,d); }',
      ' vec2 mc=vec2(uMouse.x*asp,uMouse.y); vec2 dm=p-mc; m+=0.055/dot(dm,dm);',
      ' vec3 bg=vec3(0.015,0.04,0.03); float body=smoothstep(0.6,1.1,m); float edge=smoothstep(1.0,1.05,m)-smoothstep(1.05,1.12,m);',
      ' vec3 col=mix(bg,uA*0.4,smoothstep(0.45,1.0,m)); col=mix(col,uA,body); col+=uB*smoothstep(1.5,2.4,m)*0.5; col+=uB*edge*0.6;',
      ' col*=1.0-0.45*distance(vUv,vec2(0.5)); gl_FragColor=vec4(col,1.0); }'
    ].join('\n');
    var tc=theme();
    var sc=new THREE.Scene(),cam=new THREE.Camera();
    var rnd=new THREE.WebGLRenderer({canvas:canvas,antialias:true}); rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<=820?1:2));
    var uni={uTime:{value:0},uMouse:{value:new THREE.Vector2(.5,.5)},uRes:{value:new THREE.Vector2(innerWidth,innerHeight)},
      uA:{value:new THREE.Vector3(0.09,0.84,0.55)},uB:{value:new THREE.Vector3().fromArray(tc[2])}};
    sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:uni,vertexShader:VERT,fragmentShader:FR})));
    var mxv=.5,myv=.5,mX=.5,mY=.5,t0=performance.now();
    addEventListener('mousemove',function(e){mxv=e.clientX/innerWidth;myv=1-e.clientY/innerHeight});
    addEventListener('resize',function(){rnd.setSize(innerWidth,innerHeight);uni.uRes.value.set(innerWidth,innerHeight)});
    (function tick(){requestAnimationFrame(tick); uni.uTime.value=(performance.now()-t0)/1000; mX+=(mxv-mX)*.06;mY+=(myv-mY)*.06; uni.uMouse.value.set(mX,mY); rnd.render(sc,cam);})();
  }

  /* ---------- section-driven hue + scroll-velocity intensity ---------- */
  function initSectionFX(){
    addEventListener('scroll',function(){ var d=Math.abs(scrollY-UC_LASTY); UC_LASTY=scrollY; UC_BOOST=Math.min(1,UC_BOOST+d/110); },{passive:true});
    var secs=[].slice.call(document.querySelectorAll('main section, header.hero, header.phero'));
    if(!secs.length) return;
    var io=new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var i=secs.indexOf(e.target); if(i>=0) UC_SECT=((i%7)-3)*0.022; } }); },{threshold:.5});
    secs.forEach(function(s){ io.observe(s); });
  }
  /* ---------- premium boot intro (first load of the session only) ---------- */
  function initBoot(){
    if(reduce) return;
    if(noGL) return;
    try{ if(sessionStorage.getItem('uc_booted')) return; }catch(e){}
    var b=document.createElement('div'); b.className='boot';
    b.innerHTML='<div class="boot-in"><div class="boot-mk"></div><div class="boot-wm">Ummah&nbsp;Collective</div><div class="boot-sub">Intelligence, with integrity</div><div class="boot-bar"><i></i></div></div>';
    document.body.appendChild(b); document.body.style.overflow='hidden';
    if(window.lottie){ try{ lottie.loadAnimation({container:b.querySelector('.boot-mk'),renderer:'svg',loop:true,autoplay:true,path:'orbit-lottie.json'}); }catch(e){} }
    var bar=b.querySelector('.boot-bar i'); setTimeout(function(){ if(bar) bar.style.width='100%'; },80);
    setTimeout(function(){ b.classList.add('done'); document.body.style.overflow=''; try{sessionStorage.setItem('uc_booted','1');}catch(e){} setTimeout(function(){ if(b.parentNode) b.remove(); },900); },1600);
  }
  /* ---------- booking popup (global, injected) — 2026-11-07 rebuild: 3 steps, audit mode, localised, keyboard-safe, honest success/fail ---------- */
  var BOOKING={
    w3f:'',  /* optional Web3Forms access key — if set, used instead of Formsubmit */
    email:'info@ummah-collective.com',  /* keyless Formsubmit delivery target (one-time activation) */
    ucp:''  /* UCpanel lead-intake URL — set once the dynamic panel is deployed */
  };
  var BK_STR={
    en:{k:'Book a call',kA:'Free AI audit',h1:'What can we help with?',s1:'Pick the closest fit and tell us where to look.',hA:'Your free AI audit',sA:'Instant score, written findings within 48 hours, a 30-minute walkthrough. Free. No pitch.',h2:'Preferred time',s2:'We confirm by email within one working day. Times are shown in your time zone, with Malaysia time (MYT) in brackets.',h3:'How to reach you',s3:'Free. 30 minutes. A written next step.',stepOf:'Step {n} of 3',selected:'Selected',change:'Change',web:'Your website',webPh:'yourcompany.com',company:'Company',opt:'optional',name:'Name',email:'Email',phone:'Phone or WhatsApp',msg:'Anything we should know?',msgPh:'Goals, the problem to solve, a deadline',next:'Next',back:'Back',send:'Send request',sending:'Sending…',hint:'Pick a day to see times.',eSvc:'Pick what you need to continue.',eWeb:'Add your website so we know what to audit.',eUrl:'That web address does not look right.',eSlot:'Pick a day and a time to continue.',eName:'Please add your name.',eEmail:'That email does not look right. We need it to confirm your time.',note:'By sending you agree to be contacted about your enquiry.',wa:'WhatsApp us',dH:'Request received.',dT:'Your preferred time: {t}. We confirm by email within one working day.',dA:'Your written findings follow within 48 hours. We confirm your walkthrough time by email.',dP:'Read our company profile (PDF)',fH:'That did not go through.',fT:'Your request did not reach us. Send it by email or WhatsApp and we reply within one working day.',fE:'Email us',fW:'WhatsApp us',fR:'Try again',close:'Close',
      svc:{'ai-agents':['AI agents','Answer, qualify and follow up around the clock'],'automation':['Automation','Remove the manual steps'],'custom-crm':['Custom CRM','The system your team runs on'],'app-development':['Apps & software','Custom apps, shipped fast'],'web-design':['Web design','Sites that turn visits into enquiries'],'branding':['Branding','Identity and positioning'],'lead-generation':['Lead generation','A pipeline that compounds'],'seo-content':['SEO & content','Found on Google and in AI answers'],'social-media-automation':['Social media automation','Consistent posting without the hours'],'shariah-audit':['Shariah compliance audit','A structured review of your digital operations'],'audit':['Free AI audit','Score, written findings, a 30-minute walkthrough'],'other':['Something else','Tell us what you need']}},
    de:{k:'Gespräch buchen',kA:'Kostenloses KI-Audit',h1:'Wobei können wir helfen?',s1:'Wählen Sie, was am besten passt, und sagen Sie uns, wo wir hinschauen sollen.',hA:'Ihr kostenloses KI-Audit',sA:'Sofortige Bewertung, schriftliche Ergebnisse innerhalb von 48 Stunden, 30 Minuten gemeinsames Durchgehen. Kostenlos. Ohne Verkaufsgespräch.',h2:'Wunschtermin',s2:'Wir bestätigen per E-Mail innerhalb eines Werktags. Zeiten in Ihrer Zeitzone, Malaysia-Zeit (MYT) in Klammern.',h3:'So erreichen wir Sie',s3:'Kostenlos. 30 Minuten. Ein schriftlicher nächster Schritt.',stepOf:'Schritt {n} von 3',selected:'Ausgewählt',change:'Ändern',web:'Ihre Website',webPh:'ihrefirma.de',company:'Unternehmen',opt:'optional',name:'Name',email:'E-Mail',phone:'Telefon oder WhatsApp',msg:'Was sollten wir wissen?',msgPh:'Ziele, das zu lösende Problem, eine Frist',next:'Weiter',back:'Zurück',send:'Anfrage senden',sending:'Wird gesendet…',hint:'Wählen Sie einen Tag, um Zeiten zu sehen.',eSvc:'Bitte wählen Sie aus, was Sie brauchen.',eWeb:'Bitte geben Sie Ihre Website an, damit wir wissen, was wir prüfen.',eUrl:'Diese Webadresse scheint nicht zu stimmen.',eSlot:'Bitte wählen Sie Tag und Uhrzeit.',eName:'Bitte geben Sie Ihren Namen an.',eEmail:'Diese E-Mail-Adresse scheint nicht zu stimmen. Wir brauchen sie, um Ihren Termin zu bestätigen.',note:'Mit dem Absenden stimmen Sie zu, dass wir Sie zu Ihrer Anfrage kontaktieren.',wa:'WhatsApp schreiben',dH:'Anfrage erhalten.',dT:'Ihr Wunschtermin: {t}. Wir bestätigen per E-Mail innerhalb eines Werktags.',dA:'Ihre schriftlichen Ergebnisse folgen innerhalb von 48 Stunden. Den Termin für das Durchgehen bestätigen wir per E-Mail.',dP:'Unser Unternehmensprofil lesen (PDF)',fH:'Das hat nicht geklappt.',fT:'Ihre Anfrage ist nicht bei uns angekommen. Senden Sie sie per E-Mail oder WhatsApp, wir antworten innerhalb eines Werktags.',fE:'E-Mail schreiben',fW:'WhatsApp schreiben',fR:'Erneut versuchen',close:'Schließen',
      svc:{'ai-agents':['KI-Agenten','Beantworten, qualifizieren und nachfassen, rund um die Uhr'],'automation':['Automatisierung','Manuelle Schritte entfernen'],'custom-crm':['Individuelles CRM','Das System, mit dem Ihr Team arbeitet'],'app-development':['Apps & Software','Individuelle Apps, schnell geliefert'],'web-design':['Webdesign','Websites, die Besuche in Anfragen verwandeln'],'branding':['Branding','Identität und Positionierung'],'lead-generation':['Leadgenerierung','Eine Pipeline, die wächst'],'seo-content':['SEO & Content','Gefunden bei Google und in KI-Antworten'],'social-media-automation':['Social-Media-Automatisierung','Regelmäßig posten, ohne die Stunden'],'shariah-audit':['Shariah-Compliance-Audit','Eine strukturierte Prüfung Ihrer digitalen Abläufe'],'audit':['Kostenloses KI-Audit','Bewertung, schriftliche Ergebnisse, 30 Minuten Durchgehen'],'other':['Etwas anderes','Sagen Sie uns, was Sie brauchen']}},
    ms:{k:'Tempah panggilan',kA:'Audit AI percuma',h1:'Apa yang boleh kami bantu?',s1:'Pilih yang paling hampir dan beritahu kami di mana untuk melihat.',hA:'Audit AI percuma anda',sA:'Skor segera, dapatan bertulis dalam masa 48 jam dan sesi penerangan 30 minit. Percuma. Tiada jualan.',h2:'Masa pilihan',s2:'Kami sahkan melalui e-mel dalam satu hari bekerja. Masa dipaparkan mengikut zon waktu anda, dengan waktu Malaysia (MYT) dalam kurungan.',h3:'Cara menghubungi anda',s3:'Percuma. 30 minit. Langkah seterusnya secara bertulis.',stepOf:'Langkah {n} daripada 3',selected:'Dipilih',change:'Tukar',web:'Laman web anda',webPh:'syarikatanda.com.my',company:'Syarikat',opt:'pilihan',name:'Nama',email:'E-mel',phone:'Telefon atau WhatsApp',msg:'Ada apa-apa yang patut kami tahu?',msgPh:'Matlamat, masalah yang perlu diselesaikan, tarikh akhir',next:'Seterusnya',back:'Kembali',send:'Hantar permintaan',sending:'Menghantar…',hint:'Pilih hari untuk melihat masa.',eSvc:'Pilih apa yang anda perlukan untuk teruskan.',eWeb:'Masukkan laman web anda supaya kami tahu apa yang perlu diaudit.',eUrl:'Alamat web itu kelihatan tidak betul.',eSlot:'Pilih hari dan masa untuk teruskan.',eName:'Sila masukkan nama anda.',eEmail:'E-mel itu kelihatan tidak betul. Kami memerlukannya untuk mengesahkan masa anda.',note:'Dengan menghantar, anda bersetuju untuk dihubungi berkenaan pertanyaan anda.',wa:'WhatsApp kami',dH:'Permintaan diterima.',dT:'Masa pilihan anda: {t}. Kami sahkan melalui e-mel dalam satu hari bekerja.',dA:'Dapatan bertulis anda akan dihantar dalam masa 48 jam. Kami sahkan masa sesi penerangan melalui e-mel.',dP:'Baca profil syarikat kami (PDF)',fH:'Permintaan tidak berjaya dihantar.',fT:'Permintaan anda tidak sampai kepada kami. Hantar melalui e-mel atau WhatsApp dan kami akan membalas dalam satu hari bekerja.',fE:'E-mel kami',fW:'WhatsApp kami',fR:'Cuba lagi',close:'Tutup',
      svc:{'ai-agents':['Ejen AI','Menjawab, menapis dan membuat susulan sepanjang masa'],'automation':['Automasi','Buang langkah manual'],'custom-crm':['CRM tersuai','Sistem yang digunakan pasukan anda'],'app-development':['Aplikasi & perisian','Aplikasi tersuai, siap dengan pantas'],'web-design':['Reka bentuk web','Laman yang menukar lawatan kepada pertanyaan'],'branding':['Penjenamaan','Identiti dan kedudukan jenama'],'lead-generation':['Penjanaan prospek','Saluran prospek yang terus berkembang'],'seo-content':['SEO & kandungan','Ditemui di Google dan dalam jawapan AI'],'social-media-automation':['Automasi media sosial','Siaran konsisten tanpa menghabiskan masa'],'shariah-audit':['Audit pematuhan Syariah','Semakan berstruktur operasi digital anda'],'audit':['Audit AI percuma','Skor, dapatan bertulis, sesi penerangan 30 minit'],'other':['Lain-lain','Beritahu kami apa yang anda perlukan']}},
    ar:{k:'احجز مكالمة',kA:'تدقيق ذكاء اصطناعي مجاني',h1:'كيف يمكننا مساعدتك؟',s1:'اختر الأقرب إلى حاجتك وأخبرنا أين ننظر.',hA:'تدقيقك المجاني بالذكاء الاصطناعي',sA:'تقييم فوري، ونتائج مكتوبة خلال 48 ساعة، وجلسة شرح مدتها 30 دقيقة. مجانًا ودون أي عرض بيع.',h2:'الموعد المفضّل',s2:'نؤكد الموعد بالبريد الإلكتروني خلال يوم عمل واحد. الأوقات معروضة بتوقيتك المحلي، وتوقيت ماليزيا (MYT) بين قوسين.',h3:'كيف نتواصل معك',s3:'مجانًا. 30 دقيقة. خطوة تالية مكتوبة.',stepOf:'الخطوة {n} من 3',selected:'المختار',change:'تغيير',web:'موقعك الإلكتروني',webPh:'yourcompany.com',company:'الشركة',opt:'اختياري',name:'الاسم',email:'البريد الإلكتروني',phone:'الهاتف أو واتساب',msg:'هل هناك ما يجب أن نعرفه؟',msgPh:'الأهداف، المشكلة المطلوب حلّها، موعد نهائي',next:'التالي',back:'رجوع',send:'أرسل الطلب',sending:'جارٍ الإرسال…',hint:'اختر يومًا لعرض الأوقات.',eSvc:'اختر ما تحتاجه للمتابعة.',eWeb:'أضف موقعك الإلكتروني لنعرف ما الذي سندقّقه.',eUrl:'يبدو أن عنوان الموقع غير صحيح.',eSlot:'اختر يومًا ووقتًا للمتابعة.',eName:'يرجى إدخال اسمك.',eEmail:'يبدو أن البريد الإلكتروني غير صحيح. نحتاجه لتأكيد موعدك.',note:'بإرسال الطلب، توافق على أن نتواصل معك بخصوص استفسارك.',wa:'راسلنا على واتساب',dH:'تم استلام طلبك.',dT:'موعدك المفضّل: {t}. نؤكده بالبريد الإلكتروني خلال يوم عمل واحد.',dA:'تصلك النتائج المكتوبة خلال 48 ساعة، ونؤكد موعد جلسة الشرح بالبريد الإلكتروني.',dP:'اقرأ الملف التعريفي لشركتنا (PDF)',fH:'لم يتم الإرسال.',fT:'لم يصلنا طلبك. أرسله عبر البريد الإلكتروني أو واتساب، وسنرد خلال يوم عمل واحد.',fE:'راسلنا بالبريد',fW:'راسلنا على واتساب',fR:'حاول مرة أخرى',close:'إغلاق',
      svc:{'ai-agents':['وكلاء الذكاء الاصطناعي','يردّون ويؤهّلون العملاء ويتابعون على مدار الساعة'],'automation':['الأتمتة','التخلّص من الخطوات اليدوية'],'custom-crm':['نظام CRM مخصّص','النظام الذي يعمل عليه فريقك'],'app-development':['التطبيقات والبرمجيات','تطبيقات مخصّصة تُسلَّم بسرعة'],'web-design':['تصميم المواقع','مواقع تحوّل الزيارات إلى استفسارات'],'branding':['الهوية التجارية','الهوية والتموضع'],'lead-generation':['توليد العملاء المحتملين','مسار مبيعات ينمو باستمرار'],'seo-content':['تحسين البحث والمحتوى','الظهور في Google وفي إجابات الذكاء الاصطناعي'],'social-media-automation':['أتمتة وسائل التواصل','نشر منتظم دون إهدار الساعات'],'shariah-audit':['تدقيق الامتثال للشريعة','مراجعة منظّمة لعملياتك الرقمية'],'audit':['تدقيق ذكاء اصطناعي مجاني','تقييم ونتائج مكتوبة وجلسة شرح 30 دقيقة'],'other':['شيء آخر','أخبرنا بما تحتاجه']}},
    zh:{k:'预约通话',kA:'免费 AI 审计',h1:'我们能帮您做什么？',s1:'选择最接近的一项，并告诉我们该看哪里。',hA:'您的免费 AI 审计',sA:'即时评分，48 小时内提供书面结论，以及 30 分钟讲解。免费，不推销。',h2:'首选时间',s2:'我们会在一个工作日内通过电子邮件确认。时间按您的时区显示，括号内为马来西亚时间（MYT）。',h3:'如何联系您',s3:'免费。30 分钟。书面的下一步建议。',stepOf:'第 {n} 步，共 3 步',selected:'已选择',change:'更改',web:'您的网站',webPh:'yourcompany.com',company:'公司',opt:'选填',name:'姓名',email:'电子邮件',phone:'电话或 WhatsApp',msg:'还有什么需要我们了解的吗？',msgPh:'目标、要解决的问题、截止日期',next:'下一步',back:'返回',send:'发送请求',sending:'正在发送…',hint:'选择日期以查看可用时间。',eSvc:'请选择您需要的服务。',eWeb:'请填写您的网站，以便我们知道审计对象。',eUrl:'网址格式似乎不正确。',eSlot:'请选择日期和时间。',eName:'请填写您的姓名。',eEmail:'电子邮件格式似乎不正确。我们需要用它来确认时间。',note:'发送即表示您同意我们就您的咨询与您联系。',wa:'WhatsApp 联系我们',dH:'已收到您的请求。',dT:'您的首选时间：{t}。我们会在一个工作日内通过电子邮件确认。',dA:'书面结论将在 48 小时内发送，讲解时间我们会通过电子邮件确认。',dP:'阅读我们的公司简介（PDF）',fH:'发送未成功。',fT:'您的请求未能送达。请通过电子邮件或 WhatsApp 发送，我们会在一个工作日内回复。',fE:'发送电子邮件',fW:'WhatsApp 联系我们',fR:'重试',close:'关闭',
      svc:{'ai-agents':['AI 智能体','全天候回复、筛选并跟进客户'],'automation':['自动化','去掉手动步骤'],'custom-crm':['定制 CRM','团队每天使用的系统'],'app-development':['应用与软件','定制应用，快速交付'],'web-design':['网站设计','把访问转化为咨询的网站'],'branding':['品牌','品牌识别与定位'],'lead-generation':['获客','持续增长的销售管道'],'seo-content':['SEO 与内容','在 Google 和 AI 回答中被找到'],'social-media-automation':['社交媒体自动化','稳定发布，不占用您的时间'],'shariah-audit':['伊斯兰教法合规审计','对数字业务的结构化审查'],'audit':['免费 AI 审计','评分、书面结论、30 分钟讲解'],'other':['其他','告诉我们您的需求']}},
    tr:{k:'Görüşme planla',kA:'Ücretsiz AI denetimi',h1:'Size nasıl yardımcı olabiliriz?',s1:'En yakın seçeneği seçin ve nereye bakmamız gerektiğini söyleyin.',hA:'Ücretsiz AI denetiminiz',sA:'Anında puan, 48 saat içinde yazılı bulgular ve 30 dakikalık bir değerlendirme görüşmesi. Ücretsiz. Satış konuşması yok.',h2:'Tercih ettiğiniz saat',s2:'Bir iş günü içinde e-postayla onaylıyoruz. Saatler kendi saat diliminizde, Malezya saati (MYT) parantez içinde gösterilir.',h3:'Size nasıl ulaşalım',s3:'Ücretsiz. 30 dakika. Yazılı bir sonraki adım.',stepOf:'Adım {n} / 3',selected:'Seçilen',change:'Değiştir',web:'Web siteniz',webPh:'sirketiniz.com',company:'Şirket',opt:'isteğe bağlı',name:'Ad soyad',email:'E-posta',phone:'Telefon veya WhatsApp',msg:'Bilmemiz gereken bir şey var mı?',msgPh:'Hedefler, çözülecek sorun, bir son tarih',next:'İleri',back:'Geri',send:'Talebi gönder',sending:'Gönderiliyor…',hint:'Saatleri görmek için bir gün seçin.',eSvc:'Devam etmek için ihtiyacınızı seçin.',eWeb:'Neyi denetleyeceğimizi bilmemiz için web sitenizi ekleyin.',eUrl:'Bu web adresi doğru görünmüyor.',eSlot:'Devam etmek için bir gün ve saat seçin.',eName:'Lütfen adınızı yazın.',eEmail:'Bu e-posta adresi doğru görünmüyor. Saatinizi onaylamak için ona ihtiyacımız var.',note:'Göndererek talebinizle ilgili sizinle iletişime geçmemizi kabul etmiş olursunuz.',wa:'WhatsApp’tan yazın',dH:'Talebiniz alındı.',dT:'Tercih ettiğiniz saat: {t}. Bir iş günü içinde e-postayla onaylıyoruz.',dA:'Yazılı bulgularınız 48 saat içinde gelir. Görüşmenin saatini e-postayla onaylıyoruz.',dP:'Şirket profilimizi okuyun (PDF)',fH:'Gönderilemedi.',fT:'Talebiniz bize ulaşmadı. E-posta veya WhatsApp ile gönderin, bir iş günü içinde yanıt veriyoruz.',fE:'E-posta gönderin',fW:'WhatsApp’tan yazın',fR:'Tekrar deneyin',close:'Kapat',
      svc:{'ai-agents':['AI ajanları','Gece gündüz yanıtlar, nitelendirir ve takip eder'],'automation':['Otomasyon','Manuel adımları kaldırın'],'custom-crm':['Özel CRM','Ekibinizin üzerinde çalıştığı sistem'],'app-development':['Uygulama & yazılım','Özel uygulamalar, hızla teslim'],'web-design':['Web tasarımı','Ziyaretleri taleplere dönüştüren siteler'],'branding':['Marka','Kimlik ve konumlandırma'],'lead-generation':['Müşteri adayı üretimi','Büyüyen bir satış hattı'],'seo-content':['SEO & içerik','Google’da ve AI yanıtlarında bulunun'],'social-media-automation':['Sosyal medya otomasyonu','Saatlerinizi harcamadan düzenli paylaşım'],'shariah-audit':['Şeriata uygunluk denetimi','Dijital operasyonlarınızın yapılandırılmış incelemesi'],'audit':['Ücretsiz AI denetimi','Puan, yazılı bulgular, 30 dakikalık görüşme'],'other':['Başka bir şey','Neye ihtiyacınız olduğunu yazın']}}
  };
  var BK_SVC=['ai-agents','automation','custom-crm','app-development','web-design','branding','lead-generation','seo-content','social-media-automation','shariah-audit','audit','other'];
  var BK_ALIAS={'noon-os':'custom-crm','free-audit':'audit','ai-audit':'audit'};
  var BK_EXTRA={'launch-bundle':'Launch Bundle'};  /* product presets kept as-is (product names are not translated) */
  /* Availability in MYT minutes-from-midnight, by MYT weekday. Evening block 20:00–22:00 MYT so DACH (afternoon) and Gulf (late afternoon) can book.
     HARD RULE: never offer Wednesday 16:00–18:00 MYT (enforced again in bkBlocked, whatever AVAIL says). */
  var BK_AVAIL={1:[[840,1140],[1200,1320]],2:[[690,810],[900,1020],[1200,1320]],3:[[660,840],[1200,1320]],4:[[630,900],[1200,1320]]};
  function bkBlocked(dow,t){ return dow===3 && t<1080 && t+30>960; }
  function initBooking(){
    if(document.getElementById('ucbk')) return;
    var WA='https://wa.me/601133262709', MAIL='info@ummah-collective.com';
    var L=(document.documentElement.getAttribute('lang')||'en').slice(0,2); if(!BK_STR[L]) L='en';
    var T=BK_STR[L], RTL=(L==='ar');
    var LOC={en:'en-GB',de:'de-DE',ms:'ms-MY',ar:'ar-u-nu-latn',zh:'zh-CN',tr:'tr-TR'}[L]||'en-GB';
    var esc=function(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); };
    var EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, URL_RE=/^(https?:\/\/)?([a-z0-9¡-￿-]+\.)+[a-z¡-￿]{2,}(:\d+)?(\/\S*)?$/i;
    var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
    var TZ=''; try{ TZ=Intl.DateTimeFormat().resolvedOptions().timeZone||''; }catch(e){}
    var fT=null,fM=null,fD=null; try{ fT=new Intl.DateTimeFormat(LOC,{hour:'2-digit',minute:'2-digit'}); fM=new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kuala_Lumpur'}); fD=new Intl.DateTimeFormat(LOC,{weekday:'short',day:'numeric',month:'short'}); }catch(e){}
    function tLocal(d){ return fT?fT.format(d):d.toTimeString().slice(0,5); }
    function tMYT(d){ return fM?fM.format(d):''; }
    var sameTZ=(function(){ var n=new Date(); return n.getTimezoneOffset()===-480; })();
    function svcTile(id){ var s=T.svc[id]; return '<button type="button" class="ucbk-opt" data-val="'+id+'" aria-pressed="false"><b>'+esc(s[0])+'</b><span>'+esc(s[1])+'</span></button>'; }
    function svcName(id){ return (T.svc[id]&&T.svc[id][0])||BK_EXTRA[id]||id; }
    var ar=RTL?'&larr;':'&rarr;', arb=RTL?'&rarr;':'&larr;';
    var m=document.createElement('div'); m.id='ucbk'; m.className='ucbk'; m.setAttribute('aria-hidden','true'); m.setAttribute('lang',L); m.setAttribute('dir',RTL?'rtl':'ltr');
    m.innerHTML='<div class="ucbk-back"></div><div class="ucbk-card" role="dialog" aria-modal="true" aria-labelledby="ucbkH" aria-describedby="ucbkS">'
      +'<button class="ucbk-x" type="button" aria-label="'+esc(T.close)+'">&#10005;</button><div class="ucbk-body">'
      +'<div class="ucbk-k" id="ucbkK">'+esc(T.k)+'</div><h2 class="ucbk-h" id="ucbkH" tabindex="-1">'+esc(T.h1)+'</h2><p class="ucbk-sub" id="ucbkS">'+esc(T.s1)+'</p>'
      +'<div class="ucbk-progw"><div class="ucbk-prog" aria-hidden="true"><i class="on"></i><i></i><i></i></div><p class="ucbk-stepn" id="ucbkN" aria-live="polite" aria-atomic="true"></p></div>'
      +'<form class="ucbk-form form" novalidate>'
      /* step 1: need + website (+ company) */
      +'<div class="ucbk-step on" data-step="0">'
        +'<div class="ucbk-chosen" hidden><span class="ucbk-chk">'+esc(T.selected)+': <b class="ucbk-chn"></b></span><button type="button" class="ucbk-chg">'+esc(T.change)+'</button></div>'
        +'<div class="ucbk-opts" role="group" aria-labelledby="ucbkH">'+BK_SVC.map(svcTile).join('')+'</div>'
        +'<p class="ucbk-err" id="ucbkEsvc" role="alert" hidden></p>'
        +'<div class="ucbk-row"><label class="ucbk-lw"><span class="ucbk-lt">'+esc(T.web)+' <i class="ucbk-optl">('+esc(T.opt)+')</i></span><input name="website" type="text" inputmode="url" autocomplete="url" dir="ltr" placeholder="'+esc(T.webPh)+'" aria-describedby="ucbkEweb"><span class="ucbk-err" id="ucbkEweb" role="alert" hidden></span></label>'
        +'<label><span class="ucbk-lt">'+esc(T.company)+' <i>('+esc(T.opt)+')</i></span><input name="company" autocomplete="organization"></label></div>'
      +'</div>'
      /* step 2: preferred time */
      +'<div class="ucbk-step" data-step="1"><div class="ucbk-days" id="ucbkDays" role="group" aria-label="'+esc(T.h2)+'"></div><div class="ucbk-slots" id="ucbkSlots" role="group" aria-label="'+esc(T.h2)+'"><div class="ucbk-slothint">'+esc(T.hint)+'</div></div><p class="ucbk-err" id="ucbkEslot" role="alert" hidden></p></div>'
      /* step 3: contact */
      +'<div class="ucbk-step" data-step="2"><div class="ucbk-row"><label>'+esc(T.name)+'<input name="name" required autocomplete="name" aria-describedby="ucbkEname"><span class="ucbk-err" id="ucbkEname" role="alert" hidden></span></label>'
        +'<label>'+esc(T.email)+'<input name="email" type="email" inputmode="email" autocomplete="email" required dir="ltr" placeholder="you@company.com" aria-describedby="ucbkEemail"><span class="ucbk-err" id="ucbkEemail" role="alert" hidden></span></label></div>'
        +'<label class="ucbk-full"><span class="ucbk-lt">'+esc(T.phone)+' <i>('+esc(T.opt)+')</i></span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" placeholder="+60 …"></label>'
        +'<label class="ucbk-full"><span class="ucbk-lt">'+esc(T.msg)+' <i>('+esc(T.opt)+')</i></span><textarea name="message" placeholder="'+esc(T.msgPh)+'"></textarea></label></div>'
      +'<div class="ucbk-nav"><button type="button" class="btn btn-ghost ucbk-prev" hidden><span class="ucbk-ar" aria-hidden="true">'+arb+'</span> '+esc(T.back)+'</button><span class="ucbk-spacer"></span><button type="button" class="btn btn-fill ucbk-next">'+esc(T.next)+' <span class="ucbk-ar" aria-hidden="true">'+ar+'</span></button><button type="submit" class="btn btn-fill ucbk-go" hidden>'+esc(T.send)+'</button></div>'
      +'<div class="ucbk-note">'+esc(T.note)+' &middot; <a href="'+WA+'" target="_blank" rel="noopener" class="ucbk-walink">'+esc(T.wa)+'</a></div></form>'
      +'<div class="ucbk-done" hidden><div class="ucbk-tick" aria-hidden="true">&#10003;</div><h2 class="ucbk-h" tabindex="-1">'+esc(T.dH)+'</h2><p class="ucbk-sub ucbk-dsub"></p><a class="btn btn-ghost ucbk-pdf" href="https://ummah-collective.com/profile.pdf" target="_blank" rel="noopener">'+esc(T.dP)+'</a></div>'
      +'<div class="ucbk-fail" hidden role="alert"><h2 class="ucbk-h" tabindex="-1">'+esc(T.fH)+'</h2><p class="ucbk-sub">'+esc(T.fT)+'</p><div class="ucbk-fbtns"><a class="btn btn-fill ucbk-fmail" href="mailto:'+MAIL+'">'+esc(T.fE)+'</a><a class="btn btn-ghost ucbk-fwa" href="'+WA+'" target="_blank" rel="noopener">'+esc(T.fW)+'</a><button type="button" class="btn btn-ghost ucbk-retry">'+esc(T.fR)+'</button></div><p class="ucbk-fmeta"><span class="ltr" dir="ltr">'+MAIL+'</span> &middot; <span class="ltr" dir="ltr">+60 11-3326 2709</span></p></div>'
      +'</div></div>';
    document.body.appendChild(m);
    var card=m.querySelector('.ucbk-card'), form=m.querySelector('.ucbk-form'), done=m.querySelector('.ucbk-done'), fail=m.querySelector('.ucbk-fail'), go=m.querySelector('.ucbk-go');
    var steps=[].slice.call(m.querySelectorAll('.ucbk-step')), dots=[].slice.call(m.querySelectorAll('.ucbk-prog i'));
    var prevb=m.querySelector('.ucbk-prev'), nextb=m.querySelector('.ucbk-next'), H=m.querySelector('#ucbkH'), S=m.querySelector('#ucbkS'), K=m.querySelector('#ucbkK'), N=m.querySelector('#ucbkN');
    var daysEl=m.querySelector('#ucbkDays'), slotsEl=m.querySelector('#ucbkSlots'), opts=m.querySelector('.ucbk-opts'), chosen=m.querySelector('.ucbk-chosen'), webIn=form.querySelector('[name=website]'), webLab=m.querySelector('.ucbk-lw .ucbk-optl');
    var step=0, evStep=-1, picked='', audit=false, preset=false, DAYS=[], slot=null, opener=null, inerted=[], sent=false, lastKey=null;
    /* ---- slots: generated in MYT, shown in the visitor's own time zone (MYT in brackets) ---- */
    function buildDays(){
      DAYS=[]; var now=Date.now(), my=new Date(now+8*36e5), byKey={}, order=[];
      for(var i=0;i<=24&&order.length<8;i++){
        var Y=my.getUTCFullYear(), Mo=my.getUTCMonth(), D=my.getUTCDate()+i, dow=new Date(Date.UTC(Y,Mo,D)).getUTCDay(), win=BK_AVAIL[dow]; if(!win) continue;
        win.forEach(function(w){ for(var t=w[0];t+30<=w[1];t+=30){ if(bkBlocked(dow,t)) continue;
          var at=new Date(Date.UTC(Y,Mo,D,0,0)+ (t-480)*6e4); if(at.getTime()<now+12*36e5) continue;  /* at least 12h notice */
          var key=at.getFullYear()+'-'+at.getMonth()+'-'+at.getDate();
          if(!byKey[key]){ if(order.length>=8) continue; byKey[key]={date:at,slots:[]}; order.push(key); }
          byKey[key].slots.push({at:at,dow:dow,t:t}); } });
      }
      DAYS=order.map(function(k){ return byKey[k]; });
      daysEl.innerHTML=DAYS.map(function(d,i){ var lab=fD?fD.format(d.date):d.date.toDateString(); var p=lab.split(/,\s*|\s(?=\d)/);
        return '<button type="button" class="ucbk-day" data-i="'+i+'" aria-pressed="false" aria-label="'+esc(lab)+'"><b>'+esc(p[0])+'</b><span>'+esc(p.slice(1).join(' '))+'</span></button>'; }).join('');
      slotsEl.innerHTML='<div class="ucbk-slothint">'+esc(T.hint)+'</div>';
      daysEl.querySelectorAll('.ucbk-day').forEach(function(b){ b.addEventListener('click',function(){ daysEl.querySelectorAll('.ucbk-day').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false');}); b.classList.add('sel'); b.setAttribute('aria-pressed','true'); slot=null; renderSlots(DAYS[+b.getAttribute('data-i')]); }); });
    }
    function renderSlots(d){
      slotsEl.innerHTML=d.slots.map(function(s,i){ var lt=tLocal(s.at), mt=tMYT(s.at); var lab=(fD?fD.format(s.at):'')+' '+lt+(sameTZ?' MYT':' ('+mt+' MYT)');
        return '<button type="button" class="ucbk-slot" data-i="'+i+'" aria-pressed="false" aria-label="'+esc(lab)+'"><b dir="ltr">'+esc(lt)+'</b>'+(sameTZ?'<i>MYT</i>':'<i dir="ltr">('+esc(mt)+' MYT)</i>')+'</button>'; }).join('');
      slotsEl.querySelectorAll('.ucbk-slot').forEach(function(b){ b.addEventListener('click',function(){ slotsEl.querySelectorAll('.ucbk-slot').forEach(function(x){x.classList.remove('sel');x.setAttribute('aria-pressed','false');}); b.classList.add('sel'); b.setAttribute('aria-pressed','true'); slot=d.slots[+b.getAttribute('data-i')]; err('ucbkEslot',''); }); });
    }
    function slotText(){ if(!slot) return ''; var lab=(fD?fD.format(slot.at):'')+', '+tLocal(slot.at); return sameTZ?lab+' MYT':lab+' ('+tMYT(slot.at)+' MYT)'; }
    function slotMYT(){ if(!slot) return '-'; var d; try{ d=new Intl.DateTimeFormat('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Asia/Kuala_Lumpur'}).format(slot.at); }catch(e){ d=''; }
      return d+' '+tMYT(slot.at)+' MYT'+(sameTZ?'':' (visitor local '+tLocal(slot.at)+(TZ?', '+TZ:'')+')'); }
    /* ---- errors ---- */
    function err(id,msg,field){ var e=m.querySelector('#'+id); if(!e) return; e.textContent=msg||''; e.hidden=!msg; if(field){ if(msg) field.setAttribute('aria-invalid','true'); else field.removeAttribute('aria-invalid'); } }
    function clearErr(){ m.querySelectorAll('.ucbk-err').forEach(function(e){ e.hidden=true; e.textContent=''; }); m.querySelectorAll('[aria-invalid]').forEach(function(f){ f.removeAttribute('aria-invalid'); }); }
    function focusEl(el){ if(!el) return; try{ el.focus({preventScroll:false}); }catch(e){ el.focus(); } }
    /* ---- render ---- */
    function setMode(){
      K.textContent=audit?T.kA:T.k;
      opts.hidden=(audit||preset); chosen.hidden=!(preset&&!audit);
      if(preset&&!audit) m.querySelector('.ucbk-chn').textContent=svcName(picked);
      if(webLab) webLab.hidden=audit;  /* website required in audit mode */
      webIn.required=audit;
      opts.querySelectorAll('.ucbk-opt').forEach(function(x){ var on=x.getAttribute('data-val')===picked; x.classList.toggle('sel',on); x.setAttribute('aria-pressed',on?'true':'false'); });
    }
    function heads(){ if(step===0) return audit?[T.hA,T.sA]:[T.h1,T.s1]; if(step===1) return [T.h2,T.s2]; return [T.h3,audit?T.sA:T.s3]; }
    function render(focus){
      steps.forEach(function(s,i){ s.classList.toggle('on',i===step); });
      dots.forEach(function(d,i){ d.classList.toggle('on',i<=step); });
      var h=heads(); H.textContent=h[0]; S.textContent=h[1];
      N.textContent=T.stepOf.replace('{n}',step+1);
      prevb.hidden=(step===0); nextb.hidden=(step===steps.length-1); go.hidden=(step!==steps.length-1);
      card.scrollTop=0;
      if(step!==evStep&&m.classList.contains('on')){ evStep=step; ucEv('booking_step',{step:step+1,mode:audit?'free-audit':'booking'}); }
      if(focus===false) return;
      setTimeout(function(){
        var f=null;
        if(fine){ if(step===0) f=(audit||preset)?webIn:(opts.querySelector('.ucbk-opt.sel')||opts.querySelector('.ucbk-opt')); else if(step===1) f=daysEl.querySelector('.sel')||daysEl.querySelector('.ucbk-day'); else f=form.querySelector('[name=name]'); }
        focusEl(f||H);   /* touch: focus the heading (announces the step, no keyboard pop-up) */
      },60);
    }
    function validate(n){
      clearErr();
      if(n===0){
        if(!audit&&!picked){ err('ucbkEsvc',T.eSvc); focusEl(opts.querySelector('.ucbk-opt')); return false; }
        var w=webIn.value.trim();
        if(audit&&!w){ err('ucbkEweb',T.eWeb,webIn); focusEl(webIn); return false; }
        if(w&&!URL_RE.test(w)){ err('ucbkEweb',T.eUrl,webIn); focusEl(webIn); return false; }
      }
      if(n===1&&!slot){ err('ucbkEslot',T.eSlot); focusEl(daysEl.querySelector('.sel')?slotsEl.querySelector('.ucbk-slot'):daysEl.querySelector('.ucbk-day')); return false; }
      if(n===2){
        var nm=form.querySelector('[name=name]'), em=form.querySelector('[name=email]'), bad=null;
        if(!nm.value.trim()){ err('ucbkEname',T.eName,nm); bad=bad||nm; }
        if(!EMAIL_RE.test(em.value.trim())){ err('ucbkEemail',T.eEmail,em); bad=bad||em; }
        if(bad){ focusEl(bad); return false; }
      }
      return true;
    }
    function go2(n){ if(n>step){ for(var k=step;k<n;k++){ if(!validate(k)){ step=k; render(false); return; } } } step=Math.max(0,Math.min(steps.length-1,n)); render(); }
    opts.querySelectorAll('.ucbk-opt').forEach(function(b){ b.addEventListener('click',function(){ picked=b.getAttribute('data-val');
      if(picked==='audit'){ audit=true; preset=false; }
      setMode(); err('ucbkEsvc',''); render(false); if(audit){ var h=heads(); H.textContent=h[0]; S.textContent=h[1]; }
      setTimeout(function(){ focusEl(webIn); },40); }); });
    m.querySelector('.ucbk-chg').addEventListener('click',function(){ preset=false; setMode(); focusEl(opts.querySelector('.ucbk-opt.sel')||opts.querySelector('.ucbk-opt')); });
    nextb.addEventListener('click',function(){ go2(step+1); });
    prevb.addEventListener('click',function(){ clearErr(); step=Math.max(0,step-1); render(); });
    form.addEventListener('keydown',function(e){ if(e.key==='Enter'&&e.target.tagName==='INPUT'&&step<steps.length-1){ e.preventDefault(); go2(step+1); } });
    ['website','name','email'].forEach(function(k){ var f=form.querySelector('[name='+k+']'); f.addEventListener('input',function(){ if(f.getAttribute('aria-invalid')){ f.removeAttribute('aria-invalid'); var e=m.querySelector('#'+f.getAttribute('aria-describedby')); if(e){e.hidden=true;e.textContent='';} } }); });
    /* ---- open / close with focus management ---- */
    function trapKeys(e){
      if(!m.classList.contains('on')) return;
      if(e.key==='Escape'){ e.preventDefault(); e.stopPropagation(); close(); return; }
      if(e.key!=='Tab') return;
      var f=[].slice.call(card.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(x){ return x.offsetParent!==null&&!x.closest('[hidden]'); });
      if(!f.length) return; var first=f[0], last=f[f.length-1], a=document.activeElement;
      if(!card.contains(a)){ e.preventDefault(); first.focus(); }
      else if(e.shiftKey&&(a===first||a===H)){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey&&a===last){ e.preventDefault(); first.focus(); }
    }
    function setInert(on){
      if(on){ inerted=[]; [].forEach.call(document.body.children,function(el){ if(el===m||el.tagName==='SCRIPT'||el.hasAttribute('inert')) return; el.setAttribute('inert',''); inerted.push(el); }); }
      else { inerted.forEach(function(el){ el.removeAttribute('inert'); }); inerted=[]; }
    }
    function open(sv,from){
      sv=(sv||'').toLowerCase(); sv=BK_ALIAS[sv]||sv;
      var key=sv||'';
      opener=from||document.activeElement;
      if(sent||key!==lastKey){  /* keep half-filled answers when the same popup is reopened (Esc no longer loses state) */
        try{form.reset();}catch(e){} clearErr(); slot=null; sent=false;
        audit=(sv==='audit'); picked=audit?'audit':(sv&&(T.svc[sv]||BK_EXTRA[sv])?sv:''); preset=!!picked&&!audit;
        step=0; buildDays();
      }
      lastKey=key; setMode();
      form.hidden=false; done.hidden=true; fail.hidden=true; go.disabled=false; go.textContent=T.send;
      m.classList.add('on'); m.setAttribute('aria-hidden','false');
      document.documentElement.style.overflow='hidden'; document.documentElement.classList.add('ucbk-open');
      try{ if(window.__lenis) window.__lenis.stop(); }catch(e){}
      setInert(true); document.addEventListener('keydown',trapKeys,true);
      ucEv('booking_open',{mode:audit?'free-audit':'booking',service:picked||'',page:location.pathname});
      evStep=-1; render(false);
      setTimeout(function(){ focusEl(m.querySelector('.ucbk-x')); },30);
    }
    function close(){
      if(!m.classList.contains('on')) return;
      m.classList.remove('on'); m.setAttribute('aria-hidden','true');
      document.documentElement.style.overflow=''; document.documentElement.classList.remove('ucbk-open');
      try{ if(window.__lenis) window.__lenis.start(); }catch(e){}
      setInert(false); document.removeEventListener('keydown',trapKeys,true);
      var t=opener; opener=null; if(t&&t.focus&&document.contains(t)){ try{ t.focus({preventScroll:true}); }catch(e){ t.focus(); } }
    }
    window.ucOpenBooking=function(sv){ open(sv); };
    m.querySelector('.ucbk-x').addEventListener('click',close);
    m.querySelector('.ucbk-back').addEventListener('click',close);
    m.querySelector('.ucbk-retry').addEventListener('click',function(){ fail.hidden=true; form.hidden=false; step=2; render(); });
    document.addEventListener('click',function(e){
      var a=e.target.closest?e.target.closest('a[href],button[data-book]'):null; if(!a||m.contains(a)) return;
      var h=a.getAttribute('href')||'', db=a.getAttribute('data-book');
      if(/(^|\/)booking\.html/.test(h)||a.hasAttribute('data-book')){ e.preventDefault(); var sv=''; var mm=h.match(/[?&](?:service|sv)=([a-z-]+)/i); if(mm) sv=mm[1]; else if(db&&db!=='true'&&db!=='') sv=db; open(sv,a); }
    },true);
    /* ---- send ---- */
    form.addEventListener('submit',function(e){
      e.preventDefault();
      for(var k=0;k<steps.length;k++){ if(!validate(k)){ step=k; render(false); return; } }
      var d={}; ['company','website','name','email','phone','message'].forEach(function(k){var el=form.querySelector('[name='+k+']'); d[k]=el?el.value.trim():'';});
      var service=audit?'free-audit':picked, mtxt=slotMYT(), shown=slotText();
      go.disabled=true; go.textContent=T.sending;
      var subj=(audit?'Free AI audit request - ':'New booking request - ')+d.name+(d.company?(' ('+d.company+')'):'');
      var notes='Service: '+service+' | Meeting: '+mtxt+' | Website: '+(d.website||'-')+' | Lang: '+L+(d.message?(' | '+d.message):'');
      var body={_subject:subj,_captcha:'false',_template:'table',name:d.name,email:d.email,phone:d.phone||'-',company:d.company||'-',website:d.website||'-',service:service,requested_meeting:mtxt,visitor_timezone:TZ||'-',language:L,message:d.message||'-',page:location.href};
      var jobs=[];
      if(BOOKING.w3f){ var wb={}; for(var x in body) wb[x]=body[x]; wb.access_key=BOOKING.w3f; wb.subject=subj; wb.from_name='UC Website'; jobs.push(ucPost('https://api.web3forms.com/submit',wb)); }
      else if(BOOKING.email){ jobs.push(ucPost('https://formsubmit.co/ajax/'+encodeURIComponent(BOOKING.email),body)); }
      if(BOOKING.ucp){ jobs.push(ucPost(BOOKING.ucp,{name:d.name,email:d.email,phone:d.phone,company:d.company,title:service,source:'website',status:'new',notes:notes})); }
      Promise.all(jobs).then(function(res){
        go.disabled=false; go.textContent=T.send;
        if(res.some(Boolean)){
          sent=true; form.hidden=true; done.hidden=false;
          m.querySelector('.ucbk-dsub').textContent=audit?T.dA:T.dT.replace('{t}',shown);
          ucEv('generate_lead',{lead_type:audit?'free-audit':'booking',service:service||'',page:location.pathname});
          focusEl(done.querySelector('.ucbk-h'));
        } else {
          var mb='Name: '+d.name+'\nEmail: '+d.email+(d.phone?'\nPhone: '+d.phone:'')+(d.company?'\nCompany: '+d.company:'')+(d.website?'\nWebsite: '+d.website:'')+'\nService: '+service+'\nPreferred time: '+mtxt+(d.message?'\n\n'+d.message:'');
          m.querySelector('.ucbk-fmail').href='mailto:'+MAIL+'?subject='+encodeURIComponent(subj)+'&body='+encodeURIComponent(mb);
          m.querySelector('.ucbk-fwa').href=WA+'?text='+encodeURIComponent((audit?'Free AI audit request':'Booking request')+'\n'+mb);
          form.hidden=true; fail.hidden=false;
          ucEv('booking_fail',{mode:audit?'free-audit':'booking',service:service||'',page:location.pathname});
          focusEl(fail.querySelector('.ucbk-h'));
        }
      });
    });
    /* QA 2026-11-10 (M10): booking.html opens the accessible popup straight away (respecting ?service=, incl. audit);
       the old #wiz stays in the markup only as a no-JS fallback */
    var wz=document.getElementById('wiz');
    if(wz){
      var qsv=''; try{ qsv=(new URLSearchParams(location.search).get('service')||new URLSearchParams(location.search).get('sv')||'').replace(/[^a-z-]/gi,''); }catch(e){}
      wz.hidden=true; wz.style.display='none';
      var lw=document.getElementById('bkLaunch'), rb=document.getElementById('bkReopen');
      if(lw) lw.hidden=false;
      if(rb) rb.setAttribute('data-book',qsv||'true');
      open(qsv,rb);
    }
  }
  function initTop(){
    if(document.getElementById('ucTop')) return;
    var b=document.createElement('button'); b.id='ucTop'; b.className='uc-top'; b.type='button'; b.setAttribute('aria-label','Back to top');
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(b);
    b.addEventListener('click',function(){ var L=window.__lenis; if(L&&L.scrollTo){ try{L.scrollTo(0,{immediate:true,force:true}); return;}catch(e){} } try{window.scrollTo(0,0);}catch(e){} });
    function upd(){ var L=window.__lenis; var y=(L&&typeof L.animatedScroll==='number')?L.animatedScroll:(window.scrollY||document.documentElement.scrollTop||0); if(y>620) b.classList.add('on'); else b.classList.remove('on'); }
    window.addEventListener('scroll',upd,{passive:true}); setInterval(upd,450); upd();
  }
  /* real-user Core Web Vitals -> GA4 (what Google ACTUALLY ranks on; 2026-07-07) */
  function initVitals(){
    if(!('PerformanceObserver' in window)) return;
    var sent={};
    function send(n,v){ if(sent[n]||typeof gtag!=='function') return; sent[n]=1; try{ gtag('event','web_vitals',{metric_name:n,metric_value:Math.round(v*1000)/1000,page:location.pathname,non_interaction:true}); }catch(e){} }
    try{
      var lcp=null; new PerformanceObserver(function(l){ var e=l.getEntries(); if(e.length) lcp=e[e.length-1]; }).observe({type:'largest-contentful-paint',buffered:true});
      var cls=0; new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ if(!e.hadRecentInput) cls+=e.value; }); }).observe({type:'layout-shift',buffered:true});
      var flush=function(){ if(document.visibilityState!=='hidden') return; if(lcp) send('LCP',Math.round(lcp.startTime)); send('CLS',cls); };
      addEventListener('visibilitychange',flush); addEventListener('pagehide',flush);
    }catch(e){}
  }

  function boot(){ initVitals(); initBoot(); initLang();initNewsletter(); initHeroCycle(); initChrome(); initWizard(); initBooking(); initTop(); initImages(); initLottie(); initMegaPreview(); initWorkCar(); initCmdk(); initSectionFX(); initMicro(); start(); (document.body.getAttribute('data-bg')==='liquid'?initLiquid:initGL)(); }
  if(document.readyState!=='loading') boot(); else document.addEventListener('DOMContentLoaded',boot);
})();
