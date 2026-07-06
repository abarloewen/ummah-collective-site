/* ============================================================
   UMMAH COLLECTIVE — Aurora engine: shader + i18n + booking + motion
   Requires three.js, gsap, ScrollTrigger, lenis loaded first.
   ============================================================ */
(function(){
  'use strict';
  var hasG=window.gsap&&window.ScrollTrigger; if(hasG) gsap.registerPlugin(ScrollTrigger);
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var softGL=(function(){ /* skip WebGL on software renderers (Lighthouse/SwiftShader, GPU-less devices) */
    try{var c=document.createElement('canvas');var gl=c.getContext('webgl')||c.getContext('experimental-webgl');
      if(!gl)return true;var x=gl.getExtension('WEBGL_debug_renderer_info');
      var r=x?gl.getParameter(x.UNMASKED_RENDERER_WEBGL):'';
      return /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i.test(String(r));
    }catch(e){return true;}
  })();
  var noGL=softGL||Math.min(window.innerWidth,window.screen&&screen.width||1e4)<=820; /* mobile: skip WebGL entirely (2026-07-06) */
  if(noGL){var _sg=document.getElementById('gl'); if(_sg)_sg.style.display='none'; document.querySelectorAll('.liquid-canvas,[data-gl]').forEach(function(e){e.style.display='none'});}
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
    ' col*=1.0-0.48*distance(uv,vec2(0.5,0.5));',
    ' col+=(hash(uv*uRes+vec2(uTime))-0.5)*0.02;',
    ' gl_FragColor=vec4(col,1.0);}'
  ].join('\n');

  function initGL(){
    if(reduce||noGL||!window.THREE) return;
    var canvas=document.getElementById('gl'); if(!canvas) return;
    var THREE=window.THREE, sc=new THREE.Scene(), cam=new THREE.Camera();
    var rnd=new THREE.WebGLRenderer({canvas:canvas,antialias:true});
    rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));
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
      start:"Start a project",book:"Book a call",brief:"Send a brief",audit:"Free AI audit",whatsapp:"WhatsApp",email:"Email",menu:"Menu",allsol:"All solutions &rarr;",imprint:"Imprint &amp; Privacy",
      tag1:"Intelligence,",tag2:"with integrity.",herosub:"We build the software, AI agents and systems modern companies run on — engineered fast, grounded in a decade of trust.",
      ftag:"Intelligence, with integrity. An applied-AI studio for the trust economy — the software, agents and systems modern companies run on.",
      letsbuild:"Let's build",ctah2:"Build something<br>worth <em>trusting.</em>",ctalead:"Tell us what's slowing your business down. We'll show you the system that fixes it — and how fast.",lblphone:"Phone",lblstudio:"Studio",
      abadge:"No-risk front door",audith2:"Get a <em>free AI audit</em> of your business",auditp:"A 30-minute teardown: where AI agents, automation and a better site would save you the most time and money. No pitch, just the map.",
      shifteyebrow:"(01) — The shift",shifth2:"Anyone can <em>use</em> AI now. Almost no one turns it into systems you actually <em>trust.</em>",whatwebuild:"What we build",selwork:"Selected work",st_proj:"Projects",st_cli:"Clients",st_yrs:"Years",st_lang:"Languages"},
    de:{work:"Arbeiten",services:"Leistungen",solutions:"Lösungen",ventures:"Ventures",about:"Über uns",insights:"Insights",contact:"Kontakt",products:"Produkte",company:"Unternehmen",club:"Founders Club",exploreclub:"Founders Club entdecken",clubeyebrow:"Community · Founders Club",clubh:"Bauen Sie mit Gründern, die es <em>ernst meinen.</em>",clubp:"Eine kostenlose Community muslimischer und werteorientierter Gründer — online und persönlich in Kuala Lumpur.",clubtag:"Kostenlos · KL & Online",clubwhatson:"Was läuft",clubev1:"<span>01</span> KL-Mixer & Dinner",clubev2:"<span>02</span> Masterclasses & Workshops",clubev3:"<span>03</span> Online-Webinare & AMAs",clubev4:"<span>04</span> Demo- & Pitch-Nights",homequote:"„Sie haben unser gesamtes Ökosystem aufgebaut — Marke, Website, Tracking und einen Flagship-Store. <em>Keine Kampagne. Ein Asset.</em>“",homequoteby:"ANAAKA — Halal-Hautpflege · Flagship @ TRX, Kuala Lumpur",connect:"Kontakt",
      start:"Projekt starten",book:"Termin buchen",brief:"Briefing senden",audit:"Kostenloses KI-Audit",whatsapp:"WhatsApp",email:"E-Mail",menu:"Menü",allsol:"Alle Lösungen &rarr;",imprint:"Impressum &amp; Datenschutz",
      tag1:"Intelligenz,",tag2:"mit Integrität.",herosub:"Wir bauen die Software, KI-Agenten und Systeme, auf denen moderne Unternehmen laufen — schnell entwickelt, gegründet auf einem Jahrzehnt Vertrauen.",
      ftag:"Intelligenz, mit Integrität. Ein Applied-AI-Studio für die Vertrauensökonomie — die Software, Agenten und Systeme, auf denen moderne Unternehmen laufen.",
      letsbuild:"Lass uns bauen",ctah2:"Bauen wir etwas,<br>dem man <em>vertraut.</em>",ctalead:"Sagen Sie uns, was Ihr Geschäft ausbremst. Wir zeigen Ihnen das System, das es löst — und wie schnell.",lblphone:"Telefon",lblstudio:"Studio",
      abadge:"Risikofreier Einstieg",audith2:"Holen Sie sich ein <em>kostenloses KI-Audit</em>",auditp:"Eine 30-minütige Analyse: wo KI-Agenten, Automatisierung und eine bessere Website am meisten Zeit und Geld sparen. Kein Pitch, nur die Landkarte.",
      shifteyebrow:"(01) — Der Wandel",shifth2:"Jeder kann KI heute <em>nutzen</em>. Fast niemand macht daraus Systeme, denen man wirklich <em>vertraut.</em>",whatwebuild:"Was wir bauen",selwork:"Ausgewählte Arbeiten",st_proj:"Projekte",st_cli:"Kunden",st_yrs:"Jahre",st_lang:"Sprachen"},
    ms:{work:"Kerja",services:"Perkhidmatan",solutions:"Penyelesaian",ventures:"Usaha",about:"Tentang",insights:"Wawasan",contact:"Hubungi",products:"Produk",company:"Syarikat",club:"Kelab Pengasas",exploreclub:"Terokai Kelab Pengasas",clubeyebrow:"Komuniti · Kelab Pengasas",clubh:"Membina bersama pengasas yang <em>bersungguh-sungguh.</em>",clubp:"Komuniti percuma pengasas Muslim dan sehaluan nilai — secara dalam talian dan bersemuka di Kuala Lumpur.",clubtag:"Sertai percuma · KL & Dalam Talian",clubwhatson:"Apa yang ada",clubev1:"<span>01</span> Mixer & makan malam KL",clubev2:"<span>02</span> Masterclass & bengkel",clubev3:"<span>03</span> Webinar & AMA dalam talian",clubev4:"<span>04</span> Malam demo & pitch",homequote:"“Mereka membina seluruh ekosistem kami — jenama, laman, penjejakan dan kedai utama. <em>Bukan kempen. Satu aset.</em>”",homequoteby:"ANAAKA — Penjagaan Kulit Halal · Flagship @ TRX, Kuala Lumpur",connect:"Hubungi",
      start:"Mulakan projek",book:"Tempah panggilan",brief:"Hantar taklimat",audit:"Audit AI percuma",whatsapp:"WhatsApp",email:"E-mel",menu:"Menu",allsol:"Semua penyelesaian &rarr;",imprint:"Notis &amp; Privasi",
      tag1:"Kecerdasan,",tag2:"dengan integriti.",herosub:"Kami membina perisian, ejen AI dan sistem yang digunakan syarikat moden — dibina pantas, berasaskan kepercayaan sedekad.",
      ftag:"Kecerdasan, dengan integriti. Studio AI gunaan untuk ekonomi kepercayaan — perisian, ejen dan sistem yang digunakan syarikat moden.",
      letsbuild:"Mari bina",ctah2:"Bina sesuatu yang<br><em>dipercayai.</em>",ctalead:"Beritahu kami apa yang melambatkan perniagaan anda. Kami tunjukkan sistem yang membaikinya — dan secepat mana.",lblphone:"Telefon",lblstudio:"Studio",
      abadge:"Pintu masuk tanpa risiko",audith2:"Dapatkan <em>audit AI percuma</em> untuk perniagaan anda",auditp:"Analisis 30 minit: di mana ejen AI, automasi dan laman yang lebih baik menjimatkan paling banyak masa dan wang. Tiada jualan, hanya peta.",
      shifteyebrow:"(01) — Peralihan",shifth2:"Sesiapa boleh <em>guna</em> AI sekarang. Hampir tiada yang menjadikannya sistem yang anda benar-benar <em>percayai.</em>",whatwebuild:"Apa yang kami bina",selwork:"Kerja terpilih",st_proj:"Projek",st_cli:"Pelanggan",st_yrs:"Tahun",st_lang:"Bahasa"},
    ar:{work:"أعمالنا",services:"خدماتنا",solutions:"الحلول",ventures:"مشاريعنا",about:"من نحن",insights:"مقالات",contact:"تواصل",products:"المنتجات",company:"الشركة",club:"نادي المؤسّسين",exploreclub:"اكتشف نادي المؤسّسين",clubeyebrow:"مجتمع · نادي المؤسّسين",clubh:"ابنِ إلى جانب مؤسّسين <em>جادّين فعلاً.</em>",clubp:"مجتمع مجاني من المؤسّسين المسلمين وأصحاب القيم — عبر الإنترنت وحضوريًا في كوالالمبور.",clubtag:"انضمام مجاني · كوالالمبور وأونلاين",clubwhatson:"ما الذي يجري",clubev1:"<span>01</span> لقاءات وعشاء كوالالمبور",clubev2:"<span>02</span> ورش وماستر كلاس",clubev3:"<span>03</span> ندوات وأسئلة مفتوحة أونلاين",clubev4:"<span>04</span> أمسيات عروض وبيتشينغ",homequote:"«لقد بنوا منظومتنا بالكامل — العلامة والموقع والتتبّع ومتجرًا رئيسيًا. <em>ليست حملة. بل أصل.</em>»",homequoteby:"ANAAKA — عناية بشرة حلال · المتجر الرئيسي @ TRX، كوالالمبور",connect:"تواصل",
      start:"ابدأ مشروعًا",book:"احجز مكالمة",brief:"أرسل موجزًا",audit:"تدقيق ذكاء اصطناعي مجاني",whatsapp:"واتساب",email:"البريد",menu:"القائمة",allsol:"كل الحلول &larr;",imprint:"البيان والخصوصية",
      tag1:"الذكاء،",tag2:"مع النزاهة.",herosub:"نبني البرمجيات ووكلاء الذكاء الاصطناعي والأنظمة التي تعتمد عليها الشركات الحديثة — بسرعة، وبثقة بُنيت على مدى عقد.",
      ftag:"الذكاء، مع النزاهة. استوديو ذكاء اصطناعي تطبيقي لاقتصاد الثقة — البرمجيات والوكلاء والأنظمة التي تعتمد عليها الشركات الحديثة.",
      letsbuild:"لِنبدأ البناء",ctah2:"لنبنِ شيئًا<br><em>جديرًا بالثقة.</em>",ctalead:"أخبرنا بما يُبطئ أعمالك، وسنُريك النظام الذي يُصلحه — وبأي سرعة.",lblphone:"الهاتف",lblstudio:"الاستوديو",
      abadge:"بداية بلا مخاطر",audith2:"احصل على <em>تدقيق ذكاء اصطناعي مجاني</em> لأعمالك",auditp:"جلسة 30 دقيقة: أين يوفّر وكلاء الذكاء الاصطناعي والأتمتة وموقع أفضل أكبر قدر من الوقت والمال. بلا عروض بيع، مجرد خارطة طريق.",
      shifteyebrow:"(٠١) — التحوّل",shifth2:"يستطيع الجميع <em>استخدام</em> الذكاء الاصطناعي الآن، وقلّة من يحوّله إلى أنظمة <em>تثق</em> بها فعلًا.",whatwebuild:"ما الذي نبنيه",selwork:"أعمال مختارة",st_proj:"مشاريع",st_cli:"عملاء",st_yrs:"سنوات",st_lang:"لغات"},
    zh:{work:"作品",services:"服务",solutions:"解决方案",ventures:"自有业务",about:"关于",insights:"洞察",contact:"联系",products:"产品",company:"公司",club:"创始人俱乐部",exploreclub:"探索创始人俱乐部",clubeyebrow:"社群 · 创始人俱乐部",clubh:"与<em>真正用心</em>的创始人并肩前行。",clubp:"一个面向穆斯林及价值观一致创始人的免费社群——线上与吉隆坡线下同步进行。",clubtag:"免费加入 · 吉隆坡与线上",clubwhatson:"活动内容",clubev1:"<span>01</span> 吉隆坡聚会与晚宴",clubev2:"<span>02</span> 大师课与工作坊",clubev3:"<span>03</span> 线上网络研讨与问答",clubev4:"<span>04</span> 演示与路演之夜",homequote:"“他们打造了我们的整个生态——品牌、网站、追踪和旗舰店。<em>不是一场活动，而是一项资产。</em>”",homequoteby:"ANAAKA — 清真护肤 · 旗舰店 @ 吉隆坡 TRX",connect:"联系",
      start:"启动项目",book:"预约通话",brief:"发送需求",audit:"免费 AI 审计",whatsapp:"WhatsApp",email:"邮箱",menu:"菜单",allsol:"全部方案 &rarr;",imprint:"版本说明与隐私",
      tag1:"智能，",tag2:"兼具诚信。",herosub:"我们构建现代企业赖以运行的软件、AI 智能体与系统——快速交付，建立在十年信任之上。",
      ftag:"智能，兼具诚信。面向信任经济的应用型 AI 工作室——为现代企业打造软件、智能体与系统。",
      letsbuild:"一起打造",ctah2:"打造<br>值得<em>信赖</em>的产品。",ctalead:"告诉我们是什么拖慢了你的业务，我们会展示解决它的系统——以及多快见效。",lblphone:"电话",lblstudio:"工作室",
      abadge:"零风险的第一步",audith2:"为你的业务获取<em>免费 AI 审计</em>",auditp:"30 分钟拆解：AI 智能体、自动化与更好的网站在哪里最能为你省时省钱。不推销，只给路线图。",
      shifteyebrow:"(01) — 转变",shifth2:"如今人人都能<em>使用</em> AI，却几乎没人把它变成你真正<em>信赖</em>的系统。",whatwebuild:"我们构建什么",selwork:"精选作品",st_proj:"项目",st_cli:"客户",st_yrs:"年",st_lang:"语言"},
    tr:{work:"Projeler",services:"Hizmetler",solutions:"Çözümler",ventures:"Girişimler",about:"Hakkımızda",insights:"İçgörüler",contact:"İletişim",products:"Ürünler",company:"Şirket",club:"Founders Club",exploreclub:"Founders Club'ı keşfedin",clubeyebrow:"Topluluk · Founders Club",clubh:"Gerçekten <em>inanan</em> kurucularla birlikte inşa edin.",clubp:"Müslüman ve değer odaklı kurucuların ücretsiz topluluğu — Kuala Lumpur'da çevrim içi ve yüz yüze buluşuyoruz.",clubtag:"Katılım ücretsiz · KL & Online",clubwhatson:"Neler var",clubev1:"<span>01</span> KL buluşmaları & akşam yemekleri",clubev2:"<span>02</span> Ustalık sınıfları & atölyeler",clubev3:"<span>03</span> Online webinarlar & soru-cevaplar",clubev4:"<span>04</span> Demo & sunum geceleri",homequote:"“Tüm ekosistemimizi kurdular — marka, site, takip ve amiral mağaza. <em>Bir kampanya değil. Bir varlık.</em>”",homequoteby:"ANAAKA — Helal Cilt Bakımı · Amiral Mağaza @ TRX, Kuala Lumpur",connect:"Bağlantı",
      start:"Proje başlat",book:"Görüşme planla",brief:"Brief gönderin",audit:"Ücretsiz AI denetimi",whatsapp:"WhatsApp",email:"E-posta",menu:"Menü",allsol:"Tüm çözümler &rarr;",imprint:"Künye &amp; Gizlilik",
      tag1:"Zekâ,",tag2:"dürüstlükle.",herosub:"Modern şirketlerin üzerinde çalıştığı yazılımları, AI ajanlarını ve sistemleri inşa ediyoruz — hızla geliştirilmiş, on yıllık güvene dayalı.",
      ftag:"Zekâ, dürüstlükle. Güven ekonomisi için uygulamalı yapay zekâ stüdyosu — modern şirketlerin üzerinde çalıştığı yazılımlar, ajanlar ve sistemler.",
      letsbuild:"Birlikte inşa edelim",ctah2:"Güvenmeye<br><em>değer</em> bir şey inşa edin.",ctalead:"İşinizi neyin yavaşlattığını anlatın. Bunu çözen sistemi — ve ne kadar hızlı çözdüğünü — gösterelim.",lblphone:"Telefon",lblstudio:"Stüdyo",
      abadge:"Risksiz başlangıç",audith2:"İşletmeniz için <em>ücretsiz AI denetimi</em> alın",auditp:"30 dakikalık analiz: AI ajanları, otomasyon ve daha iyi bir sitenin size en çok zaman ve para kazandıracağı yerler. Satış konuşması yok, sadece yol haritası.",
      shifteyebrow:"(01) — Dönüşüm",shifth2:"Artık herkes AI <em>kullanabiliyor.</em> Ama neredeyse hiç kimse onu gerçekten <em>güvendiğiniz</em> sistemlere dönüştüremiyor.",whatwebuild:"Ne inşa ediyoruz",selwork:"Seçilmiş işler",st_proj:"Proje",st_cli:"Müşteri",st_yrs:"Yıl",st_lang:"Dil"},
  };
  var _CTA={
    en:{cta_results:'Want results<br>like <em>these?</em>',cta_first:'What should we<br>build <em>first?</em>',cta_studio:'Work with<br>the <em>studio.</em>',cta_noon:'Be first on<br><em>Noon OS.</em>',cta_launch:'Claim your<br><em>launch slot.</em>'},
    de:{cta_results:'Wollen Sie<br>solche <em>Ergebnisse?</em>',cta_first:'Was bauen wir<br><em>zuerst?</em>',cta_studio:'Mit dem<br><em>Studio</em> arbeiten.',cta_noon:'Seien Sie zuerst auf<br><em>Noon OS.</em>',cta_launch:'Sichern Sie sich<br>einen <em>Slot.</em>'},
    ms:{cta_results:'Mahukan hasil<br><em>seperti ini?</em>',cta_first:'Apa patut kami<br>bina <em>dahulu?</em>',cta_studio:'Bekerja dengan<br><em>studio.</em>',cta_noon:'Jadi yang pertama di<br><em>Noon OS.</em>',cta_launch:'Tempah<br><em>slot anda.</em>'},
    ar:{cta_results:'تريد نتائج<br><em>كهذه؟</em>',cta_first:'ماذا نبني<br><em>أولًا؟</em>',cta_studio:'اعمل مع<br><em>الاستوديو.</em>',cta_noon:'كن أول من يجرّب<br><em>Noon OS.</em>',cta_launch:'احجز<br><em>مكانك.</em>'},
    zh:{cta_results:'想要<br><em>这样的成果？</em>',cta_first:'我们先<br>构建<em>什么？</em>',cta_studio:'与<br><em>工作室</em>合作。',cta_noon:'抢先体验<br><em>Noon OS。</em>',cta_launch:'<em>预约</em><br>名额。'},
    tr:{cta_results:'Böyle sonuçlar<br>ister <em>misiniz?</em>',cta_first:'Önce ne<br>inşa <em>edelim?</em>',cta_studio:'Stüdyo ile<br><em>çalışın.</em>',cta_noon:"Noon OS'ta<br><em>ilk siz olun.</em>",cta_launch:'Lansman yerinizi<br><em>ayırtın.</em>'}
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
    var sel='main p, main li, main b, main h2, main h3, main h4, main .nm, main .res, main .ti, main .de, main .cat, main summary, main .quote-by, main .cap, main .prodcard .pt span, main .pc-tags span, main .pc-meta, main .pc-go, main blockquote, main figcaption, main .badge, main .eyebrow .mono, .phero h1, .phero p, nav .mega-col h6, nav .mega-link b, nav .mega-link span span, nav .mega-preview .pk, nav .mega-preview .lab, nav .mega-preview .dsc, nav .mega-btns a, nav .subnav a, footer h6, footer a, footer p, .overlay .ov-h, .overlay .ov-item b, .overlay .ov-tx>span, .overlay .ov-clink, .overlay .ov-cta-k, .overlay .ov-cta-h, main .flow .ftitle, main .flow .ftag, main .fstep .ftx span, main .funnel .fl, main .road .rstep span, main .serp .stx span, main .dpc-k, main .dpc-b, main .svc .svc-l, main .svc .svc-b, main .svc-foot';
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
    w.innerHTML='<h6>'+T.h+'</h6><p class="nlf-p">'+T.p+'</p><form class="nlf-f" novalidate><input type="email" required placeholder="'+T.ph+'" aria-label="Email"><button type="submit" class="btn btn-fill">'+T.b+'</button></form><div class="nlf-msg" hidden></div>';
    col.appendChild(w);
    var f=w.querySelector('form'),msg=w.querySelector('.nlf-msg');
    f.addEventListener('submit',function(e){e.preventDefault();
      var em=f.querySelector('input').value.trim(); if(!em||em.indexOf('@')<0) return;
      var done=function(ok){msg.hidden=false;msg.textContent=ok?T.ok:T.err;if(ok)f.hidden=true;};
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
    function target(code){
      var p=location.pathname.replace(/^\/(de|ms|ar|zh|tr)(?=\/)/,'');
      if(p==='')p='/';
      return code==='en'? p : '/'+code+(p==='/'?'/':p);
    }
    var box=document.getElementById('lang');
    if(box){var btn=box.querySelector('button');
      btn.onclick=function(e){e.stopPropagation();box.classList.toggle('open')};
      box.querySelectorAll('.lang-menu button').forEach(function(b){b.onclick=function(){location.href=target(b.getAttribute('data-l'));}});
      document.addEventListener('click',function(){box.classList.remove('open')});
    }
  }

  /* ---------- GA4 + Consent Mode v2 (guarded: loader skips when head snippet present) ---------- */
  (function(){
    if(!window.gtag){
      window.dataLayer=window.dataLayer||[];
      window.gtag=function(){dataLayer.push(arguments);};
      gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});
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

  /* ---------- hero title: cycle languages every 3s ---------- */
  function initHeroCycle(){
    var h1=document.querySelector('header.hero h1.hero-cycle'); if(!h1) return;
    var t1=h1.querySelector('.ht1'), t2=h1.querySelector('.ht2'); if(!t1||!t2) return;
    var order=['en','de','ms','ar','zh','tr'];
    function apply(l){ var d=I18N[l]; if(!d) return; if(d.tag1!=null) t1.innerHTML=d.tag1; if(d.tag2!=null) t2.innerHTML=d.tag2; h1.setAttribute('dir', l==='ar'?'rtl':'ltr'); }
    var i=0; /* always open on English, then cycle in menu order (Attila 2026-07-05) */
    apply(order[i]);                                   // begin on the language the user has selected
    window.UC_heroAnchor=function(l){ var k=order.indexOf(l); if(k<0) return; i=k; apply(l); };  // re-anchor when the user switches language
    if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    h1.style.transition='opacity .55s ease, filter .55s ease, transform .55s ease';
    var tick=function(){
      i=(i+1)%order.length;
      h1.style.opacity='0'; h1.style.filter='blur(7px)'; h1.style.transform='translateY(12px)';
      setTimeout(function(){ apply(order[i]); h1.style.opacity='1'; h1.style.filter='none'; h1.style.transform='none'; },560);
    };
    var started=false;
    function startCycle(){ if(started)return; started=true; setTimeout(function(){ tick(); setInterval(tick,3000); },1200); }
    ['scroll','pointerdown','pointermove','keydown','touchstart'].forEach(function(ev){ addEventListener(ev,startCycle,{once:true,passive:true}); }); /* humans move; lab runs don't — keeps LCP stable */
  }

  /* ---------- chrome: nav, menu, cursor, magnetic ---------- */
  function initChrome(){
    var nav=document.getElementById('nav'); if(nav) addEventListener('scroll',function(){nav.classList.toggle('scrolled',scrollY>40)});
    var ov=document.getElementById('overlay'),ob=document.getElementById('menuOpen'),oc=document.getElementById('menuClose');
    addEventListener('pageshow',function(){if(ov)ov.classList.remove('open')});
    if(ob&&ov) ob.onclick=function(){ov.classList.add('open')};
    function cl(){if(ov)ov.classList.remove('open')} if(oc)oc.onclick=cl; if(ov)ov.querySelectorAll('a').forEach(function(a){a.onclick=cl});
    /* mega menu hover-intent: open only from the nav LINK text, small delay (2026-07-06) */
    document.querySelectorAll('.has-mega').forEach(function(m){
      var a=null; for(var i=0;i<m.children.length;i++){ if(m.children[i].tagName==='A'){a=m.children[i];break;} }
      var panel=m.querySelector('.mega'); if(!a||!panel) return;
      var ot,ct;
      function doOpen(){ clearTimeout(ct); ot=setTimeout(function(){ m.classList.add('mega-open'); },140); }
      function doClose(){ clearTimeout(ot); ct=setTimeout(function(){ m.classList.remove('mega-open'); },180); }
      a.addEventListener('mouseenter',doOpen);
      a.addEventListener('mouseleave',doClose);
      panel.addEventListener('mouseenter',function(){ clearTimeout(ct); clearTimeout(ot); m.classList.add('mega-open'); });
      panel.addEventListener('mouseleave',doClose);
    });
    /* accordion: only one Solutions group open at a time (2026-07-05) */
    if(ov)ov.querySelectorAll('.ov-acc').forEach(function(d){d.addEventListener('toggle',function(){if(d.open)ov.querySelectorAll('.ov-acc[open]').forEach(function(o){if(o!==d)o.open=false;})})});
    if(!matchMedia('(hover:none)').matches){
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
      o.classList.add('sel'); sel[grp]=o.getAttribute('data-val');}});
    w.querySelectorAll('.slot').forEach(function(s){s.onclick=function(){w.querySelectorAll('.slot').forEach(function(x){x.classList.remove('sel')});s.classList.add('sel');sel.slot=s.getAttribute('data-val');}});
    if(qs){var pre=w.querySelector('.opt[data-grp="service"][data-val="'+qs+'"]'); if(pre){pre.classList.add('sel');sel.service=qs;}}
    var fin=w.querySelector('#wizFinish');
    if(fin) fin.onclick=function(){
      var sum=w.querySelector('#wizSummary'); if(sum) sum.textContent=(sel.service||'Project')+' · '+(sel.pkg||'Scope TBD')+' · '+(sel.slot||'Time TBD');
      show(steps.length-1);
      // handoff to scheduler (replace with real Cal.com/Calendly link)
      var url='https://cal.com/ummah-collective?utm_source=site&service='+encodeURIComponent(sel.service||'');
      var go=w.querySelector('#wizHandoff'); if(go) go.href=url;
    };
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
    if(typeof Lenis!=='undefined'&&!isTouch){var l=new Lenis({lerp:0.1});window.__lenis=l;
      if(hasG){l.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){l.raf(t*1000)});gsap.ticker.lagSmoothing(0);}
      else{function raf(t){l.raf(t);requestAnimationFrame(raf)}requestAnimationFrame(raf);}
      /* recompute scrollable height after fonts/lottie/images reflow so the footer is always reachable */
      var rzT;function rz(){clearTimeout(rzT);rzT=setTimeout(function(){try{l.resize();if(hasG)ScrollTrigger.refresh();}catch(e){}},120);}
      window.addEventListener('load',rz);window.addEventListener('resize',rz);
      if(document.fonts&&document.fonts.ready)document.fonts.ready.then(rz);
      setTimeout(rz,600);setTimeout(rz,1600);setTimeout(rz,3000);
      if(window.ResizeObserver){try{new ResizeObserver(rz).observe(document.body);}catch(e){}}
    }
    if(!hasG){document.querySelectorAll('.reveal').forEach(function(e){e.style.opacity=1;e.style.transform='none'});return;}
    gsap.utils.toArray('.reveal').forEach(function(el){gsap.to(el,{opacity:1,y:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}})});
    gsap.utils.toArray('.count').forEach(function(el){var to=+el.getAttribute('data-to');
      ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:function(){gsap.to({v:0},{v:to,duration:1.4,ease:'power2.out',onUpdate:function(){el.textContent=Math.round(this.targets()[0].v)}})}});});
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
      try{ lottie.loadAnimation({container:el,renderer:'svg',loop:true,autoplay:true,path:el.getAttribute('data-src')}); }catch(e){} }); }

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
    function step(dir){ var t=c.querySelector('.tile'); var dx=(t?t.offsetWidth+18:300)*dir; c.scrollBy({left:dx,behavior:'smooth'}); }
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
    rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));
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
    var rnd=new THREE.WebGLRenderer({canvas:canvas,antialias:true}); rnd.setSize(innerWidth,innerHeight); rnd.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));
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
  /* ---------- booking popup (global, injected) ---------- */
  var BOOKING={
    w3f:'',  /* optional Web3Forms access key — if set, used instead of Formsubmit */
    email:'info@ummah-collective.com',  /* keyless Formsubmit delivery target (one-time activation) */
    ucp:''  /* UCpanel lead-intake URL — set once the dynamic panel is deployed */
  };
  function initBooking(){
    if(document.getElementById('ucbk')) return;
    var WA='https://wa.me/601133262709';
    var svc=[['ai-agents','AI Agents','Agents that sell &amp; support 24/7'],['automation','Automation','Cut overhead, keep output'],['app-development','App &amp; Software','Custom apps, shipped fast'],['web-design','Web &amp; Platforms','Sites that convert'],['branding','Branding &amp; Identity','Perception is strategy'],['custom-crm','Custom CRM','The system your team runs on'],['lead-generation','Lead Generation','A pipeline that compounds'],['marketing-ads','Marketing &amp; Ads','Demand, engineered'],['strategy','Strategy &amp; Market Entry','The roadmap that aligns it'],['other','Something else','Tell us what you need']];
    var ind=[['','&mdash;'],['halal-fnb','Halal / F&amp;B'],['beauty','Beauty &amp; skincare'],['fashion','Fashion &amp; modest wear'],['finance','Finance / fintech'],['education','Education'],['travel','Travel / hospitality'],['tech','Tech / SaaS'],['retail','Retail / e-commerce'],['services','Professional services'],['other','Other']];
    var tl=[['','&mdash;'],['asap','ASAP'],['1-3m','1&ndash;3 months'],['3-6m','3&ndash;6 months'],['exploring','Just exploring']];
    var heard=[['','&mdash;'],['search','Google / search'],['referral','Referral'],['social','Social media'],['linkedin','LinkedIn'],['event','Event'],['other','Other']];
    var contact=[['email','Email'],['whatsapp','WhatsApp'],['phone','Phone call'],['any','Any is fine']];
    var AVAIL={1:[[840,1140]],2:[[690,810],[900,1020]],3:[[660,840]],4:[[630,900]]};
    var DOWn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], MONn=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    function fmtT(x){var h=Math.floor(x/60),mm=x%60,ap=h<12?'AM':'PM',h12=h%12||12;return h12+':'+(mm<10?'0'+mm:mm)+' '+ap;}
    function slotStarts(w){var o=[];w.forEach(function(p){for(var t=p[0];t+30<=p[1];t+=30)o.push(t);});return o;}
    function opts(a){return a.map(function(o){return '<option value="'+o[0]+'">'+o[1]+'</option>';}).join('');}
    function tiles(a){return a.map(function(o){return '<button type="button" class="ucbk-opt" data-val="'+o[0]+'"><b>'+o[1]+'</b><span>'+o[2]+'</span></button>';}).join('');}
    var heads=[['What can we help with?','Pick the closest fit &mdash; you can add detail next.'],['About your business','So we come prepared.'],['Your project','A little context goes a long way.'],['Pick a time','Choose a slot &mdash; all times Malaysia time (MYT).'],['How to reach you','We&rsquo;ll confirm your meeting by email.']];
    var m=document.createElement('div'); m.id='ucbk'; m.className='ucbk'; m.setAttribute('aria-hidden','true');
    m.innerHTML='<div class="ucbk-back"></div><div class="ucbk-card" role="dialog" aria-modal="true" aria-label="Book a call"><button class="ucbk-x" type="button" aria-label="Close">&#10005;</button><div class="ucbk-body"><div class="ucbk-k">Book a call</div><h3 class="ucbk-h" id="ucbkH">'+heads[0][0]+'</h3><p class="ucbk-sub" id="ucbkS">'+heads[0][1]+'</p><div class="ucbk-prog"><i class="on"></i><i></i><i></i><i></i><i></i></div><form class="ucbk-form form" novalidate><div class="ucbk-step on" data-step="0"><div class="ucbk-opts">'+tiles(svc)+'</div></div><div class="ucbk-step" data-step="1"><div class="ucbk-row"><label>Company<input name="company" placeholder="&nbsp;"></label><label>Website<input name="website" placeholder="https://&hellip;"></label></div><label class="ucbk-full">Industry / type<select name="industry">'+opts(ind)+'</select></label></div><div class="ucbk-step" data-step="2"><label class="ucbk-full">When do you want to start?<select name="timeline">'+opts(tl)+'</select></label><label class="ucbk-full">What do you want to achieve?<textarea name="message" placeholder="Goals, the problem to solve, anything useful&hellip;"></textarea></label><label class="ucbk-full">How did you hear about us?<select name="heard">'+opts(heard)+'</select></label></div><div class="ucbk-step" data-step="3"><div class="ucbk-days" id="ucbkDays"></div><div class="ucbk-slots" id="ucbkSlots"><div class="ucbk-slothint">Select a day above to see times.</div></div></div><div class="ucbk-step" data-step="4"><div class="ucbk-row"><label>Name*<input name="name" required placeholder="&nbsp;"></label><label>Email*<input name="email" type="email" required placeholder="you@company.com"></label></div><div class="ucbk-row"><label>Phone / WhatsApp<input name="phone" placeholder="+60&hellip;"></label><label>Preferred contact<select name="contact">'+opts(contact)+'</select></label></div></div><div class="ucbk-nav"><button type="button" class="btn btn-ghost ucbk-prev" hidden>&larr; Back</button><span class="ucbk-spacer"></span><button type="button" class="btn btn-fill ucbk-next">Next &rarr;</button><button type="submit" class="btn btn-fill ucbk-go" hidden>Send request</button></div><div class="ucbk-note">By sending you agree to be contacted about your enquiry. &middot; <a href="'+WA+'" target="_blank" rel="noopener" class="ucbk-walink">WhatsApp us</a></div></form><div class="ucbk-done" hidden><div class="ucbk-tick">&#10003;</div><h3 class="ucbk-h">Request received.</h3><p class="ucbk-sub ucbk-dsub">Thank you &mdash; we&rsquo;ll be in touch shortly.</p></div></div></div>';
    document.body.appendChild(m);
    var form=m.querySelector('.ucbk-form'), done=m.querySelector('.ucbk-done'), go=m.querySelector('.ucbk-go');
    var steps=[].slice.call(m.querySelectorAll('.ucbk-step')), dots=[].slice.call(m.querySelectorAll('.ucbk-prog i'));
    var prevb=m.querySelector('.ucbk-prev'), nextb=m.querySelector('.ucbk-next'), H=m.querySelector('#ucbkH'), S=m.querySelector('#ucbkS');
    var daysEl=m.querySelector('#ucbkDays'), slotsEl=m.querySelector('#ucbkSlots');
    var step=0, picked='', DAYS=[], slot=null;
    function renderSlots(d){
      var starts=slotStarts(AVAIL[d.getDay()]);
      slotsEl.innerHTML=starts.map(function(t){return '<button type="button" class="ucbk-slot" data-t="'+t+'">'+fmtT(t)+'</button>';}).join('');
      slotsEl.querySelectorAll('.ucbk-slot').forEach(function(b){ b.addEventListener('click',function(){ slotsEl.querySelectorAll('.ucbk-slot').forEach(function(x){x.classList.remove('sel');}); b.classList.add('sel'); slot={d:d,t:+b.getAttribute('data-t')}; }); });
    }
    function buildDays(){
      DAYS=[]; var base=new Date(); base.setHours(0,0,0,0);
      for(var i=1;i<=24&&DAYS.length<8;i++){ var nd=new Date(base.getTime()+i*864e5); if(AVAIL[nd.getDay()]) DAYS.push(nd); }
      daysEl.innerHTML=DAYS.map(function(d,i){ return '<button type="button" class="ucbk-day" data-i="'+i+'"><b>'+DOWn[d.getDay()]+'</b><span>'+MONn[d.getMonth()]+' '+d.getDate()+'</span></button>'; }).join('');
      slotsEl.innerHTML='<div class="ucbk-slothint">Select a day above to see times.</div>';
      daysEl.querySelectorAll('.ucbk-day').forEach(function(b){ b.addEventListener('click',function(){ daysEl.querySelectorAll('.ucbk-day').forEach(function(x){x.classList.remove('sel');}); b.classList.add('sel'); renderSlots(DAYS[+b.getAttribute('data-i')]); }); });
    }
    function slotLabel(){ if(!slot) return ''; return DOWn[slot.d.getDay()]+', '+MONn[slot.d.getMonth()]+' '+slot.d.getDate()+' &middot; '+fmtT(slot.t)+' MYT'; }
    function render(){
      steps.forEach(function(s,i){ s.classList.toggle('on',i===step); });
      dots.forEach(function(d,i){ d.classList.toggle('on',i<=step); });
      H.innerHTML=heads[step][0]; S.innerHTML=heads[step][1];
      prevb.hidden=(step===0); nextb.hidden=(step===0||step===steps.length-1); go.hidden=(step!==steps.length-1);
      var card=m.querySelector('.ucbk-card'); if(card) card.scrollTop=0;
      setTimeout(function(){ if(step>0){ var f=steps[step].querySelector('input,select,textarea'); if(f) f.focus(); } },120);
    }
    function go2(n){ step=Math.max(0,Math.min(steps.length-1,n)); render(); }
    m.querySelectorAll('.ucbk-opt').forEach(function(b){ b.addEventListener('click',function(){ m.querySelectorAll('.ucbk-opt').forEach(function(x){x.classList.remove('sel');}); b.classList.add('sel'); picked=b.getAttribute('data-val'); go2(1); }); });
    nextb.addEventListener('click',function(){ go2(step+1); });
    prevb.addEventListener('click',function(){ go2(step-1); });
    function open(sv){ step=0; picked=sv||''; slot=null; try{form.reset();}catch(e){} m.querySelectorAll('.ucbk-opt').forEach(function(x){ x.classList.toggle('sel', !!sv&&x.getAttribute('data-val')===sv); }); buildDays(); form.hidden=false; done.hidden=true; render(); m.classList.add('on'); m.setAttribute('aria-hidden','false'); document.documentElement.style.overflow='hidden'; }
    function close(){ m.classList.remove('on'); m.setAttribute('aria-hidden','true'); document.documentElement.style.overflow=''; }
    window.ucOpenBooking=open;
    m.querySelector('.ucbk-x').addEventListener('click',close);
    m.querySelector('.ucbk-back').addEventListener('click',close);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&m.classList.contains('on')) close(); });
    document.addEventListener('click',function(e){
      var a=e.target.closest?e.target.closest('a[href],button[data-book]'):null; if(!a) return;
      var h=a.getAttribute('href')||a.getAttribute('data-book')||'';
      if(/(^|\/)booking\.html/.test(h)||a.hasAttribute('data-book')){ e.preventDefault(); var sv=''; var mm=h.match(/service=([a-z-]+)/); if(mm) sv=mm[1]; open(sv); }
    },true);
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var d={}; ['company','website','industry','timeline','message','heard','name','email','phone','contact'].forEach(function(k){var el=form.querySelector('[name='+k+']'); d[k]=el?el.value.trim():'';});
      d.service=picked; var meeting=slotLabel();
      if(!d.name||!d.email){ go2(4); setTimeout(function(){ (d.name?form.querySelector('[name=email]'):form.querySelector('[name=name]')).focus(); },140); return; }
      go.disabled=true; go.innerHTML='Sending&hellip;';
      var subj='New booking request - '+d.name+(d.company?(' ('+d.company+')'):'');
      var mtxt=(meeting||'-').replace(/&middot;/g,'-');
      var notes='Service: '+(d.service||'-')+' | Meeting: '+mtxt+' | Industry: '+(d.industry||'-')+' | Timeline: '+(d.timeline||'-')+' | Preferred: '+(d.contact||'-')+' | Heard: '+(d.heard||'-')+' | Website: '+(d.website||'-')+(d.message?(' | '+d.message):'');
      var jobs=[];
      if(BOOKING.w3f){ jobs.push(fetch('https://api.web3forms.com/submit',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({access_key:BOOKING.w3f,subject:subj,from_name:'UC Website',name:d.name,email:d.email,phone:d.phone,company:d.company,website:d.website,service:d.service,requested_meeting:mtxt,industry:d.industry,timeline:d.timeline,preferred_contact:d.contact,how_heard:d.heard,message:d.message,page:location.href})}).then(function(r){return r.ok;}).catch(function(){return false;})); }
      else if(BOOKING.email){ jobs.push(fetch('https://formsubmit.co/ajax/'+encodeURIComponent(BOOKING.email),{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:subj,_captcha:'false',_template:'table',name:d.name,email:d.email,phone:d.phone,company:d.company,website:d.website,service:d.service,requested_meeting:mtxt,industry:d.industry,timeline:d.timeline,preferred_contact:d.contact,how_heard:d.heard,message:d.message,page:location.href})}).then(function(r){return r.ok;}).catch(function(){return false;})); }
      if(BOOKING.ucp){ jobs.push(fetch(BOOKING.ucp,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:d.name,email:d.email,phone:d.phone,company:d.company,title:d.service,source:'website',status:'new',notes:notes})}).then(function(r){return r.ok;}).catch(function(){return false;})); }
      var dsub=m.querySelector('.ucbk-dsub'); if(dsub) dsub.innerHTML = meeting ? ('Your requested time: <b>'+meeting+'</b>.<br>We&rsquo;ll confirm by email shortly.') : 'Thank you &mdash; we&rsquo;ll be in touch shortly to lock a time.';
      Promise.all(jobs).then(function(){ form.hidden=true; done.hidden=false; go.disabled=false; go.innerHTML='Send request'; });
    });
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
