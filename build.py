#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Ummah Collective — Aurora full-site generator v2 (all services, all projects, imagery, i18n, booking)."""
import os, html, json, re
OUT=os.path.dirname(os.path.abspath(__file__))
SITE="https://ummah-collective.com"  # LIVE DOMAIN (cutover 2026-07-06); staging was https://ummah-collective-site.vercel.app

# ---- translation registry: key = English (entity-decoded), values = per-language text ----
TRMAP={'de':{},'ms':{},'ar':{},'zh':{},'tr':{}}
def TRREG(en,de='',ms='',ar='',zh='',tr=''):
    k=html.unescape(en).strip()
    if de:TRMAP['de'][k]=de
    if ms:TRMAP['ms'][k]=ms
    if ar:TRMAP['ar'][k]=ar
    if zh:TRMAP['zh'][k]=zh
    if tr:TRMAP['tr'][k]=tr
try:
    import i18n_data; i18n_data.register(TRREG)
except Exception as _e:
    print("i18n_data not loaded:", _e)

CDN=('<script defer src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
     '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>'
     '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>'
     '<script defer src="https://cdn.jsdelivr.net/npm/lenis@1.1.14/dist/lenis.min.js"></script>'
     '<script defer src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js"></script>')
# Perf/SEO head block (2026-07-04): preconnect to every external origin, fonts moved
# from uc.css @import (render-blocking chain) to <link> here, social card og-image.png.
PERF=('<style>html{background:#0B0F0E;color:#F6F3EC}body{background:#0B0F0E;margin:0}</style>'
      '<script async src="https://www.googletagmanager.com/gtag/js?id=G-HWF39V3XM0"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag(\'consent\',\'default\',{ad_storage:\'denied\',ad_user_data:\'denied\',ad_personalization:\'denied\',analytics_storage:\'denied\'});try{if(localStorage.getItem(\'uc_consent\')===\'granted\')gtag(\'consent\',\'update\',{analytics_storage:\'granted\'})}catch(e){}gtag(\'js\',new Date());gtag(\'config\',\'G-HWF39V3XM0\');</script>'
      '<meta name="theme-color" content="#0B0F0E">'
      '<link rel="manifest" href="site.webmanifest">'
      '<meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="UMMAH">'
      '<link rel="preconnect" href="https://api.fontshare.com"><link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>'
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
      '<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin><link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>'
      '<link rel="dns-prefetch" href="https://s0.wp.com">'
      '<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&f[]=general-sans@300,400,500,600&display=swap" media="print" onload="this.media=&quot;all&quot;">'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;600&display=swap" media="print" onload="this.media=&quot;all&quot;">'
      '<noscript><link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600&f[]=general-sans@300,400,500,600&display=swap"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Noto+Sans+Arabic:wght@300;400;600&family=Noto+Sans+SC:wght@300;400;600&display=swap"></noscript>')
LOGO='/assets/logo-white.png'
# Shariah Compliance & Halal Consultant (photo via Drive→lh3 hotlink, added 2026-07-04)
LAWAL_IMG='https://lh3.googleusercontent.com/d/1BpqQExtjIRQ0K2pUCsDAMehLjHKXviSH=w1000'
LAWAL_BIO=('Trained in Islamic finance at <strong>INCEIF University</strong>, Kuala Lumpur &mdash; the global university of Islamic finance &mdash; '
 'with research on <strong>cryptocurrencies</strong> and the Shariah questions of digital assets. He brings industry experience across sectors, '
 'including work with <strong>Zakat Selangor</strong> on optimising its operations.')
BRAND='<a href="index.html" class="brand"><img class="logo" src="'+LOGO+'" alt="Ummah Collective"><span class="wmtext" style="display:none">Ummah Collective</span></a>'

# ---- SEO helpers ----
def _plain(s): return re.sub('<[^>]+>','',html.unescape(str(s))).strip()
def _ld(obj): return '<script type="application/ld+json">'+json.dumps(obj,ensure_ascii=False)+'</script>'
def faq_ld(faq): return _ld({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":_plain(q),"acceptedAnswer":{"@type":"Answer","text":_plain(a)}} for q,a in faq]})
GLOBAL_LD=json.dumps({"@context":"https://schema.org","@graph":[
 {"@type":["Organization","ProfessionalService"],"@id":SITE+"/#org","name":"Ummah Collective","legalName":"Ummah Collective Sdn. Bhd.","url":SITE+"/","logo":LOGO,"image":LOGO,"email":"info@ummah-collective.com","telephone":"+60 11 3326 2709","foundingDate":"2022","founder":{"@type":"Person","name":"Attila von Barloewen"},"address":{"@type":"PostalAddress","addressLocality":"Kuala Lumpur","addressCountry":"MY"},"areaServed":["MY","DE","AE","SA","SG"],"description":"Applied-AI studio — the software, AI agents, CRMs and growth systems modern companies run on. Kuala Lumpur, Berlin, borderless.","sameAs":["https://www.linkedin.com/company/ummah-collective/"]},
 {"@type":"WebSite","@id":SITE+"/#website","url":SITE+"/","name":"Ummah Collective","inLanguage":"en","publisher":{"@id":SITE+"/#org"}}
]},ensure_ascii=False)
FXMAP={'default':'aurora','services':'mesh','work':'particles','ventures':'grid','insights':'grid','contact':'aurora','about':'particles','market':'mesh'}
WA='https://wa.me/601133262709'
def U(i,w=1400): return f'https://images.unsplash.com/photo-{i}?auto=format&fit=crop&w={w}&q=80'
def img(src,alt,cls="ph"): return f'<figure class="{cls}"><img src="{src}" alt="{alt}" loading="lazy"></figure>'

# ---- contextual animated explainers (SVG + CSS, "Lottie-style") ----
EX={
 "dashboard":'''<rect width="320" height="200" fill="#0a0d0b"/><rect width="320" height="22" fill="#111716"/><circle cx="13" cy="11" r="3.5" class="ex-fill"/><rect x="24" y="8" width="64" height="6" rx="3" fill="#2a302d"/>
<rect x="0" y="22" width="54" height="178" fill="#0e1311"/><rect x="10" y="36" width="34" height="6" rx="3" class="ex-fill"/><rect x="10" y="52" width="34" height="5" rx="2.5" fill="#2a302d"/><rect x="10" y="64" width="28" height="5" rx="2.5" fill="#2a302d"/><rect x="10" y="76" width="32" height="5" rx="2.5" fill="#2a302d"/>
<clipPath id="cv"><rect x="54" y="22" width="266" height="178"/></clipPath><g clip-path="url(#cv)"><g class="ex-scroll">
<rect x="66" y="34" width="76" height="44" rx="6" fill="#121a17"/><rect x="76" y="44" width="28" height="6" rx="3" fill="#2a302d"/><rect x="76" y="56" width="46" height="12" rx="3" class="ex-fill"/>
<rect x="150" y="34" width="76" height="44" rx="6" fill="#121a17"/><rect x="160" y="44" width="28" height="6" rx="3" fill="#2a302d"/><rect x="160" y="56" width="40" height="12" rx="3" class="ex-fill2"/>
<rect x="234" y="34" width="76" height="44" rx="6" fill="#121a17"/><rect x="244" y="44" width="28" height="6" rx="3" fill="#2a302d"/><rect x="244" y="56" width="36" height="12" rx="3" class="ex-fill"/>
<rect x="66" y="90" width="244" height="92" rx="6" fill="#121a17"/><g transform="translate(82,170)">
<rect x="0" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill" style="animation-delay:0s"/><rect x="28" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill2" style="animation-delay:.2s"/><rect x="56" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill" style="animation-delay:.4s"/><rect x="84" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill2" style="animation-delay:.6s"/><rect x="112" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill" style="animation-delay:.8s"/><rect x="140" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill2" style="animation-delay:1s"/><rect x="168" y="-58" width="16" height="58" rx="2" class="ex-bar ex-fill" style="animation-delay:1.2s"/></g>
<rect x="66" y="192" width="244" height="14" rx="3" fill="#121a17"/><rect x="66" y="212" width="244" height="14" rx="3" fill="#121a17"/><rect x="66" y="232" width="244" height="14" rx="3" fill="#121a17"/></g></g>
<g class="ex-cursor"><path d="M0 0 L0 17 L4.5 12.5 L7.5 19 L10 18 L7 11.5 L12 11.5 Z" fill="#fff" stroke="#04140a" stroke-width=".6"/></g>''',
 "chat":'''<rect width="320" height="200" fill="#0a0d0b"/>
<g class="ex-bub" style="animation-delay:.2s"><rect x="20" y="26" width="158" height="34" rx="11" fill="#121a17"/><rect x="32" y="36" width="104" height="6" rx="3" fill="#2a302d"/><rect x="32" y="48" width="72" height="6" rx="3" fill="#2a302d"/></g>
<g class="ex-bub" style="animation-delay:1s"><rect x="142" y="74" width="158" height="34" rx="11" class="ex-fill"/><rect x="154" y="84" width="104" height="6" rx="3" fill="rgba(0,0,0,.35)"/><rect x="154" y="96" width="64" height="6" rx="3" fill="rgba(0,0,0,.35)"/></g>
<g class="ex-bub" style="animation-delay:1.8s"><rect x="20" y="122" width="176" height="34" rx="11" fill="#121a17"/><rect x="32" y="132" width="120" height="6" rx="3" fill="#2a302d"/><rect x="32" y="144" width="84" height="6" rx="3" fill="#2a302d"/></g>
<g transform="translate(34,178)"><circle class="ex-dot ex-fill" cx="0" cy="0" r="3.2"/><circle class="ex-dot ex-fill" cx="11" cy="0" r="3.2" style="animation-delay:.2s"/><circle class="ex-dot ex-fill" cx="22" cy="0" r="3.2" style="animation-delay:.4s"/></g>''',
 "flow":'''<rect width="320" height="200" fill="#0a0d0b"/>
<path d="M48 100 C 120 36, 200 164, 272 100" fill="none" stroke="#2a302d" stroke-width="2"/>
<path d="M48 100 C 120 36, 200 164, 272 100" fill="none" class="ex-stroke ex-draw" stroke-width="2.4" stroke-linecap="round"/>
<g><rect x="20" y="84" width="56" height="32" rx="8" fill="#121a17" stroke="#2a302d"/><rect x="30" y="96" width="36" height="8" rx="4" class="ex-fill"/></g>
<g><rect x="132" y="40" width="56" height="32" rx="8" fill="#121a17" stroke="#2a302d"/><rect x="142" y="52" width="36" height="8" rx="4" class="ex-fill2"/></g>
<g><rect x="132" y="128" width="56" height="32" rx="8" fill="#121a17" stroke="#2a302d"/><rect x="142" y="140" width="36" height="8" rx="4" class="ex-fill"/></g>
<g><rect x="244" y="84" width="56" height="32" rx="8" fill="#121a17" stroke="#2a302d"/><rect x="254" y="96" width="36" height="8" rx="4" class="ex-fill2"/></g>
<circle r="5" class="ex-fill ex-packet" style="offset-path:path('M48 100 C 120 36, 200 164, 272 100')"/>''',
 "funnel":'''<rect width="320" height="200" fill="#0a0d0b"/>
<g transform="translate(160,30)">
<rect x="-120" y="0" width="240" height="26" rx="6" class="ex-rise ex-fill" style="animation-delay:0s"/>
<rect x="-92" y="38" width="184" height="26" rx="6" class="ex-rise ex-fill2" style="animation-delay:.25s"/>
<rect x="-64" y="76" width="128" height="26" rx="6" class="ex-rise ex-fill" style="animation-delay:.5s"/>
<rect x="-36" y="114" width="72" height="26" rx="6" class="ex-rise ex-fill2" style="animation-delay:.75s"/></g>
<circle r="4" class="ex-fill ex-packet" style="offset-path:path('M160 24 L160 168')"/>''',
 "web":'''<rect width="320" height="200" fill="#0a0d0b"/><rect x="30" y="24" width="260" height="152" rx="10" fill="#0e1311" stroke="#2a302d"/>
<rect x="30" y="24" width="260" height="20" rx="10" fill="#111716"/><circle cx="44" cy="34" r="3" class="ex-fill"/><circle cx="56" cy="34" r="3" fill="#2a302d"/><circle cx="68" cy="34" r="3" fill="#2a302d"/>
<g transform="translate(46,58)">
<rect x="0" y="-26" width="120" height="26" rx="4" class="ex-rise ex-fill" style="animation-delay:0s"/>
<rect x="0" y="6" width="228" height="8" rx="4" class="ex-rise" fill="#2a302d" style="animation-delay:.2s"/>
<rect x="0" y="20" width="200" height="8" rx="4" class="ex-rise" fill="#2a302d" style="animation-delay:.3s"/>
<rect x="0" y="42" width="68" height="50" rx="6" class="ex-rise ex-fill2" style="animation-delay:.5s"/>
<rect x="80" y="42" width="68" height="50" rx="6" class="ex-rise" fill="#121a17" style="animation-delay:.65s"/>
<rect x="160" y="42" width="68" height="50" rx="6" class="ex-rise" fill="#121a17" style="animation-delay:.8s"/></g>''',
 "search":'''<rect width="320" height="200" fill="#0a0d0b"/>
<g transform="translate(40,40)">
<rect x="0" y="0" width="240" height="18" rx="9" fill="#121a17"/><rect x="14" y="6" width="120" height="6" rx="3" fill="#2a302d"/>
<rect x="0" y="34" width="240" height="14" rx="4" fill="#121a17"/><rect x="0" y="56" width="200" height="14" rx="4" fill="#121a17"/><rect x="0" y="78" width="220" height="14" rx="4" fill="#121a17"/></g>
<g transform="translate(60,150)"><rect x="0" y="-30" width="20" height="30" rx="3" class="ex-rise ex-fill" style="animation-delay:0s"/><rect x="30" y="-46" width="20" height="46" rx="3" class="ex-rise ex-fill2" style="animation-delay:.2s"/><rect x="60" y="-58" width="20" height="58" rx="3" class="ex-rise ex-fill" style="animation-delay:.4s"/><rect x="90" y="-40" width="20" height="40" rx="3" class="ex-rise ex-fill2" style="animation-delay:.6s"/></g>
<g class="ex-cursor"><circle r="13" fill="none" class="ex-stroke" stroke-width="3"/><line x1="9" y1="9" x2="18" y2="18" class="ex-stroke" stroke-width="3" stroke-linecap="round"/></g>'''
}
def explain(kind,cap):
    if kind=='chat':
        inner=('<div class="lpanel"><div class="lp-top"><span class="ld"></span><span class="ld"></span><span class="ld"></span>'
          '<span class="lp-ttl">AI Agent &middot; WhatsApp</span><span class="lp-liv"><i></i> Online</span></div>'
          '<div class="lp-chat">'
          '<div class="lp-msg a m1">Assalamualaikum &#128075; I need 5,000 units of your halal serum in Jeddah before Ramadan &mdash; MYR pricing + export docs. Possible?</div>'
          '<div class="lp-msg u m2">Wa alaikum salam. Checking stock, JAKIM cert &amp; Jeddah lead-time&hellip;</div>'
          '<div class="lp-msg u m3">&#9989; 5,000 confirmed &mdash; MYR 142,500, SFDA-compliant labels + export docs included. Ships in 3 weeks.</div>'
          '<div class="lp-msg a m4">Perfect. Split it &mdash; 3,000 now, 2,000 in March?</div>'
          '<div class="lp-typing"><i></i><i></i><i></i></div>'
          '<div class="lp-msg u m5">Done &mdash; drafted a 2-shipment contract, reserved stock &amp; booked our export lead for Thu 11am KSA. Quote PDF inbound &#128196;</div>'
          '</div></div>')
    else:
        inner=('<div class="lpanel"><div class="lp-top"><span class="ld"></span><span class="ld"></span><span class="ld"></span>'
          '<span class="lp-ttl">Command Center</span><span class="lp-liv"><i></i> Live</span></div>'
          '<div class="lp-dash"><div class="lp-kpis">'
          '<div class="lp-kpi"><div class="k">Pipeline</div><div class="v">&euro;422K</div></div>'
          '<div class="lp-kpi"><div class="k">MRR</div><div class="v up">&euro;28.5K</div></div>'
          '<div class="lp-kpi"><div class="k">ROAS</div><div class="v up">7.0&times;</div></div></div>'
          '<div class="lp-chart">'+('<span class="bar"></span>'*7)+'</div>'
          '<div class="lp-rows">'
          '<div class="lp-row"><span class="av"></span><span class="rt">Agent closed a &euro;4,200 deal</span><span class="pill">Autonomous</span></div>'
          '<div class="lp-row"><span class="av"></span><span class="rt">47 leads scored overnight</span><span class="pill">AI</span></div>'
          '<div class="lp-row"><span class="av"></span><span class="rt">Contract + invoice auto-sent</span><span class="pill">Done</span></div>'
          '</div></div></div>')
    return '<div class="demo reveal">'+inner+'<span class="cap">'+cap+'</span></div>'

def agent_chat(ttl,cap,msgs):
    rows="";mi=0
    for k,t in msgs:
        if k=='typing': rows+='<div class="lp-typing"><i></i><i></i><i></i></div>'
        else:
            mi+=1; rows+='<div class="lp-msg '+k+' m'+str(mi)+'">'+t+'</div>'
    return ('<div class="demo reveal"><div class="lpanel"><div class="lp-top"><span class="ld"></span><span class="ld"></span><span class="ld"></span>'
      '<span class="lp-ttl">'+ttl+'</span><span class="lp-liv"><i></i> Online</span></div>'
      '<div class="lp-chat">'+rows+'</div></div><span class="cap">'+cap+'</span></div>')

# ---- animated automation flow component ----
FICON={
 'bolt':'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
 'ai':'<path d="M12 3l1.7 4.6L18 9l-4.3 1.4L12 15l-1.7-4.6L6 9l4.3-1.4z"/><path d="M5 16l.7 1.8L7.5 18l-1.8.7L5 20.5l-.7-1.8L2.5 18l1.8-.2z"/>',
 'crm':'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 'cal':'<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
 'send':'<path d="m22 2-7 20-4-9-9-4z"/>',
 'cart':'<circle cx="9" cy="20" r="1.3"/><circle cx="19" cy="20" r="1.3"/><path d="M2 2h3l2.4 12.2a2 2 0 0 0 2 1.6h8.3a2 2 0 0 0 2-1.6L22 6H6"/>',
 'check':'<path d="M20 6 9 17l-5-5"/>',
 'doc':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
 'pay':'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
 'mail':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 6 10 7 10-7"/>',
 'user':'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 'chart':'<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>',
 'alert':'<path d="M12 2 2 20h20z"/><path d="M12 9v5M12 17.5v.5"/>',
 'sync':'<path d="M21 12a9 9 0 1 1-2.6-6.3"/><path d="M21 3v5h-5"/>',
 'fork':'<path d="M7 4v16M7 12h6a4 4 0 0 0 4-4V4"/><circle cx="7" cy="4" r="1.4"/><circle cx="17" cy="4" r="1.4"/><circle cx="7" cy="20" r="1.4"/>',
 'chat':'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
 'star':'<path d="m12 3 2.5 5.8 6.2.5-4.7 4 1.5 6L12 16.8 6.5 19.3 8 13.3 3.3 9.3l6.2-.5z"/>',
 'badge':'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5 11 15l4.5-5"/>',
}
def flow_card(title,tag,steps,cap):
    rows=""
    for i,(ic,b,s) in enumerate(steps,1):
        rows+=('<div class="fstep s'+str(i)+'"><span class="fic"><svg viewBox="0 0 24 24">'+FICON.get(ic,'')+'</svg></span>'
          '<span class="ftx"><b>'+b+'</b><span>'+s+'</span></span>'
          '<span class="fchk"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span></div>')
    return ('<div class="flow reveal"><div class="flow-top"><span class="fdot"></span><span class="ftitle">'+title+'</span><span class="ftag">'+tag+'</span></div>'
      '<div class="flow-steps">'+rows+'</div><span class="cap">'+cap+'</span></div>')
EXMAP={"ai-agents":("chat","An AI agent qualifying a lead in real time"),"automation":("flow","Data flowing through an automated workflow"),
 "custom-crm":("dashboard","A live CRM dashboard we built for clients"),"app-development":("web","An app interface assembling, block by block"),
 "web-design":("web","A premium site building in real time"),"lead-generation":("funnel","Leads moving down a tracked funnel"),
 "seo":("search","Rankings rising as authority compounds"),"content-marketing":("chat","Content engaging an audience"),
 "branding":("web","A brand system coming together"),"graphic-design":("web","Layouts composing on the canvas"),
 "digital-marketing":("funnel","Spend turning into qualified pipeline"),"digital-advertising":("funnel","Ads converting click to customer"),
 "social-media":("chat","A community growing, post by post"),"digital-strategies":("flow","A roadmap connecting every system"),
 "seo-content":("search","Rankings rising as authority compounds"),"marketing-ads":("funnel","Spend turning into qualified pipeline"),"strategy":("flow","A roadmap connecting every system")}

LANGS=[("en","English"),("de","Deutsch"),("ms","Bahasa Melayu"),("ar","العربية"),("zh","中文"),("tr","Türkçe")]
NAV=[("work.html","work"),("services.html","services"),("ventures.html","ventures"),("about.html","about"),("insights.html","insights"),("contact.html","contact")]

# Symmetric mega menu (Attila 2026-07-05): 4/4/3/3 — two full columns, two matched short columns.
MEGA=[("AI &amp; Software",[("ai-agents","AI Agents"),("automation","Automation"),("app-development","App Development"),("custom-crm","Custom CRM")]),
      ("Web &amp; Brand",[("web-design","Web Design"),("branding","Branding &amp; Strategy"),("social-media-automation","Social Media Automation"),("launch-bundle","Launch Bundle")]),
      ("Growth &amp; Trust",[("lead-generation","Lead Gen &amp; Performance"),("seo-content","SEO &amp; Content"),("shariah-audit","Shariah &amp; Halal Audit")]),
      ("Products",[("noonos-p","Noon OS"),("deengen","DeenGen.com"),("niyya","niyya."),("rayhan-kids","Rayhan Kids")])]

ICN={'ai-agents':'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
 'automation':'<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>','custom-crm':'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
 'app-development':'<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>','web-design':'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/>',
 'branding':'<path d="M12 2 2 12l10 10 10-10z"/>','graphic-design':'<circle cx="12" cy="12" r="9"/><path d="M12 3v18"/>','content-marketing':'<path d="M4 5h16M4 10h16M4 15h10"/>',
 'lead-generation':'<path d="M3 4h18l-7 8v6l-4 2v-8z"/>','seo':'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>','digital-marketing':'<path d="M3 17l6-6 4 4 8-8"/>',
 'digital-advertising':'<path d="M3 11l18-7v16L3 13z"/>','social-media':'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.5 10.5l7-3M8.5 13.5l7 3"/>',
 'digital-strategies':'<circle cx="12" cy="12" r="9"/><path d="M12 12l5-3"/>','market-entry':'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>','ventures':'<path d="M12 2 2 12l10 10 10-10z"/>',
 'shariah-audit':'<path d="M12 2l8 4v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6z"/><path d="M9 12l2 2 4-4"/>',
 'social-media-automation':'<circle cx="6" cy="12" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.5 10.5l7-3M8.5 13.5l7 3"/>'}
DESC={'ai-agents':'24/7 agents that sell &amp; support','automation':'Cut overhead, keep output','custom-crm':'The system your team runs on','app-development':'Custom apps, APIs &amp; payments',
 'web-design':'Sites that convert','branding':'Perception is strategy','graphic-design':'Craft in every pixel','content-marketing':'Stories that compound',
 'lead-generation':'A pipeline that compounds','seo':'Found by people &amp; AI','digital-marketing':'Demand, engineered','digital-advertising':'Paid that pays back',
 'social-media':'Presence with purpose','digital-strategies':'The roadmap that aligns it','market-entry':'Enter new markets','ventures':'Own businesses we build'}
ICN['noon-os']='<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'
ICN['launch-bundle']='<path d="M12 2c3 3 4 7 4 10a4 4 0 0 1-8 0c0-3 1-7 4-10z"/><path d="M9 18l-3 3M15 18l3 3"/>'
ICN['seo-content']=ICN['seo']; ICN['marketing-ads']=ICN['digital-marketing']; ICN['strategy']=ICN['digital-strategies']
DESC['noon-os']='Halal-industry CRM &middot; from &euro;19/mo'; DESC['launch-bundle']='Brand + site, the halal way &middot; by application'
DESC['seo-content']='Found by people &amp; AI'; DESC['marketing-ads']='Demand, engineered'; DESC['strategy']='The roadmap that aligns it'
DESC['shariah-audit']='Scholar-led external audit'  # kept to ONE line for menu rhythm (2026-07-05)
DESC['branding']='Identity, positioning &amp; market entry'; DESC['lead-generation']='Outbound, paid &amp; CRO &mdash; one engine'
DESC['social-media-automation']='On-brand content, on autopilot'
def _ic(s): return '<span class="ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'+ICN.get(s,'<path d="M12 2 22 12 12 22 2 12z"/>')+'</svg></span>'
_SPECIAL={'noon-os':'noon-os.html','launch-bundle':'launch-bundle.html','ventures':'ventures.html','market-entry':'service-branding.html','noonos-p':'https://www.noon-os.com','deengen':'https://www.deengen.com','rayhan-kids':'https://www.rayhan-kids.com','niyya':'https://niyya.my'}
ICN['noonos-p']='<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>'
ICN['deengen']='<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'
ICN['rayhan-kids']='<path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L3.8 8.7l5.4-.8z"/>'
DESC['noonos-p']='Run your business from one panel'; DESC['deengen']='Halal crypto intelligence, daily'; DESC['rayhan-kids']='Islamic kids, done beautifully'; DESC['niyya']="The Ummah's own cola"
ICN['niyya']='<path d="M10 2h4M9 5h6l1.5 4c.3.9.5 1.8.5 2.8V19a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-7.2c0-1 .2-1.9.5-2.8z"/>'
PLOGO={
 'niyya':'<svg viewBox="0 0 82 24" xmlns="http://www.w3.org/2000/svg" aria-label="niyya." data-word="1"><text x="1" y="18" font-family="\'Space Grotesk\',\'Manrope\',sans-serif" font-size="18" font-weight="600" letter-spacing=".3" fill="#F6EFE4">niyya<tspan fill="#3E937B" font-style="italic" font-weight="700">.</tspan></text></svg>',
 'noonos-p':'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Noon OS"><defs><linearGradient id="noonM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#10B981"/><stop offset="1" stop-color="#047857"/></linearGradient></defs><rect x="6" y="6" width="88" height="88" rx="24" fill="url(#noonM)"/><path d="M32 38 C 32 80, 68 80, 68 38" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><circle cx="50" cy="27" r="6.5" fill="#fff"/></svg>',
 # inline SVG wordmark (old deengen.com WP image went 404 — self-contained now, 2026-07-05)
 'deengen':'<svg viewBox="0 0 128 20" xmlns="http://www.w3.org/2000/svg" aria-label="DeenGen.com" data-word="1"><text x="0" y="15" font-family="\'IBM Plex Mono\',ui-monospace,Menlo,monospace" font-size="14.5" font-weight="600" letter-spacing="1.2" fill="#4ade9d">DEENGEN<tspan fill="#7d948a" font-size="12" letter-spacing="0.5">.com</tspan></text></svg>',
 'rayhan-kids':'<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-label="Rayhan Kids"><defs><linearGradient id="rayM" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3FBF7F"/><stop offset="1" stop-color="#23895a"/></linearGradient></defs><rect width="100" height="100" rx="26" fill="url(#rayM)"/><path d="M50 26c16 4 26 16 26 30 0 12-10 20-26 20s-26-8-26-20c0-14 10-26 26-30z" fill="#fff"/><path d="M50 30v40" stroke="#23895a" stroke-width="5" stroke-linecap="round"/><path d="M50 47l9-7M50 57l9-7M50 47l-9-7M50 57l-9-7" stroke="#23895a" stroke-width="3.4" stroke-linecap="round"/></svg>'}
def _href(s): return _SPECIAL.get(s, "service-"+s+".html")
def nav():
    SMETA={s[0]:(s[2],s[8],s[3]) for s in SERVICES}
    SMETA['noon-os']=('Noon OS','1551288049-bebda4e38f71','The CRM for the Halal economy')
    SMETA['launch-bundle']=('Launch Bundle','1467232004584-a241de8bcf5d','Everything to go live, by application')
    def mlink(s,label):
        ti,iid,ds=SMETA.get(s,(label,'',''))
        isword=(s in PLOGO and 'data-word' in PLOGO[s])
        icon=('<span class="ic ic-logo'+(' ic-word' if isword else '')+'">'+PLOGO[s]+'</span>') if s in PLOGO else _ic(s)
        txt=('<span class="mw-txt"><span>'+DESC.get(s,'')+'</span></span>') if isword else ('<span><b>'+label+'</b><span>'+DESC.get(s,'')+'</span></span>')
        tgt=' target="_blank" rel="noopener"' if _href(s).startswith('http') else ''
        return '<a class="mega-link'+(' mega-word' if isword else '')+'" href="'+_href(s)+'"'+tgt+' data-title="'+ti+'" data-desc="'+ds+'">'+icon+txt+'</a>'
    def col(g,items): return '<div class="mega-col"><h6>'+g+'</h6>'+"".join(mlink(s,t) for s,t in items)+'</div>'
    cols="".join(col(*g) for g in MEGA)
    prev=('<div class="mega-preview" id="megaPreview"><div class="mp-glow"></div>'
      '<div class="pv"><span class="pk">Start here</span>'
      '<span class="lab">Tell us what&rsquo;s slowing your growth.</span>'
      '<span class="dsc">A free 30-minute teardown &mdash; no pitch, just the map.</span>'
      '<div class="mega-btns"><a class="mb1" href="booking.html">Book a call &rarr;</a><a class="mb2" href="'+WA+'" target="_blank" rel="noopener">WhatsApp</a></div>'
      '<div class="mega-soc">'
      '<a href="'+WA+'" target="_blank" rel="noopener" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.9c0 1.76.46 3.45 1.32 4.95L2 22l5.3-1.39a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.13h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.16 8.16 0 0 1-1.26-4.37c0-4.54 3.7-8.23 8.24-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.69 8.23-8.23 8.23zm4.5-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.48-1.38-1.73-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42l-.48-.01c-.16 0-.43.06-.66.31s-.86.84-.86 2.05c0 1.21.88 2.38 1 2.54.12.17 1.74 2.66 4.22 3.73.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg></a>'
      '<a href="https://www.linkedin.com/company/ummah-collective/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9.5 9H13v1.65h.05c.49-.93 1.7-1.9 3.5-1.9 3.74 0 4.43 2.46 4.43 5.66V21h-4v-5.3c0-1.26-.02-2.89-1.76-2.89-1.76 0-2.03 1.38-2.03 2.8V21h-4z"/></svg></a>'
      '<a href="mailto:info@ummah-collective.com" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 7.5l8.5 5.5 8.5-5.5"/></svg></a>'
      '</div></div></div>')
    mega='<div class="mega"><div class="mega-in">'+cols+prev+'</div></div>'
    sol='<div class="has-mega"><a href="services.html" data-i18n="solutions">Solutions</a>'+mega+'</div>'
    company=('<div class="has-sub"><a href="about.html" data-i18n="company">Company</a><div class="subnav">'
      '<a href="about.html">About</a><a href="ventures.html">Ventures</a><a href="founders-club.html" data-i18n="club">Founders Club</a><a href="insights.html">Insights</a><a href="process.html">How we work</a></div></div>')
    links=sol+'<a href="work.html" data-i18n="work">Work</a>'+company
    langs="".join('<button data-l="'+c+'">'+n+'</button>' for c,n in LANGS)
    return ('<nav id="nav"><div class="nav-in">'+BRAND+'<div class="nav-links">'+links+'</div>'+
      '<div class="nav-cta"><button class="kbd" data-cmdk type="button"><span>Search</span><kbd>&#8984;K</kbd></button>'+
      '<div class="lang" id="lang"><button><span id="langCur">EN</span> &#9662;</button><div class="lang-menu">'+langs+'</div></div>'+
      '<a href="booking.html" class="btn btn-fill" data-i18n="book">Book a call</a><span class="menu-btn" id="menuOpen" data-i18n="menu">Menu</span></div></div></nav>')

def overlay():
    # Compact app-style mobile menu (Attila 2026-07-05): collapsible Solutions groups
    # (icon + label only, no descriptions), Work as flat link, Company grid, sticky CTA.
    def mitem(s,label):
        isword=(s in PLOGO and 'data-word' in PLOGO[s])
        icon=('<span class="ic ic-logo'+(' ic-word' if isword else '')+'">'+PLOGO[s]+'</span>') if s in PLOGO else _ic(s)
        nm=('' if isword else '<b>'+label+'</b>')
        tgt=' target="_blank" rel="noopener"' if _href(s).startswith('http') else ''
        return '<a class="ov-item'+(' ov-word' if isword else '')+'" href="'+_href(s)+'"'+tgt+'>'+icon+'<span class="ov-tx">'+nm+'</span></a>'
    accs="".join('<details class="ov-acc"><summary><span class="ov-h">'+g+'</span><span class="ov-n">'+str(len(items))+'</span><span class="ov-ch">&#9662;</span></summary><div class="ov-items">'+"".join(mitem(s,t) for s,t in items)+'</div></details>' for g,items in MEGA)
    sol='<div class="ov-k" data-i18n="solutions">Solutions</div>'+accs
    work='<a class="ov-big" href="work.html"><span data-i18n="work">Work</span><span class="ov-arrow">&rarr;</span></a>'
    comp=[("about.html","About","about"),("ventures.html","Ventures","ventures"),("founders-club.html","Founders Club","club"),("insights.html","Insights","insights"),("process.html","How we work",""),("contact.html","Contact","contact")]
    compitems="".join('<a class="ov-clink" href="'+u+'"'+((' data-i18n="'+k+'"') if k else '')+'>'+t+'</a>' for u,t,k in comp)
    compsec='<section class="ov-sec" style="margin-top:18px"><div class="ov-k" data-i18n="company">Company</div><div class="ov-comp">'+compitems+'</div></section>'
    cta_card=('<div class="ov-cta"><span class="ov-cta-k">Start here</span>'
      '<span class="ov-cta-h">Tell us what&rsquo;s slowing your growth.</span>'
      '<div class="ov-cta-btns"><a class="btn btn-fill" href="booking.html" data-i18n="book">Book a call</a><a class="btn btn-ghost" href="'+WA+'" target="_blank" rel="noopener">WhatsApp</a></div></div>')
    return f'''<div class="overlay" id="overlay"><div class="ov-top">{BRAND}<span class="ov-close" id="menuClose" aria-label="Close">&#10005;</span></div>
  <div class="ov-body">{sol}{work}{compsec}<div class="ov-ctawrap">{cta_card}</div></div></div>'''

def fab():
    wa='<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-1-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8 0-1.3.7-2 .9-2.2.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.3 0 .5l-.4.6-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.5-.1l.7-.9c.2-.2.4-.2.6-.1l1.8.9c.3.1.4.2.5.3.1.3.1.6-.1 1z"/></svg>'
    cal='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>'
    return f'<div class="fab"><a class="wa" href="{WA}" title="WhatsApp" target="_blank" rel="noopener">{wa}</a><a class="bk" href="booking.html" title="Book a call">{cal}</a></div>'

def footer():
    # Symmetric 5-column footer (Attila 2026-07-04): brand | Services | Products | Company | Connect
    svc="".join(f'<a href="service-{s}.html">{t}</a>' for s,t in [("ai-agents","AI Agents"),("automation","Automation"),("app-development","App Development"),("web-design","Web Design"),("branding","Branding &amp; Strategy"),("lead-generation","Lead Gen &amp; Marketing")])
    return f'''<footer><div class="wrap"><div class="f-grid">
    <div><a href="index.html" class="brand"><img class="logo" src="{LOGO}" alt="Ummah Collective"><span class="wmtext" style="display:none">Ummah Collective</span></a>
      <p style="margin-top:14px;max-width:32ch" data-i18n="ftag">Intelligence, with integrity. An applied-AI studio for the trust economy &mdash; the software, agents and systems modern companies run on.</p></div>
    <div><h6 data-i18n="services">Services</h6>{svc}<a href="services.html" data-i18n="allsol">All solutions &rarr;</a></div>
    <div><h6 data-i18n="products">Products</h6><a href="https://www.noon-os.com" target="_blank" rel="noopener">Noon OS</a><a href="https://www.deengen.com" target="_blank" rel="noopener">DeenGen.com</a><a href="https://www.rayhan-kids.com" target="_blank" rel="noopener">Rayhan Kids</a><a href="https://niyya.my" target="_blank" rel="noopener">niyya.</a><a href="launch-bundle.html">Launch Bundle</a><a href="ventures.html" data-i18n="ventures">Ventures</a></div>
    <div><h6 data-i18n="company">Company</h6><a href="work.html" data-i18n="work">Work</a><a href="about.html" data-i18n="about">About</a><a href="process.html">How we work</a><a href="founders-club.html" data-i18n="club">Founders Club</a><a href="insights.html" data-i18n="insights">Insights</a></div>
    <div><h6 data-i18n="connect">Connect</h6><a href="booking.html" data-i18n="book">Book a call</a><a href="mailto:info@ummah-collective.com" data-i18n="email">Email</a><a href="{WA}" data-i18n="whatsapp">WhatsApp</a><a href="https://www.linkedin.com/company/ummah-collective/">LinkedIn</a><a href="imprint.html" data-i18n="imprint">Legal notice</a><a href="privacy.html" data-i18n="f_privacy">Privacy Policy</a><a href="terms.html" data-i18n="f_terms">Terms of Use</a></div>
  </div><div class="f-bot"><span>&copy; 2026 Ummah Collective Sdn. Bhd.</span><span>Kuala Lumpur &middot; Berlin &middot; Borderless</span></div></div></footer>'''

def absart(cls="art-hero"): return '<div class="abs '+cls+' reveal"></div>'
def page(fname,title,desc,body,aurora="default",bg="",ld=""):
    canon=SITE+"/"+("" if fname=="index.html" else fname)
    html=f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title><meta name="description" content="{desc}"><link rel="canonical" href="{canon}"><meta name="robots" content="index,follow"><link rel="icon" href="favicon.ico" sizes="any"><link rel="icon" type="image/svg+xml" href="favicon.svg"><link rel="apple-touch-icon" href="apple-touch-icon.png"><meta property="og:title" content="{title}"><meta property="og:description" content="{desc}"><meta property="og:type" content="website"><meta property="og:url" content="{canon}"><meta property="og:image" content="{SITE}/og-image.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="Ummah Collective"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{SITE}/og-image.png">{PERF}<link rel="stylesheet" href="uc.css"><script type="application/ld+json">{GLOBAL_LD}</script>{ld}</head>
<body data-aurora="{aurora}" data-fx="{FXMAP.get(aurora,'aurora')}" data-bg="{bg}"><canvas id="gl"></canvas><div class="veil"></div>
{nav()}{overlay()}{fab()}
<main class="page">
{body}
</main>{footer()}{CDN}<script defer src="uc.js"></script></body></html>'''
    open(os.path.join(OUT,fname),"w",encoding="utf-8").write(html); return fname

def phero(crumb,eyebrow,h1,intro,h1key=''):
    h1a=(' data-i18n="'+h1key+'"') if h1key else ''
    return f'''<header class="phero"><div class="lottie-box pmark" data-src="orbit-lottie.json"></div><div class="wrap"><div class="crumb reveal">{crumb}</div>
  <div class="eyebrow reveal"><span class="t"></span><span class="mono">{eyebrow}</span></div>
  <h1 class="reveal"{h1a}>{h1}</h1>{('<p class="reveal">'+intro+'</p>') if intro else ''}</div></header>'''

def cta(big='Build something<br>worth <em>trusting.</em>'):
    _ck={'Build something<br>worth <em>trusting.</em>':'ctah2','Want results<br>like <em>these?</em>':'cta_results','What should we<br>build <em>first?</em>':'cta_first','Work with<br>the <em>studio.</em>':'cta_studio','Be first on<br><em>Noon OS.</em>':'cta_noon','Claim your<br><em>launch slot.</em>':'cta_launch'}.get(big)
    h2a=(' data-i18n="'+_ck+'"') if _ck else ''
    return f'''<section class="cta"><div class="wrap"><div class="eyebrow reveal" style="justify-content:center"><span class="t"></span><span class="mono" data-i18n="letsbuild">Let's build</span></div>
  <h2 class="reveal"{h2a}>{big}</h2><p class="lead reveal" data-i18n="ctalead">Tell us what's slowing your business down. We'll show you the system that fixes it &mdash; and how fast.</p>
  <div class="reveal" style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="booking.html" class="btn btn-fill" data-i18n="book">Book a call</a><a href="contact.html" class="btn btn-ghost" data-i18n="brief">Send a brief</a></div>
  <div class="cta-meta reveal"><div><span data-i18n="email">Email</span><b>info@ummah-collective.com</b></div><div><span data-i18n="lblphone">Phone</span><b>+60 11 3326 2709</b></div><div><span data-i18n="lblstudio">Studio</span><b>Kuala Lumpur &middot; Berlin</b></div></div></div></section>'''

def audit():
    return '''<section><div class="wrap"><div class="audit reveal"><span class="badge" data-i18n="abadge">No-risk front door</span>
  <h2 data-i18n="audith2">Get a <em>free AI audit</em> of your business</h2>
  <p style="margin:0 auto 26px" data-i18n="auditp">A 30-minute teardown: where AI agents, automation and a better site would save you the most time and money. No pitch, just the map.</p>
  <a href="booking.html?service=ai-agents" class="btn btn-fill" data-i18n="audit">Free AI audit</a></div></div></section>'''

# ---------------- SERVICES (14 granular) ----------------
SERVICES=[
 ("ai-agents","01","AI Agents","Agents that work while you sleep",
  "Custom AI agents that talk to customers, qualify leads and run your back office &mdash; 24/7, in any language.",
  [("Customer-service agents","Always-on support that resolves, escalates and books."),("WhatsApp &amp; voice","Conversational commerce on the channels your market uses."),("Internal copilots","Private assistants over your own documents (RAG)."),("Document agents","Automate quotes, invoices and reports.")],
  [("24/7","Coverage"),("&minus;60%","Response time"),("6+","Languages"),("1","Brain")],["Claude","OpenAI","WhatsApp API","Vapi","RAG","n8n"],"1620712943543-bcc4688e7485"),
 ("automation","02","Automation &amp; Workflows","Cut the overhead, keep the output",
  "We connect your tools and remove the manual work between them &mdash; compounding savings on operational and HR expense.",
  [("Process automation","Data entry, hand-offs, approvals, notifications."),("System integrations","CRM, email, calendar, accounting, payments."),("HR &amp; overhead reduction","Your team does only the work humans should."),("Reporting on autopilot","Live dashboards, assembled automatically.")],
  [("&minus;30%","Overhead"),("100s","Hours / yr"),("1","Source of truth"),("0","Copy-paste")],["n8n","Make","Zapier","Supabase","APIs","Claude"],"1518770660439-4636190af475"),
 ("app-development","03","App &amp; Software Development","Custom software, shipped fast",
  "Web and mobile applications with the APIs, integrations and payment rails your product needs.",
  [("Web &amp; mobile apps","Product-grade, end to end."),("API design","Connect to anything; expose your own."),("Payment solutions","Stripe and local rails."),("MVP to scale","Ship sharp, then harden.")],
  [("Days","To working build"),("Secure","By design"),("Scales","MVP up"),("API","First")],["React","Supabase","Stripe","PWA","Cloud","CI/CD"],"1526374965328-7f61d4dc18c5"),
 ("web-design","04","Web Design &amp; Platforms","Sites that are infrastructure",
  "Premium, fast, multilingual websites and platforms engineered for conversion and built to be found.",
  [("Brand &amp; marketing sites","Cinematic sites that convert."),("Landing pages &amp; CRO","Optimised for one outcome."),("Web platforms","Logged-in tools and portals."),("Multilingual &amp; RTL","EN/DE/BM/AR/ZH from day one.")],
  [("Weeks","Brief to live"),("100","Performance"),("6+","Languages"),("&infin;","Scales")],["Next.js","Vercel","Headless CMS","WordPress","SEO","Analytics"],"1481487196290-c152efe083f5"),
 ("branding","05","Branding &amp; Strategy","Perception is strategy",
  "Premium positioning, a coherent identity and the strategic roadmap that aligns brand, web, content and growth &mdash; then takes you into new markets across SEA, Europe and the Gulf.",
  [("Brand strategy","Positioning and the narrative everything else hangs on."),("Visual identity","Logo, type, colour &mdash; a system, with guidelines that scale."),("Messaging","A voice that sounds intentional, in every language you sell in."),("Audit &amp; roadmap","Where to invest first &mdash; a phased plan, not a slide deck."),("Market entry","Research, GTM and warm intros across SEA, Europe and the Gulf."),("Ongoing advisory","Senior guidance as the brand and the plan evolve.")],
  [("Premium","Perception"),("Aligned","One system"),("3","Regions"),("Sharp","Not generic")],["Figma","Tokens","Research","GTM frameworks","Roadmaps","Naming"],"1561070791-2526d30994b5"),
 ("social-media-automation","06","Social Media Automation Flow","Content that runs itself",
  "A brand template system, an AI content engine and publishing automation &mdash; on-brand social content produced, approved and posted on autopilot, with a performance loop that makes every week smarter.",
  [("Brand template system","A designed kit &mdash; layouts, colours, type &mdash; so every post is unmistakably yours."),("AI content engine","Posts drafted in your voice and rendered as finished visuals, at cadence."),("Publishing automation","Approve in chat; scheduled and posted to every network at the right time."),("Performance loop","Results read weekly &mdash; winners scaled, templates updated, the flow learns.")],
  [("Daily","Cadence, no burnout"),("On-brand","Every single post"),("Hands-free","Approve &amp; forget"),("Smarter","Every week")],["Claude","Figma / Canva","Templates","Scheduler","Analytics","WhatsApp approvals"],"1626785774573-4b799315345d"),
 ("lead-generation","07","Lead Generation &amp; Performance Marketing","A pipeline that compounds",
  "One growth engine &mdash; outbound, paid media, funnels and CRO &mdash; that finds, warms and converts the right buyers, instrumented end to end and measured to the ringgit and euro.",
  [("Outbound systems","Human-sounding cold email &amp; LinkedIn, researched and personalised."),("Paid media","Google, Meta &amp; TikTok &mdash; built around ROI, not reach."),("Landing &amp; funnels","Mapped to each campaign, optimised for one outcome."),("Conversion optimisation","Lift the numbers that move revenue."),("Lifecycle &amp; nurture","Email &amp; WhatsApp sequences to booked calls."),("Analytics &amp; attribution","Server-side tracking &mdash; every touch measured.")],
  [("Qualified","Not noise"),("ROI","Led, not reach"),("Tracked","Server-side"),("Lower","CAC")],["Instantly","Clay","Google Ads","Meta","GA4","CRM"],"1460925895917-afdab827c52f"),
 ("seo-content","08","SEO &amp; Content","Be found by people and AI",
  "Technical SEO and a content engine so you rank in Google, surface in AI answers, and build authority that compounds &mdash; durable visibility, not rented clicks.",
  [("Technical SEO","Architecture, speed, schema."),("Content engine","AI-assisted, human-edited, at cadence."),("GEO / answer-engine","Surface in ChatGPT, Perplexity, Google AI."),("Distribution","Repurposed across every channel.")],
  [("Organic","Compounding"),("Authority","Built, not bought"),("Multi","Format"),("Durable","Not rented")],["Search Console","SEMrush","Schema","Claude / GPT","Analytics","GEO"],"1432888622747-4eb9a8efeb07"),
 ("shariah-audit","09","Shariah Compliance &amp; Halal Audit","Know exactly where you stand",
  "An external, scholar-led audit of your Islamic finance, halal status and Shariah compliance &mdash; a clear picture of your status quo before you enter the Muslim market or apply for certification.",
  [("Status-quo audit","Products, finance, operations and marketing &mdash; reviewed against Shariah principles and halal requirements."),("Gap analysis &amp; report","A documented picture of what complies, what doesn&rsquo;t, and what it takes to close the gap."),("Certification readiness","Documentation and processes in order before you apply to official halal-certification bodies."),("Muslim-market confidence","Enter the Muslim target group with positioning and claims you can stand behind.")],
  [("Clarity","On your status quo"),("Scholar-led","Not a checkbox"),("Ready","For official bodies"),("Trusted","By the market")],["Scholar review","Islamic finance","Halal standards","Gap analysis","Audit report","Roadmap"],"1554224155-6726b3ff858f"),
]

def service_page(slug,num,title,eyebrow,intro,deliver,outcomes,tools,imgid):
    crumb='<a href="index.html">Home</a> / <a href="services.html">Services</a> / '+title
    if slug=='ai-agents':
        deliver=[("Sales &amp; SDR agents","Inbound leads qualified and meetings booked, 24/7."),("Outbound agents","Accounts researched, outreach personalised, follow-ups run."),("Customer-support agents","Tickets resolved and escalated &mdash; in any language."),("WhatsApp &amp; commerce agents","Conversational selling on the channels your market uses."),("HR &amp; ops agents","HR and back-office overhead, cut."),("Document &amp; back-office agents","Quotes, invoices and reports, automated.")]
        outcomes=[("24/7","Replies faster than humans"),("0","Never lose a deal"),("100%","Every lead followed up"),("&uarr;","Up- &amp; cross-sells"),("&minus;40%","Lower HR cost"),("6+","Speaks every language")]
    deliv="".join(f'<li><span class="i">{i:02d}</span><div><b>{b}</b><p>{p}</p></div></li>' for i,(b,p) in enumerate(deliver,1))
    cards="".join(f'<div class="card reveal"><div class="no">{n}</div><h3>{k}</h3></div>' for n,k in outcomes)
    tg="".join(f'<i>{t}</i>' for t in tools)
    i=[s for s,*_ in SERVICES].index(slug); rel=[SERVICES[(i+1)%len(SERVICES)],SERVICES[(i+2)%len(SERVICES)]]
    rels="".join(f'<a class="idx-row" href="service-{r[0]}.html"><span class="no">{r[1]}</span><span class="ti">{r[2]}</span><span class="de">{r[4]}</span><span class="go">&rarr;</span></a>' for r in rel)
    exk,exc=EXMAP.get(slug,("dashboard","A system we built, in action"))
    exsec='<section style="padding-top:0"><div class="wrap"><div class="explain-row'+(' rev' if i%2 else '')+'"><div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">In action</span></div><h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:14px">See it work</h2><p>'+exc+'.</p><div style="margin-top:20px"><a href="booking.html?service='+slug+'" class="btn btn-fill" data-i18n="book">Book a call</a></div></div>'+explain(exk,exc)+'</div></div></section>'
    aix=''
    if slug=='ai-agents':
        d1=agent_chat('Sales agent &middot; WhatsApp','Closing a complex export order',[('a','Assalamualaikum &#128075; I need 5,000 units of your halal serum in Jeddah before Ramadan &mdash; MYR pricing + export docs. Possible?'),('u','Wa alaikum salam. Checking stock, JAKIM cert &amp; Jeddah lead-time&hellip;'),('u','&#9989; 5,000 confirmed &mdash; MYR 142,500, SFDA labels + export docs in. Ships in 3 weeks.'),('a','Perfect. Split &mdash; 3,000 now, 2,000 in March?'),('typing',''),('u','Done &mdash; drafted a 2-shipment contract, reserved stock &amp; booked our export lead for Thu 11am KSA &#128196;')])
        d2=agent_chat('Outbound agent &middot; Email','Booking a meeting from a cold open',[('u','Hi Sarah &mdash; saw your brand just launched in Dubai. We helped 3 halal brands localise for the Gulf in under 6 weeks. Worth 15 min?'),('a','Maybe&hellip; what&rsquo;s the catch?'),('u','No catch &mdash; fixed scope, you own everything we build. Free teardown of your funnel?'),('a','Go on then. Thursday?'),('typing',''),('u','Booked Thu 2pm + sent a 1-page plan tailored to your brand &#9989;')])
        d3=agent_chat('Support agent &middot; WhatsApp','Resolving a hard ticket on its own',[('a','Order #4821 says delivered but I got nothing &#128545;'),('u','So sorry &mdash; pulling the courier scan &amp; GPS now&hellip;'),('u','Found it: misdelivered 2 streets over. Replacement dispatched (free express) + shipping refunded &#9989;'),('a','Oh wow &mdash; thank you!'),('typing',''),('u','Anytime &#128591; Logged the address error so it can&rsquo;t happen again.')])
        d4=agent_chat('HR agent &middot; WhatsApp','Screening &amp; scheduling a candidate',[('a','Salam, I applied for the marketing role &mdash; any update? And is remote possible?'),('u','Salam Yusuf! You&rsquo;re shortlisted &#127881; Checking the calendar&hellip;'),('u','Remote: hybrid, 2 days/wk in KL. Interview booked Tue 10am with Aisha &mdash; invite + prep guide sent.'),('a','That&rsquo;s perfect, thank you!'),('typing',''),('u','Onboarding pack will be ready the moment you sign &#128203;')])
        exsec=('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:64ch"><div class="eyebrow"><span class="t"></span><span class="mono">In action</span></div>'
          '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">See them work</h2>'
          '<p>Four agents, four hard jobs &mdash; sales, outbound, support and HR &mdash; each running the conversation and updating your systems, in any language.</p></div>'
          '<div class="grid g2" style="gap:18px;margin-top:24px">'+d1+d2+d3+d4+'</div></div></section>')
        _ag=[("01","Sales &amp; SDR agent","Qualifies inbound leads, answers questions and books meetings on autopilot &mdash; web, WhatsApp and email."),
             ("02","Outbound agent","Researches accounts, personalises every message and runs the follow-ups until a real conversation starts."),
             ("03","Customer-support agent","Resolves tickets, escalates the hard ones and never sleeps &mdash; in any language, with &minus;60% response time."),
             ("04","WhatsApp commerce agent","Sells, takes orders and answers on the channel your market actually uses &mdash; conversational checkout."),
             ("05","HR &amp; ops agent","Cuts HR and back-office overhead: screens applicants, onboards staff and answers internal questions, 24/7."),
             ("06","Back-office &amp; document agent","Generates quotes, invoices and reports, then pushes them into your systems &mdash; quote-to-cash, automated.")]
        agc="".join('<div class="card reveal"><div class="no">'+n+'</div><h3>'+t+'</h3><p>'+d+'</p></div>' for n,t,d in _ag)
        _st=[("01","Discover","We map the workflow, the data and the hand-offs."),
             ("02","Build &amp; train","Built on your stack, grounded on your own docs (RAG) &mdash; it speaks in your voice."),
             ("03","Deploy","Live on your channels, with clean human hand-off where it matters."),
             ("04","Improve","We monitor, measure and tune &mdash; it gets better every week.")]
        stc="".join('<div class="card reveal"><div class="no">'+n+'</div><h3>'+t+'</h3><p>'+d+'</p></div>' for n,t,d in _st)
        _fq=[("Will it sound like us?","Yes &mdash; trained on your tone, documents and rules. It speaks in your brand voice, not a generic bot."),
             ("Is our data safe?","Your data stays yours. Private deployments, no training on your data, and EU/region hosting on request."),
             ("Which languages does it speak?","6+ out of the box &mdash; including Arabic, Malay, German and English &mdash; switching mid-conversation."),
             ("What can it plug into?","WhatsApp, web chat, voice, your CRM, calendar, email, payments and internal tools."),
             ("Does a human stay in the loop?","Always &mdash; the agent escalates edge cases and hands off cleanly to your team."),
             ("How fast can it go live?","A first working agent in weeks, not quarters &mdash; then we harden and expand.")]
        fqc="".join('<details class="reveal"><summary>'+q+'<span class="pl">+</span></summary><p>'+a+'</p></details>' for q,a in _fq)
        aix=('<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Agents we build</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">More than chatbots</span></div></div><div class="grid g3" style="gap:16px">'+agc+'</div></div></section>'
          '<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">How it works</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Idea to live in weeks</span></div></div><div class="grid g4" style="gap:14px">'+stc+'</div></div></section>'
          '<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">AI agents, answered</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">FAQ</span></div></div><div class="faq">'+fqc+'</div></div></section>')
    if slug=='automation':
        F=[
         ("Lead &rarr; Deal autopilot","Sales",[('bolt','New lead in','Web form &middot; WhatsApp'),('ai','AI qualifies &amp; scores','Intent, fit &amp; budget'),('crm','Enrich + add to CRM','Company data, owner set'),('cal','Book the meeting','Calendar invite sent'),('send','Recap + next steps','Summary to the rep')],'From stranger to booked meeting, hands-free'),
         ("Order-to-cash","Commerce",[('cart','Order received','Store &middot; WhatsApp'),('check','Stock &amp; price check','Live availability'),('doc','Quote &amp; invoice','Generated and sent'),('pay','Payment link','Paid securely'),('badge','Accounting + fulfilment','Receipt + dispatch')],'Every order closed, billed and dispatched'),
         ("Invoice intake &amp; books","Finance",[('mail','Invoice email in','Inbox watched 24/7'),('ai','AI extracts the data','Amounts, dates &amp; VAT'),('check','Match the PO','3-way match'),('badge','Approval','Routed to the owner'),('chart','Post + schedule pay','Straight into accounting')],'Bookkeeping that does itself'),
         ("Recruiting on autopilot","HR",[('user','Application in','Careers page'),('ai','AI screens the CV','Skills vs the role'),('star','Score &amp; shortlist','Ranked by fit'),('cal','Auto-schedule','Interview + prep pack'),('badge','Onboarding tasks','Created on hire')],'Hire faster, without the HR hours'),
         ("Support deflection","Support",[('chat','Ticket in','Email &middot; WhatsApp'),('ai','Classify intent','Priority &amp; topic'),('doc','Answer from your docs','RAG, in-language'),('fork','Resolve or escalate','Clean hand-off'),('badge','Log + CSAT','Measured &amp; improved')],'Most tickets solved before a human sees them'),
         ("Reporting on autopilot","Analytics",[('sync','Nightly data pull','CRM, ads &amp; payments'),('ai','AI summarises','What moved &amp; why'),('chart','Dashboard assembled','Live KPIs'),('alert','Anomalies flagged','Alerts raised'),('send','Digest sent','WhatsApp &middot; email')],'Your numbers, explained, every morning'),
        ]
        fcards="".join(flow_card(*f) for f in F)
        exsec=('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:66ch"><div class="eyebrow"><span class="t"></span><span class="mono">In action</span></div>'
          '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">Automations we build</h2>'
          '<p>Six real workflows our agents run end-to-end &mdash; triggered, decided and completed without you lifting a finger.</p></div>'
          '<div class="grid g3 flowgrid" style="gap:16px;margin-top:26px">'+fcards+'</div></div></section>')
    SCMAP={
     'app-development':('Recent builds','Apps &amp; software we have shipped','Real platforms, tools and apps &mdash; built, deployed and in daily use.',['noonos','arju','shoraka','asyraf-takaful','matchakoeln','dolezel']),
     'web-design':('Recent sites','Websites we have built','Premium, multilingual sites &mdash; shipped, deployed and live.',['dolezel','matchakoeln','anaaka','asyraf-takaful','dig-it-company','almaruf']),
     'branding':('Selected work','Identity &amp; brand systems','Brands built from zero to category leader.',['anaaka','jugendberufsagentur','shoraka','matchakoeln','arju','dig-it-company']),
     'social-media-automation':('Selected work','Design that feeds the flow','The craft behind the automation &mdash; brands, layouts and visual systems that ship.',['jugendberufsagentur','anaaka','asyraf-takaful','matchakoeln','dolezel','arju']),
    }
    if slug in SCMAP:
        _eb,_hd,_in,_sl=SCMAP[slug]; exsec=showcase(_eb,_hd,_in,_sl)
    elif slug in ('lead-generation','seo-content'):
        _dm=fdemo_funnel(exc) if slug=='lead-generation' else fdemo_rank(exc)
        exsec='<section style="padding-top:0"><div class="wrap"><div class="explain-row'+(' rev' if i%2 else '')+'"><div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">In action</span></div><h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:14px">See it work</h2><p>'+exc+'.</p><div style="margin-top:20px"><a href="booking.html?service='+slug+'" class="btn btn-fill" data-i18n="book">Book a call</a></div></div>'+_dm+'</div></div></section>'
    if slug=='lead-generation': aix=leadgen_extra()+ad_platforms()  # fused page: outbound engine + paid platforms (2026-07-04 merge)
    if slug=='branding': aix=strategy_extra()  # fused page: brand + strategy/market-entry (2026-07-04 merge)
    if slug=='social-media-automation':
        F=[("Content engine","Create",[('ai','AI drafts on-brand','Your templates + voice'),('doc','Design auto-rendered','Artboards &rarr; assets'),('check','Human approves','One tap, in chat'),('cal','Scheduled','Best time per network'),('send','Published','IG &middot; LinkedIn &middot; TikTok')],'From idea to published post, hands-free'),
           ("Calendar on autopilot","Plan",[('sync','Content calendar','Themes &amp; campaigns'),('ai','Posts generated','Copy + visual, per channel'),('badge','Brand-checked','Colours, fonts, tone'),('cal','Queue filled','Weeks ahead'),('alert','Gaps flagged','Never miss a slot')],'A month of content in one sitting'),
           ("Performance loop","Learn",[('chart','Results pulled','Reach, clicks, saves'),('ai','AI reads patterns','What worked &amp; why'),('star','Winners scaled','More of what converts'),('doc','Templates updated','The system learns'),('send','Weekly digest','To your WhatsApp')],'Every post makes the next one smarter')]
        fcards="".join(flow_card(*f) for f in F)
        aix=('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:66ch"><div class="eyebrow"><span class="t"></span><span class="mono">The flow</span></div>'
          '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">Three loops, one machine</h2>'
          '<p>Create, plan, learn &mdash; the full social pipeline running end-to-end, with you approving from your phone.</p></div>'
          '<div class="grid g3 flowgrid" style="gap:16px;margin-top:26px">'+fcards+'</div></div></section>')
    if slug=='shariah-audit':
        exsec=('<section style="padding-top:0"><div class="wrap"><div class="advband reveal">'
          '<img class="advphoto" src="'+LAWAL_IMG+'" alt="Ustadh Dr. Muhammad Lawal" loading="lazy">'
          '<div><div class="eyebrow"><span class="t"></span><span class="mono">Who leads it</span></div>'
          '<h2 style="margin-top:10px">An audit with a<br>scholar behind it.</h2>'
          '<p style="color:var(--dim);margin-top:14px"><strong>Ustadh Dr. Muhammad Lawal</strong> &mdash; Shariah Compliance &amp; Halal Consultant at Ummah Collective &mdash; leads every engagement. '+LAWAL_BIO+'</p>'
          '<p style="color:var(--dim);margin-top:12px">That matters, because a compliance answer is only as strong as the person who signs it. This is not a checklist exercise &mdash; it is an independent, scholar-led review.</p>'
          '<div class="advchips"><span>INCEIF &middot; Islamic Finance</span><span>Digital-asset research</span><span>Zakat Selangor &middot; Operations</span></div></div>'
          '</div></div></section>')
        _sc=[("01","Islamic finance","Funding, financing and revenue structures reviewed against Shariah principles &mdash; riba, gharar and contract form."),
             ("02","Halal status","Products, ingredients and processes &mdash; where you already meet halal requirements, and where you don&rsquo;t yet."),
             ("03","Operations &amp; supply chain","Sourcing, handling and logistics &mdash; the points where halal integrity is usually won or lost."),
             ("04","Marketing &amp; claims","What you say to the Muslim market &mdash; the claims you can back, and the ones to fix before they cost trust."),
             ("05","Documentation","The paper trail official certification bodies will ask for &mdash; assembled and audit-ready."),
             ("06","Governance","Policies and internal ownership, so compliance holds long after the audit is done.")]
        scc="".join('<div class="card reveal"><div class="no">'+n+'</div><h3>'+t+'</h3><p>'+d+'</p></div>' for n,t,d in _sc)
        _st=[("01","Scope","We map your products, structures and markets &mdash; and agree exactly what the audit covers."),
             ("02","Review","Scholar-led examination of finance, halal status and Shariah compliance across the business."),
             ("03","Report","A documented status quo: what complies, what doesn&rsquo;t, and the gap analysis in between."),
             ("04","Roadmap","Practical steps to certification readiness and a Muslim-market entry you can defend.")]
        stc="".join('<div class="card reveal"><div class="no">'+n+'</div><h3 style="margin-top:8px">'+t+'</h3><p>'+d+'</p></div>' for n,t,d in _st)
        _fq=[("Do you issue halal certificates?","No &mdash; certification comes from official bodies. Our external audit tells you where you stand and puts your documentation and processes in order so you can apply with confidence."),
             ("Who conducts the audit?","Ustadh Dr. Muhammad Lawal, our Shariah Compliance &amp; Halal Consultant &mdash; trained in Islamic finance at INCEIF University, with research on cryptocurrencies and operational work for Zakat Selangor."),
             ("Who is this for?","Companies entering the Muslim target group, brands preparing a halal-certification application, and businesses that want independent confirmation of their Islamic-finance arrangements."),
             ("What do we receive?","A documented status-quo assessment, a gap analysis, and a practical roadmap &mdash; evidence you can put in front of certification bodies, partners and investors."),
             ("Does it cover digital assets?","Yes &mdash; Shariah questions around cryptocurrencies and digital assets are a research focus of our consultant.")]
        fqc="".join('<details class="reveal"><summary>'+q+'<span class="pl">+</span></summary><p>'+a+'</p></details>' for q,a in _fq)
        aix=('<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What the audit examines</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Six lenses</span></div></div><div class="grid g3" style="gap:16px">'+scc+'</div></div></section>'
          '<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">How it works</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Four steps to clarity</span></div></div><div class="grid g4" style="gap:14px">'+stc+'</div></div></section>'
          '<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Straight answers</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">FAQ</span></div></div><div class="faq">'+fqc+'</div></div></section>')
    depth=depth_section(slug)
    body=phero(crumb,f"Service / {eyebrow}",title,intro)+f'''
<section style="padding-top:20px"><div class="wrap"><div class="grid g2" style="align-items:start">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">What we deliver</span></div><ul class="dlist">{deliv}</ul>
    <div style="margin-top:22px"><div class="eyebrow"><span class="t"></span><span class="mono">Stack</span></div><div class="tg" style="display:flex;flex-wrap:wrap;gap:7px">{tg}</div></div>
    <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap"><a href="booking.html?service={slug}" class="btn btn-fill" data-i18n="book">Book a call</a><a href="contact.html" class="btn btn-ghost" data-i18n="brief">Send a brief</a></div></div>
  <div class="grid g2 reveal" style="gap:14px">{cards}</div>
</div></div></section>
{exsec}
{aix}
{depth}
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Related services</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">One roof</span></div></div><div class="idx reveal">{rels}</div></div></section>
'''+audit()+cta()
    _SEOT={'ai-agents':'AI Automation Agency — Done-for-You AI Agents & WhatsApp AI','web-design':'Web Design Agency Kuala Lumpur — Premium Multilingual Websites','lead-generation':'Lead Generation & Growth for Halal-Certified Brands','automation':'Business Process Automation — Cut Overhead, Keep Output','custom-crm':'Custom CRM Development Malaysia — Systems You Own','app-development':'App & Software Development — Shariah-Compliant by Design'}
    _SEOD={'ai-agents':'Done-for-you AI agents and WhatsApp automation that sell and support 24/7. An applied-AI automation agency serving Malaysia, Europe, the Gulf and the US.','web-design':'Premium web design from Kuala Lumpur: conversion-focused, multilingual (EN/BM/DE/AR) websites for modern and halal businesses. European standards, local fluency.','lead-generation':'Outbound, paid and CRO in one engine — including growth marketing for halal-certified brands entering Malaysia, Europe and the US.','custom-crm':'Custom CRM development in Malaysia: your workflow, WhatsApp-native, and you own the system. From audit to daily-driver.','app-development':'Custom apps, APIs and payment systems — including shariah-compliant software development for islamic fintech and halal-economy startups.'}
    sld=_ld({"@context":"https://schema.org","@type":"Service","name":_plain(title),"description":_plain(intro),"serviceType":_plain(title),"provider":{"@id":SITE+"/#org"},"areaServed":["MY","DE","AE","SA","SG"],"url":SITE+"/service-"+slug+".html"})
    return page(f"service-{slug}.html",_SEOT.get(slug,title)+" — Ummah Collective",_SEOD.get(slug,intro.replace('&mdash;','-')[:150]),body,aurora="services",ld=sld)

# ---------------- PROJECTS ----------------
RU='https://ummah-collective.com/wp-content/uploads/'
PROJECTS=[
 ("anaaka","ANAAKA","Brand &middot; Commerce &middot; Market Entry","2023&ndash;24","Halal skincare built from zero Malaysian presence to category leader.",["Full ecosystem: brand, store, tracking","18.45% revenue from organic search","Flagship store @ TRX, Kuala Lumpur"],"https://anaaka.com.my","/assets/anaaka-portfolio.png"),
 ("matchakoeln","Matcha Köln","Web &middot; 7 Languages","2026","Premium multilingual redesign with a booking wizard.",["7 languages incl. AR-RTL","Booking wizard + commerce","Cinematic premium build"],None,U("1536256263959-770b48d82b0a")),
 ("arju","ARJU","Platform &middot; Learning","2026","A Netflix-style Islamic learning platform with strategy blueprint.",["10-page multilingual prototype","Course + creator architecture","Strategy blueprint"],None,U("1769428197774-2dfdffe4a723")),
 ("dolezel","Dolezel","Redesign &middot; Germany","2026","A 40-year Munich security Meisterbetrieb &mdash; rebuilt bold and modern, with an online shop.","8 pages + online shop,Bold Modern system,Live on Vercel".split(","),"https://dolezel-de.vercel.app",U("1487014679447-9f8336841d58")),
 ("almaruf","Almaruf Maid","Web &middot; CRM &middot; Malaysia","2026","Website rebuild in four languages + custom CRM for Kuala Lumpur's trusted maid agency.",["7 pages &middot; 4 languages","Custom CRM built for the business","Staged on Vercel"],"https://almaruf-maid.vercel.app",U("1581578731548-c64695cc6952")),
 ("asyraf-takaful","Asyraf Takaful","Web &middot; Finance","2026","A trilingual, BM-first home for a Zurich Takaful specialist &mdash; booking wizard and live calculators included.",["BM / EN / AR-RTL","Booking wizard + 4 calculators","Staged on Vercel"],"https://asyraf-takaful.vercel.app",U("1450101499163-c8848c66ca85")),
 ("dig-it-company","Dig it! Company","Web &middot; Trilingual","2026","A survey-blueprint redesign for a Bavarian field-archaeology firm &mdash; bold, angular, trilingual.",["DE / EN / AR-RTL","Feldplan design system","70-project archive"],"https://dig-it-companyv2.vercel.app",U("1599580546666-fd8b9b6f3f8f")),
 ("b-plus-ag","B Plus AG","Web &middot; Engineering","2024","Website, recruiting hub and campaigns for a Berlin engineering firm.",["Corporate website","Recruiting hub + campaigns","Live at b-plus-ag.de"],"https://b-plus-ag.de",RU+"2024/04/handy-digital-4.png"),
 ("jugendberufsagentur","Jugendberufsagentur Brandenburg","Public Sector &middot; Brand &amp; Web","2022&ndash;now","One brand, one website and the ongoing operation for three Jugendberufsagenturen in Brandenburg.",["Branding &amp; CI + website","3 agencies, one home","Ongoing management &amp; comms"],"https://www.meinejbainbrandenburg.de",RU+"2024/04/Jugendberufsagentur-Brandenburg-3.png"),
 ("shoraka","Shoraka Group","Fintech &middot; Web &amp; UX","2023&ndash;26","The digital home of a Shariah-compliant fintech group &mdash; UX-documented, benchmarked to global fintechs, live at shorakagroup.com.",["Live at shorakagroup.com","6 platforms, one home","UX &middot; UI &middot; SEO &amp; analytics"],"https://shorakagroup.com",U("1611974789855-9c2a0a7236a3")),
 ("optima","Optima Limited","Fintech &middot; Digital Factoring","2022","The digital home of an ethical SME-financing platform &mdash; brand, CI, UX, UI, web and SEO, built from scratch.",["Brand &amp; CI from zero","UX &middot; UI &middot; SEO","Live at optima-limited.com"],"https://optima-limited.com",U("1460925895917-afdab827c52f")),
 ("ar-city-media","AR City Media","Heritage &middot; Berlin","2014&ndash;22","The founder's Berlin agency &mdash; ethno-marketing and full service, from BARMER to IHK Dresden.",["Ethno-Marketing &amp; Full Service","Eurogida &middot; BARMER &middot; IHK Dresden","The roots of UC"],"https://www.arcitymedia.de",U("1492691527719-9d1e07e534b4")),
 ("noonos","Noon OS","Venture &middot; Halal-Industry CRM","2026","UC's flagship product &mdash; a halal-industry CRM and operating system for Muslim-aligned brands to run sales, delivery and growth in one place.",["Product / SaaS","CRM &amp; operations","Flagship venture"],"noon-os.html",U("1460925895917-afdab827c52f")),
 ("faircharity","Faircharity e.V.","Web &middot; Non-profit","2026","Website, donation gateway and UX for a German charity reforming how giving works.",["Website + donation gateway","UX/UI &amp; SEO","Live at faircharity.de"],"https://faircharity.de",U("1488521787991-ed7bbaae773c")),
 ("kamar-halal","Kamar Halal","F&amp;B &middot; Web &amp; Halal Consulting","","Website, UI/UX and halal-certificate consulting for the &lsquo;Halal made in Germany&rsquo; family producer.",["Website &middot; UI/UX","Halal-certificate consulting","DE / EN / TR"],"https://www.kamar-halal.de/en/",U("1529692236671-f1f6cf9683ba")),
 ("eurogida","Eurogida","Retail &middot; Web &amp; Ops","2020&ndash;now","The digital home of Berlin&rsquo;s Turkish-market grocer &mdash; website, design, UX/UI and six years of continuous management.",["Website &middot; Design &middot; UX/UI","14 Berlin stores","6 years of management"],"https://www.eurogida.de",U("1581006852262-e4307cf6283a")),
]
# Work-grid display order (Attila 2026-07-04): most impressive first — verified results &
# scale open, prototypes later, heritage closes. Edit THIS list to reorder; tuples stay put.
_ORDER=['anaaka','shoraka','noonos','eurogida','jugendberufsagentur','matchakoeln','optima',
 'kamar-halal','faircharity','b-plus-ag','dolezel','arju','asyraf-takaful','dig-it-company',
 'almaruf','ar-city-media']
PROJECTS=sorted(PROJECTS,key=lambda p:_ORDER.index(p[0]) if p[0] in _ORDER else 99)

import urllib.parse as _up
def _ms(u,w=1280): return 'https://s0.wp.com/mshots/v1/'+_up.quote(u,safe='')+'?w='+str(w)
# Live-site screenshots via WordPress mShots for the publicly reachable client sites.
# NOTE: dig-it-companyv2, webuildai, enrichment are behind Vercel deployment-protection
# (login wall) so a public screenshot service can't reach them. Lift protection (or set a public
# alias) and add their production URLs here to get real live screenshots automatically.
# dolezel-de.vercel.app is PUBLIC (verified 2026-07-03) — screenshots work directly.
THUMB={
 # RULE (Attila 2026-07-03): tiles are ALWAYS website screenshots. Live client site → mShots direct.
 # No clean external capture (geo popups: anaaka) or no live site yet (arju) → static "thumb page"
 # in this repo recreating the site's top fold (anaaka-thumb.html / arju-thumb.html) → mShots that.
 'anaaka':_ms('https://ummah-collective-site.vercel.app/anaaka-thumb.html?uc=1'),
 'matchakoeln':_ms('https://matchakoeln.de'),
 'arju':_ms('https://ummah-collective-site.vercel.app/arju-thumb.html?uc=1'),
 'dolezel':_ms('https://dolezel-de.vercel.app/?uc=1'),  # OUR redesign, not the old dolezel.de
 'dig-it-company':_ms('https://dig-it-companyv2.vercel.app/?uc=1'),  # clean project domain is PUBLIC (deployment-specific URL was login-walled)
 'almaruf':_ms('https://almaruf-maid.vercel.app/?uc=1'),
 'asyraf-takaful':_ms('https://asyraf-takaful.vercel.app/?uc=1'),
 'shoraka':'https://bcxwrqdfebdogglkypof.supabase.co/functions/v1/uc-img?id=shorakathumb&v=2',  # static capture 2026-07-06 — mShots hangs on shorakagroup.com
 'b-plus-ag':_ms('https://b-plus-ag.de?uc=1'),
 'jugendberufsagentur':_ms('https://www.meinejbainbrandenburg.de?uc=1'),
 'optima':_ms('https://optima-limited.com?uc=1'),
 'faircharity':_ms('https://faircharity.de?uc=1'),
 'noonos':_ms('https://www.noon-os.com?uc=1'),
 'ar-city-media':_ms('https://www.arcitymedia.de'),
 # eurogida.de homepage hero is a <video> that breaks in mShots (media-error overlay) →
 # capture the Filialen page instead: clean Berlin map + red store-pin grid, unmistakably them.
 'eurogida':_ms('https://www.eurogida.de/filialen/?uc=1'),
 'kamar-halal':_ms('https://www.kamar-halal.de/en/?uc=1'),  # clean capture verified 2026-07-04 (no popup)
}
LOGOIMG={}  # empty since 2026-07-04 — every visible tile now has a real screenshot
def _thumb(s,im): return THUMB.get(s,im)
def _tile(s,n,c,y,b,im,v=''):
    if s in LOGOIMG:
        inner='<div class="ph logo-ph"><img class="tlogo" src="'+LOGOIMG[s]+'" alt="'+n+'" loading="eager" decoding="async"></div>'
    else:
        inner='<div class="ph"><img src="'+_thumb(s,im)+'" alt="'+n+'" loading="lazy"></div>'
    return ('<a class="tile reveal '+v+'" href="project-'+s+'.html">'+inner+
            '<div class="meta"><div class="top"><span class="cat">'+c+'</span></div>'  # no dates on tiles (Attila 2026-07-04)
            '<div><div class="nm">'+n+'</div><div class="res">'+b+'</div></div></div></a>')
PBY={p[0]:p for p in PROJECTS}
def ptile(slug,v=''):
    s,n,c,y,b,sc,url,im=PBY[slug]; return _tile(s,n,c,y,b,im,v)
def showcase(eyebrow,head,intro,slugs):
    grid="".join(ptile(s) for s in slugs if s in PBY)
    return ('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:64ch"><div class="eyebrow"><span class="t"></span><span class="mono">'+eyebrow+'</span></div>'
      '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">'+head+'</h2><p>'+intro+'</p></div>'
      '<div class="grid g3" style="gap:16px;margin-top:24px">'+grid+'</div></div></section>')
def _ltop(ttl,liv):
    return ('<div class="lp-top"><span class="ld"></span><span class="ld"></span><span class="ld"></span>'
      '<span class="lp-ttl">'+ttl+'</span><span class="lp-liv"><i></i> '+liv+'</span></div>')
def fdemo_funnel(cap):
    rows=[("Visitors","12,480","100"),("Leads","3,210","72"),("Qualified","880","50"),("Customers","214","36")]
    bars="".join('<div class="fnl s'+str(i+1)+'" style="--w:'+w+'%"><span class="fl">'+l+'</span><span class="fv">'+v+'</span></div>' for i,(l,v,w) in enumerate(rows))
    return ('<div class="demo reveal"><div class="lpanel">'+_ltop('Pipeline','Live')+'<div class="funnel">'+bars+'</div></div><span class="cap">'+cap+'</span></div>')
def fdemo_rank(cap):
    serp=('<div class="serp">'
      '<div class="srow you"><span class="sfav"></span><span class="stx"><b>your-brand.com</b><span>#1 &middot; featured snippet</span></span><span class="sup">&uarr;</span></div>'
      '<div class="srow"><span class="sfav"></span><span class="stx"><b>competitor-a.com</b><span>#2</span></span></div>'
      '<div class="srow"><span class="sfav"></span><span class="stx"><b>competitor-b.com</b><span>#3</span></span></div></div>')
    bars='<div class="rankbars">'+"".join('<span class="rb b'+str(i+1)+'"></span>' for i in range(8))+'</div>'
    return ('<div class="demo reveal"><div class="lpanel">'+_ltop('Organic search','Climbing')+'<div class="rankwrap">'+serp+bars+'</div></div><span class="cap">'+cap+'</span></div>')
def fdemo_road(cap):
    steps=[("Audit","Where you are"),("Position","Brand &amp; message"),("Build","Web, app &amp; systems"),("Launch","Go to market"),("Grow","Scale what works")]
    rs="".join('<div class="rstep r'+str(i+1)+'"><span class="rdot"></span><b>'+t+'</b><span>'+s+'</span></div>' for i,(t,s) in enumerate(steps))
    return ('<div class="demo reveal"><div class="lpanel">'+_ltop('Roadmap','Aligned')+'<div class="road">'+rs+'</div></div><span class="cap">'+cap+'</span></div>')
DEPTH={
 'ai-agents':("The silent leak","Every unanswered message is a customer walking out.",
   "Buyers expect an answer now &mdash; at midnight, in their language, on WhatsApp. A human team can&rsquo;t be everywhere at once, so the leads you paid for go cold while they wait.",
   [("Reply in seconds","Speed is the single biggest predictor of whether a lead ever converts."),("Never off","Nights, weekends, holidays &mdash; the agent is always first to respond."),("Scales for free","Ten conversations or ten thousand, same instant service, zero new hires.")],
   "Stop the leak &mdash; put an agent on it."),
 'automation':("Robot work","Your best people are doing work a robot should.",
   "Copy-paste, data entry, chasing approvals, re-typing the same reply &mdash; every hour spent on it is an hour stolen from the work only humans can do. It&rsquo;s expensive, and it quietly burns people out.",
   [("Hours back","Reclaim the time lost to the manual glue between your tools."),("Fewer errors","Machines don&rsquo;t mistype, skip a step or drop a hand-off."),("Cut overhead","Grow output without growing headcount at the same rate.")],
   "Hand the busywork to machines &mdash; keep your people for the real work."),
 'app-development':("The duct-tape tax","You don&rsquo;t have a software problem &mdash; you have a duct-tape problem.",
   "Spreadsheets here, three SaaS tools there, a WhatsApp group holding it together. It works &mdash; until it doesn&rsquo;t. Every manual hand-off is a leak: lost hours, dropped orders, numbers nobody trusts.",
   [("~10 hrs / week","Gone to copy-paste, re-keying and chasing updates that should be automatic."),("Deals slip","Work falls through the cracks between disconnected tools and inboxes."),("Stale data","You decide on numbers that were already out of date this morning.")],
   "Custom software removes the tape &mdash; your data, your roadmap. Find your biggest leak in a free 30-minute teardown."),
 'web-design':("Your best salesperson","Your website is your hardest-working salesperson &mdash; or your weakest.",
   "It sells every hour you don&rsquo;t, in every market you can&rsquo;t reach in person. A slow, generic, English-only site quietly turns away the exact buyers you paid to attract.",
   [("The 3-second test","Half of visitors leave a slow or unclear page &mdash; and you never hear from them."),("Trust at a glance","People judge your credibility from your site before they read a single word."),("Speaks their language","Multilingual, fast and built to convert &mdash; so the right buyer says yes.")],
   "We build sites that sell while you sleep. See what yours could do."),
 'branding':("Perception is price","You&rsquo;re not expensive &mdash; you just look it.",
   "Before anyone reads a word, your brand has already set the price they expect to pay. Premium brands aren&rsquo;t pricier products; they&rsquo;re clearer, braver and more consistent ones.",
   [("Charge more","A strong identity commands a premium without changing the product."),("Be remembered","Consistency across every touchpoint is what makes a brand stick."),("Pull the right buyer","Clear positioning repels the wrong leads and attracts the ones who pay.")],
   "Let&rsquo;s build a brand people trust on sight."),
 'graphic-design':("Details sell","Sloppy design costs you the sale before the pitch begins.",
   "People can&rsquo;t see your quality &mdash; so they judge it by your design. Every off-kilter layout, clashing colour and rushed slide whispers &lsquo;cut corners&rsquo; to the buyer you&rsquo;re trying to win.",
   [("First impression","Design is the proxy for quality people use before they trust you."),("A faster yes","Clean, confident visuals make decisions easy and shorten the sale."),("One system","Templates and assets that keep every piece on-brand, at speed.")],
   "Make every asset look like the quality you deliver."),
 'lead-generation':("Hope is not a pipeline","Referrals are a gift. They are not a growth plan.",
   "Waiting on word-of-mouth means your revenue depends on luck and timing you don&rsquo;t control. A real pipeline is built on purpose &mdash; and it compounds.",
   [("Predictable","Know how many conversations you&rsquo;ll have next month, not just this one."),("Compounds","Every campaign and asset keeps working long after you build it."),("Right-fit only","Targeted outreach and capture, so you talk to buyers, not tyre-kickers.")],
   "Stop hoping, start filling the pipeline."),
 'seo-content':("Findable or invisible","If Google and AI can&rsquo;t find you, you don&rsquo;t exist.",
   "Your buyers search before they ever contact you &mdash; increasingly inside AI assistants, not just Google. If you&rsquo;re not the answer they surface, your competitor is, and the click was never yours to lose.",
   [("Compounding","Unlike ads, rankings keep paying off long after the work is done."),("Intent traffic","Search brings people already looking to buy &mdash; the warmest leads there are."),("Answer the machines","Structured, authoritative content is what AI cites and recommends.")],
   "Become the answer your market finds."),
 'marketing-ads':("Clicks aren&rsquo;t customers","Most ad budgets buy traffic. Ours buys customers.",
   "Impressions and clicks feel like progress, but they don&rsquo;t pay salaries. The only metric that matters is profitable customers acquired &mdash; and that&rsquo;s engineered, not bought.",
   [("ROAS, not vanity","We optimise to revenue and payback, not likes and reach."),("Full funnel","Ad, landing page and follow-up built as one &mdash; so the click converts."),("Spend that scales","Find what works, then pour fuel on it with confidence.")],
   "Turn ad spend into predictable revenue."),
 'strategy':("Motion vs progress","Busy isn&rsquo;t the same as growing.",
   "Most teams are drowning in activity and starved of direction. Without a roadmap that aligns brand, product, marketing and market, effort scatters &mdash; and the best opportunities pass by unseen.",
   [("Clarity","One roadmap that tells you what to do next &mdash; and what to ignore."),("Aligned","Brand, web, content and growth all pulling in the same direction."),("New markets","A proven path into SEA, Europe and the Gulf, de-risked.")],
   "Get the roadmap that aligns it all."),
}
def depth_section(slug):
    d=DEPTH.get(slug)
    if not d: return ''
    kicker,head,lead,cards,ctaline=d
    cc="".join('<div class="dpc reveal"><div class="dpc-k">'+k+'</div><div class="dpc-b">'+b+'</div></div>' for k,b in cards)
    return ('<section style="padding-top:0"><div class="wrap"><div class="depth reveal">'
      '<div class="eyebrow"><span class="t"></span><span class="mono">'+kicker+'</span></div>'
      '<h2 class="depth-h">'+head+'</h2><p class="depth-lead">'+lead+'</p>'
      '<div class="grid g3 depth-cards" style="gap:16px;margin-top:26px">'+cc+'</div>'
      '<div class="depth-cta"><p>'+ctaline+'</p><a href="booking.html?service='+slug+'" class="btn btn-fill" data-i18n="book">Book a call</a></div>'
      '</div></div></section>')
def ad_platforms():
    META='<svg viewBox="0 0 24 24" fill="#0866FF" aria-hidden="true"><path d="M7.2 6.6C4.5 6.6 2.6 9.2 2.6 12.3c0 2.5 1.3 4.5 3.3 4.5 1.6 0 2.7-1 4.2-3.5.4-.6.9-1.5 1.3-2.2.5.8 1 1.7 1.4 2.3 1.5 2.3 2.6 3.4 4.1 3.4 2.1 0 3.3-2 3.3-4.6 0-3.2-1.9-5.7-4.5-5.7-1.5 0-2.6.9-3.9 2.8-.9-1.4-2-2.7-3.7-2.7zm.1 1.8c.8 0 1.6.8 2.5 2.2-.7 1.1-1.2 1.9-1.6 2.5-1 1.4-1.5 1.7-2.1 1.7-.9 0-1.4-1-1.4-2.6 0-2.1 1-3.8 2.6-3.8zm9 0c1.6 0 2.6 1.7 2.6 3.8 0 1.6-.5 2.7-1.4 2.7-.7 0-1.1-.4-2-1.8-.5-.7-1-1.5-1.5-2.4.9-1.4 1.7-2.3 2.3-2.3z"/></svg>'
    GOOG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.07-1.4-.2-2.1H12v3.9h5.9c-.1 1-.8 2.5-2.2 3.4l3.4 2.6c2-1.8 3.4-4.5 3.4-7.8z"/><path fill="#34A853" d="M12 23c2.9 0 5.3-1 7.1-2.6l-3.4-2.6c-.9.6-2.1 1-3.7 1-2.9 0-5.3-1.9-6.2-4.6l-3.5 2.7C4.1 20.4 7.8 23 12 23z"/><path fill="#FBBC05" d="M5.8 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.6.4-2.3L2.3 7C1.6 8.5 1.2 10.2 1.2 12s.4 3.5 1.1 5z"/><path fill="#EA4335" d="M12 5.4c2 0 3.4.9 4.1 1.6l3.1-3C17.4 2.3 14.9 1.2 12 1.2 7.8 1.2 4.1 3.8 2.3 7l3.5 2.7C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'
    LINK='<svg viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zM8.4 18H5.9v-8h2.5zM7.15 8.8a1.45 1.45 0 1 1 0-2.9 1.45 1.45 0 0 1 0 2.9zM18.1 18h-2.5v-4.3c0-1-.4-1.7-1.3-1.7-.7 0-1.1.5-1.3 1-.06.16-.05.4-.05.6V18H10.5s.03-7.3 0-8h2.5v1.1c.33-.5.92-1.2 2.2-1.2 1.6 0 2.8 1 2.8 3.3z"/></svg>'
    P=[('Meta',META,'Facebook &middot; Instagram &middot; WhatsApp','Demand creation and retargeting where your market spends its attention.',['Creative-led','Retargeting &amp; lookalikes','Click-to-WhatsApp']),
       ('Google',GOOG,'Search &middot; Shopping &middot; YouTube &middot; Pmax','Capture the people already searching for exactly what you sell.',['Search &amp; Performance Max','Shopping feeds','YouTube &amp; remarketing']),
       ('LinkedIn',LINK,'B2B targeting &middot; Lead gen','Reach decision-makers by role, company and industry &mdash; not guesswork.',['Job-title &amp; company','Lead-gen forms','Account-based'])]
    cc=""
    for nm,ic,ch,de,tags in P:
        tg="".join('<span>'+t+'</span>' for t in tags)
        cc+=('<div class="adp reveal"><div class="adp-top"><span class="adp-ic">'+ic+'</span><div><div class="adp-nm">'+nm+'</div><div class="adp-ch">'+ch+'</div></div></div>'
          '<p class="adp-de">'+de+'</p><div class="adp-tags">'+tg+'</div></div>')
    return ('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:62ch"><div class="eyebrow"><span class="t"></span><span class="mono">Where we run your ads</span></div>'
      '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">Meta, Google &amp; LinkedIn &mdash; run as one engine</h2>'
      '<p>Each platform does a different job. We run them together so demand, intent and B2B reach compound instead of competing for the same budget.</p></div>'
      '<div class="grid g3 adpgrid" style="gap:16px;margin-top:24px">'+cc+'</div></div></section>')
def leadgen_extra():
    BLD='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h6"/></svg>'
    CART='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.3 12.2a2 2 0 0 0 2 1.6h8a2 2 0 0 0 2-1.6L21 7H6"/></svg>'
    HEALTH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2-5 4 10 2-5h6"/></svg>'
    PEOPLE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6"/><path d="M21 20a6 6 0 0 0-4.5-5.8"/></svg>'
    HOME='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>'
    CAP='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 9 12 5 2 9l10 4 10-4z"/><path d="M6 11v5c0 1.4 2.7 3 6 3s6-1.6 6-3v-5"/></svg>'
    IND=[("B2B &amp; SaaS",BLD,"Outbound &middot; LinkedIn &middot; Demos","Targeted account lists, personalised multi-channel sequences, and meetings booked straight to your calendar.",["Account lists","Sequences","Demo booking"]),
       ("E-commerce &amp; DTC",CART,"Paid social &middot; Retargeting &middot; Capture","Meta &amp; TikTok ads into lead magnets and flows that turn browsers into subscribers and buyers.",["Paid social","Lead magnets","Email/WhatsApp flows"]),
       ("Clinics &amp; services",HEALTH,"Local SEO &middot; Reviews &middot; WhatsApp","Show up locally, win trust with reviews, and capture every enquiry the instant it arrives.",["Local SEO","Review engine","Instant intake"]),
       ("Halal &amp; Muslim-market",PEOPLE,"CTWA &middot; Community &middot; Creators","Click-to-WhatsApp ads, an engaged community and the right creators &mdash; on the channels your market actually uses.",["Click-to-WhatsApp","Community","Creators"]),
       ("Real estate &amp; high-ticket",HOME,"Magnets &middot; Nurture &middot; Qualify","Lead magnets and long nurture sequences that warm high-intent buyers until they&rsquo;re ready to talk.",["Lead magnets","Nurture","Scoring"]),
       ("Events &amp; education",CAP,"Webinars &middot; Funnels &middot; Reminders","Registration funnels, reminder sequences and follow-up that fill seats and convert attendees.",["Webinar funnels","Reminders","Follow-up"])]
    cc="".join('<div class="adp reveal"><div class="adp-top"><span class="adp-ic">'+ic+'</span><div><div class="adp-nm">'+nm+'</div><div class="adp-ch">'+ch+'</div></div></div><p class="adp-de">'+de+'</p><div class="adp-tags">'+"".join('<span>'+t+'</span>' for t in tags)+'</div></div>' for nm,ic,ch,de,tags in IND)
    industries=('<section style="padding-top:0"><div class="wrap"><div class="reveal" style="max-width:62ch"><div class="eyebrow"><span class="t"></span><span class="mono">Different markets, different playbooks</span></div>'
      '<h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">Lead generation, by industry</h2>'
      '<p>There&rsquo;s no one way to fill a pipeline. We pick the channels and motion that fit your market &mdash; here&rsquo;s how that looks across a few.</p></div>'
      '<div class="grid g3 adpgrid" style="gap:16px;margin-top:24px">'+cc+'</div></div></section>')
    f1=flow_card('Outbound &middot; Cold-to-booked','Outbound',[('crm','Research the account','Fit, trigger &amp; the right person'),('ai','Personalise the message','Tailored to them, not a blast'),('send','Multi-channel reach','Email, LinkedIn &amp; WhatsApp'),('bolt','Follow up automatically','Until a real reply lands'),('cal','Meeting booked','Straight to your calendar')],'Cold outreach that lands real conversations')
    f2=flow_card('Inbound &middot; Click-to-qualified','Inbound',[('chart','Ad or content','Where the intent already lives'),('doc','Landing page','Built to convert the click'),('badge','Lead magnet','Captured, never lost'),('ai','Auto-nurture','Warmed up while you sleep'),('star','Scored &amp; routed','Hot leads to sales, now')],'Attention turned into qualified, sales-ready leads')
    flows=('<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">How the leads flow</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Two engines, one pipeline</span></div></div>'
      '<div class="grid g2" style="gap:18px">'+f1+f2+'</div></div></section>')
    return industries+flows
def strategy_extra():
    aim=PBY['anaaka'][7]
    cs=('<section style="padding-top:0"><div class="wrap"><div class="cstudy reveal">'
      '<div class="cs-media"><img src="'+aim+'" alt="ANAAKA Halal Skincare &mdash; European brand established in Malaysia" loading="lazy"></div>'
      '<div class="cs-body"><div class="eyebrow"><span class="t"></span><span class="mono">Case study &middot; Market entry</span></div>'
      '<h2 class="cs-h">From a European luxury brand<br>to a Kuala Lumpur flagship.</h2>'
      '<p class="cs-p">ANAAKA is a luxury halal skincare brand from Europe &mdash; a brand we helped build. When they set their sights on Malaysia, we led the market entry end to end: research, a localised brand and store, distribution and licensing &mdash; through to a flagship at TRX, Kuala Lumpur.</p>'
      '<div class="cs-stats"><div><b>18.45%</b><span>revenue from organic search</span></div><div><b>TRX</b><span>flagship store, KL</span></div><div><b>EU &rarr; MY</b><span>built in Europe, launched in Malaysia</span></div></div>'
      '<div class="cs-cta"><a href="project-anaaka.html" class="btn btn-fill">See the full case &rarr;</a></div>'
      '</div></div></div></section>')
    MK=[("SEA","Southeast Asia","Malaysia and the halal heartland &mdash; halal certification, local partners and the Muslim-consumer market, from KL outward."),
        ("EU","Europe","Germany and the EU &mdash; European quality standards, premium positioning, GDPR-clean operations and distribution into a demanding market."),
        ("Gulf","GCC &amp; MENA","The Gulf and wider MENA &mdash; Arabic-first presence, premium retail and the regional partners that open doors.")]
    mc="".join('<div class="card reveal"><div class="no">'+code+'</div><h3 style="font-size:20px">'+rg+'</h3><p>'+de+'</p></div>' for code,rg,de in MK)
    markets=('<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Markets we open</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">SEA &middot; Europe &middot; Gulf</span></div></div>'
      '<div class="grid g3" style="gap:16px">'+mc+'</div></div></section>')
    return cs+markets
# ---- custom-CRM animated previews ----
def crm_pipeline():
    cols=[("New","Nadia Skincare","MYR 38K"),("Qualified","Zahra Foods","MYR 96K"),("Proposal","Halal Mart","MYR 120K"),("Won","Dar Retail","MYR 210K")]
    ch=""
    for c,nm,vv in cols:
        ch+='<div class="kbcol'+(' won' if c=="Won" else '')+'"><div class="kbh">'+c+'</div><div class="kbcard ghost"><b>'+nm+'</b><span>'+vv+'</span></div></div>'
    return ('<div class="demo reveal span2"><div class="lpanel">'+_ltop('Workflow board','Live')+
      '<div class="crmkb"><div class="kbcols">'+ch+'</div><div class="kbmove"><b>Acme Foods</b><span>MYR 142K</span></div></div></div>'
      '<span class="cap">Any process &mdash; sales, orders, approvals, fulfilment &mdash; moving stage to stage, automatically</span></div>')
def crm_contact():
    tl=[("Call logged &mdash; 12 min","t1"),("Email sent &mdash; quote PDF","t2"),("Deal created &mdash; MYR 142K","t3"),("Next: follow-up Thu 11am","t4 next")]
    tlh="".join('<div class="tlrow '+c+'"><span class="tldot"></span><span>'+t+'</span></div>' for t,c in tl)
    return ('<div class="demo reveal"><div class="lpanel">'+_ltop('Record 360','Synced')+
      '<div class="crmc"><div class="crmc-head"><span class="crmc-av">SA</span><div class="crmc-id"><b>Sarah Aziz</b><span>Head of Procurement &middot; Acme Foods</span></div></div>'
      '<div class="crmc-tags"><span>Customer</span><span>KSA</span><span>VIP</span></div>'
      '<div class="crmc-tl">'+tlh+'</div></div></div>'
      '<span class="cap">Customers, suppliers, anything &mdash; every interaction on one timeline</span></div>')
def crm_dash():
    inner=('<div class="lpanel">'+_ltop('Dashboard','Live')+
      '<div class="lp-dash"><div class="lp-kpis">'
      '<div class="lp-kpi"><div class="k">Pipeline</div><div class="v">MYR 1.2M</div></div>'
      '<div class="lp-kpi"><div class="k">Win rate</div><div class="v up">34%</div></div>'
      '<div class="lp-kpi"><div class="k">Closed / mo</div><div class="v up">MYR 286K</div></div></div>'
      '<div class="lp-chart">'+('<span class="bar"></span>'*7)+'</div>'
      '<div class="lp-rows">'
      '<div class="lp-row"><span class="av"></span><span class="rt">Dar Retail &mdash; deal won</span><span class="pill">+MYR 210K</span></div>'
      '<div class="lp-row"><span class="av"></span><span class="rt">12 leads captured today</span><span class="pill">WhatsApp</span></div>'
      '<div class="lp-row"><span class="av"></span><span class="rt">3 invoices auto-sent</span><span class="pill">Done</span></div>'
      '</div></div></div>')
    return '<div class="demo reveal">'+inner+'<span class="cap">Your whole operation, live &mdash; sales, ops and finance in one place</span></div>'
def crm_auto():
    steps=[('badge','Deal marked Won','Dar Retail &middot; MYR 210K'),('doc','Invoice generated','Sent to the client'),('bolt','Finance notified','Posted to accounting'),('cal','Onboarding scheduled','Kickoff booked'),('send','Welcome pack sent','In their language')]
    rows="".join('<div class="fstep s'+str(i+1)+'"><span class="fic"><svg viewBox="0 0 24 24">'+FICON.get(ic,'')+'</svg></span><span class="ftx"><b>'+b+'</b><span>'+s+'</span></span><span class="fchk"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span></div>' for i,(ic,b,s) in enumerate(steps))
    return ('<div class="demo reveal"><div class="lpanel">'+_ltop('Automation','Running')+'<div class="flow-steps" style="margin-top:6px">'+rows+'</div></div>'
      '<span class="cap">When something happens, the busywork handles itself</span></div>')
def crm_savings():
    items=[("5&ndash;8 &rarr; 1","tools replaced","One system instead of paying for a CRM plus email, scheduling, invoicing and chat tools."),
      ("up to &minus;40%","software + ops cost","Versus a stack of per-seat SaaS subscriptions that grow with every hire."),
      ("~12 hrs / week","saved per team","Reclaimed from re-keying, chasing updates and building reports by hand."),
      ("0","per-seat tax","You own the asset &mdash; adding people doesn&rsquo;t add licence fees.")]
    cc="".join('<div class="svc reveal"><div class="svc-n">'+n+'</div><div class="svc-l">'+l+'</div><div class="svc-b">'+b+'</div></div>' for n,l,b in items)
    return ('<section style="padding-top:0"><div class="wrap"><div class="depth reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The math</span></div>'
      '<h2 class="depth-h">Own your system. Stop renting five.</h2>'
      '<p class="depth-lead">Most teams bleed money on a stack of per-seat subscriptions and hours of manual work that never quite fit. A custom system replaces the stack, fits your workflows exactly, and becomes an asset you own &mdash; not a bill that grows forever.</p>'
      '<div class="grid g4 svc-grid" style="gap:14px;margin-top:26px">'+cc+'</div>'
      '<p class="svc-foot">Typical for a 10-person B2B team &mdash; we model your real numbers in the audit.</p></div></div></section>')
WHIDE=set()  # all previously-hidden slugs removed from PROJECTS entirely (2026-07-04)
def work_page():
    tiles="".join(_tile(s,n,c,y,b,im) for s,n,c,y,b,sc,url,im in PROJECTS if s not in WHIDE)
    body=phero('<a href="index.html">Home</a> / Work',"Selected work","Proof, not <em>promises.</em>",
        "Every project &mdash; client builds, legacy work and our own ventures. 100+ projects across Southeast Asia, Europe and MENA.")+f'''
<section style="padding-top:24px"><div class="wrap"><div class="grid g3">{tiles}</div></div></section>
'''+cta()
    return page("work.html","Work — Ummah Collective","All projects: ANAAKA, Matcha Köln, ARJU, Dolezel, Almaruf, Shoraka and more.",body,aurora="work")

def project_page(s,n,c,y,b,scope,url,im):
    crumb='<a href="index.html">Home</a> / <a href="work.html">Work</a> / '+n
    sc="".join(f'<div class="erow"><span class="x">0{i}</span><span class="nm" style="font-size:clamp(20px,2.2vw,28px)">{x}</span><span class="de"></span></div>' for i,x in enumerate(scope,1))
    live=f'<a href="{url}" class="btn btn-fill" target="_blank" rel="noopener">Visit live site &rarr;</a>' if url else ''
    heroimg=img(_thumb(s,im),n,"art-hero reveal")
    _sl=[p[0] for p in PROJECTS]; _i=_sl.index(s); _pv=PROJECTS[(_i-1)%len(PROJECTS)]; _nx=PROJECTS[(_i+1)%len(PROJECTS)]
    nextnav=('<section style="padding-top:0"><div class="wrap"><div class="pnav reveal">'
      '<a class="pnav-a" href="project-'+_pv[0]+'.html"><span class="pn-l">&larr; Previous</span><span class="pn-t">'+_pv[1]+'</span></a>'
      '<a class="pnav-all" href="work.html" data-i18n="work">All work</a>'
      '<a class="pnav-a pnav-r" href="project-'+_nx[0]+'.html"><span class="pn-l">Next &rarr;</span><span class="pn-t">'+_nx[1]+'</span></a>'
      '</div></div></section>')
    if s=='anaaka':
        AN='https://anaaka.com.my/cdn/shop/files/'
        GIF=''  # if Attila drops a real screen-recording GIF in Drive, set the lh3 URL here to use it instead of the CSS scroll
        _hu=AN+'Anaaka-1_e6b7eb7e-d3bc-4616-85a4-f1e4b12264e7.jpg?width=1600'
        _hero=('<div class="sa-hero" style="background-image:linear-gradient(rgba(10,10,10,.30),rgba(10,10,10,.55)),url('+_hu+')">'
          '<div class="sa-eyebrow">H &mdash; BEAUTY</div>'
          '<div class="sa-title">Premium Skincare<br>&amp; Haircare</div>'
          '<div class="sa-tag">DERMATOLOGIST APPROVED &middot; MADE IN ITALY</div>'
          '<span class="sa-cta">Shop Best Sellers</span></div>')
        _award=('<div class="sa-award"><div class="sa-ah">AWARD-WINNING HALAL CERTIFIED</div>'
          '<div class="sa-asub">Dermatologist-approved European formulas for ethical, high-performance beauty</div>'
          '<div class="sa-chips"><span>100% Cruelty-Free</span><span>100% Paraben-Free</span><span>100% Silicone-Free</span><span>100% Sulphate-Free</span></div></div>')
        _pr=[('1-3.jpg','Overnight Revitalizer'),('1-2.png','Priming Day Cream'),('1-6.png','Foaming Cleanser'),('1.png','Make-up Remover'),('1-1.jpg','Firming Serum'),('1.jpg','Eye Serum')]
        _grid='<div class="sa-grid">'+''.join('<figure class="sa-card"><img src="'+AN+f+'?width=420" alt="'+nm+'" loading="lazy"><figcaption>'+nm+'</figcaption></figure>' for f,nm in _pr)+'</div>'
        _life='<img class="sa-img" src="'+AN+'complete-lifestyle-routine.jpg?width=1600" alt="ANAAKA complete lifestyle routine" loading="lazy">'
        _bands=_hero+_award+_grid+_life
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">anaaka.com.my</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the store we built &middot; <a href="https://anaaka.com.my" target="_blank" rel="noopener">visit anaaka.com.my &rarr;</a></div></div></section>')
        herosec=('<section style="padding-top:10px"><div class="wrap"><img class="pimg reveal" src="'+GIF+'" alt="anaaka.com.my" loading="eager"></div></section>') if GIF else _showcase
        SEIBU='https://lh3.googleusercontent.com/d/1_mAKHo5dU3Hp3J5heN8PQDl3T24K6OKg=w1000'  # SEIBU/TRX store photo (Attila's Drive, via Google CDN)
        store_img=(f'<img class="pimg reveal" src="{SEIBU}" alt="ANAAKA flagship at SEIBU, TRX Mall, Kuala Lumpur" loading="lazy">') if SEIBU else ''
        res=[("10,446","Sessions generated"),("8,244","Users acquired"),("18.45%","Revenue from organic search"),("6,432","Instagram followers"),("15,212","Page views in one month"),("98.55%","Engagement rate")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        built=[("Brand &amp; identity","Name, positioning, packaging story and the visual system for a premium halal house."),("E-commerce","A conversion-built, multilingual Shopify store &mdash; fast, and made to sell."),("Analytics &amp; tracking","Full measurement, so every channel and every ringgit of spend is accountable."),("Content &amp; social","A content engine and social presence &mdash; @anaaka.official &mdash; that compounds."),("Market-entry strategy","The plan to take a European brand into Malaysia from a standing start."),("Retail &amp; activation","A flagship at TRX and a retail activation at SEIBU KL, with a national ambassador.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        skin=["Overnight Revitalizer","Priming Anti-Aging Day Cream &middot; SPF 15","Firming Anti-Aging Serum","Radiance-Boosting Eye Serum","Foaming Cleanser &amp; Make-up Remover"]
        hair=["Shampoo &amp; Conditioner &middot; Natural Hair","Shampoo &amp; Conditioner &middot; Coloured Hair","Overnight Revitalizing Mask","Hair Spray Perfume","The Complete Lifestyle Collection"]
        skinli="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in skin)
        hairli="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in hair)
        IGPROC='<script>(function(){function p(){if(window.instgrm&&window.instgrm.Embeds){window.instgrm.Embeds.process();}else{setTimeout(p,400);}}if(document.readyState==="complete")p();else window.addEventListener("load",function(){setTimeout(p,300);});})();</script>'
        body=phero(crumb,f"Case / {c}",n,"A European halal skincare house &mdash; built from the ground up, then brought to Malaysia and made a category leader.")+f'''
{herosec}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The brand</span></div>
    <h2 style="margin-top:10px">Premium halal beauty,<br>with nothing to apologise for.</h2>
    <p style="color:var(--dim);margin-top:14px">Halal beauty is one of the fastest-growing categories in the world &mdash; and one of the most under-served at the premium end. ANAAKA is the answer: a halal-certified skincare and haircare house with European formulas, <strong>made in Italy</strong>, dermatologist-approved and clean by design &mdash; cruelty-free, and free from alcohol, parabens, sulphates and silicones. We helped build it from the identity up, so premium halal feels aspirational, never a compromise.</p>
    <div class="mono reveal" style="margin-top:16px;color:var(--acc2);font-size:12px">Award-winning &middot; Best Halal Skincare Company (winner) &middot; Most Innovative Halal Anti-Aging Product (finalist)</div>
  </div>
  <img class="pimg reveal" src="{AN}complete-lifestyle-routine.jpg" alt="ANAAKA Complete Lifestyle Collection" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{AN}voile-complete-care-pack-natural-1.jpg" alt="ANAAKA halal haircare range" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The move</span></div>
    <h2 style="margin-top:10px">From a European brand<br>to a Kuala Lumpur flagship.</h2>
    <p style="color:var(--dim);margin-top:14px">With the brand built, the real work was market entry &mdash; taking ANAAKA into Malaysia from <strong>zero local presence</strong>. Over 16 months we built the full ecosystem: a Shopify storefront, analytics and tracking, a content and social engine, and a go-to-market plan. Then we made the brand physical &mdash; a <strong>flagship store at TRX</strong>, a retail activation at <strong>SEIBU KL</strong>, and <strong>Anzalna Nasir</strong> as brand ambassador.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Full ecosystem</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">The results &middot; 16 months</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div>
  <p class="reveal" style="margin-top:18px;max-width:64ch;color:var(--dim)">From zero Malaysian presence to category leader &mdash; and 4,980 clicks in the first 24 hours of a single social push. Proof that a brand built as an asset keeps paying back.</p></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The range</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Skincare &amp; halal haircare</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Skincare</div><ul class="incl">{skinli}</ul></div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Halal haircare &mdash; every hair type, hijab-worn included</div><ul class="incl">{hairli}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The flagship</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Physical retail &middot; Kuala Lumpur</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Digital first, but not digital only. In 2025 ANAAKA went physical with a flagship counter at <strong>SEIBU, TRX Mall</strong> &mdash; the Japanese luxury department store in Tun Razak Exchange, Kuala Lumpur&rsquo;s new financial and luxury district. A backlit digital product wall, the full range merchandised in the brand&rsquo;s signature black &amp; rose-gold, and national ambassador <strong>Anzalna Nasir</strong> extending the reach. Proof that a brand built as a digital asset can command premium physical retail.</p>
      <ul class="ev-meta" style="margin-top:22px">
        <li><span>Location</span><b>SEIBU &middot; TRX Mall, KL</b></li>
        <li><span>Format</span><b>Flagship counter + digital wall</b></li>
        <li><span>Ambassador</span><b>Anzalna Nasir</b></li>
        <li><span>Opened</span><b>2025</b></li>
      </ul>
    </div>
    <div class="reveal">{store_img}</div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">On Instagram</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">@anaaka.official &middot; 23.7k followers</span></div></div>
  <div class="ig-feed reveal">
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DaM5cdNI4nu/" data-instgrm-version="14"></blockquote>
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DaCm1H1sOQS/" data-instgrm-version="14"></blockquote>
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DaABUZcIO97/" data-instgrm-version="14"></blockquote>
  </div>
  <div style="text-align:center;margin-top:26px"><a href="https://www.instagram.com/anaaka.official/" class="btn btn-fill" target="_blank" rel="noopener">Follow @anaaka.official &rarr;</a></div>
</div></section>
<script async src="//www.instagram.com/embed.js"></script>{IGPROC}
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">&ldquo;They built our entire ecosystem &mdash; brand, site, tracking and a flagship store. <em>Not a campaign. An asset.</em>&rdquo;</div><div class="quote-by reveal">ANAAKA &mdash; Halal Skincare &middot; Flagship @ TRX, Kuala Lumpur</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{url}" class="btn btn-fill" target="_blank" rel="noopener">Visit anaaka.com.my &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want results<br>like <em>these?</em>')
        return page(f"project-{s}.html","ANAAKA — Halal Skincare Case Study | Ummah Collective","How Ummah Collective built ANAAKA, a European halal skincare & haircare brand, and took it into Malaysia from zero to a TRX flagship — brand, e-commerce, tracking and market entry.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"ANAAKA — Halal Skincare Case Study","about":"Brand, e-commerce and market entry for ANAAKA halal skincare","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-anaaka.html"}))
    if s=='matchakoeln':
        HB='https://images.unsplash.com/photo-1708573106073-e27e43ec7fda?w=1600&q=80'
        SQ='https://images.squarespace-cdn.com/content/v1/69ee6d3b517677487d633f31/'
        P_mango=SQ+'0c913079-405b-4031-bf04-130339e7bc38/matchamango.jpg?format=1000w'
        P_whisk=SQ+'8c8d3e30-c74e-4e33-9472-bbc386ef5d77/PHOTO-2026-04-24-23-41-44+2.jpg?format=1000w'
        P_smooth=SQ+'46bca59a-cfe8-45e7-9974-68a4dd9a1bb8/IMG_8596.JPG?format=1000w'
        P_cup=SQ+'bef43dd5-ab58-4590-a96c-86283bcc2b72/IMG_1769.JPG?format=1000w'
        _hero=('<div class="sa-hero" style="background-image:linear-gradient(rgba(18,22,14,.42),rgba(18,22,14,.64)),url('+HB+')">'
          '<div class="sa-eyebrow">MOBILES MATCHA-CATERING &middot; K&Ouml;LN &amp; UMGEBUNG</div>'
          '<div class="sa-title">Matcha f&uuml;r Events,<br>die in <em>Erinnerung</em> bleiben</div>'
          '<div class="sa-tag">FRISCH LIVE AUFGESCHLAGEN &middot; BIO-QUALIT&Auml;T</div>'
          '<span class="sa-cta">Catering anfragen</span></div>')
        _promise=('<div class="sa-award"><div class="sa-ah">Drei Versprechen</div>'
          '<div class="sa-asub">Mehr als Catering &mdash; ein Erlebnis, das in Erinnerung bleibt.</div>'
          '<div class="sa-chips"><span>Kompromisslose Bio-Qualit&auml;t</span><span>Sicherheit &amp; Professionalit&auml;t</span><span>Volle Kostentransparenz</span></div></div>')
        _pr=[(P_whisk,'Live aufgeschlagen'),(P_mango,'Drei Kreationen'),(P_smooth,'Iced Matcha'),(P_cup,'Signature Cup')]
        _grid='<div class="sa-photos">'+''.join('<figure><img src="'+u+'" alt="'+t+'" loading="lazy"><figcaption>'+t+'</figcaption></figure>' for u,t in _pr)+'</div>'
        _occ=('<div class="sa-award"><div class="sa-ah">Wo Matcha Madness gl&auml;nzt</div>'
          '<div class="sa-chips"><span>Hochzeiten</span><span>Henna-Abende</span><span>Firmenevents</span><span>Sommerfeste</span><span>Messen</span><span>Babyshowers</span><span>Verlobungen</span></div></div>')
        _bands=_hero+_promise+_grid+_occ
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim mk reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">matchakoeln.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the site we built &middot; <a href="https://matchakoeln.de" target="_blank" rel="noopener">visit matchakoeln.de &rarr;</a></div></div></section>')
        built=[("Website redesign","A premium, cinematic and mobile-first site &mdash; built to turn a visit into an enquiry."),("Booking wizard","A multi-step flow &mdash; package &rarr; flavours &rarr; event &rarr; contact &mdash; with a live price estimate."),("Email integration","Every enquiry and booking lands straight in the inbox. No dashboard, no friction."),("7 languages","German, English, Arabic (RTL), Turkish, Bosnian, Albanian and French &mdash; auto-detected."),("Local SEO","LocalBusiness schema, sitemap and metadata to win &lsquo;Matcha-Catering K&ouml;ln&rsquo;."),("Brand &amp; content","A services brochure, a seven-post blog and a library of social templates.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("7","Languages, incl. Arabic RTL"),("13","Pages, multilingual chrome"),("3","Event packages"),("5+","Cities served"),("4","Steps in the booking wizard"),("100%","Live on their own domain")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Schritt 1","Paket w&auml;hlen &mdash; S, M oder L"),("Schritt 2","Sorten &amp; Extras ausw&auml;hlen"),("Schritt 3","Event-Details: Datum, Ort, G&auml;ste"),("Schritt 4","Kontakt + Sofort-Preis, per E-Mail")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        pkgs=["Paket S &middot; intime Feiern","Paket M &middot; mittlere Events","Paket L &middot; gro&szlig;e Feiern &amp; Messen"]
        occ=["Hochzeiten &amp; Verlobungen","Henna-Abende","Firmenevents &amp; Messen","Geburtstage &amp; Sommerfeste","Babyshowers &amp; Shop-Er&ouml;ffnungen"]
        pkgli="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in pkgs)
        occli="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in occ)
        IGPROC='<script>(function(){function p(){if(window.instgrm&&window.instgrm.Embeds){window.instgrm.Embeds.process();}else{setTimeout(p,400);}}if(document.readyState==="complete")p();else window.addEventListener("load",function(){setTimeout(p,300);});})();</script>'
        body=phero(crumb,f"Case / {c}",n,"A mobile matcha-catering brand in K&ouml;ln &mdash; given a premium multilingual home, a booking wizard, and enquiries that land straight in the inbox.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The brand</span></div>
    <h2 style="margin-top:10px">K&ouml;ln&rsquo;s mobile<br>matcha bar.</h2>
    <p style="color:var(--dim);margin-top:14px">Matcha Madness brings premium organic matcha, whisked <strong>live</strong> at a beautifully styled mobile bar, right in front of the guests. Founded by <strong>Nour Khammar</strong>, it turns weddings, henna evenings, corporate events, fairs and summer parties into a calm, ceremonial moment &mdash; across <strong>K&ouml;ln, Bonn, D&uuml;sseldorf, Leverkusen and Bergisch-Gladbach</strong>. Our brief: give a fast-growing catering brand a home as premium as the experience itself.</p>
  </div>
  <img class="pimg reveal" src="{P_mango}" alt="Matcha Madness &mdash; three signature matcha creations" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{P_whisk}" alt="Matcha whisked live with a bamboo whisk" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">One brand,<br>seven languages.</h2>
    <p style="color:var(--dim);margin-top:14px">We rebuilt <strong>matchakoeln.de</strong> from the ground up: a cinematic, mobile-first site that speaks <strong>seven languages</strong> &mdash; German, English, Arabic (right-to-left), Turkish, Bosnian, Albanian and French &mdash; auto-detecting each visitor&rsquo;s own. At its heart is a <strong>booking wizard</strong> that turns a browser into an enquiry in four steps, with a live price estimate, plus <strong>email integration</strong> so every request lands directly in the inbox. Local SEO, a seven-post blog and a full brand kit round it out &mdash; now live on their own domain.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Site &middot; booking &middot; email</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The booking engine</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Four steps to an enquiry</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">The wizard is the site&rsquo;s engine. Instead of a dead contact form, guests are guided &mdash; package, flavours, event details, contact &mdash; and see an <strong>instant price estimate</strong> before they send. The finished enquiry is <strong>emailed in full</strong>, so Matcha Madness can reply with a quote in minutes.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <img class="pimg reveal" src="{P_smooth}" alt="Iced matcha creations by Matcha Madness" loading="lazy">
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Packages &amp; occasions</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Sized to the event</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Transparent packages</div><ul class="incl">{pkgli}</ul></div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Where they shine</div><ul class="incl">{occli}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">On Instagram</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">@matchamadness_cgn</span></div></div>
  <div class="ig-feed reveal">
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DaEBT5PMmp3/" data-instgrm-version="14"></blockquote>
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DZ5UJf0Mm6g/" data-instgrm-version="14"></blockquote>
    <blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/DZz-3oOsWLC/" data-instgrm-version="14"></blockquote>
  </div>
  <div style="text-align:center;margin-top:26px"><a href="https://www.instagram.com/matchamadness_cgn/" class="btn btn-fill" target="_blank" rel="noopener">Follow @matchamadness_cgn &rarr;</a></div>
</div></section>
<script async src="//www.instagram.com/embed.js"></script>{IGPROC}
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Premium in seven languages &mdash; and <em>an enquiry that lands before the guest leaves the page.</em></div><div class="quote-by reveal">Matcha Madness &mdash; Mobiles Matcha-Catering &middot; K&ouml;ln</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{url}" class="btn btn-fill" target="_blank" rel="noopener">Visit matchakoeln.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a site<br>like <em>this?</em>')
        return page("project-matchakoeln.html","Matcha Madness — Multilingual Site & Booking Wizard | Ummah Collective","How Ummah Collective built Matcha Madness a premium 7-language website, a multi-step booking wizard and email integration — mobile matcha catering in Köln.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Matcha Madness — Website, Booking Wizard & Email Integration","about":"Premium multilingual website and booking system for Matcha Madness, mobile matcha catering in Cologne","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-matchakoeln.html"}))
    if s=='arju':
        MARK='<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="ARJU"><defs><linearGradient id="arjuRed" x1="6" y1="4" x2="58" y2="60" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FF3B47"/><stop offset="0.55" stop-color="#E11D2A"/><stop offset="1" stop-color="#9E0E1C"/></linearGradient><radialGradient id="arjuGlow" cx="0.5" cy="0.32" r="0.85"><stop offset="0" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs><rect x="2" y="2" width="60" height="60" rx="16" fill="url(#arjuRed)"/><rect x="2" y="2" width="60" height="60" rx="16" fill="url(#arjuGlow)"/><rect x="2.75" y="2.75" width="58.5" height="58.5" rx="15.25" fill="none" stroke="#ffffff" stroke-opacity="0.18" stroke-width="1.5"/><g stroke="#F4ECDA" stroke-width="2" stroke-linejoin="round" fill="none" opacity="0.95"><path d="M18 18 H46 V46 H18 Z"/><path d="M32 11 L53 32 L32 53 L11 32 Z"/></g><path d="M27.5 25.5 L41 32 L27.5 38.5 Z" fill="#F4ECDA"/></svg>'
        YT=lambda v:'https://img.youtube.com/vi/'+v+'/maxresdefault.jpg'
        _hero=('<div class="aj-hero">'+MARK+'<div class="aj-word">ARJU</div>'
          '<div class="aj-eye">SACRED KNOWLEDGE &middot; BEAUTIFULLY TAUGHT</div>'
          '<div class="aj-title">Learn your dīn the way<br>it deserves to be learned.</div>'
          '<span class="aj-cta">Kostenlos starten</span></div>')
        _cs=[('YBKJZscjDC8','Trials of the Ummah'),('t6ukHnSaWno','Why the Prophet ﷺ was Al-Amīn'),('vs7CQjJ97J4','What this Dunya is really about'),('DpsVkKjApP0','Stay patient, O Khabbāb'),('4d96xNd0iUc','Real success in Islam'),('qTJDYNmxob8','The fear of Allāh’s punishment')]
        _cards="".join('<div class="aj-card"><img src="'+YT(v)+'" alt="'+t+'" loading="lazy"><div class="aj-cap">'+t+'</div></div>' for v,t in _cs)
        _rail='<div class="aj-rail"><div class="aj-rh">Continue learning</div><div class="aj-grid">'+_cards+'</div></div>'
        _tiers=('<div class="aj-tiers">'
          '<div class="aj-tier"><b>Seeker</b><span class="pr">Free</span><span class="mt">Foundations, forever free</span></div>'
          '<div class="aj-tier feat"><b>Premium</b><span class="pr">&euro;14 / mo</span><span class="mt">Full library + live halaqāt</span></div>'
          '<div class="aj-tier"><b>Pro &middot; Ijāza</b><span class="pr">&euro;49 / mo</span><span class="mt">1-to-1 + certified ijāza</span></div></div>')
        _bands=_hero+_rail+_tiers
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim aj reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">arju.app</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A scroll through the ARJU prototype we designed &middot; <span style="color:#C9A24B">coming soon</span></div></div></section>')
        built=[("Brand &amp; identity","A cinematic black-red-gold system and a logo fusing the Rub el Hizb with a play mark."),("Product &amp; UX design","The full experience &mdash; home, browse, course, watch, live, dashboard, pricing, settings."),("12-page prototype","A working front-end, not a mockup &mdash; search, nav, tiers, toasts and reveals all live."),("5 languages","German, English, Turkish, Arabic (RTL) and Bahasa Melayu, with a live switcher."),("Content architecture","29 courses across Qur&rsquo;ān, Ḥadīth, Fiqh, ʿAqīdah, Tazkiyah, Arabic and family."),("Strategy blueprint","Positioning, tier strategy, content roadmap and a build path to launch.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("12","Pages, full app prototype"),("5","Languages, incl. Arabic RTL"),("29","Courses architected"),("3","Membership tiers"),("40","Ḥadīth Nawawi &mdash; flagship track"),("1","Strategy blueprint")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        tiers=[("Seeker","Free","Foundational courses and daily reminders &mdash; free forever, for every seeker."),("Premium","&euro;14 / mo","The full library, live halaqāt and seasonal programs. The heart of ARJU."),("Pro &middot; Ijāza","&euro;49 / mo","One-to-one study, book tracks and a certified <em>ijāza</em> with a connected chain.")]
        tcards="".join('<div class="card reveal"><div class="mono" style="color:#C9A24B;font-size:12px">'+p+'</div><h3 style="margin-top:8px;font-size:20px">'+t+'</h3><p style="margin-top:8px">'+d+'</p></div>' for t,p,d in tiers)
        body=phero(crumb,f"Case / {c}",n,"A premium, cinematic home for Islamic learning &mdash; designed and prototyped for Imam Maged Al-Berlini, and ready to build.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The concept</span></div>
    <h2 style="margin-top:10px">Netflix-grade,<br>for the dīn.</h2>
    <p style="color:var(--dim);margin-top:14px">Islamic knowledge is abundant online &mdash; and almost never presented with the craft it deserves. ARJU is our answer: a <strong>premium, cinematic learning platform</strong> where on-demand courses, live halaqāt and one-to-one study sit in an experience as considered as the teaching. The name honours <strong>Arresalah Jugend</strong> &mdash; lineage, not invention &mdash; and the whole system is powered by <strong>Imam Maged Al-Berlini</strong>.</p>
  </div>
  <img class="pimg reveal" src="{YT('t6ukHnSaWno')}" alt="ARJU course &mdash; real teaching by Imam Maged Al-Berlini" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{YT('vs7CQjJ97J4')}" alt="ARJU course thumbnail" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">A working platform,<br>not a slide deck.</h2>
    <p style="color:var(--dim);margin-top:14px">We designed and built a <strong>12-page front-end prototype</strong> &mdash; home, browse, course, watch, live, dashboard, pricing, settings and more &mdash; in <strong>five languages</strong> with a live switcher and full Arabic RTL. Real teaching content is wired in from Maged&rsquo;s channel, wrapped in a complete <strong>subscription and tier architecture</strong>. Alongside it, a strategy blueprint maps the path from prototype to launch.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Brand &middot; product &middot; strategy</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Three ways to learn</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Membership tiers</span></div></div><div class="grid g3">{tcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="reveal" style="text-align:center;border:1px solid var(--line);border-radius:16px;padding:34px 24px">
  <div class="mono" style="color:#C9A24B;font-size:12px;letter-spacing:.2em">POWERED BY</div>
  <h3 style="margin-top:12px;font-size:24px">Imam Maged Al-Berlini</h3>
  <p style="color:var(--dim);margin-top:10px;max-width:56ch;margin-left:auto;margin-right:auto">Imam of the Arresalah Centre in Berlin. His teaching is the heart of ARJU&rsquo;s curriculum &mdash; and the reason a platform this considered has real substance behind it.</p>
  <div style="margin-top:18px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="https://youtube.com/@al.berlini1" class="btn btn-ghost" target="_blank" rel="noopener">YouTube @al.berlini1 &rarr;</a><a href="https://arresalah-berlin.de" class="btn btn-ghost" target="_blank" rel="noopener">arresalah-berlin.de &rarr;</a></div>
</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">A platform where sacred knowledge is <em>finally given the craft it deserves.</em></div><div class="quote-by reveal">ARJU &mdash; Islamic Learning &middot; powered by Imam Maged Al-Berlini</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><span class="btn btn-fill" style="opacity:.7;cursor:default">Coming soon</span><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a platform<br>like <em>this?</em>')
        return page("project-arju.html","ARJU — Islamic Learning Platform (Concept) | Ummah Collective","How Ummah Collective designed and prototyped ARJU, a premium Netflix-style Islamic learning platform powered by Imam Maged Al-Berlini — brand, product and strategy.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"ARJU — Islamic Learning Platform (Concept & Prototype)","about":"Brand, product design and prototype for ARJU, a premium Islamic learning platform","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-arju.html"}))
    if s=='dolezel':
        DPH='https://lh3.googleusercontent.com/gps-cs-s/APNQkAEU40B1kvrQcXY-OrWENl3e0urbvYqD5sBIirOYF5m-dtTvA98aEFoB2FujEYA9T0N_ybxKY04eOcvKMu3i0En6fGmGnWuc_efyL6h7_15lXMqosIAGwKX0WEw8sFundRA-_yoN=w1600-h1600-k-no'
        DURL='https://dolezel-de.vercel.app'
        _hero=('<div class="dz-hero"><div class="dz-hl">'
          '<span class="dz-badge"><i></i>MEISTERBETRIEB &middot; M&Uuml;NCHEN-HAIDHAUSEN</span>'
          '<div class="dz-h1">Sicherheit, die seit <em>1980</em> h&auml;lt.</div>'
          '<div class="dz-sub">Schl&uuml;ssel, Tresore, Schlie&szlig;anlagen und Sicherheitstechnik &mdash; handwerklich gefertigt, pers&ouml;nlich beraten, dauerhaft installiert.</div>'
          '<div class="dz-ctas"><span class="dz-cta">TERMIN VEREINBAREN &rarr;</span><span class="dz-cta ghost">LEISTUNGEN</span></div></div>'
          '<div class="dz-hp"><img src="'+DPH+'" alt="Dolezel Werkstatt, Weissenburger Str. 28" loading="lazy"><span class="dz-tag">WERKSTATT &middot; WEISSENBURGER STR. 28</span></div></div>')
        _dstats=('<div class="dz-stats"><div><b>40+</b><span>Jahre in Haidhausen</span></div><div><b>10K+</b><span>Zufriedene Kunden</span></div><div><b>16</b><span>Produktbereiche</span></div><div><b>24h</b><span>Notdienst M&uuml;nchen</span></div></div>')
        _pillars=('<div class="sa-award"><div class="sa-ah">Drei S&auml;ulen. Eine Sicherheitsadresse.</div>'
          '<div class="sa-asub">Vom Schl&uuml;ssel bis zur Alarmanlage &mdash; alles aus einer Werkstatt.</div>'
          '<div class="sa-chips"><span>Schl&uuml;ssel, Schloss &amp; Einbruchschutz</span><span>Tresore, Briefk&auml;sten &amp; Schilder</span><span>Elektronische Systeme &amp; Alarmanlagen</span></div></div>')
        _dshop=('<div class="dz-shop"><div class="dz-sh2">Bestellen. Abholen. Oder liefern lassen.</div><p>Der Dolezel-Shop &mdash; Sicherheit online bestellt, in Haidhausen abgeholt.</p><span class="dz-cta">ZUM SHOP &rarr;</span></div>')
        _bands=_hero+_dstats+_pillars+_dshop
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim dz reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">dolezel.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A scroll through the redesign we shipped &middot; <a href="'+DURL+'" target="_blank" rel="noopener">see it live &rarr;</a></div></div></section>')
        built=[("Bold Modern design system","Inter-led typography, ink and petrol, hard grids &mdash; a 40-year Handwerk brand that finally looks as solid as it builds."),("8-page website","Start, Unternehmen, Leistungen, Produkte, Shop, Referenzen, Blog, Kontakt &mdash; one coherent system, fully navigable."),("Online shop","12 products with category filters, cart and click &amp; collect &mdash; ordered online, picked up in Haidhausen."),("Ratgeber blog","Nine practical articles &mdash; from burglary protection to choosing a safe &mdash; with filters and pagination."),("Reputation, front and centre","Real Google reviews with verified badges and the &#9733;4.9 rating built into the experience, not hidden on a third-party site."),("Social discount mechanic","A 5% follower discount tied to Instagram and TikTok &mdash; turning store visits into an audience.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("8","Pages, one design system"),("12","Shop products in the launch range"),("9","Ratgeber articles"),("3","S&auml;ulen &mdash; service pillars"),("40+","Years of Munich Handwerk"),("4.9","&#9733; Google rating, made visible")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Schritt 1","Produkt w&auml;hlen &mdash; Launch-Sortiment, nach Kategorie gefiltert"),("Schritt 2","In den Warenkorb &mdash; mit laufendem Z&auml;hler"),("Schritt 3","Abholen in Haidhausen &mdash; oder liefern lassen"),("Schritt 4","5% Follower-Rabatt &mdash; via Instagram &amp; TikTok")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        saeulen=["Schl&uuml;ssel, Schloss &amp; Einbruchschutz","Tresore, Briefk&auml;sten &amp; Schilder","Elektronische Systeme &amp; Alarmanlagen"]
        trust=["Echte Google-Bewertungen mit Verified-Badge","&#9733;4.9 sichtbar ab der Startseite","Echtes Werkstatt-Foto statt Stock-Bildern","Google Maps &amp; direkte Anfahrt auf Kontakt","24h-Notdienst prominent erreichbar"]
        s1li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in saeulen)
        s2li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in trust)
        _shopshot=_ms(DURL+'/shop.html?uc=1')
        _refshot=_ms(DURL+'/referenzen.html?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A 40-year Munich security-technology Meisterbetrieb &mdash; redesigned bold and modern, with an online shop, a knowledge hub and its hard-earned reputation front and centre.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The brand</span></div>
    <h2 style="margin-top:10px">Four decades<br>of Munich Handwerk.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Adolf Dolezel GmbH</strong> has secured Munich since <strong>1980</strong> &mdash; a family-run Meisterbetrieb on <strong>Weissenburger Stra&szlig;e in Haidhausen</strong>, trusted by over 10,000 customers for keys, locking systems, safes and alarm technology, with a &#9733;4.9 Google rating to show for it. The craft was never the problem. The web presence was &mdash; a dated site that sold a Munich institution short. Our brief: a digital storefront as solid as the workshop behind it.</p>
  </div>
  <img class="pimg reveal" src="{DPH}" alt="Dolezel workshop storefront &mdash; Weissenburger Str. 28, M&uuml;nchen-Haidhausen" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_refshot}" alt="Referenzen &mdash; real Google reviews on the new site" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">Bold, modern &mdash;<br>and built to sell.</h2>
    <p style="color:var(--dim);margin-top:14px">We rebuilt <strong>dolezel.de</strong> as an eight-page <strong>Bold Modern</strong> system &mdash; Inter-led typography, ink and petrol, hard grids &mdash; around the three S&auml;ulen of the business. At its centre: an <strong>online shop</strong> with cart and click &amp; collect, a nine-article <strong>Ratgeber</strong> that answers real security questions, and the shop&rsquo;s <strong>Google reputation pulled into the site itself</strong> &mdash; verified reviews, &#9733;4.9, real workshop photography. Shipped and live on Vercel.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Redesign &middot; shop &middot; content</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The digital storefront</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Bestellen &middot; abholen &middot; sparen</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">A local locksmith doesn&rsquo;t need a webshop for its own sake &mdash; it needs one that <strong>brings people into the store</strong>. The Dolezel shop is built around <strong>click &amp; collect</strong>: order online, pick up at Weissenburger Stra&szlig;e, get advice face to face. The <strong>5% follower discount</strong> closes the loop, turning walk-in customers into an owned audience.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <img class="pimg reveal" src="{_shopshot}" alt="The Dolezel online shop &mdash; click &amp; collect" loading="lazy">
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">S&auml;ulen &amp; trust</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">What carries the site</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Die drei S&auml;ulen</div><ul class="incl">{s1li}</ul></div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Trust, eingebaut</div><ul class="incl">{s2li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Vierzig Jahre M&uuml;nchner Handwerk &mdash; <em>jetzt mit einem digitalen Zuhause, das genauso solide h&auml;lt.</em></div><div class="quote-by reveal">Adolf Dolezel GmbH &mdash; Sicherheitstechnik &middot; M&uuml;nchen-Haidhausen</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{DURL}" class="btn btn-fill" target="_blank" rel="noopener">See the redesign live &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a storefront<br>like <em>this?</em>')
        return page("project-dolezel.html","Dolezel — Security-Tech Redesign & Online Shop | Ummah Collective","How Ummah Collective redesigned Adolf Dolezel GmbH — a 40-year Munich security Meisterbetrieb — into a bold, modern 8-page site with an online shop, Ratgeber blog and Google reviews built in.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Dolezel — Website Redesign & Online Shop","about":"Bold Modern redesign, online shop and content system for Adolf Dolezel GmbH, Sicherheitstechnik München","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-dolezel.html"}))
    if s=='almaruf':
        AMURL='https://almaruf-maid.vercel.app'
        AMW='https://almarufmaid.com/wp-content/uploads/2025/10/'
        _hero=('<div class="am-hero" style="background-image:linear-gradient(100deg,rgba(10,37,64,.94) 34%,rgba(4,92,180,.55) 62%,rgba(10,37,64,.18)),url('+AMW+'ChatGPT-Image-Oct-19-2025-11_02_08-PM.png)">'
          '<span class="am-badge">MALAYSIA&ndash;INDONESIA MAID AGENCY</span>'
          '<div class="am-h1">The Most <em>Trusted</em><br>Maid Agency in Malaysia</div>'
          '<div class="am-sub">Caring, reliable helpers &mdash; carefully selected, fully documented, and trained to serve your family with respect and integrity.</div>'
          '<div class="am-ctas"><span class="am-cta">Get Free Consultation</span><span class="am-cta ghost">Explore Services</span></div>'
          '<div class="am-ticks"><span>&#10003; 6-Month Replacement Guarantee</span><span>&#10003; Licensed by JTKSM, JIM &amp; KBRI</span><span>&#10003; Guided by Islamic Values</span></div></div>')
        _trust=('<div class="sa-award"><div class="sa-ah">Why families trust Almaruf</div>'
          '<div class="sa-asub">A licensed Kuala Lumpur agency &mdash; run on care, compliance and clear answers.</div>'
          '<div class="sa-chips"><span>3,000+ families served</span><span>10+ years of experience</span><span>100% documented &amp; compliant</span><span>EN &middot; BM &middot; ID &middot; AR</span></div></div>')
        _clean=('<div class="am-clean"><div class="am-ch">Almaruf Cleaning</div><p>Professional &amp; Shariah-conscious cleaning &mdash; including Sertu &amp; Samak Islamic purification.</p>'
          '<div class="am-chips"><span>Deep Cleaning</span><span>Move-In / Move-Out</span><span>Post-Renovation</span><span>Sertu &amp; Samak</span></div></div>')
        _bands=_hero+_trust+_clean
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim am reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">almaruf-maid.vercel.app</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A scroll through the rebuild, staged for go-live &middot; <a href="'+AMURL+'" target="_blank" rel="noopener">see it live &rarr;</a></div></div></section>')
        built=[("Website rebuild","Seven pages &mdash; home, services, cleaning, about, testimonies, FAQ, contact &mdash; rebuilt clean, fast and mobile-first."),("4 languages, full RTL","English, Bahasa Melayu, Bahasa Indonesia and Arabic &mdash; 232 translation keys each, with proper right-to-left Arabic."),("WhatsApp-first conversion","Every CTA opens a pre-filled WhatsApp chat &mdash; the channel Malaysian families actually use. No dead contact forms."),("Almaruf Cleaning sub-brand","A second service line in its own green identity &mdash; six cleaning services plus Sertu &amp; Samak Islamic purification."),("Custom CRM","Purpose-built operations software: helper registry, placements pipeline, permit renewals and cleaning jobs."),("Trust architecture","Licences (JTKSM, JIM, KBRI), guarantees, real testimonies and the director&rsquo;s own story &mdash; structured to answer every doubt.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("7","Pages, mobile-first"),("4","Languages, incl. Arabic RTL"),("232","Translation keys &times; 4 languages"),("7","Stages in the placements pipeline"),("3,000+","Families served"),("10+","Years of experience")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Module 1","Maids &amp; Helpers registry &mdash; passports, permits &amp; FOMEMA expiries"),("Module 2","Placements kanban &mdash; seven stages, enquiry to handover"),("Module 3","Renewals &amp; permits &mdash; automatic 60-day due alerts"),("Module 4","Cleaning jobs board &mdash; the second business line, same system")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        sitel=["Four languages with full Arabic RTL","Every enquiry routed to WhatsApp, pre-filled","Testimonies &amp; FAQ built as trust pages","Cleaning brand with Islamic purification services","Fast, static and mobile-first"]
        crml=["Helper registry with document expiries","Seven-stage placements pipeline","60-day renewal &amp; permit alerts","Cleaning jobs &amp; scheduling","Invoicing &amp; finance, in one place"]
        s1li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in sitel)
        s2li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in crml)
        _cleanshot=_ms(AMURL+'/cleaning.html?uc=1')
        _svcshot=_ms(AMURL+'/services.html?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A licensed Kuala Lumpur maid agency &mdash; given a fast, four-language website that converts through WhatsApp, and custom CRM software that runs the business behind it.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The brand</span></div>
    <h2 style="margin-top:10px">Trust is<br>the product.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Almaruf Maid Agency</strong> places carefully selected, fully documented helpers with Malaysian families &mdash; <strong>3,000+ families over 10+ years</strong>, licensed by JTKSM, JIM and KBRI, and led by director <strong>Puan Zunainah Mohammed</strong>. In this industry, trust is everything &mdash; and their old website carried none of it. Our brief: a digital home that earns a family&rsquo;s confidence before the first phone call.</p>
  </div>
  <img class="pimg reveal" src="{AMW}About-Alameen-Maid-1.png" alt="Almaruf Maid Agency &mdash; Kuala Lumpur" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_cleanshot}" alt="Almaruf Cleaning &mdash; the Shariah-conscious cleaning sub-brand" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">One agency,<br>four languages, two brands.</h2>
    <p style="color:var(--dim);margin-top:14px">We rebuilt the site as <strong>seven fast, mobile-first pages</strong> speaking <strong>English, Bahasa Melayu, Bahasa Indonesia and Arabic</strong> &mdash; full RTL included, 232 translation keys per language. Every call-to-action opens a <strong>pre-filled WhatsApp chat</strong>, because that is where Malaysian families make decisions. And alongside the maid agency we built <strong>Almaruf Cleaning</strong> &mdash; a green-identity service line with Sertu &amp; Samak Islamic purification as its differentiator.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Site &middot; languages &middot; software</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The operations engine</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Custom CRM, built for this business</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">A maid agency lives and dies by <strong>documents and deadlines</strong> &mdash; passports, permits, FOMEMA checks, embassy contracts. Off-the-shelf CRMs don&rsquo;t speak that language, so we built one that does: every helper, placement and renewal in one system, with <strong>automatic alerts 60 days before anything expires</strong>.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <img class="pimg reveal" src="{_svcshot}" alt="Almaruf services &mdash; recruitment, renewals and the calling-visa process" loading="lazy">
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Site &amp; system</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Two halves of one build</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">What the site does</div><ul class="incl">{s1li}</ul></div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">What the CRM tracks</div><ul class="incl">{s2li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">A decade of trust, three thousand families &mdash; <em>now with a digital home in all four of their languages.</em></div><div class="quote-by reveal">Almaruf Maid Agency &mdash; Kuala Lumpur</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{AMURL}" class="btn btn-fill" target="_blank" rel="noopener">See the rebuilt site &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a system<br>like <em>this?</em>')
        return page("project-almaruf.html","Almaruf Maid — Website Rebuild & Custom CRM | Ummah Collective","How Ummah Collective rebuilt Almaruf Maid Agency's website in four languages with WhatsApp-first conversion, a cleaning sub-brand, and custom CRM software for placements, permits and renewals.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Almaruf Maid — Website Rebuild & Custom CRM","about":"Four-language website rebuild and custom CRM for Almaruf Maid Agency, Kuala Lumpur","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-almaruf.html"}))
    if s=='asyraf-takaful':
        ATURL='https://asyraf-takaful.vercel.app'
        _hero=('<div class="at-hero"><div>'
          '<span class="at-badge">&#9679; 100% patuh Syariah &middot; disokong Zurich</span>'
          '<div class="at-h1">Perlindungan halal yang <em>bijak</em> untuk masa depan keluarga anda.</div>'
          '<div class="at-sub">Saya Hj. Asyraf Fauzi &mdash; perunding Takaful Zurich bertauliah dengan 10+ tahun membantu keluarga dan usahawan di Kuala Lumpur dan Pantai Timur.</div>'
          '<div class="at-ctas"><span class="at-cta">Tempah perundingan percuma</span><span class="at-cta wa">WhatsApp saya</span></div>'
          '<div class="at-stats"><div><b>10+</b><span>Tahun pengalaman</span></div><div><b>2&times;</b><span>Johan Producer &rsquo;22 &amp; &rsquo;23</span></div><div><b>RM1M+</b><span>Volum agensi 2021</span></div></div>'
          '</div><div class="at-photo"><img src="'+ATURL+'/assets/img/asyraf-hero.jpg" alt="Hj. Asyraf Fauzi &mdash; Zurich Takaful specialist" loading="lazy"></div></div>')
        _trust=('<div class="sa-award"><div class="sa-ah">Kepercayaan, dibina dalam</div>'
          '<div class="sa-asub">Regulated, protected and proven &mdash; stated right on the page.</div>'
          '<div class="sa-chips"><span>Dikawal selia Bank Negara Malaysia</span><span>Dilindungi PIDM</span><span>KL &amp; Pantai Timur</span><span>Johan Producer &rsquo;22 &amp; &rsquo;23</span></div></div>')
        _prod=('<div class="at-prod"><div class="at-ph2">Zurich Takaful, explained simply.</div><p>Every plan on the site, in plain language &mdash; three of them with live calculators.</p>'
          '<div class="at-chips"><span>MediPro</span><span>MediAfya</span><span>Z-MedProtect</span><span>Takaful MediCash</span><span>ProInvest</span><span>Personal Sentinel V3</span><span>Z-Driver</span></div></div>')
        _bands=_hero+_trust+_prod
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim at reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">asyraf-takaful.vercel.app</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A scroll through the build, staged for go-live &middot; <a href="'+ATURL+'" target="_blank" rel="noopener">see it live &rarr;</a></div></div></section>')
        built=[("Trilingual, BM-first","Bahasa Melayu by default &mdash; the customer&rsquo;s language &mdash; with English and full right-to-left Arabic, 242 translation keys each."),("Booking wizard","A four-step flow &mdash; service, meeting type, date &amp; time, details &mdash; ending in a clean email-style confirmation."),("Four takaful calculators","Medical cover, family protection (hibah), education savings and motor &mdash; live estimates before the first call."),("Achievements as trust","Champion Personal Producer &rsquo;22 &amp; &rsquo;23 and the RM1M agency milestone &mdash; built into a dedicated trust page."),("One-pager + multipage","Two architectures from one system: a fast single page for ads, five structured pages for depth."),("WhatsApp-first contact","Every CTA routes to WhatsApp or the wizard &mdash; no dead forms, no friction.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("3","Languages &mdash; BM, EN, AR (RTL)"),("242","Translation keys &times; 3 languages"),("4","Live takaful calculators"),("4","Steps in the booking wizard"),("10+","Years advising families"),("2&times;","Champion Personal Producer")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Langkah 1","Pilih perkhidmatan &mdash; takaful plan or advice"),("Langkah 2","Jenis pertemuan &mdash; WhatsApp, call or in person"),("Langkah 3","Tarikh &amp; masa &mdash; pick a slot"),("Langkah 4","Butiran &amp; pengesahan &mdash; email-style summary")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        sitel=["BM default, English and full Arabic RTL","Every CTA routes to WhatsApp or the wizard","Achievements page &mdash; awards as social proof","One-pager for campaigns, multipage for depth","Zurich products explained in plain language"]
        calcl=["Medical cover estimator","Family protection &mdash; hibah","Education savings goal","Motor takaful estimate","Instant numbers, before the first call"]
        s1li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in sitel)
        s2li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in calcl)
        _bookshot=_ms(ATURL+'/booking.html?uc=2')  # uc=2: cache-bust after booking.html was replaced with the finished (rounded) wizard
        _calcshot=_ms(ATURL+'/calculators.html?uc=1')
        body=phero(crumb,f"Case / {c}",n,"An authorised Zurich Takaful specialist &mdash; given a trilingual, BM-first home with a booking wizard, four live calculators, and trust built into every section.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The specialist</span></div>
    <h2 style="margin-top:10px">Protection is personal.<br>So is trust.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Hj. Asyraf Fauzi</strong> is an authorised <strong>Zurich Takaful</strong> specialist and Agency Director of Gemilang Empire ZFN &mdash; serving Kuala Lumpur and the East Coast for <strong>10+ years</strong>, twice <strong>Champion Personal Producer</strong> (2022 &amp; 2023), with an RM1M agency contract volume in 2021. Takaful is bought on trust and explained face to face &mdash; his web presence needed to open that door, in the customer&rsquo;s own language.</p>
  </div>
  <img class="pimg reveal" src="{ATURL}/assets/img/asyraf-portrait.jpg" alt="Hj. Asyraf Fauzi" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_calcshot}" alt="Takaful calculators &mdash; live estimates on the site" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">BM first.<br>Numbers up front.</h2>
    <p style="color:var(--dim);margin-top:14px">We built the site <strong>Bahasa Melayu&ndash;first</strong> &mdash; with English and full right-to-left Arabic behind a switcher, 242 keys per language. Two things do the converting: a <strong>four-step booking wizard</strong> that turns interest into an appointment, and <strong>four live calculators</strong> &mdash; medical, hibah, education, motor &mdash; that give a family real numbers before the first conversation. Staged on Vercel, ready for go-live.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Site &middot; wizard &middot; calculators</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The booking engine</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Four steps to an appointment</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Insurance sites die at the contact form. This one <strong>guides</strong> instead: pick a service, choose how to meet, pick a slot, confirm &mdash; and the enquiry arrives structured, ready to answer. For everyone else, <strong>WhatsApp is one tap away</strong> on every page.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <img class="pimg reveal" src="{_bookshot}" alt="The four-step booking wizard" loading="lazy">
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Site &amp; calculators</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Built to convert on trust</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">What the site does</div><ul class="incl">{s1li}</ul></div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">The calculators</div><ul class="incl">{s2li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Protection advice in three languages &mdash; <em>and an appointment booked before the first phone call.</em></div><div class="quote-by reveal">Hj. Asyraf Fauzi &mdash; Zurich Takaful Specialist &middot; KL &amp; Pantai Timur</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{ATURL}" class="btn btn-fill" target="_blank" rel="noopener">See the live build &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a site<br>like <em>this?</em>')
        return page("project-asyraf-takaful.html","Asyraf Takaful — Trilingual Site, Booking Wizard & Calculators | Ummah Collective","How Ummah Collective built Hj. Asyraf Fauzi, an authorised Zurich Takaful specialist, a trilingual BM-first website with a 4-step booking wizard and four live takaful calculators.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Asyraf Takaful — Trilingual Website, Booking Wizard & Calculators","about":"Trilingual BM/EN/AR website with booking wizard and takaful calculators for a Zurich Takaful specialist","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-asyraf-takaful.html"}))
    if s=='dig-it-company':
        DIURL='https://dig-it-companyv2.vercel.app'
        _svg=('<svg viewBox="0 0 420 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
          '<rect x="8" y="8" width="404" height="190" fill="#efe8d9" stroke="#15130d" stroke-width="2"/>'
          '<path d="M8 48 L412 40" stroke="#15130d" stroke-width="1.5" fill="none"/>'
          '<path d="M8 8 h404 v34 l-404 8 Z" fill="none" stroke="#15130d" stroke-width="0"/>'
          '<path d="M8 42 C110 34 310 52 412 38" stroke="#15130d" stroke-width="1.5" fill="none"/>'
          '<path d="M8 104 C120 96 300 116 412 100" stroke="#15130d" stroke-width="1.5" fill="none"/>'
          '<path d="M8 158 C130 150 290 170 412 154" stroke="#15130d" stroke-width="1.5" fill="none"/>'
          '<g fill="#b4382b"><circle cx="150" cy="76" r="4"/><circle cx="290" cy="130" r="4"/><circle cx="205" cy="180" r="4"/></g>'
          '<g stroke="#b4382b" stroke-width="1.5"><path d="M150 68v16M142 76h16"/><path d="M290 122v16M282 130h16"/><path d="M205 172v16M197 180h16"/></g>'
          '<text x="162" y="80" font-family="monospace" font-size="11" fill="#15130d">F-04</text>'
          '<text x="302" y="134" font-family="monospace" font-size="11" fill="#15130d">B-11</text>'
          '<path d="M8 214 h120 M8 209 v10 M68 209 v10 M128 209 v10" stroke="#15130d" stroke-width="1.5"/>'
          '<text x="8" y="236" font-family="monospace" font-size="10" fill="#15130d">0</text>'
          '<text x="118" y="236" font-family="monospace" font-size="10" fill="#15130d">2 m</text></svg>')
        _hero=('<div class="di-hero"><div class="di-hl">'
          '<div class="di-eye"><i></i>ARCH&Auml;OLOGIE &middot; BAYERN &middot; SEIT 2001</div>'
          '<div class="di-h1">Arch&auml;ologie, die Bauen <em>m&ouml;glich macht.</em></div>'
          '<div class="di-sub">Seit 2001 bergen und dokumentieren wir als freiberufliches Grabungsteam Bayerns Vergangenheit &mdash; professionell, flexibel und termingerecht.</div>'
          '<div class="di-ctas"><span class="di-cta">PROJEKT ANFRAGEN</span><span class="di-cta ghost">UNSERE LEISTUNGEN</span></div></div>'
          '<div class="di-plan"><div class="di-coord">N 48.19 &middot; E 11.05 &middot; M 1:25</div>'+_svg+'<div class="di-cap">PROFIL OST &middot; STICHBANDKERAMIK &ndash; R&Ouml;MISCH</div></div></div>')
        _arch=('<div class="sa-award"><div class="sa-ah">70 Projekte. Siebzehn Jahre. Drei Sprachen.</div>'
          '<div class="sa-asub">The full reference archive, 2001&ndash;2017 &mdash; every entry in German, English and Arabic.</div>'
          '<div class="sa-chips"><span>Grabung &amp; Dokumentation</span><span>2001&ndash;2017</span><span>Bayernweit</span><span>DE &middot; EN &middot; AR</span></div></div>')
        _off=('<div class="di-off"><div class="di-oh">Vier Standorte in Bayern.</div><p>Ein Team &mdash; von Oberbayern bis ins Umland von M&uuml;nchen.</p>'
          '<div class="di-chips"><span>Peiting &middot; HQ</span><span>Garching</span><span>F&uuml;rstenfeldbruck</span><span>Landsberg</span></div></div>')
        _bands=_hero+_arch+_off
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim di reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">dig-it-companyv2.vercel.app</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A scroll through the redesign we shipped &middot; <a href="'+DIURL+'" target="_blank" rel="noopener">see it live &rarr;</a></div></div></section>')
        built=[("The Feldplan system","A survey-blueprint design language &mdash; paper grid, slab type, datum points and section drawings. Bold and angular, no clich&eacute;s."),("Three concepts to choose from","Strata, Feldplan and Monolith &mdash; three full design directions built as working demos, not moodboards. The client chose Feldplan."),("Trilingual, full RTL","German, English and Arabic with complete right-to-left support &mdash; rare for a regional Handwerk-adjacent firm, deliberate for international clients."),("70-project archive","The complete reference list 2001&ndash;2017, structured as data and rendered in all three languages &mdash; seventeen years of work, browsable."),("Image-light by design","The original photos were low-resolution &mdash; so the system replaces them with drawn SVG survey motifs that will never age or pixelate."),("Shipped &amp; live","Six pages, Google-Maps contact, social integration and the real company emblem &mdash; deployed on Vercel.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("6","Pages, no build step"),("3","Languages &mdash; DE, EN, AR (RTL)"),("70","Projects in the archive"),("17","Years of documented work"),("4","Offices across Bavaria"),("3","Design concepts presented")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Konzept A","Strata &mdash; dark, photographic, cinematic"),("Konzept B","Feldplan &mdash; light survey-blueprint, bold &amp; angular"),("Konzept C","Monolith &mdash; brutalist, type-led"),("Entscheidung","Feldplan &mdash; precise like the work itself")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        sitel=["Survey-blueprint design system (Feldplan)","Trilingual with full Arabic RTL","SVG survey motifs instead of weak photos","Google Maps &amp; social integration","Legal pages (Impressum, Datenschutz) built in"]
        archl=["70 projects, 2001&ndash;2017","Every entry in three languages","Structured as data, rendered as archive","Filterable, scannable, honest","Seventeen years of proof, one page"]
        s1li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in sitel)
        s2li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in archl)
        _refshot=_ms(DIURL+'/referenzen.html?uc=1')
        _lstshot=_ms(DIURL+'/leistungen.html?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A Bavarian field-archaeology firm since 2001 &mdash; redesigned as a survey blueprint: bold, angular, trilingual, with seventeen years of work in the archive.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The firm</span></div>
    <h2 style="margin-top:10px">They dig before<br>Bavaria builds.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Dig it! Company GbR</strong> is a freelance field-archaeology team working across Bavaria since <strong>2001</strong> &mdash; excavating and documenting for public institutions and private developers before construction can begin, from four offices: <strong>Peiting (HQ), Garching, F&uuml;rstenfeldbruck and Landsberg</strong>. The name is the work: archaeologists who dig. Their 2018-era website said none of that.</p>
  </div>
  <img class="pimg reveal" src="{_lstshot}" alt="Leistungen &mdash; the services page of the Feldplan redesign" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_refshot}" alt="Referenzen &mdash; the 70-project trilingual archive" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">Precise like<br>a Feldplan.</h2>
    <p style="color:var(--dim);margin-top:14px">We presented <strong>three complete design concepts</strong> as working demos; the firm chose <strong>Feldplan</strong> &mdash; a light survey-blueprint system with paper grid, slab type and drawn section profiles. Because the original photography was low-resolution, the design is deliberately <strong>image-light</strong>: SVG survey motifs carry the identity instead. Underneath: <strong>three languages including full Arabic RTL</strong>, and the complete <strong>70-project archive</strong> from seventeen years of digs.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">System &middot; languages &middot; archive</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Three concepts, one call</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Design as a decision, not a guess</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Instead of one take-it-or-leave-it draft, we built <strong>three full design directions as clickable demos</strong> &mdash; dark-cinematic, survey-blueprint, and brutalist &mdash; so the decision was made on real pages, not promises. Feldplan won because it looks like what the firm actually does: <strong>precise documentation of the ground beneath Bavaria</strong>.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Site &amp; archive</div><ul class="incl">{s1li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The archive</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Seventeen years, structured</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><p style="color:var(--dim)">A firm like this doesn&rsquo;t need testimonials &mdash; it needs its <strong>track record made visible</strong>. We turned the complete project list into structured data and rendered it as a browsable, trilingual archive: 70 excavations and surveys across Bavaria, 2001 to 2017.</p></div>
    <div class="reveal"><ul class="incl">{s2li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Two decades in Bavaria&rsquo;s ground &mdash; <em>now documented as precisely online as on site.</em></div><div class="quote-by reveal">Dig it! Company GbR &mdash; Arch&auml;ologie &middot; Bayern</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{DIURL}" class="btn btn-fill" target="_blank" rel="noopener">See the redesign live &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a system<br>like <em>this?</em>')
        return page("project-dig-it-company.html","Dig it! Company — Feldplan Redesign, Trilingual | Ummah Collective","How Ummah Collective redesigned Dig it! Company, a Bavarian field-archaeology firm — a survey-blueprint design system, trilingual DE/EN/AR with RTL, and a 70-project archive.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Dig it! Company — Feldplan Website Redesign","about":"Survey-blueprint trilingual website redesign for a Bavarian field-archaeology firm","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-dig-it-company.html"}))
    if s=='shoraka':
        SKURL='https://shorakagroup.com'
        _hero=('<div class="sk-hero"><i class="sk-hex h1x"></i><i class="sk-hex h2x"></i><div class="sk-hl">'
          '<div class="sk-h1">Islamic Finance Built<br>For <em>The Digital Age</em></div>'
          '<div class="sk-sub">Shoraka Group delivers ethical, technology-driven financial solutions for individuals and businesses &mdash; rooted in Islamic principles, powered by innovation.</div>'
          '<div class="sk-ctas"><span class="sk-cta">Learn More</span><span class="sk-cta ghost">Talk To Us</span></div></div></div>')
        _why=('<div class="sa-award"><div class="sa-ah">Why Shoraka?</div>'
          '<div class="sa-asub">Trust, engineered into every layer of the experience.</div>'
          '<div class="sa-chips"><span>Shariah-Compliant at the Core</span><span>Security You Can Trust</span><span>Smart, Streamlined Solutions</span></div></div>')
        _plat=('<div class="sk-plat"><div class="sk-ph2">One group. Six platforms.</div><p>Every product with its own home &mdash; and a Shariah-advisors page behind them all.</p>'
          '<div class="sk-chips"><span>Raya &middot; EWA</span><span>Ringgit Ease</span><span>Suyula</span><span>QuickFactor</span><span>Al-Amin</span><span>Ventures</span></div></div>')
        _bands=_hero+_why+_plat
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim sk reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">shorakagroup.com</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the site we built &middot; <a href="'+SKURL+'" target="_blank" rel="noopener">visit shorakagroup.com &rarr;</a></div></div></section>')
        built=[("The group&rsquo;s digital home","shorakagroup.com &mdash; one coherent site for a multi-platform fintech group, live on their own domain."),("UX documentation","Benchmarked against global fintechs &mdash; flows, structure and content architecture documented before a pixel was drawn."),("High-fidelity UI","A precise maroon-and-white system around the Shoraka mark &mdash; corporate trust with fintech clarity."),("Six platform pages","Raya, Ringgit Ease, Suyula, QuickFactor, Al-Amin and Ventures &mdash; each product explained in its own right."),("Trust architecture","Shariah advisors, the team and the 2006-to-today story &mdash; the pages that make a finance brand credible."),("SEO &amp; analytics","Structured for search and measured from day one &mdash; plus a media hub that now carries the group&rsquo;s growing press coverage.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("6","Platform &amp; product pages"),("2006","Founded &mdash; Dubai to Kuala Lumpur"),("3","Trust pillars, front and centre"),("2","Financing pillars + services"),("EN+BM","News in both languages"),("100%","Live on their own domain")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Raya","Earned Wage Access &mdash; the Shoraka RAYA app"),("Ringgit Ease","Personal Financing-i for everyday needs"),("Suyula","The Ar-Rahnu platform"),("QuickFactor &amp; Al-Amin","Digital factoring and Tawarruq for business")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        sitel=["One site, six product lines &mdash; clearly separated","Shariah-advisors page as a first-class citizen","Team &amp; story pages &mdash; 2006 to today","Media hub carrying real press coverage","Contact &amp; lead capture on every path"]
        newsl=["Uzbekistan &mdash; strategic partnership with Raqama Ltd.","Collaboration with AFFIN","&lsquo;Bayar Jak&rsquo; &mdash; financial inclusion in Sarawak","Featured among fintech industry leaders","Coverage in English and Bahasa Malaysia"]
        s1li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in sitel)
        s2li="".join('<li><span class="ck">&#10003;</span><div><b>'+x+'</b></div></li>' for x in newsl)
        _rayashot=_ms(SKURL+'/raya/?uc=1')
        _mediashot=_ms(SKURL+'/media/?uc=1')
        body=phero(crumb,f"Case / {c}",n,"The digital home of a Shariah-compliant fintech group &mdash; UX-documented, benchmarked to global fintechs, and live at shorakagroup.com carrying the group&rsquo;s growing story.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The group</span></div>
    <h2 style="margin-top:10px">Islamic finance,<br>run as an ecosystem.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Shoraka Group</strong> builds Shariah-compliant digital finance from Kuala Lumpur &mdash; a family of platforms spanning <strong>earned wage access (Raya), personal financing (Ringgit Ease), Ar-Rahnu (Suyula), digital factoring (QuickFactor), Tawarruq (Al-Amin) and ventures</strong>, with roots going back to <strong>2006</strong>. A group like that needs one digital home that makes the whole ecosystem legible &mdash; to customers, partners and regulators alike.</p>
  </div>
  <img class="pimg reveal" src="{_rayashot}" alt="Raya &mdash; the Earned Wage Access platform page" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_mediashot}" alt="The Shoraka media hub &mdash; real press coverage" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">Benchmarked to<br>global fintechs.</h2>
    <p style="color:var(--dim);margin-top:14px">We built <strong>shorakagroup.com</strong> the way fintech infrastructure gets built: <strong>UX documentation first</strong>, benchmarked against the best global fintech sites, then a <strong>high-fidelity UI system</strong> in the group&rsquo;s maroon, with <strong>SEO and analytics</strong> wired in from launch. Today the site carries the group&rsquo;s momentum &mdash; from an <strong>AFFIN collaboration</strong> to a fintech partnership in <strong>Uzbekistan</strong> &mdash; in English and Bahasa Malaysia.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">UX &middot; UI &middot; SEO &middot; analytics</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The ecosystem, made legible</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Six platforms, one architecture</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">A multi-platform group usually ends up with a confusing website. The architecture here does the opposite: each product gets <strong>its own page, its own story and its own call-to-action</strong> &mdash; while the group narrative, the Shariah governance and the news hold everything together.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">What the site carries</div><ul class="incl">{s1li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">In the news</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">The site now carries the story</span></div></div>
  <div class="grid g2" style="gap:26px;align-items:start">
    <div class="reveal"><p style="color:var(--dim)">The best measure of a fintech group&rsquo;s website is whether it can <strong>keep up with the business</strong>. Shoraka&rsquo;s media hub does &mdash; real coverage, added as it happens, in both of the group&rsquo;s languages.</p></div>
    <div class="reveal"><ul class="incl">{s2li}</ul></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">A Shariah-compliant fintech group &mdash; <em>finally with a digital home as structured as its finance.</em></div><div class="quote-by reveal">Shoraka Group &mdash; Shariah-Compliant Digital Finance &middot; Kuala Lumpur</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{SKURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit shorakagroup.com &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a platform<br>like <em>this?</em>')
        return page("project-shoraka.html","Shoraka Group — Shariah-Compliant Fintech Website | Ummah Collective","How Ummah Collective built shorakagroup.com — UX documentation, high-fidelity UI, SEO and analytics for a Shariah-compliant fintech group with six platforms, live and carrying real press coverage.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Shoraka Group — Fintech Website","about":"Website, UX documentation, UI system, SEO and analytics for Shoraka Group, Shariah-compliant digital finance","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-shoraka.html"}))
    if s=='barmer':
        BLOGO='https://commons.wikimedia.org/wiki/Special:FilePath/BARMER_Logo.svg'
        _herob=('<section style="padding-top:10px"><div class="wrap"><div class="bm-hero reveal">'
          '<div class="bm-eye">BERLIN &middot; 2014&ndash;22 &middot; HERITAGE</div>'
          '<img class="bm-logo" src="'+BLOGO+'" alt="BARMER" loading="eager">'
          '<div class="bm-line">Cultural fluency, proven at <em>enterprise scale.</em></div>'
          '<p class="bm-sub">Eight years of campaign creative and corporate design for one of Germany&rsquo;s largest statutory health insurers &mdash; delivered through AR City Media, Berlin.</p>'
          '</div></div></section>')
        built=[("Campaign creative","Concepts, key visuals and campaign assets &mdash; produced to the standards of a regulated, national health brand."),("Corporate design","Working inside one of Germany&rsquo;s most recognisable brand systems &mdash; extending it without ever bending it."),("Multicultural audiences","Reaching Germany&rsquo;s Turkish- and Arabic-speaking communities in their own languages &mdash; AR City Media&rsquo;s specialty, a decade before &lsquo;cultural marketing&rsquo; became a buzzword."),("An eight-year relationship","2014 to 2022 &mdash; enterprise clients don&rsquo;t keep agencies that long unless the work keeps landing."),("Enterprise standards","Compliance, brand governance, sign-off chains &mdash; the discipline that now underpins every UC delivery."),("The lineage","This is where Ummah Collective&rsquo;s 12+ years of craft come from: our founder built brands in Berlin long before founding UC in Kuala Lumpur.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("8","Years of collaboration &mdash; 2014&ndash;22"),("2","Disciplines &mdash; campaign &amp; corporate design"),("Millions","Of insured across Germany"),("Berlin","Delivered via AR City Media")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        body=phero(crumb,f"Case / {c}",n,"Heritage work &mdash; eight years of campaign creative and corporate design for one of Germany&rsquo;s largest statutory health insurers, through AR City Media, Berlin.")+f'''
{_herob}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The client</span></div>
    <h2 style="margin-top:10px">A national institution,<br>a diverse nation.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>BARMER</strong> is one of Germany&rsquo;s largest statutory health insurers, serving millions of insured across the country. And Germany is not one audience: millions of its residents live, decide and trust in Turkish, Arabic and other languages. Reaching them isn&rsquo;t translation &mdash; it&rsquo;s <strong>cultural fluency</strong>, the thing most agencies claim and few can prove at this scale.</p>
  </div>
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The mandate</span></div>
    <h2 style="margin-top:10px">Campaigns that speak<br>the audience&rsquo;s language.</h2>
    <p style="color:var(--dim);margin-top:14px">Through <strong>AR City Media, Berlin</strong> &mdash; the ethno-marketing agency where our founder built brands for a decade &mdash; the mandate ran from <strong>campaign creative to corporate design</strong>, 2014 to 2022: national-brand discipline on one side, genuine multicultural reach on the other. That combination is rare. It is also exactly what Ummah Collective was founded to carry forward.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What the work covered</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Campaign &middot; design &middot; heritage</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">The shape of it</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Cultural fluency isn&rsquo;t a niche skill &mdash; <em>at enterprise scale, it decides whether a message lands at all.</em></div><div class="quote-by reveal">BARMER &times; AR City Media &mdash; Berlin &middot; 2014&ndash;22</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="booking.html" class="btn btn-fill" data-i18n="book">Book a call</a><a href="about.html" class="btn btn-ghost">Our story &rarr;</a></div></div></section>
{nextnav}
'''+cta('Want this craft<br>on <em>your brand?</em>')
        return page("project-barmer.html","BARMER — Heritage Campaign Work via AR City Media | Ummah Collective","Eight years of campaign creative and corporate design for BARMER, one of Germany's largest statutory health insurers — heritage work through AR City Media, Berlin (2014–22).",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"BARMER — Heritage Campaign & Corporate Design","about":"Campaign creative and corporate design for BARMER via AR City Media Berlin, 2014-2022","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-barmer.html"}))
    if s=='b-plus-ag':
        BPURL='https://b-plus-ag.de'
        _hero=('<div class="bp-top"><span>+49 (0)30 39095-320</span><span>info@b-plus-ag.de</span><span>Westhafenstr. 1, D-13353 Berlin</span></div>'
          '<div class="bp-nav"><b>B Plus<br>Planungs-AG</b><span class="bp-links">HOME &middot; ARBEITSGEBIETE &middot; LEISTUNGSPROFILE &middot; KARRIERE</span><span class="bp-cta">KONTAKT</span></div>'
          '<div class="bp-hero"><div class="bp-h1">Mit Intelligenz und Kompetenz<br>die <em>Zukunft gestalten</em></div>'
          '<div class="bp-sub">Egal wo oder was Sie bauen m&ouml;chten &mdash; wir mobilisieren, wertsch&auml;tzen und realisieren Ihr Projekt.</div>'
          '<span class="bp-btn">KONTAKT</span></div>')
        _felder=('<div class="sa-award"><div class="sa-ah">Wir planen, steuern und &uuml;berwachen Ihr Projekt.</div>'
          '<div class="sa-asub">Sechs Arbeitsgebiete, ein Ingenieurb&uuml;ro.</div>'
          '<div class="sa-chips"><span>Wasserbau</span><span>Verkehrsanlagen</span><span>Siedlungswasserwirtschaft</span><span>Hoch- &amp; Industriebau</span><span>Tragwerksplanung</span><span>Technische Ausr&uuml;stung</span></div></div>')
        _karr=('<div class="bp-karr"><div class="bp-kh">Werde Teil unseres Teams!</div><p>Offene Stellen, echte Benefits, direkte Bewerbung &mdash; das Recruiting l&auml;uft &uuml;ber die Website.</p>'
          '<div class="bp-chips"><span>Architekt / Bauingenieur (Hochbau)</span><span>Bauingenieur Bau&uuml;berwachung (Tiefbau)</span><span>Initiativbewerbung</span></div></div>')
        _bands=_hero+_felder+_karr
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim bp reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">b-plus-ag.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the site we built &middot; <a href="'+BPURL+'" target="_blank" rel="noopener">visit b-plus-ag.de &rarr;</a></div></div></section>')
        built=[("Corporate website","A clean, confident home for an engineering firm &mdash; six fields of work and seven service profiles, made instantly legible."),("Recruiting hub","A Karriere section with live job listings, employer benefits and a direct application flow &mdash; built into the site, not bolted on."),("Recruiting campaigns","Campaigns that put the open roles in front of Berlin&rsquo;s engineers &mdash; because in this market, candidates don&rsquo;t find you by accident."),("Six Arbeitsgebiete","Wasserbau to Tragwerksplanung &mdash; each field with its own section, anchor-linked and scannable."),("Seven Leistungsprofile","From Projektsteuerung to SiGe-Koordination &mdash; the full service depth, structured for the people who commission it."),("People, not hotlines","Real contact persons with direct lines &mdash; the way public and private Auftraggeber actually want to reach an Ingenieurb&uuml;ro.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("6","Arbeitsgebiete &mdash; vom Wasserbau bis zur Technischen Ausr&uuml;stung"),("7","Leistungsprofile, klar strukturiert"),("3","Deliverables &mdash; Website, Recruiting, Kampagnen"),("Berlin","Westhafen &mdash; im Herzen der Hauptstadt")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Schritt 1","Stellenanzeige als eigene Seite &mdash; nicht als PDF"),("Schritt 2","Kampagnen bringen Kandidaten auf die Seite"),("Schritt 3","Benefits verkaufen den Arbeitgeber"),("Schritt 4","Bewerbung direkt ins Postfach &mdash; personal@")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(BPURL+'?uc=1')
        _karrshot=_ms(BPURL+'/karriere/?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A Berlin engineering firm for water, transport and industrial construction &mdash; given a modern digital home, a recruiting engine, and the campaigns to fill it.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The firm</span></div>
    <h2 style="margin-top:10px">Engineering Berlin&rsquo;s<br>infrastructure.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>B Plus Planungs-AG</strong> plans, steers and supervises construction projects from Berlin&rsquo;s Westhafen &mdash; planning and consulting across Hoch- und Tiefbau for <strong>public and private clients</strong>, with a focus on commercial property and <strong>port-related facilities</strong>, up to and including BImSchG approval procedures. Serious engineering &mdash; that deserved more than the anonymous web presence the industry defaults to.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="b-plus-ag.de &mdash; the site we built" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_karrshot}" alt="The Karriere recruiting hub on b-plus-ag.de" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">A website that<br>hires engineers.</h2>
    <p style="color:var(--dim);margin-top:14px">We built <strong>b-plus-ag.de</strong> as more than a brochure: a clear six-field architecture for clients &mdash; and a <strong>recruiting engine</strong> for the firm&rsquo;s scarcest resource. In a market where every Ingenieurb&uuml;ro competes for the same engineers, the Karriere hub turns job ads into proper landing pages, and <strong>campaigns</strong> put them in front of the right candidates. Applications land directly in the inbox.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Website &middot; recruiting &middot; campaigns</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The recruiting engine</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Vom Inserat zur Bewerbung</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Germany&rsquo;s engineering shortage means the best candidates are <strong>never actively searching</strong>. So the site doesn&rsquo;t wait: open roles live as real pages with real benefits &mdash; BVG Jobticket, flexible hours, health management &mdash; and campaigns carry them to the engineers who should see them.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">By the numbers</div><div class="stats" style="margin-top:12px">{rcells}</div></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Ingenieure gewinnt man nicht mit Anzeigen von gestern &mdash; <em>sondern mit einem Auftritt, der Kompetenz zeigt.</em></div><div class="quote-by reveal">B Plus Planungs-AG &mdash; Ingenieurb&uuml;ro &middot; Berlin</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{BPURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit b-plus-ag.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a site<br>that <em>recruits?</em>')
        return page("project-b-plus-ag.html","B Plus AG — Website, Recruiting & Campaigns | Ummah Collective","How Ummah Collective built b-plus-ag.de for a Berlin engineering firm — corporate website, a Karriere recruiting hub with live job listings, and the campaigns to fill them.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"B Plus Planungs-AG — Website, Recruiting Hub & Campaigns","about":"Corporate website, recruiting hub and campaigns for B Plus Planungs-AG, Berlin engineering firm","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-b-plus-ag.html"}))
    if s=='jugendberufsagentur':
        JBURL='https://www.meinejbainbrandenburg.de'
        _hero=('<div class="jb-hero"><span class="jb-blob b1"></span><span class="jb-blob b2"></span><span class="jb-dash d1"></span><span class="jb-dash d2"></span>'
          '<div class="jb-sign">Willkommen bei deiner<br><em>JBA in Brandenburg</em></div>'
          '<div class="jb-cards"><span>JBA Potsdam</span><span>JBA Brandenburg an der Havel</span><span>JBA Teltow-Fl&auml;ming</span></div></div>')
        _events=('<div class="jb-ev"><div class="jb-eh">DAS MERK&rsquo; ICH MIR</div><p>Workshops, Arbeitgeber-Events und Elternabende &mdash; laufend gepflegt, mit Online-Anmeldung.</p>'
          '<div class="jb-chips"><span>Digital f&uuml;r Eltern</span><span>Berufe &amp; Karriere in Uniform</span><span>Eignungstest-Workshop</span><span>Das perfekte Vorstellungsgespr&auml;ch</span></div></div>')
        _trust=('<div class="sa-award"><div class="sa-ah">Wir f&uuml;r dich.</div>'
          '<div class="sa-asub">Ein Auftritt, der jungen Menschen den Weg in den Beruf zeigt &mdash; barrierefrei und nahbar.</div>'
          '<div class="sa-chips"><span>0800 45555 00</span><span>Online-Anmeldebogen</span><span>Barrierefreiheits-Erkl&auml;rung</span><span>Drei Standorte, eine Marke</span></div></div>')
        _bands=_hero+_trust+_events
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim jb reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">meinejbainbrandenburg.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the platform we brand, build and run &middot; <a href="'+JBURL+'" target="_blank" rel="noopener">visit meinejbainbrandenburg.de &rarr;</a></div></div></section>')
        built=[("Complete branding &amp; CI","A shared identity for three agencies &mdash; playful, young and unmistakably one brand, from logo system to colour world."),("One site, three agencies","Potsdam, Brandenburg an der Havel and Teltow-Fl&auml;ming &mdash; each with its own section, all under one digital roof."),("Event hub with registration","The &lsquo;Das merk&rsquo; ich mir&rsquo; calendar: workshops, employer events and parent evenings, with online sign-up forms."),("Ongoing management","We maintain and update the platform continuously &mdash; the calendar running months ahead is the proof."),("User &amp; client communication","Enquiries from young people, parents and partner institutions &mdash; handled as part of the engagement, not left to a mailbox."),("Public-sector standards","Accessibility statement, Impressum, DSGVO, a free 0800 hotline &mdash; built to the standards public institutions answer to.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("3","Jugendberufsagenturen, eine Marke"),("4","Deliverables &mdash; Brand, Website, Betrieb, Kommunikation"),("2022","Engagement start &mdash; and still running"),("0800","Kostenlose Hotline, eingebaut")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Laufend","Events &amp; Workshops ver&ouml;ffentlichen"),("Laufend","Anmeldungen &amp; Anfragen beantworten"),("Laufend","Inhalte f&uuml;r drei Standorte pflegen"),("Laufend","Technik, Sicherheit &amp; Updates")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(JBURL+'?uc=1')
        _potshot=_ms(JBURL+'/potsdam/?uc=1')
        body=phero(crumb,f"Case / {c}",n,"Three Jugendberufsagenturen in Brandenburg &mdash; given one brand, one website, and a partner who runs it: content, events, maintenance and communication, since 2022.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The mandate</span></div>
    <h2 style="margin-top:10px">Three agencies.<br>One front door.</h2>
    <p style="color:var(--dim);margin-top:14px">A <strong>Jugendberufsagentur</strong> bundles employment agency, Jobcenter and youth services to guide young people into training and careers. In Brandenburg, three of them &mdash; <strong>Potsdam, Brandenburg an der Havel and Teltow-Fl&auml;ming</strong> &mdash; needed what public institutions rarely have: one warm, young, recognisable brand and a single digital front door that parents and teenagers actually want to use.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="meinejbainbrandenburg.de &mdash; the platform we brand and run" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_potshot}" alt="JBA Potsdam &mdash; one of three agency sections" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build &amp; the operation</span></div>
    <h2 style="margin-top:10px">Built once.<br>Run continuously.</h2>
    <p style="color:var(--dim);margin-top:14px">We created the <strong>complete branding and CI</strong>, built <strong>meinejbainbrandenburg.de</strong> around it &mdash; and have <strong>run the platform since 2022</strong>: publishing workshops and employer events, handling registrations and enquiries from users and partner institutions, and keeping three agencies&rsquo; content current. The events calendar planning months ahead isn&rsquo;t decoration &mdash; it&rsquo;s the operation, visible.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we deliver</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Brand &middot; web &middot; operations &middot; comms</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The operating engagement</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">A retainer, not a relaunch</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Most agency work ends at launch. This one didn&rsquo;t: for a public-sector platform, the value is in the <strong>running</strong> &mdash; fresh events, answered enquiries, three locations kept in sync, and a site that stays secure and accessible. That&rsquo;s the model we now call a <strong>systems retainer</strong>; this engagement has proven it since 2022.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">By the numbers</div><div class="stats" style="margin-top:12px">{rcells}</div></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Junge Menschen erreicht man nicht mit Amtsdeutsch &mdash; <em>sondern mit einer Marke, die ihre Sprache spricht.</em></div><div class="quote-by reveal">Jugendberufsagenturen Brandenburg &mdash; Potsdam &middot; Brandenburg a.d.H. &middot; Teltow-Fl&auml;ming</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{JBURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit meinejbainbrandenburg.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a partner<br>who <em>runs it?</em>')
        return page("project-jugendberufsagentur.html","Jugendberufsagentur Brandenburg — Brand, Website & Operations | Ummah Collective","How Ummah Collective branded, built and runs meinejbainbrandenburg.de — one CI and website for three Jugendberufsagenturen in Brandenburg, with ongoing management and communication since 2022.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Jugendberufsagentur Brandenburg — Branding, Website & Operations","about":"Branding, website and ongoing operation for three Jugendberufsagenturen in Brandenburg","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-jugendberufsagentur.html"}))
    if s=='optima':
        OPURL='https://optima-limited.com'
        _hero=('<div class="op-hero"><span class="op-glow"></span><div class="op-hl">'
          '<div class="op-h1">Fast. Digital.<br>Financing.</div>'
          '<div class="op-sub">Start your business growth journey with ethical financing designed for SMEs &mdash; fast, transparent funding through a fully digital platform.</div>'
          '<span class="op-cta">Apply Now &rarr;</span></div>'
          '<div class="op-cards"><span class="op-card c1"><i>Balance</i><b>$25,750.50</b></span><span class="op-card c2"><i>Transactions</i><b>&#9601;&#9603;&#9605;&#9607;</b></span></div></div>')
        _princ=('<div class="sa-award"><div class="sa-ah">Finance that aligns with your principles.</div>'
          '<div class="sa-asub">The product promise, made legible on every page.</div>'
          '<div class="sa-chips"><span>Ethical by Design</span><span>Upfront Cash Flow</span><span>Transparent Process</span><span>Fast &amp; Paperless</span></div></div>')
        _flow=('<div class="op-flow"><div class="op-fh">Upload. Approve. Get Paid.</div><p>Submit unpaid invoices and receive fast financing &mdash; one secure, paperless platform. No delays, no hidden fees.</p><span class="op-cta">Get Started Now</span></div>')
        _bands=_hero+_princ+_flow
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim op reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">optima-limited.com</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the platform site we built from scratch &middot; <a href="'+OPURL+'" target="_blank" rel="noopener">visit optima-limited.com &rarr;</a></div></div></section>')
        built=[("Brand &amp; CI from zero","Name treatment, mark, colour world and voice &mdash; a fintech identity built from a blank page."),("UX architecture","From first visit to submitted application &mdash; the apply flow designed before a single screen was drawn."),("Dark fintech UI","A near-black system with violet depth and product mockups &mdash; credibility you can see before you read a word."),("Website build","Five pages plus the application flow &mdash; product, company, apply and contact, all built from scratch."),("SEO &amp; content","Plain-language explanations of invoice financing &mdash; structured for search and for humans skimming an FAQ."),("Trust architecture","No hidden fees, real-trade backing, an FAQ that answers the hard questions &mdash; trust engineered into copy and layout.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("6","Deliverables &mdash; brand, CI, UX, UI, web, SEO"),("5","Pages + application flow"),("0","Hidden fees &mdash; the message the site carries"),("2022","Built from scratch")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Step 1","Upload &mdash; submit your unpaid B2B invoices"),("Step 2","Verify &mdash; invoices checked on the platform"),("Step 3","Funded &mdash; capital disbursed within days"),("Step 4","Follow-up &mdash; Optima manages the customer, not you")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(OPURL+'?uc=1')
        _prodshot=_ms(OPURL+'/our-products/?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A digital invoice-financing platform for SMEs &mdash; given its entire identity from scratch: brand, CI, UX, UI, website and SEO.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The platform</span></div>
    <h2 style="margin-top:10px">Invoices in.<br>Cash flow out.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Optima Limited</strong> gives SMEs, exporters and suppliers what banks make slow: working capital. Businesses submit unpaid B2B invoices and receive an advance through a <strong>fully digital platform</strong> &mdash; transparent, contract-based, with no hidden fees, and with Optima handling the customer follow-up. Ethical financing, engineered as a product.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="optima-limited.com &mdash; the platform site we built" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_prodshot}" alt="Our Products &mdash; the financing explained" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">For a fintech, the website<br>is the first credit check.</h2>
    <p style="color:var(--dim);margin-top:14px">Optima came to us with a product and nothing around it. We built <strong>everything from scratch</strong>: the brand and CI, the UX of the application journey, a <strong>dark fintech UI</strong> with violet depth and product mockups, the five-page website, and the SEO and content that explain invoice financing in plain language. When a company asks SMEs to trust it with their cash flow, the site has to answer first &mdash; this one does.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Brand &middot; UX &middot; UI &middot; web &middot; SEO</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">The product, made legible</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Upload &middot; approve &middot; get paid</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Invoice financing sounds complicated &mdash; which is exactly why the site refuses to be. The whole product fits in three words on the page: <strong>Upload. Approve. Get&nbsp;Paid.</strong> Everything else &mdash; FAQ, principles, process &mdash; exists to remove the next doubt before it forms.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">By the numbers</div><div class="stats" style="margin-top:12px">{rcells}</div></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Trust is the product &mdash; <em>the website just makes it visible at first glance.</em></div><div class="quote-by reveal">Optima Limited &mdash; Digital Invoice Financing for SMEs</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{OPURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit optima-limited.com &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a brand<br>from <em>zero?</em>')
        return page("project-optima.html","Optima Limited — Fintech Brand, UX & Website from Scratch | Ummah Collective","How Ummah Collective built Optima Limited from scratch — brand and CI, UX, dark fintech UI, website and SEO for a digital invoice-financing platform serving SMEs.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Optima Limited — Brand, UX, UI, Website & SEO","about":"Brand, CI, UX, UI, website and SEO for Optima Limited, a digital invoice-financing platform","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-optima.html"}))
    if s=='ar-city-media':
        ACURL='https://www.arcitymedia.de'
        _herob=('<section style="padding-top:10px"><div class="wrap"><div class="bm-hero reveal">'
          '<div class="bm-eye">BERLIN &middot; ETHNO-MARKETING &amp; FULL SERVICE &middot; 2014&ndash;22</div>'
          '<div style="font-family:var(--mono);font-weight:600;font-size:clamp(22px,3vw,34px);letter-spacing:.3em;color:#15130d;margin-bottom:20px">AR CITY MEDIA</div>'
          '<div class="bm-line">Kulturspezifische Kommunikation &mdash; <em>as a craft.</em></div>'
          '<p class="bm-sub">The Berlin agency where our founder built brands for eight years &mdash; reaching Germany&rsquo;s multicultural communities with full-service campaigns, long before &lsquo;cultural marketing&rsquo; had a conference circuit.</p>'
          '</div></div></section>')
        _acshot=_ms(ACURL)
        built=[("Ethno-marketing as the specialty","Cultural awareness for audiences with Migrationshintergrund &mdash; knowing how and where to reach Germany&rsquo;s Turkish- and Arabic-speaking communities."),("Full service, one partner","Campaigns, video production, social media, recruiting and digitalisation &mdash; &lsquo;like your own marketing department, only more effective&rsquo;."),("Enterprise campaigns","BARMER &mdash; ethno-marketing campaigns to win Turkish-speaking members for one of Germany&rsquo;s largest statutory insurers."),("Public institutions","IHK Dresden &mdash; communications and creative cinema advertising for the Dresdner Filmn&auml;chte am Elbufer."),("Retail &amp; FMCG","Eurogida &mdash; retail branding and campaigns for the German-Turkish supermarket group."),("The bridge to UC","Cultural fluency, enterprise discipline, full-service delivery &mdash; the standards Ummah Collective was founded on in 2022.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("8","Years &mdash; the founder&rsquo;s Berlin chapter, 2014&ndash;22"),("1","Specialty &mdash; ethno-marketing, full service"),("3","Heritage engagements carried into UC&rsquo;s story"),("2","Cities &mdash; the craft from Berlin, the studio in KL")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Eurogida","Retail branding &amp; campaigns &mdash; German-Turkish supermarket group"),("BARMER","Campaigns to win Turkish-speaking members"),("IHK Dresden","Communications &amp; cinema advertising &mdash; Dresdner Filmn&auml;chte"),("Full service","Video, social, recruiting, digitalisation &mdash; delivered end to end")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        body=phero(crumb,f"Case / {c}",n,"The Berlin ethno-marketing agency where our founder built brands from 2014 to 2022 &mdash; the roots of Ummah Collective&rsquo;s cultural fluency.")+f'''
{_herob}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The agency</span></div>
    <h2 style="margin-top:10px">Marketing for the Germany<br>most agencies miss.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>AR City Media</strong> is a Berlin ethno-marketing and full-service agency: campaigns, video, social media, recruiting and digitalisation, with one specialty at the core &mdash; <strong>kulturspezifische Kommunikation</strong>. Millions in Germany live and decide in Turkish, Arabic and other languages; AR City Media built its entire practice on reaching them properly, not via translation.</p>
  </div>
  <img class="pimg reveal" src="{_acshot}" alt="arcitymedia.de &mdash; Ethno-Marketing &amp; Full Service" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The lineage</span></div>
    <h2 style="margin-top:10px">Where UC&rsquo;s standards<br>were forged.</h2>
    <p style="color:var(--dim);margin-top:14px">From <strong>2014 to 2022</strong>, our founder built brands here &mdash; carrying campaigns for <strong>BARMER</strong>, <strong>IHK Dresden</strong> and <strong>Eurogida</strong> among others, inside German compliance and enterprise sign-off culture. When Ummah Collective was founded in Kuala Lumpur in 2022, it inherited exactly this DNA: <strong>European delivery standards plus genuine cultural fluency</strong> &mdash; now applied to new markets.</p>
  </div>
  <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">Heritage engagements</div><ul class="ev-meta">{stepli}</ul></div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What the Berlin years covered</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Campaigns &middot; video &middot; social &middot; recruiting</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">The shape of it</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">The craft came from Berlin &mdash; <em>the mission found Kuala Lumpur.</em></div><div class="quote-by reveal">AR City Media &rarr; Ummah Collective &middot; 2014&ndash;22 &rarr; today</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{ACURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit arcitymedia.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want this craft<br>on <em>your brand?</em>')
        return page("project-ar-city-media.html","AR City Media — The Berlin Heritage | Ummah Collective","AR City Media, Berlin: the ethno-marketing and full-service agency where Ummah Collective's founder built brands from 2014 to 2022 — BARMER, IHK Dresden, Eurogida and the roots of UC's cultural fluency.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"AR City Media — Berlin Heritage","about":"The Berlin ethno-marketing agency years behind Ummah Collective, 2014-2022","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-ar-city-media.html"}))
    if s=='noonos':
        NOURL='https://www.noon-os.com'
        _hero=('<div class="no-hero"><div class="no-hl">'
          '<div class="no-eye">POWERED BY UMMAH COLLECTIVE</div>'
          '<div class="no-h1">Run your whole business from <em>one command center.</em></div>'
          '<div class="no-sub">The all-in-one operating system for Muslim founders &amp; CEOs &mdash; CRM, projects, finance, marketing and community. Halal by design.</div>'
          '<div class="no-ctas"><span class="no-cta">Try the live demo</span><span class="no-cta ghost">Get founding access</span></div></div>'
          '<div class="no-dash"><div class="no-bar">app.noonos.app</div>'
          '<div class="no-kpis"><span><i>OPEN PIPELINE</i><b>&euro;422K</b><u>8 deals</u></span><span><i>REVENUE MTD</i><b>&euro;28.5K</b><u>paid</u></span><span><i>AD ROAS</i><b>7.0&times;</b><u>&euro;13.1K</u></span></div>'
          '<div class="no-live"><em class="dot"></em>Global operations &middot; KL &middot; Dubai &middot; London &middot; Berlin &middot; Istanbul &middot; Sydney</div></div></div>')
        _vals=('<div class="sa-award"><div class="sa-ah">Built for values-driven businesses.</div>'
          '<div class="sa-asub">Templates pre-loaded per industry &mdash; productive on day one.</div>'
          '<div class="sa-chips"><span>Halal F&amp;B</span><span>Modest fashion</span><span>Islamic fintech</span><span>Agency</span><span>Charity / NGO</span><span>Education</span></div></div>')
        _halal=('<div class="no-halal"><div class="no-hh">Halal by design.</div><p>Not a generic tool with a crescent slapped on &mdash; values wired into the product.</p>'
          '<div class="no-chips"><span>Hijri &amp; Zakat aware</span><span>Compliance checks</span><span>Adab-aware AI &middot; opens with salam</span><span>6 languages incl. AR-RTL</span></div></div>')
        _bands=_hero+_vals+_halal
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim no reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">noon-os.com</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of our flagship product &middot; <a href="'+NOURL+'" target="_blank" rel="noopener">visit noon-os.com &rarr;</a></div></div></section>')
        built=[("The product itself","A working business OS &mdash; CRM, pipeline, finance, marketing and community in one command center, live at app.noonos.app."),("A demo you can touch","No signup, no sales call: a fully working workspace with sample data, open to anyone in seconds. The product is the pitch."),("Halal by design","Hijri calendar, Zakat-aware workflows, content compliance checks and AI that opens with &lsquo;Assalamu alaikum&rsquo; &mdash; wired in, not bolted on."),("Six languages","English, German, French, Turkish, Arabic (RTL) and Bahasa Melayu &mdash; a product that speaks its market&rsquo;s languages from day one."),("Birdseye intelligence","Clients, deals and leads on a live 3D globe with multi-currency roll-ups &mdash; MYR, EUR, USD, GBP, SGD."),("Community as a moat","The Muslim Entrepreneur Founders Club turns software into a network &mdash; events, playbooks and deal flow around the product.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("6","Languages, incl. Arabic RTL"),("6","Industry templates, day-one ready"),("5&ndash;7","Disconnected tools replaced by one OS"),("$2.6T","The Islamic economy it&rsquo;s built for")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Step 1","Open the demo &mdash; code avb, no signup"),("Step 2","Pick a template &mdash; halal F&amp;B to fintech"),("Step 3","Run the business &mdash; CRM, finance, marketing"),("Always","Halal compliance &amp; adab, built in")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(NOURL+'?uc=1')
        _priceshot=_ms(NOURL+'/pricing.html?uc=1')
        body=phero(crumb,f"Case / {c}",n,"Our flagship product &mdash; the operating system for Muslim founders &amp; CEOs. Built, branded and shipped by the same team that builds for clients.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The product</span></div>
    <h2 style="margin-top:10px">One command center,<br>instead of seven tools.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>NoonOS</strong> is the business OS for Muslim founders and CEOs: CRM, projects, finance, marketing and community in one place &mdash; with a <strong>live demo anyone can open</strong> (no signup, code <strong>avb</strong>), industry templates from halal F&amp;B to Islamic fintech, and pricing from &euro;19 a seat. It targets a <strong>US$2.6 trillion Islamic economy</strong> that generic software has never been built for.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="noon-os.com &mdash; our flagship product site" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <img class="pimg reveal" src="{_priceshot}" alt="NoonOS pricing &mdash; from solo founder to enterprise" loading="lazy">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">Why we built it</span></div>
    <h2 style="margin-top:10px">We build digital assets &mdash;<br>including our own.</h2>
    <p style="color:var(--dim);margin-top:14px">Ummah Collective runs on two pillars: agency work for clients, and <strong>ventures on our own balance sheet</strong>. NoonOS is the flagship of the second &mdash; positioning, brand, a six-language product site and the <strong>live application</strong>, all designed and engineered in-house. It&rsquo;s the strongest proof we can offer a client: the same team that ships this, ships your project.</p>
  </div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What&rsquo;s in the build</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Product &middot; brand &middot; site &middot; app</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Zero to running, in minutes</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">The product is the pitch</span></div></div>
  <div class="grid g2" style="align-items:center;gap:32px">
    <div class="reveal"><p style="color:var(--dim)">Most SaaS hides behind a demo call. NoonOS does the opposite: the <strong>full product is open</strong>, pre-loaded with sample data, in six languages. Win a deal on the pipeline, watch the forecast update, let the AI draft a client update that opens with salam &mdash; before anyone asks for your email.</p>
      <ul class="ev-meta" style="margin-top:22px">{stepli}</ul>
    </div>
    <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">By the numbers</div><div class="stats" style="margin-top:12px">{rcells}</div></div>
  </div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">Not a generic tool with a crescent slapped on &mdash; <em>values wired into the product.</em></div><div class="quote-by reveal">NoonOS &mdash; The Operating System for Muslim Founders &middot; by Ummah Collective</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{NOURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit noon-os.com &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a product<br>like <em>this?</em>')
        return page("project-noonos.html","Noon OS — Our Flagship Product | Ummah Collective","NoonOS: the operating system for Muslim founders & CEOs — CRM, finance, marketing and community, halal by design. Built, branded and shipped in-house by Ummah Collective.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"NoonOS — Flagship Product","about":"NoonOS, the business operating system for Muslim founders, built by Ummah Collective","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-noonos.html"}))
    if s=='faircharity':
        FCURL='https://faircharity.de'
        _hero=('<div class="fc-hero"><div class="fc-nav"><b>FAIR<span>CHARITY</span></b><span class="fc-links">KURBAN &middot; PROJEKTE &middot; RELIGI&Ouml;SE SPENDEN &middot; &Uuml;BER UNS</span><span class="fc-cta">&#9829; Jetzt Spenden</span></div>'
          '<div class="fc-hl"><div class="fc-h1">FAIRCHARITY E.V.</div>'
          '<div class="fc-tag">Hilfe mit System, Verantwortung und Wirkung</div>'
          '<div class="fc-sub">Wir ver&auml;ndern, wie Hilfe funktioniert &mdash; unabh&auml;ngig, transparent, professionell und menschlich.</div></div></div>')
        _proj=('<div class="sa-award"><div class="sa-ah">W&auml;hle dein Spendenprojekt.</div>'
          '<div class="sa-asub">Strukturen statt Kampagnen &mdash; jedes Projekt gewartet, dokumentiert, garantiert.</div>'
          '<div class="sa-chips"><span>Multifunktionspatenschaft</span><span>Nachhaltige Wasserversorgung</span><span>Hilfe zur Selbsthilfe</span><span>Kurban &amp; religi&ouml;se Spenden</span></div></div>')
        _fam=('<div class="fc-fam"><div class="fc-fh">Werde Fa(ir)mily.</div><p>Vier Mitgliedschaften tragen Verwaltung, Transparenzsysteme und Projektaufbau &mdash; monatlich, planbar, ehrlich.</p>'
          '<div class="fc-chips"><span>Supporter &middot; ab &euro;10</span><span>Sustainer &middot; ab &euro;25</span><span>Builder &middot; ab &euro;50</span><span>Guardian &middot; ab &euro;100</span></div></div>')
        _bands=_hero+_proj+_fam
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim fc reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">faircharity.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the platform we built &middot; <a href="'+FCURL+'" target="_blank" rel="noopener">visit faircharity.de &rarr;</a></div></div></section>')
        built=[("The website","A warm, credible home for a charity whose whole promise is trust &mdash; built around clarity instead of guilt-tripping."),("Donation payment gateway","One-off project donations, four recurring memberships and religious giving &mdash; Kurban and Spenden &mdash; processed online, end to end."),("UX/UI","From first visit to completed donation in the fewest honest steps &mdash; give once, or join monthly as Fa(ir)mily."),("SEO","Structured to be found by people searching for transparent, accountable giving in German."),("Trust architecture","Six principles &mdash; from &lsquo;Nachhaltigkeit statt Nothilfe&rsquo; to &lsquo;W&uuml;rde statt Almosen&rsquo; &mdash; made visible, not buried in a PDF."),("Project storytelling","Sponsorships, water systems, empowerment &mdash; each program explained by its long-term structure, not by pity imagery.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("3","Spendenprojekte &mdash; Patenschaft, Wasser, Selbsthilfe"),("4","Mitgliedschaften &mdash; ab &euro;10 monatlich"),("3","Kontinente Felderfahrung im Team"),("1","Gateway f&uuml;r alle Arten des Gebens")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Schritt 1","Projekt w&auml;hlen &mdash; oder Kurban / religi&ouml;se Spende"),("Schritt 2","Einmalig geben oder monatlich beitreten"),("Schritt 3","Gateway verarbeitet die Zahlung &mdash; sicher, online"),("Schritt 4","Transparenz folgt &mdash; dokumentiert, nachvollziehbar")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(FCURL+'?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A German charity reforming how giving works &mdash; given a website, a donation payment gateway, UX/UI and SEO that make trust tangible.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The organisation</span></div>
    <h2 style="margin-top:10px">Charity, rebuilt<br>on accountability.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Faircharity e.V.</strong> exists because trust in the humanitarian sector is broken. Its answer: <strong>structures instead of campaigns</strong> &mdash; sponsorships, sustainable water systems and empowerment programs, run by a team with field experience across <strong>Africa, Asia and Europe</strong>, and a conviction the site states plainly: help is an <strong>Am&#257;nah</strong>, a trust to be answered for.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="faircharity.de &mdash; the platform we built" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">A gateway that turns<br>conviction into donations.</h2>
    <p style="color:var(--dim);margin-top:14px">We built <strong>faircharity.de</strong> end to end: the website, the <strong>UX/UI</strong>, the <strong>SEO</strong> &mdash; and the piece that makes a charity actually work online: a <strong>donation payment gateway</strong> handling one-off project gifts, <strong>Kurban and religious giving</strong>, and four recurring memberships from &euro;10 a month. For an organisation whose product is trust, every step of the flow had to feel as honest as the mission.</p>
  </div>
  <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">The giving engine</div><ul class="ev-meta">{stepli}</ul></div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Web &middot; gateway &middot; UX &middot; SEO</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">&bdquo;Wir wollen nicht die gr&ouml;&szlig;te Organisation sein &mdash; <em>sondern die glaubw&uuml;rdigste.&ldquo;</em></div><div class="quote-by reveal">Faircharity e.V. &mdash; Leitsatz &middot; faircharity.de</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{FCURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit faircharity.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a platform<br>like <em>this?</em>')
        return page("project-faircharity.html","Faircharity e.V. — Website, Donation Gateway & UX | Ummah Collective","How Ummah Collective built faircharity.de — website, donation payment gateway (incl. Kurban and religious giving), UX/UI and SEO for a German charity reforming how giving works.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Faircharity e.V. — Website & Donation Gateway","about":"Website, donation payment gateway, UX/UI and SEO for Faircharity e.V.","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-faircharity.html"}))
    if s=='kamar-halal':
        KHURL='https://www.kamar-halal.de/en/'
        _hero=('<div class="kh-hero"><div class="kh-nav"><b class="kh-logo">KAMAR</b><span class="kh-links">HOME &middot; PRODUCTS &middot; ABOUT US &middot; FAQ &middot; CERTIFICATE &middot; CONTACT</span><span class="kh-lang">DE &middot; EN &middot; TR</span></div>'
          '<div class="kh-fire"><div class="kh-h1">Halal made in Germany</div>'
          '<div class="kh-tag">Product safety, quality and a unique taste experience</div>'
          '<span class="kh-cta">get to know Kamar</span><span class="kh-badge">&#9733; HALAL</span></div></div>')
        _prod=('<div class="kh-prod"><div class="kh-ph2">Our tasty best sellers</div><div class="kh-psub">Now also in your supermarket &mdash; oriental top quality for every taste.</div>'
          '<div class="kh-chips"><span>Sucuk</span><span>Salare</span><span>Bratwurst</span><span>Pullo</span><span>Sosis</span><span>Yamini</span></div></div>')
        _cert=('<div class="kh-cert"><div class="kh-ce">100% HALAL, 100% DELICIOUS</div><div class="kh-ch">Certified product safety.</div>'
          '<div class="kh-cchips"><span>HaPI Halal Zertifikat</span><span>Family company &middot; 20+ years</span><span>Made in Gehlenberg, Germany</span></div></div>')
        _bands=_hero+_prod+_cert
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim kh reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">www.kamar-halal.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the platform we built &middot; <a href="'+KHURL+'" target="_blank" rel="noopener">visit kamar-halal.de &rarr;</a></div></div></section>')
        built=[("The website","The full digital home for the brand &mdash; company, products, FAQ, certificate and contact &mdash; built end to end."),("UI/UX","A shopper-first flow: see the product, trust the certificate, find it in your supermarket &mdash; warm food photography over clean structure."),("Trilingual by design","German, English and Turkish &mdash; the three languages of Kamar&rsquo;s actual shoppers, switchable on every page."),("Product architecture","Six lines &mdash; Sucuk, Salare, Bratwurst, Pullo, Sosis and the Yamini snack &mdash; each with its own page, not a buried PDF catalogue."),("Halal-certificate consulting","Guidance on the halal certification itself &mdash; and on presenting it so the HaPI certificate is visible, downloadable and checkable, not fine print."),("Trust design","&lsquo;Halal made in Germany&rsquo; is a claim that invites scrutiny &mdash; so the site answers it: certificate up front, FAQ for the hard questions, family story behind it.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("3","Languages &mdash; German, English, Turkish"),("6","Product lines &mdash; from Sucuk to Yamini"),("20+","Years of family halal production behind the brand"),("1","HaPI halal certificate &mdash; front and center")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("Claim","&lsquo;Halal made in Germany&rsquo; &mdash; one line, whole positioning"),("Proof","HaPI certificate &mdash; visible, downloadable, checkable"),("Product","German classics, halal &mdash; Bratwurst to Sucuk"),("Reach","Three languages, one supermarket shelf")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _homeshot=_ms(KHURL+'?uc=1')
        body=phero(crumb,f"Case / {c}",n,"A German family producer of halal meats &mdash; given its full website, UI/UX and consulting on the halal certification that carries the brand.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The company</span></div>
    <h2 style="margin-top:10px">German classics,<br>made halal.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Kamar</strong> is a family company from Gehlenberg in northern Germany that has produced halal meats for <strong>over 20 years</strong> &mdash; Bratwurst, Viennese sausages, cold cuts, sucuk and the Yamini snack salami. Its promise is the category in one line: <strong>&lsquo;Halal made in Germany&rsquo;</strong> &mdash; German product standards and genuine halal certification in the same product, now on supermarket shelves.</p>
  </div>
  <img class="pimg reveal" src="{_homeshot}" alt="kamar-halal.de &mdash; the website we built" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The build</span></div>
    <h2 style="margin-top:10px">A website that proves<br>what the label claims.</h2>
    <p style="color:var(--dim);margin-top:14px">We built the <strong>whole website</strong> and its <strong>UI/UX</strong> in three languages &mdash; and consulted on the piece most agencies can&rsquo;t touch: the <strong>halal certificates</strong>. For a brand whose entire positioning rests on certified compliance, the certification had to be handled correctly and shown convincingly &mdash; the <strong>HaPI certificate</strong> sits in the main navigation, not in a footnote.</p>
  </div>
  <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">The trust engine</div><ul class="ev-meta">{stepli}</ul></div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Web &middot; UI/UX &middot; halal consulting</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">&bdquo;Halal from Germany &mdash; <em>product safety, quality and a unique taste experience.&ldquo;</em></div><div class="quote-by reveal">Kamar &middot; kamar-halal.de</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{KHURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit kamar-halal.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Building a brand<br>on <em>trust?</em>')
        return page("project-kamar-halal.html","Kamar Halal — Website, UI/UX & Halal-Certificate Consulting | Ummah Collective","How we built kamar-halal.de — the full website, UI/UX and halal-certificate consulting for Kamar, the 'Halal made in Germany' family producer, in German, English and Turkish.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Kamar Halal — Website & Halal-Certificate Consulting","about":"Website, UI/UX and halal-certificate consulting for Kamar.","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-kamar-halal.html"}))
    if s=='eurogida':
        EGURL='https://www.eurogida.de'
        _hero=('<div class="eg-hero"><div class="eg-nav"><b class="eg-logo">euro<span>gida</span><i class="eg-leaf"></i></b><span class="eg-links">HOME &middot; AKTUELLES &middot; REZEPTE &middot; KOCHMAGAZINE &middot; PRODUKTE &middot; FILIALEN &middot; UNTERNEHMEN &middot; BLOG &middot; KONTAKT</span></div>'
          '<div class="eg-film"><span class="eg-play">&#9654;</span><div class="eg-h1">Willkommen bei Eurogida</div>'
          '<div class="eg-tag">Mediterrane Frische &mdash; t&auml;glich, in ganz Berlin</div></div></div>')
        _fil=('<div class="eg-fil"><div class="eg-fh">Filialen</div><div class="eg-fsub">14 M&auml;rkte, ein Berlin.</div>'
          '<div class="eg-pins"><span>Charlottenburg</span><span>Kreuzberg</span><span>Neuk&ouml;lln</span><span>Sch&ouml;neberg</span><span>Spandau</span><span>Steglitz</span><span>Tempelhof</span><span>Wedding</span><span>Moabit</span></div></div>')
        _mag=('<div class="eg-mag"><div class="eg-me">KOCHMAGAZIN</div><div class="eg-mh">Rezepte, Kochblog &amp; Imagefilme.</div>'
          '<div class="eg-chips"><span>Kochmagazin &middot; Print + Online</span><span>Monatliche Rezepte</span><span>Imagefilme</span><span>Instagram</span></div></div>')
        _bands=_hero+_fil+_mag
        _showcase=('<section style="padding-top:10px"><div class="wrap"><div class="site-anim eg reveal"><div class="site-bar"><i></i><i></i><i></i><span class="site-url">www.eurogida.de</span></div><div class="site-view"><div class="site-track">'+_bands+_bands+'</div></div></div><div class="site-cap mono reveal">A live scroll of the platform we run &middot; <a href="'+EGURL+'" target="_blank" rel="noopener">visit eurogida.de &rarr;</a></div></div></section>')
        built=[("The website","The digital home for the whole group &mdash; stores, products, recipes, publications and company &mdash; built from scratch and still ours to run."),("Design &amp; CI","The red-and-green fresh-market identity carried through every page, publication and campaign asset."),("UX/UI","A store-first architecture: find your Filiale, browse the week&rsquo;s products, cook this month&rsquo;s recipes &mdash; in the fewest taps."),("Filialfinder","All 14 Berlin stores on one map &mdash; district by district, from Spandau to Neuk&ouml;lln, each with its own page."),("Content engine","Monthly Rezepte and the Kochblog, the Kochmagazin in print and online, image films and the Instagram feed &mdash; produced and published continuously."),("Six years of management","Updates, content, campaigns, maintenance &mdash; the part most agencies hand back after launch is the part we&rsquo;ve run since 2020.")]
        bcards="".join('<div class="card reveal"><h3 style="font-size:19px">'+t+'</h3><p>'+d+'</p></div>' for t,d in built)
        res=[("14","Filialen across Berlin, one digital home"),("6","Years of continuous management"),("9","Site sections &mdash; from Rezepte to Unternehmen"),("2","Formats of the Kochmagazin &mdash; print &amp; online")]
        rcells="".join('<div class="stat"><b>'+v+'</b><div class="k">'+k+'</div></div>' for v,k in res)
        steps=[("2020","Website, design &amp; UX/UI &mdash; built from scratch"),("Ongoing","Monthly recipes, Kochblog &amp; magazine issues"),("Ongoing","Image films, campaigns &amp; social feed"),("Today","Still running it &mdash; year six and counting")]
        stepli="".join('<li><span>'+a+'</span><b>'+b2+'</b></li>' for a,b2 in steps)
        _filshot=_ms(EGURL+'/filialen/?uc=1')
        body=phero(crumb,f"Case / {c}",n,"Berlin&rsquo;s Turkish-market grocer &mdash; 14 stores, a cooking magazine and a digital home we built and have managed for six years.")+f'''
{_showcase}
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The company</span></div>
    <h2 style="margin-top:10px">Fourteen stores.<br>One digital home.</h2>
    <p style="color:var(--dim);margin-top:14px"><strong>Eurogida</strong> is a Berlin institution &mdash; <strong>14 supermarkets</strong> across the city, from Spandau to Neuk&ouml;lln, selling Turkish, oriental and German groceries side by side. Beyond the shelves it publishes its own <strong>Kochmagazin</strong>, monthly recipes and a Kochblog &mdash; a grocer that behaves like a food brand. All of it needed one place to live online.</p>
  </div>
  <img class="pimg reveal" src="{_filshot}" alt="eurogida.de &mdash; the Filialen finder we built" loading="lazy">
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start;gap:26px">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">The engagement</span></div>
    <h2 style="margin-top:10px">Built once.<br>Run for six years.</h2>
    <p style="color:var(--dim);margin-top:14px">We built <strong>everything</strong>: the website, the <strong>design</strong>, the <strong>UX/UI</strong> &mdash; and then stayed. Since <strong>2020</strong> we have managed the platform continuously: publishing the recipes and magazine issues, keeping 14 store pages current, producing campaign and film content, and maintaining the system underneath. Not a relaunch every few years &mdash; a digital asset, compounding since day one.</p>
  </div>
  <div class="reveal"><div class="mono" style="color:var(--acc2);margin-bottom:12px">The operating rhythm</div><ul class="ev-meta">{stepli}</ul></div>
</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we built &mdash; and still run</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Web &middot; design &middot; UX/UI &middot; management</span></div></div><div class="grid g3">{bcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono">By the numbers</span></div>
  <div class="stats reveal" style="margin-top:24px">{rcells}</div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">&bdquo;Ein Supermarkt, der sich wie eine Food-Marke verh&auml;lt &mdash; <em>und eine Website, die seit sechs Jahren mitw&auml;chst.&ldquo;</em></div><div class="quote-by reveal">Eurogida &middot; Berlin &middot; eurogida.de</div>
  <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap;justify-content:center"><a href="{EGURL}" class="btn btn-fill" target="_blank" rel="noopener">Visit eurogida.de &rarr;</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div></section>
{nextnav}
'''+cta('Want a partner who<br><em>stays?</em>')
        return page("project-eurogida.html","Eurogida — Website, Design, UX/UI & 6 Years of Management | Ummah Collective","How we built eurogida.de — website, design and UX/UI for Berlin's 14-store Turkish-market grocer — and have managed it continuously for six years.",body,aurora="work",ld=_ld({"@context":"https://schema.org","@type":"CreativeWork","name":"Eurogida — Website & Six Years of Management","about":"Website, design, UX/UI and continuous management for Eurogida Berlin.","creator":{"@id":SITE+"/#org"},"url":SITE+"/project-eurogida.html"}))
    stats=''
    body=phero(crumb,f"Case / {c}",n,b)+f'''
<section style="padding-top:10px"><div class="wrap">{heroimg}</div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start">
  <div class="reveal"><div class="eyebrow"><span class="t"></span><span class="mono">Scope</span></div><div>{sc}</div>
    <div style="margin-top:26px;display:flex;gap:12px;flex-wrap:wrap">{live}<a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div></div>
  <div class="reveal"><div class="card"><div class="no">{y}</div><h3 style="margin-top:8px">{n}</h3><p>{b}</p>
    <div class="mono" style="margin-top:16px;color:var(--dim2)">Category &middot; {c}</div></div></div>
</div></div></section>
{stats}{nextnav}
'''+cta('Want results<br>like <em>these?</em>')
    return page(f"project-{s}.html",f"{n} — Ummah Collective",b.replace('&mdash;','-')[:150],body,aurora="work")

# ---------------- ARTICLES (reuse 8) ----------------
ARTICLES=[
 ("taste-is-the-moat","Branding","2026","Taste is the moat: standing out when anyone can generate a website","AI has made a decent website nearly free to produce. That did not lower the bar for premium brands &mdash; it moved it, from production to judgment.","1557838923-2985c318be48",
  ["<h2>The floor rose. So did the bar.</h2><p>In an afternoon, anyone can now generate a site that would have passed for professional two years ago. Clean template, stock gradient, confident copy &mdash; the machine produces it on demand. Which means it no longer signals anything. When every business can ship 'decent' for free, decent becomes invisible, and visitors learn to recognise the generated look the way they once learned to spot clip art. The floor of quality rose for everyone at once. The bar for standing out rose with it, and it did not rise toward more production. It rose toward judgment.</p>",
   "<h2>What taste actually does</h2><p>Taste is not decoration. It is a series of commercial decisions that generators do not make on their own:</p><ul><li>Restraint: knowing what to cut, so one idea lands instead of ten competing for attention.</li><li>Specificity: details drawn from the actual business &mdash; its market, its customers, its proof &mdash; instead of interchangeable filler.</li><li>Coherence: type, colour, motion and copy pulling in one direction, so the brand reads as intentional rather than assembled.</li><li>Hierarchy: a page that quietly tells the visitor what matters first, second and last.</li><li>Standards: the discipline to reject work that is merely fine, even when it shipped fast.</li></ul>",
   "<h2>AI-first, craft-always</h2><p>The conclusion is not to avoid AI &mdash; we run an AI-first studio and the leverage is real. Machines now carry the volume: drafts, variants, builds, translations. What they cannot supply is the standard the work is held to, and that standard is now the scarcest asset in the market. Direction, references, revisions, the refusal to ship the generic version &mdash; that is where a brand's premium actually lives. As production gets cheaper, taste compounds in value, which is precisely why we build digital assets, not temporary traffic. The tools are available to everyone. The judgment is not.</p>"]),
 ("multilingual-by-design","Web","2026","Multilingual by design: one site that speaks to five markets","A translated site is not a multilingual one. Real reach comes from building for every language, script and reading direction from the first line of code, not bolting them on once the design is already locked.","1451187580459-43490279c0fa",
  ["<h2>Translation is the easy part</h2><p>Most brands treat languages as a plug-in. The English site ships first, and months later a second language gets poured into the same layout like water into a mould built for something else. The words are correct and the experience is broken: buttons overflow, headlines wrap in odd places, and a page designed left-to-right falls apart the moment it has to run right-to-left. Translation was never the hard part. Building an interface that stays elegant in any language is. When five markets share one system, that discipline has to live in the code, not in a spreadsheet handed to a translator at the end.</p>",
   "<h2>What building for every language really means</h2><p>Designing for reach is a set of decisions made up front, not repairs made later:</p><ul><li>Direction: layouts that mirror cleanly for right-to-left scripts like Arabic, so the whole interface flips, not just the text.</li><li>Reflow: components that stay composed when German runs long or Chinese runs short, with no clipping or awkward gaps.</li><li>Typography: a type system that renders each script with the same care, rather than forcing one font to do a job it cannot.</li><li>Meaning: copy adapted to how a market actually reads, not translated word for word into something that sounds foreign.</li><li>Findability: proper hreflang and one clean source of content, so search sends each visitor to the right version.</li></ul>",
   "<h2>Borderless, but never generic</h2><p>This is how we build sites that carry a brand across English, German, Malay, Arabic, Turkish, French and Chinese without diluting it in any one of them. A market entry does not wait on a rebuild, and a visitor in Kuala Lumpur or Dubai meets the same premium standard as one in Berlin. It is the same thesis we hold everywhere: we build digital assets, not temporary traffic. A site engineered for many markets from the start keeps paying off with every new one you open, instead of forcing a rebuild each time you cross a border.</p>"]),
 ("before-you-automate","Automation","2026","Before you automate: the operations audit that makes it pay","Automation disappoints when you buy the tool before you map the work. The audit that comes first is unglamorous, quick, and the reason the automation actually holds.","1517180102446-f3ece451e9d8",
  ["<h2>The tool is not the automation</h2><p>Most automation projects start with a purchase. A team buys the platform everyone is talking about, wires up a few triggers, and waits for the hours to come back. They rarely do. The reason is quiet but consistent: the tool was bought before the work was understood. Automating a process you have never mapped only makes a messy process run faster &mdash; and now the mess is hard-coded. The first move is not software. It is an honest look at how the work actually flows today.</p>",
   "<h2>The audit that comes first</h2><p>Before automating anything, we walk a business through five questions about each recurring task:</p><ul><li>Frequency: how often does this happen, and how many people touch it?</li><li>Rules: is the logic clear enough to write down, or does it lean on human judgment?</li><li>Handoffs: where does work wait, get re-typed, or fall between tools?</li><li>Cost of error: what breaks if the step is done wrong, and who notices?</li><li>Value: would automating it free real hours, or just relocate the busywork?</li></ul><p>The tasks that score high on frequency and clear rules, and low on judgment, are where automation quietly pays for itself.</p>",
   "<h2>Automate the flow, not the task</h2><p>The gains rarely come from automating one step. They come from connecting the steps &mdash; so a lead becomes a record, a record becomes a proposal, and a signed proposal becomes an invoice without anyone re-typing a thing. That is the difference between a shortcut and a system. Built on top of AI, an automation like this keeps working long after it ships and gets cheaper every month it runs. It is why we build digital assets, not temporary traffic. Start with the one process your team dreads most, map it once, and let the machine carry it from there.</p>"]),
 ("halal-crypto-without-the-hype","Products","2026","Halal crypto without the hype: a values-first way to learn the space","The volatility is loud and the questions are real: is any of this permissible, and how would you even tell? The honest answer is not a hot tip &mdash; it is a framework for screening, learning and deciding with a clear conscience.","1639762681485-074b7f938ba0",
  ["<h2>Two bad answers, and the gap between them</h2><p>Most content about crypto and faith sits at one of two extremes. One camp shills the next coin and promises life-changing gains; the other waves the whole space away as forbidden and moves on. Neither helps a thoughtful person who simply wants to understand what they are looking at. The volatility is real, the jargon is thick, and the values questions are legitimate &mdash; and none of that is served by hype or by a blanket dismissal. What is missing is the middle: a calm, honest way to learn.</p>",
   "<h2>A framework, not a tip</h2><p>Rather than asking whether crypto is simply good or bad, values-aligned learners tend to ask sharper questions about a specific asset:</p><ul><li>What does it actually do &mdash; is there a real use, or only speculation?</li><li>Where do any returns come from, and is interest baked into the mechanism?</li><li>How much hidden uncertainty and leverage sit under the surface?</li><li>Is the project transparent about how it works and who runs it?</li><li>And, crucially, what would a qualified scholar say about this structure?</li></ul><p>These are questions to investigate, not verdicts to assume.</p>",
   "<h2>Learn first, decide for yourself</h2><p>This is exactly why we built DeenGen as education, not advice: a Shariah-screened newsletter, a halal screener to test an asset against clear criteria, and live masterclasses with a scholar who can address the fiqh directly. It never tells anyone to buy or sell and never promises a return &mdash; it helps people understand the space and take real questions to the right people. Rulings belong with qualified scholars; our job is to make the learning honest and clear. Because we build digital assets, not temporary traffic &mdash; and an educated decision outlasts any tip.</p>"]),
 ("values-economy-software-opportunity","Ventures","2026","The values economy is a software opportunity","Nearly two billion people, trillions in spend, and most of it still served by generic tools. The durable move is not another ad campaign &mdash; it is building the software this market actually runs on.","1512941937669-90a1b58e7e9c",
  ["<h2>A market everyone cites, and almost no one builds for</h2><p>The figures get repeated at every conference: nearly two billion people, trillions in annual spend, double-digit growth across finance, food, travel and learning. Yet most of that audience is still served by generic software that was never designed with their values in mind &mdash; the equivalent of translating a menu and calling it a new restaurant. The gap is not attention. It is product. The values economy is described endlessly and engineered for rarely.</p>",
   "<h2>Where purpose-built software wins</h2><ul><li>Finance: tools that treat Shariah compliance as a core rule of the system, not a disclaimer bolted on at the end.</li><li>Commerce: platforms that understand halal supply chains, certification and trust as first-class data.</li><li>Learning: products for families that are safe by design rather than merely filtered after the fact.</li><li>Operations: a CRM that speaks the language of a values-led business instead of forcing it into a generic pipeline.</li></ul>",
   "<h2>Build the asset, not the wrapper</h2><p>This is why our ventures exist as products, not campaigns: Noon OS as a command center for the halal industry, DeenGen for values-aligned market intelligence, Rayhan Kids for children raised with both wonder and care. Each is built to compound, because we build digital assets, not temporary traffic. If you serve this market, the durable move is to own the software your customers rely on &mdash; not rent their attention one ad at a time.</p>"]),
 ("outbound-that-earns-trust","Lead Gen","2026","Outbound that earns trust: lead generation without the spam","Cold outreach has a bad name for good reason. Sprayed at everyone it burns your brand; built on research and relevance it fills a pipeline with people glad you reached out.","1522071820081-009f0129c71c",
  ["<h2>Why most outbound quietly hurts you</h2><p>The default playbook is volume: buy a list, blast the same message to ten thousand strangers, hope a handful reply. It occasionally books a meeting, but every ignored message is a small withdrawal from your reputation &mdash; and premium brands cannot afford to look like everyone else in the inbox. The problem was never outreach itself. It was outreach with nothing behind it: no research, no relevance, no reason for the recipient to care.</p>",
   "<h2>What relevant outreach looks like</h2><ul><li>Targeting: a tightly defined list of accounts you can genuinely help, not a scraped everyone.</li><li>Research: a specific, true observation about their business that proves you looked.</li><li>Relevance: one clear reason your offer matters to them right now, in their words.</li><li>Respect: the right channel and cadence for each market &mdash; and the rules that govern it, which differ by country.</li><li>Follow-through: a system that logs every reply and never drops a warm lead.</li></ul>",
   "<h2>Make it a system, not a sprint</h2><p>Good outbound is a machine with three parts: research to find fit, AI to draft and personalize at scale, and a human to keep it honest. Built that way, it compounds &mdash; because we build digital assets, not temporary traffic, and a pipeline of real relationships keeps paying long after a single campaign ends. Start with the fifty accounts you most want to work with, and earn the first conversation properly.</p>"]),
 ("answer-engine-optimization","SEO","2026","Answer-engine optimization: how to become the answer, not just a link","Search is splitting in two. People still type queries, but more and more they ask an AI and trust the answer it returns. Ranking on page one matters less than being the source the model cites.","1556228720-195a672e8a03",
  ["<h2>From ten blue links to one answer</h2><p>For twenty years the goal of search was a ranking: climb to the top of the page and earn the click. That game is changing. A growing share of questions now end inside an AI assistant, where the user reads a synthesized answer and never visits a website at all. The new question is not 'where do we rank?' but 'when the model answers, does it quote us?' &mdash; and most brands have no plan for it.</p>",
   "<h2>What answer engines actually reward</h2><ul><li>Clarity: pages that state a claim plainly, then back it, are easy for a model to extract and trust.</li><li>Structure: clean headings, definitions and lists give an answer engine clean facts to lift.</li><li>Authority: being referenced elsewhere &mdash; reviews, citations, mentions &mdash; signals you are worth quoting.</li><li>Freshness: dated, maintained content beats abandoned pages that quietly drift out of truth.</li></ul>",
   "<h2>Build to be cited</h2><p>This is the same thesis we hold for every channel: we build digital assets, not temporary traffic. Content engineered to be the clearest, best-sourced answer keeps compounding long after an ad stops running &mdash; and as acquisition costs rise, owning the answer is the cheapest durable advantage left. Start with the ten questions your buyers actually ask, then make your site the place those questions get answered best.</p>"]),
 ("positioning-before-pixels","Branding","2026","Positioning before pixels: the decision that makes design easy","Design is the last ten percent of a brand, not the first. Get the position right and every later choice &mdash; colour, copy, layout &mdash; almost makes itself.","1517180102446-f3ece451e9d8",
  ["<h2>Why rebrands start in the wrong place</h2><p>Most brand projects open with a moodboard. The logo gets argued over, the palette gets chosen, and months later nothing converts any better than before. The reason is simple: design is an answer, and no one wrote down the question. Without a sharp position, every visual decision turns into a matter of taste &mdash; and taste is impossible to agree on.</p>",
   "<h2>The four questions that set a position</h2><ul><li>Who is this for, specifically &mdash; and who is it not for?</li><li>What do you do better than the obvious alternative?</li><li>What single idea do you want to own in their mind?</li><li>What would you stake your reputation on being true?</li></ul>",
   "<h2>From position to system</h2><p>Once the position is decided, design stops being guesswork. The words come faster, every layout has a job, and the brand reads as intentional rather than decorated. That is the order we work in &mdash; position first, then the system that carries it &mdash; because a clear idea, built well, outlasts any trend.</p>"]),
 ("one-source-of-truth","Systems","2026","One source of truth: why disconnected tools quietly cost you","Spreadsheets here, a CRM there, DMs everywhere. The hidden tax on a growing business isn't the software &mdash; it's the gaps between it.","1620712943543-bcc4688e7485",
  ["<h2>The tax you can't see</h2><p>A lead lands on WhatsApp, gets copied into a sheet, re-typed into an invoice, then forgotten in a follow-up. None of it is one big failure &mdash; it's a hundred small leaks that compound into lost deals and wasted hours. Every tool you bolt on adds another seam for work to fall through.</p>",
   "<h2>What one system changes</h2><ul><li>Every lead, project and invoice in one place &mdash; no re-typing.</li><li>Automations that move work forward while you sleep.</li><li>Numbers you can actually trust, because there's a single source.</li><li>A team that scales without hiring just to manage admin.</li></ul>",
   "<h2>Custom beats generic</h2><p>Off-the-shelf tools force your business to bend to their model. A custom system &mdash; the kind we build on top of AI &mdash; bends to yours: your workflow, your language, your margins. Start with the one process that hurts most, and connect outward from there.</p>"]),
 ("europe-to-kuala-lumpur","Market Entry","2026","Europe to Kuala Lumpur: a market-entry playbook for halal brands","A great product doesn't travel on its own. Entering a new market is a system &mdash; research, positioning, partners and proof &mdash; not a launch party.","1557838923-2985c318be48",
  ["<h2>Why good brands stall abroad</h2><p>Most don't fail on product. They fail on context. What signals premium in Berlin can read as cold in Kuala Lumpur. Market entry is the work of re-earning trust in a place that has never heard of you &mdash; and that is a process, not a poster.</p>",
   "<h2>The four moves that work</h2><ul><li>Research: map the buyer, the competitor and the channel before spending a cent.</li><li>Position: adapt the story to local meaning without diluting the brand.</li><li>Partner: warm intros and local credibility beat cold reach.</li><li>Prove: a flagship moment &mdash; a store, an activation, an ambassador &mdash; that makes the brand real.</li></ul>",
   "<h2>From idea to flagship</h2><p>It's the path we walked with ANAAKA &mdash; a European luxury halal skincare brand we helped build, then brought into Malaysia, all the way to a flagship at TRX. Borderless, but never generic.</p>"]),
 ("website-that-sells","Growth","2026","Your website should be your best salesperson","Most sites are brochures that look nice and do nothing. A few are engines that capture, qualify and book &mdash; every hour of every day.","1451187580459-43490279c0fa",
  ["<h2>Pretty isn't the job</h2><p>A site that wins on looks but doesn't convert is an expensive business card. The real question isn't 'does it look good?' &mdash; it's 'what does it do when a stranger lands on it at 2am?'</p>",
   "<h2>The five systems behind a site that sells</h2><ul><li>A sharp position in the first five seconds.</li><li>Speed and trust &mdash; fast, secure, credible.</li><li>One clear path to a single action.</li><li>Capture and follow-up that never sleeps &mdash; agents and automation.</li><li>Analytics on everything, so you improve what you can see.</li></ul>",
   "<h2>Front door meets back office</h2><p>The magic isn't the homepage. It's connecting the front door to the systems behind it, so every visit can become a conversation &mdash; and every conversation is logged. That's the difference between traffic and pipeline.</p>"]),
 ("ai-agents-new-employees","Strategy","2026","Why AI agents are the new employees","A tireless, multilingual teammate that answers in seconds and costs a fraction of a hire. That's this quarter, not the future.","1620712943543-bcc4688e7485",
  ["<h2>The quiet hire</h2><p>The most valuable new team member at many companies in 2026 takes no salary and never sleeps. It answers every message in seconds, qualifies the lead, books the call and logs it &mdash; in five languages. AI agents have crossed from novelty to <strong>operational infrastructure</strong>.</p>",
   "<h2>What they do</h2><ul><li><strong>Front desk:</strong> first response, FAQs, booking.</li><li><strong>Sales:</strong> qualification, follow-up, proposal drafts.</li><li><strong>Back office:</strong> invoices, reports, document work.</li></ul>",
   "<h2>Where to start</h2><p>Pick one painful, high-volume task &mdash; usually first-response or qualification. Ship one agent, measure, expand. That's how we run our own studio.</p>"]),
 ("traffic-to-assets","Playbook","2026","From traffic to assets: the 2026 playbook","As acquisition costs rise, the winning move is owning systems that compound &mdash; not renting attention.","1451187580459-43490279c0fa",
  ["<h2>The rented-attention trap</h2><p>For a decade, growth meant buying traffic. But ad costs only rise, and the moment you stop paying, it stops. The brands pulling ahead treat their presence as an <strong>asset on the balance sheet</strong>.</p>",
   "<h2>Four assets that compound</h2><ul><li>Search &amp; answer-engine authority.</li><li>Owned data &mdash; a CRM you control.</li><li>Automation that gets cheaper over time.</li><li>Brand &mdash; the trust that lowers every future cost.</li></ul>",
   "<h2>In practice</h2><p>Move budget from pure paid acquisition toward systems that keep working after launch.</p>"]),
 ("10-mistakes-muslim-brands-make-online","Branding","2025","10 mistakes Muslim brands make online — and how to fix them","Your online presence is the first impression. For values-driven brands it should reflect excellence as much as ethics.","1556228720-195a672e8a03",
  ["<h2>The recurring gaps</h2><p>Weak positioning, slow or untrusted sites, inconsistent branding, no analytics, and treating marketing as posting rather than systems.</p>",
   "<h2>The fixes</h2><ul><li>Lead with a sharp position.</li><li>Make the site fast, secure, conversion-built.</li><li>Own your data, instrument every channel.</li><li>Be consistent everywhere.</li><li>Turn content into an engine.</li></ul>",
   "<p>Done well, a values-driven brand outperforms &mdash; trust is the cheapest acquisition advantage there is.</p>"]),
 ("halal-mobile-apps","Tech","2024","The rising demand for halal mobile apps","With the halal economy expanding, halal-aligned apps are a fast-growing niche &mdash; especially across Germany and Malaysia.","1512941937669-90a1b58e7e9c",
  ["<h2>A niche going mainstream</h2><p>From halal travel and finance to lifestyle and learning, demand for value-aligned apps is accelerating &mdash; with Germany and Malaysia at the center.</p>",
   "<h2>What good looks like</h2><p>Not 'Muslim versions' of existing apps, but genuinely better products for a specific need, built with cultural fluency and AI baked in.</p>",
   "<p>We take founders from idea to MVP to scale, under one roof.</p>"]),
 ("digital-frontier","Strategy","2024","Navigating the digital frontier","Automation and a strong web presence are no longer optional for Muslim-owned and Muslim-targeting businesses.","1517180102446-f3ece451e9d8",
  ["<h2>The crossroads</h2><p>Competition is global and expectations rise daily. Winners pair a credible presence with automation that removes friction.</p>",
   "<h2>Start with systems</h2><p>A beautiful site without follow-up leaks revenue. Pair the front door with the back office so every lead is captured automatically.</p>",
   "<p>Presence plus automation &mdash; exactly what we build.</p>"]),
 ("halal-marketing","Marketing","2024","Unveiling halal marketing","A strategic approach for the Muslim market &mdash; built on cultural sensitivity, trust and genuine value.","1557838923-2985c318be48",
  ["<h2>Beyond a certificate</h2><p>Halal marketing isn't a logo. It's communicating with cultural intelligence and integrity &mdash; values-respecting yet commercially sharp.</p>",
   "<h2>Why it works</h2><p>Trust lowers acquisition cost and raises loyalty. Authenticity builds durable advantage in one of the fastest-growing markets.</p>",
   "<p>We bring European standards and genuine fluency across SEA, the diaspora and the Gulf.</p>"]),
 ("collaborate-digitalize","Strategy","2024","Why Muslim businesses should collaborate and digitalize","With a growing global Muslim population, ecosystem thinking and digital presence are critical.","1522071820081-009f0129c71c",
  ["<h2>Stronger together</h2><p>Collaboration lets values-aligned businesses punch above their weight against larger incumbents.</p>",
   "<h2>Digitalize to compete</h2><p>Automation, data and AI let a lean team operate like a much bigger one. Ecosystem plus technology is how the halal economy scales.</p>",
   "<p>Our two-pillar model &mdash; agency plus ventures &mdash; is built on this belief.</p>"]),
 ("blockchain-week-2024","Event","2024","Ummah Collective at Blockchain Week 2024","Malaysia is emerging as a key player in Asia's tech landscape. We joined the conversation on Sharia-compliant innovation.","1639762681485-074b7f938ba0",
  ["<h2>A regional hub</h2><p>Malaysia's position and ecosystem are making it a center for fintech, Web3 and AI across Southeast Asia.</p>",
   "<h2>Our takeaway</h2><p>The opportunity isn't hype &mdash; it's infrastructure: analytics, education and AI agents that help values-driven businesses participate responsibly.</p>",
   "<p>A thesis we back through our own ventures.</p>"]),
]
def article_page(slug,cat,date,title,lede,imgid,blocks):
    crumb='<a href="index.html">Home</a> / <a href="insights.html">Insights</a> / '+cat
    body=phero(crumb,f"{cat} &middot; {date}",title,"")+f'''
<section style="padding-top:16px"><div class="wrap"><div class="article">
  <div class="art-hero reveal"><img src="{U(imgid)}" class="ld" alt="{_plain(title)}" loading="lazy"></div>
  <p class="lede reveal">{lede}</p>
  <div class="reveal">{''.join(blocks).replace("<strong>","").replace("</strong>","")}</div>
  <div style="margin-top:36px;display:flex;gap:12px;flex-wrap:wrap"><a href="booking.html?service=ai-agents" class="btn btn-fill" data-i18n="audit">Free AI audit</a><a href="insights.html" class="btn btn-ghost">All insights</a></div>
</div></div></section>'''+cta()
    ald=_ld({"@context":"https://schema.org","@type":"BlogPosting","headline":_plain(title),"description":_plain(lede),"image":U(imgid),"datePublished":str(date),"dateModified":str(date),"inLanguage":"en","author":{"@type":"Organization","name":"Ummah Collective"},"publisher":{"@id":SITE+"/#org"},"mainEntityOfPage":SITE+"/article-"+slug+".html"})
    return page(f"article-{slug}.html",f"{title} — Ummah Collective",lede.replace('&mdash;','-')[:150],body,aurora="insights",ld=ald)

# ---------------- CORE PAGES ----------------
def home():
    pil=[("01","AI Agents","Agents that sell, support and run your back office, 24/7.","ai-agents"),("02","Noon OS","Our CRM built for the Halal economy &mdash; from &euro;19/mo.","noon-os"),("03","Web &amp; Apps","Premium sites, platforms and custom software.","web-design"),("04","Growth","Lead gen, SEO &amp; content, paid media and strategy.","lead-generation")]
    idx="".join(f'<a class="idx-row" href="{_href(s)}"><span class="no">{n}</span><span class="ti">{t}</span><span class="de">{d}</span><span class="go">&rarr;</span></a>' for n,t,d,s in pil)
    _fsl=['anaaka','matchakoeln','dolezel','arju','almaruf','asyraf-takaful','dig-it-company','shoraka']
    _pm={p[0]:p for p in PROJECTS}
    feat=[_pm[s] for s in _fsl if s in _pm]
    tiles="".join(_tile(s,n,c,y,b,im) for s,n,c,y,b,sc,url,im in feat)
    faq=[("How fast can you ship?","Most builds go from brief to live in weeks, not quarters, using fixed-scope sprints and AI-assisted delivery."),("Do you work outside Malaysia?","Yes &mdash; borderless across SEA, Europe (DACH) and the Gulf, in five languages."),("Can you work white-label?","Yes: direct, white-label behind your agency, or referral partnership."),("What does it cost?","Web from ~&euro;4,800; AI agents and systems scoped per project. Book a call for a fixed quote.")]
    faqs="".join(f'<details class="reveal"><summary>{q}<span class="pl">+</span></summary><p>{a}</p></details>' for q,a in faq)
    body=f'''
<header class="hero"><div class="wrap">
  <div class="hero-solo">
    <div class="lottie-box lottie-mark reveal" data-src="orbit-lottie.json" style="margin-bottom:16px"></div>
    <div class="eyebrow reveal"><span class="t"></span><span class="mono">Applied-AI Studio &middot; Since MMXXII</span></div>
    <h1 class="reveal hero-cycle" dir="auto"><span class="ht1">Intelligence,</span><br><span class="out ht2">with integrity.</span></h1>
    <p class="lead reveal" data-i18n="herosub" style="margin-top:26px">We build the software, AI agents and systems modern companies run on — engineered fast, grounded in a decade of trust.</p>
    <div class="hero-cta reveal" style="margin-top:24px"><a href="booking.html" class="btn btn-fill" data-i18n="book">Book a call</a><a href="services.html" class="btn btn-ghost" data-i18n="services">Services</a></div>
    <div class="hero-stats reveal">
      <div class="s"><b><span class="count" data-to="100">0</span>+</b><span data-i18n="st_proj">Projects</span></div>
      <div class="s"><b><span class="count" data-to="60">0</span>+</b><span data-i18n="st_cli">Clients</span></div>
      <div class="s"><b><span class="count" data-to="12">0</span>+</b><span data-i18n="st_yrs">Years</span></div>
      <div class="s"><b>5</b><span data-i18n="st_lang">Languages</span></div></div>
  </div>
</div></header>

<section><div class="wrap"><div class="eyebrow reveal"><span class="t"></span><span class="mono" data-i18n="shifteyebrow">(01) &mdash; The shift</span></div>
  <h2 class="big2 reveal" data-i18n="shifth2">Anyone can <em>use</em> AI now. Almost no one turns it into systems you actually <em>trust.</em></h2>
  <div class="grid g2" style="margin-top:50px;align-items:start"><p class="lead reveal">For a decade we've built digital assets, not temporary traffic. The companies that win own their systems &mdash; search visibility, data, pipeline, tools.</p>
  <p class="reveal">We pair a decade of brand and engineering craft with applied AI and deep systems integration &mdash; reliable, refined, built to compound. European standards, modern strategy, genuine cultural fluency.</p></div></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal" data-i18n="whatwebuild">What we build</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">(02) &mdash; Four pillars, 14 disciplines</span></div></div><div class="idx reveal">{idx}</div>
  <div class="reveal" style="margin-top:24px"><a href="services.html" class="alink" data-i18n="services">All services <span class="ar">&rarr;</span></a></div></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">See the systems in motion</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">(02b) &mdash; Live &amp; animated</span></div></div>
  <div class="grid g2" style="gap:18px">{explain('dashboard','A live CRM dashboard we built for clients')}{explain('chat','An AI agent closing a complex export order')}</div>
  <div class="reveal" style="display:flex;justify-content:center;margin-top:10px"><div class="lottie-box" data-src="pulse-lottie.json"></div></div>
</div></section>

<section><div class="wrap"><div class="sh"><h2 class="reveal" data-i18n="selwork">Selected work</h2><div class="wcar-head reveal"><span class="eyebrow"><span class="t"></span><span class="mono">(03) &mdash; 100+ projects</span></span><span class="wcar-nav"><button class="wcar-btn" data-dir="-1" type="button" aria-label="Previous">&larr;</button><button class="wcar-btn" data-dir="1" type="button" aria-label="Next">&rarr;</button></span></div></div><div class="wcar" id="workCar">{tiles}</div>
  <div class="reveal" style="margin-top:18px"><a href="work.html" class="alink" data-i18n="work">See all work <span class="ar">&rarr;</span></a></div></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal" data-i18n="products">Products</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Built in-house</span></div></div>
<div class="prodshow reveal">
  <a class="prodcard pc-noon" href="https://www.noon-os.com" target="_blank" rel="noopener"><span class="pc-head"><span class="pc-logo">{PLOGO['noonos-p']}</span><span class="pc-name">Noon OS</span></span><p class="pc-desc">The all-in-one operating system for Muslim founders &amp; CEOs &mdash; CRM, projects, finance, marketing and community, run from one panel.</p><span class="pc-tags"><span>CRM</span><span>Projects</span><span>Finance</span><span>Community</span></span><span class="pc-foot2"><span class="pc-meta">Halal by design &middot; from &euro;19/mo</span><span class="pc-go">Explore &rarr;</span></span></a>
  <a class="prodcard pc-deen" href="https://www.deengen.com" target="_blank" rel="noopener"><span class="pc-head"><span class="pc-logo word">{PLOGO['deengen']}</span></span><p class="pc-desc">Learn crypto the halal way &mdash; a free Shariah-screened newsletter, a halal screener, and live masterclasses with a PhD scholar.</p><span class="pc-tags"><span>Newsletter</span><span>Halal screener</span><span>Masterclasses</span></span><span class="pc-foot2"><span class="pc-meta">Education, not advice</span><span class="pc-go">Explore &rarr;</span></span></a>
  <a class="prodcard pc-rayhan" href="https://www.rayhan-kids.com" target="_blank" rel="noopener"><span class="pc-head"><span class="pc-logo">{PLOGO['rayhan-kids']}</span><span class="pc-name">Rayhan Kids</span></span><p class="pc-desc">A little world of wonder &mdash; stories, games and friends that help Muslim children grow up loving their faith. Scholar-checked, parent-approved.</p><span class="pc-tags"><span>Storybooks</span><span>Games</span><span>Values</span></span><span class="pc-foot2"><span class="pc-meta">A little world of wonder</span><span class="pc-go">Explore &rarr;</span></span></a>
  <a class="prodcard pc-niyya" href="https://niyya.my" target="_blank" rel="noopener"><span class="pc-head"><span class="pc-logo word">{PLOGO['niyya']}</span></span><p class="pc-desc">The Ummah's own cola &mdash; halal, German-crafted, born in Malaysia. A share of every sale supports Palestinian orphanages.</p><span class="pc-tags"><span>Halal cola</span><span>Impact</span><span>FMCG</span></span><span class="pc-foot2"><span class="pc-meta">Drink with intention</span><span class="pc-go">Explore &rarr;</span></span></a>
</div></div></section>

<section><div class="wrap"><div class="club-teaser reveal">
  <div class="ct-main">
    <div class="eyebrow"><span class="t"></span><span class="mono" data-i18n="clubeyebrow">Community &middot; Founders Club</span></div>
    <h2 class="ct-h" data-i18n="clubh">Build alongside founders who <em>mean it.</em></h2>
    <p class="ct-p" data-i18n="clubp">A free community of Muslim and values-aligned founders &mdash; meeting online and in person in Kuala Lumpur.</p>
    <div class="ct-cta"><a href="founders-club.html" class="btn btn-fill" data-i18n="exploreclub">Explore the Founders Club</a><span class="ct-tag" data-i18n="clubtag">Free to join &middot; KL &amp; Online</span></div>
  </div>
  <div class="ct-side">
    <span class="ct-side-h" data-i18n="clubwhatson">What&rsquo;s on</span>
    <ul class="ct-evs">
      <li data-i18n="clubev1"><span>01</span> KL mixers &amp; dinners</li>
      <li data-i18n="clubev2"><span>02</span> Masterclasses &amp; workshops</li>
      <li data-i18n="clubev3"><span>03</span> Online webinars &amp; AMAs</li>
      <li data-i18n="clubev4"><span>04</span> Demo &amp; pitch nights</li>
    </ul>
  </div>
</div></div></section>

{audit()}

<section><div class="wrap"><div class="stats">
  <div class="stat reveal"><div class="n"><span class="count" data-to="100">0</span>+</div><div class="k">Projects delivered</div></div>
  <div class="stat reveal"><div class="n"><span class="count" data-to="60">0</span>+</div><div class="k">Clients worldwide</div></div>
  <div class="stat reveal"><div class="n"><span class="count" data-to="12">0</span>+</div><div class="k">Years of craft</div></div>
  <div class="stat reveal"><div class="n">3</div><div class="k">Regions &mdash; SEA &middot; EU &middot; MENA</div></div></div></div></section>

<section><div class="wrap" style="text-align:center"><div class="quote reveal" data-i18n="homequote" style="margin:0 auto">&ldquo;They built our entire ecosystem &mdash; brand, site, tracking and a flagship store. <em>Not a campaign. An asset.</em>&rdquo;</div>
  <div class="quote-by reveal" data-i18n="homequoteby">ANAAKA &mdash; Halal Skincare &middot; Flagship @ TRX, Kuala Lumpur</div></div></section>

<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Questions, answered</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">(04) &mdash; FAQ</span></div></div><div class="faq">{faqs}</div></div></section>
'''+cta()
    return page("index.html","Ummah Collective — Applied-AI Studio · AI Agents, Automation, Web & CRM","Applied-AI studio in Kuala Lumpur: done-for-you AI agents, business automation, premium web design and custom CRM — built for modern and halal-economy businesses. KL · Berlin · borderless.",body,aurora="default")

def services_overview():
    rows="".join(f'<a class="idx-row" href="service-{s}.html"><span class="no">{n}</span><span class="ti">{t}</span><span class="de">{i}</span><span class="go">&rarr;</span></a>' for s,n,t,_,i,*_ in SERVICES)
    body=phero('<a href="index.html">Home</a> / Services',"What we build","Fourteen disciplines.<br><em>One roof.</em>",
        "Every capability of a full-service agency, rebuilt around applied AI &mdash; from the first line of code to the lead that closes itself.")+f'''
<section style="padding-top:24px"><div class="wrap"><div class="idx reveal">{rows}</div></div></section>
<section><div class="wrap"><div class="sh"><h2 class="reveal">Three ways to work with us</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Engagement</span></div></div><div class="reveal">
  <div class="erow"><span class="x">01 &mdash; Direct</span><span class="nm">Direct engagement</span><span class="de">Full studio partnership, end to end.</span></div>
  <div class="erow"><span class="x">02 &mdash; White-label</span><span class="nm">White-label delivery</span><span class="de">We build behind your agency's brand.</span></div>
  <div class="erow"><span class="x">03 &mdash; Referral</span><span class="nm">Referral partnership</span><span class="de">Earn a fee on every closed project.</span></div></div></div></section>
'''+audit()+cta('What should we<br>build <em>first?</em>')
    return page("services.html","Services — Ummah Collective","14 services: AI agents, automation, CRM, web, apps, lead gen, SEO, branding, paid media, strategy.",body,aurora="services")

def about_page():
    TEAM=[("Attila von Barloewen","CEO &amp; Co-Founder","/assets/team-attila.jpg"),("MD. Safiqul Islam","CTO / Technical Director","/assets/team-safik.jpg"),("Yusef Abu-Saiba","B2B Market Analyst &amp; Sales","/assets/team-yuseda.jpg"),("Saidah Sheikh Jaffar","Content &amp; Co-Founder","/assets/team-saidah.jpg"),("Zackry M. Fazillah","Sales Director","/assets/team-zackry.jpg"),("Ustadh Dr. Muhammad Lawal","Shariah Advisor &amp; Auditor",LAWAL_IMG)]
    tcards="".join(f'<div class="card reveal">{img(p if (p.startswith("http") or p.startswith("/")) else RU+p,n,"tphoto")}<h3 style="font-size:21px">{n}</h3><p class="mono" style="color:var(--acc2)">{r}</p></div>' for n,r,p in TEAM)
    body=phero('<a href="index.html">Home</a> / About',"The studio","European standards.<br>Cultural fluency.<br><em>Applied AI.</em>",
        "Founded in 2022 in Kuala Lumpur, Ummah Collective blends European quality standards with traditional values and Islamic ethics &mdash; now running on applied AI. The team behind it has built brands, sites and software for 12+ years; we grew into AI, we didn&rsquo;t appear with it. We bridge Europe, Southeast Asia and the Muslim economy.")+f'''
<section style="padding-top:0"><div class="wrap"><div class="stats">
  <div class="stat reveal"><div class="n">2022</div><div class="k">Founded &middot; KL</div></div>
  <div class="stat reveal"><div class="n"><span class="count" data-to="100">0</span>+</div><div class="k">Projects</div></div>
  <div class="stat reveal"><div class="n"><span class="count" data-to="60">0</span>+</div><div class="k">Clients</div></div>
  <div class="stat reveal"><div class="n">3</div><div class="k">Regions</div></div></div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Our team</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">The people</span></div></div><div class="grid g3">{tcards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we believe</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Principles</span></div></div><div class="grid g3">
  <div class="card reveal"><div class="no">01</div><h3>Assets over traffic</h3><p>Systems you own, not rented clicks.</p></div>
  <div class="card reveal"><div class="no">02</div><h3>Speed is a feature</h3><p>Weeks, not quarters.</p></div>
  <div class="card reveal"><div class="no">03</div><h3>Integrity scales</h3><p>Ethical, halal-aligned, transparent.</p></div></div></div></section>
'''+cta('Work with<br>the <em>studio.</em>')
    return page("about.html","About — Ummah Collective","Founded 2022 by Attila von Barloewen. Team, principles and markets.",body,aurora="about")

def process_page():
    steps=[("Discovery","We audit the goal, the data and the overhead — and find where intelligence pays off fastest."),("Planning","Premium UX and an architecture built to scale: a roadmap, not a slide deck."),("Development","Fixed-scope sprints. You see working software in days and go live in weeks."),("Delivery","We launch, maintain, optimise and extend — systems that get smarter over time.")]
    rows="".join(f'<div class="erow reveal"><span class="x">Step 0{i}</span><span class="nm">{t}</span><span class="de">{d}</span></div>' for i,(t,d) in enumerate(steps,1))
    body=phero('<a href="index.html">Home</a> / How we work',"The method","From brief to live in<br>weeks, <em>not quarters.</em>",
        "A four-step process, AI-assisted end to end, that turns ambiguity into shipped systems fast.")+f'''
<section style="padding-top:24px"><div class="wrap">{rows}</div></section>
'''+cta()
    return page("process.html","How We Work — Ummah Collective","Discovery, Planning, Development, Delivery — our four-step method.",body,aurora="services")

def ventures_page():
    body=phero('<a href="index.html">Home</a> / Ventures',"Own businesses &middot; own balance sheet","We build<br>ventures, <em>too.</em>",
        "We don't only advise. We back and build our own products under the same standards &mdash; proof that we run on exactly what we sell.")+'''
<section style="padding-top:24px"><div class="wrap"><div class="reveal">
  <div class="erow"><span class="x">Venture / AI</span><span class="nm">WeBuildAI</span><span class="de">AI automation infrastructure across MY, AU, DE &amp; MENA.</span></div>
  <div class="erow"><span class="x">Venture / FMCG</span><span class="nm"><a href="https://niyya.my" target="_blank" rel="noopener" style="color:inherit">niyya. &mdash; The Ummah's Own Cola</a></span><span class="de">Halal cola, German-crafted, born in Malaysia. A share of every sale supports Palestinian orphanages.</span></div>
  <div class="erow"><span class="x">Venture / F&amp;B</span><span class="nm">Mobistro</span><span class="de">White-label food-truck brand for the DACH market.</span></div>
  <div class="erow"><span class="x">Venture / Finance</span><span class="nm">Microfinance &mdash; Takaful</span><span class="de">Shariah-compliant, asset-backed investment products. No riba.</span></div>
  <div class="erow"><span class="x">Venture / Web3</span><span class="nm">Crypto</span><span class="de">Analytics, AI agents and education for values-aligned investors.</span></div></div></div></section>
'''+cta()
    return page("ventures.html","Ventures — Ummah Collective","WeBuildAI, niyya. (the Ummah's own cola), Mobistro, Takaful microfinance and crypto.",body,aurora="ventures")

def founders_club():
    ev=[("KL Mixers &amp; Dinners","In person &middot; Kuala Lumpur","Intimate founder dinners and networking nights &mdash; real relationships over a shared table."),
        ("Masterclasses &amp; Workshops","Premium &middot; Online + KL","Hands-on deep-dives on applied AI, growth and halal-market entry, led by our team and guests."),
        ("Online Webinars &amp; AMAs","Free &middot; Online","Live talks, panels and open Q&amp;As &mdash; join from anywhere in the world."),
        ("Demo &amp; Pitch Nights","In person + online","Founders demo what they&rsquo;re building and pitch for feedback, partners and momentum.")]
    cards="".join('<div class="card reveal"><div class="mono" style="color:var(--acc2)">'+f+'</div><h3 style="margin-top:10px">'+t+'</h3><p>'+d+'</p></div>' for t,f,d in ev)
    up=[("Monthly","KL Founder Dinner","Kuala Lumpur &middot; in person"),("Quarterly","Applied-AI Masterclass","Online + KL &middot; premium"),("Ongoing","Community AMAs","Online &middot; free")]
    uprows="".join('<a class="erow" href="booking.html"><span class="x">'+c+'</span><span class="nm">'+n+'</span><span class="de">'+f+'</span></a>' for c,n,f in up)
    steps=[("01","Apply to join","Tell us who you are and what you&rsquo;re building. The community is free."),
           ("02","Get the calendar","Online sessions and KL meetups, announced to members first."),
           ("03","Show up","Online from anywhere, or in person in Kuala Lumpur."),
           ("04","Go deeper","Optional premium masterclasses and cohorts when you want more.")]
    stepcards="".join('<div class="card reveal"><div class="no">'+n+'</div><h3 style="margin-top:8px">'+t+'</h3><p>'+d+'</p></div>' for n,t,d in steps)
    es='''
<section id="event" class="ev-sec" style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Next event</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Invite-only &middot; Members&rsquo; event</span></div></div>
  <div class="grid g2" style="gap:22px;align-items:start">
    <div class="card reveal">
      <div class="urgency"><span class="udot"></span>Invite-only &middot; limited seats</div>
      <h3 style="font-size:clamp(24px,3vw,32px);margin:14px 0 8px">AI &mdash; Claude &amp; Sales</h3>
      <p style="color:var(--dim);max-width:46ch">A hands-on session on using Claude to sell smarter &mdash; real workflows, live examples, and how AI turns more conversations into closed deals. An intimate room of founders and operators.</p>
      <ul class="ev-meta">
        <li><span>Date</span><b>Friday, 11 July 2026</b></li>
        <li><span>Time</span><b>4:00 &ndash; 6:00 PM</b></li>
        <li><span>Venue</span><b>Oval Damansara, Kuala Lumpur</b></li>
        <li><span>Included</span><b>Drinks &amp; snacks provided</b></li>
      </ul>
    </div>
    <div class="card reveal">
      <form class="form ev-form" id="evForm" novalidate>
        <h3 style="font-size:22px;margin-bottom:2px">Apply to join</h3>
        <p style="color:var(--dim);font-size:14px;margin-bottom:4px">Seats are limited and confirmed by invite. Tell us a little about you.</p>
        <div class="row2"><label>Name*<input name="name" required></label><label>Email*<input name="email" type="email" required placeholder="you@company.com"></label></div>
        <div class="row2"><label>Phone / WhatsApp<input name="phone" placeholder="+60&hellip;"></label><label>Company &amp; role<input name="company"></label></div>
        <label>What do you sell, or hope to get from the session?<textarea name="message" placeholder="Optional&hellip;"></textarea></label>
        <button class="btn btn-fill" type="submit">Apply to attend &rarr;</button>
        <div class="ev-note">By applying you agree to be contacted about this event.</div>
      </form>
      <div class="ev-done" id="evDone" hidden><div class="ev-tick">&#10003;</div><h3 style="font-size:22px">Application received.</h3><p style="color:var(--dim)">Thank you &mdash; we&rsquo;ll review and be in touch to confirm your seat.</p></div>
    </div>
  </div>
</div></section>
<script>(function(){var f=document.getElementById("evForm");if(!f)return;var done=document.getElementById("evDone");f.addEventListener("submit",function(e){e.preventDefault();var g=function(k){var el=f.querySelector("[name="+k+"]");return el?el.value.trim():"";};var nm=g("name"),em=g("email");if(!nm||!em){(nm?f.querySelector("[name=email]"):f.querySelector("[name=name]")).focus();return;}var btn=f.querySelector("button");btn.disabled=true;btn.textContent="Sending...";fetch("https://formsubmit.co/ajax/info@ummah-collective.com",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({_subject:"Founders Club event application - AI: Claude & Sales (11 Jul) - "+nm,_captcha:"false",_template:"table",event:"AI - Claude & Sales | 11 Jul 2026, 4-6pm | Oval Damansara",name:nm,email:em,phone:g("phone"),company:g("company"),message:g("message"),page:location.href})}).catch(function(){}).then(function(){f.hidden=true;done.hidden=false;});});})();</script>'''
    body=phero('<a href="index.html">Home</a> / <a href="about.html" data-i18n="company">Company</a> / Founders Club',"Community &middot; Founders Club","Build alongside founders<br>who <em>mean it.</em>",
        "The Ummah Collective Founders Club is a community of Muslim and values-aligned founders, operators and builders &mdash; meeting online and in person in Kuala Lumpur. Free to join; go deeper with premium masterclasses and cohorts.",h1key='clubh')+f'''
<section style="padding-top:0"><div class="wrap"><div class="grid g2" style="align-items:start"><p class="lead reveal">A room of people building with the same intent &mdash; excellence and ethics, together. Less noise, more signal; real relationships and real momentum.</p>
  <p class="reveal">Whether you&rsquo;re pre-idea or scaling, you&rsquo;ll find peers, mentors and the conversations that move things forward &mdash; rooted in our values, open to the world.</p></div></div></section>
{es}
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What&rsquo;s on</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Online &amp; in Kuala Lumpur</span></div></div><div class="grid g2" style="gap:18px">{cards}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Coming up</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Members hear first</span></div></div><div class="reveal">{uprows}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">How it works</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Free to join</span></div></div><div class="grid g2">{stepcards}</div></div></section>
'''+cta('Apply to the<br>Founders <em>Club.</em>')
    return page("founders-club.html","Founders Club — Ummah Collective","A community of Muslim and values-aligned founders — online and in Kuala Lumpur. Free to join; premium masterclasses, mixers and events.",body,aurora="ventures")

def market_entry():
    body=phero('<a href="index.html">Home</a> / Market Entry',"Strategy / Market Entry","Enter new markets<br>with <em>intent.</em>",
        "We help brands cross borders &mdash; into Southeast Asia, Europe and the Gulf &mdash; with research, go-to-market and warm introductions, then build the systems to win there.")+f'''
<section style="padding-top:10px"><div class="wrap">{absart()}</div></section>
<section style="padding-top:0"><div class="wrap"><div class="grid g3">
  <div class="card reveal"><div class="no">01</div><h3>Research</h3><p>Competitor and buyer mapping.</p></div>
  <div class="card reveal"><div class="no">02</div><h3>Go-to-market</h3><p>Positioning, pricing, phased launch.</p></div>
  <div class="card reveal"><div class="no">03</div><h3>Warm intros</h3><p>Our network across MY/SEA, DE/EU, GCC/MENA.</p></div></div></div></section>
'''+cta()
    return page("market-entry.html","Market Entry — Ummah Collective","Market-entry strategy across SEA, EU and the Gulf.",body,aurora="market")

def insights_page():
    rows="".join(f'<a class="erow reveal" href="article-{s}.html"><span class="x">{c} &middot; {d}</span><span class="nm">{t}</span><span class="de">{l}</span></a>' for s,c,d,t,l,im,_ in ARTICLES)
    body=phero('<a href="index.html">Home</a> / Insights',"Insights","Notes from<br>the <em>studio.</em>","Thinking on applied AI, premium positioning and building digital assets for the values economy.")+f'''
<section style="padding-top:24px"><div class="wrap">{rows}</div></section>'''+cta()
    return page("insights.html","Insights — Ummah Collective","Applied AI, positioning and digital assets for the values economy.",body,aurora="insights")

def contact_page():
    opts="".join(f'<option>{t}</option>' for t in ["Start a project"]+[t for _,_,t,*_ in SERVICES]+["Free AI audit","Something else"])
    body=phero('<a href="index.html">Home</a> / Contact',"Let's build","Tell us what's<br>slowing you <em>down.</em>","Book a call, send a brief, or message us on WhatsApp. Direct, white-label or referral.")+f'''
<section style="padding-top:24px"><div class="wrap"><div class="grid g2" style="align-items:start">
  <form class="form reveal" onsubmit="event.preventDefault(); this.querySelector('.ok').style.display='block';">
    <div class="row"><div><label>Name</label><input required placeholder="Your name"></div><div><label>Company</label><input placeholder="Company"></div></div>
    <div class="row"><div><label>Email</label><input type="email" required placeholder="you@company.com"></div><div><label>Interested in</label><select>{opts}</select></div></div>
    <div><label>What are you trying to build?</label><textarea required placeholder="A custom CRM, an AI agent, a new site..."></textarea></div>
    <div><button class="btn btn-fill" type="submit" data-i18n="brief">Send a brief</button></div>
    <p class="ok" style="display:none;color:var(--acc)">Thanks &mdash; we'll reply within one business day. (Demo form: also email info@ummah-collective.com.)</p></form>
  <div class="reveal">
    <div class="eyebrow"><span class="t"></span><span class="mono">Direct</span></div>
    <p style="margin-bottom:18px"><a class="alink" href="booking.html" data-i18n="book">Book a call</a></p>
    <p style="margin-bottom:18px"><a class="alink" href="mailto:info@ummah-collective.com">info@ummah-collective.com <span class="ar">&rarr;</span></a></p>
    <p style="margin-bottom:18px"><a class="alink" href="{WA}">WhatsApp +60 11 3326 2709 <span class="ar">&rarr;</span></a></p>
    <div class="eyebrow" style="margin-top:18px"><span class="t"></span><span class="mono">Studio</span></div><p>Kuala Lumpur &middot; Berlin &middot; Borderless</p></div>
</div></div></section>'''
    return page("contact.html","Contact — Ummah Collective","Book a call, send a brief, or WhatsApp us.",body,aurora="contact")

def booking_page():
    svc="".join(f'<div class="opt" data-grp="service" data-val="{s}"><b>{t}</b><span>{e}</span></div>' for s,_,t,e,*_ in SERVICES[:6])
    pkgs=[("sprint","Sprint","Fixed-scope, 2&ndash;4 weeks"),("retainer","Systems retainer","Monthly build &amp; run"),("audit","Free AI audit","30-min teardown"),("explore","Just exploring","Let's talk options")]
    pk="".join(f'<div class="opt" data-grp="pkg" data-val="{v}"><b>{t}</b><span>{d}</span></div>' for v,t,d in pkgs)
    slots=[("mon","Mon","10:00"),("tue","Tue","14:00"),("wed","Wed","11:00"),("thu","Thu","16:00"),("fri","Fri","09:30"),("mon2","Mon","13:00"),("tue2","Tue","10:30"),("wed2","Wed","15:00")]
    sl="".join(f'<div class="slot" data-val="{v} {h}"><b>{d}</b><span>{h} MYT</span></div>' for v,d,h in slots)
    body=phero('<a href="index.html">Home</a> / Booking',"Book a call","Let's find<br>the <em>fix.</em>","Four quick steps, then pick your exact time. The first call is a free scoping session.")+f'''
<section style="padding-top:24px"><div class="wrap"><div class="wiz" id="wiz">
  <div class="wiz-prog"><span class="p on"></span><span class="p"></span><span class="p"></span><span class="p"></span><span class="p"></span></div>
  <div class="wiz-step on"><h3>What do you need?</h3><div class="sub">Pick the closest fit.</div><div class="opts">{svc}</div><div class="wiz-nav"><span></span><button class="btn btn-fill" data-next>Next &rarr;</button></div></div>
  <div class="wiz-step"><h3>How would you like to work?</h3><div class="sub">Choose an engagement style.</div><div class="opts">{pk}</div><div class="wiz-nav"><button class="btn btn-ghost" data-prev>&larr; Back</button><button class="btn btn-fill" data-next>Next &rarr;</button></div></div>
  <div class="wiz-step"><h3>Pick a preferred time</h3><div class="sub">Tell us what suits you (MYT) &mdash; we'll confirm the exact slot by email.</div><div class="cal">{sl}</div><div class="wiz-nav"><button class="btn btn-ghost" data-prev>&larr; Back</button><button class="btn btn-fill" data-next>Next &rarr;</button></div></div>
  <div class="wiz-step"><h3>Your details</h3><div class="sub">So we can prepare.</div><div class="form"><div class="row"><div><label for="wizName">Name</label><input id="wizName" name="name" autocomplete="name" placeholder="Your name" required></div><div><label for="wizEmail">Email</label><input id="wizEmail" name="email" type="email" autocomplete="email" placeholder="you@company.com" required></div></div><div><label for="wizCompany">Company</label><input id="wizCompany" name="company" autocomplete="organization" placeholder="Company name"></div><div><label for="wizNotes">Anything we should know?</label><textarea id="wizNotes" name="notes" placeholder="Context, goals, timeline..."></textarea></div></div><div id="wizErr" class="mono" style="display:none;color:#ff6b6b;margin-top:10px"></div><div id="wizMsgs" hidden><span id="wizMsgName">Please add your name so we know who we&rsquo;re replying to.</span><span id="wizMsgMail">That email doesn&rsquo;t look right &mdash; we need it to send your confirmation.</span></div><div class="wiz-nav"><button class="btn btn-ghost" data-prev>&larr; Back</button><button class="btn btn-fill" id="wizFinish">Review &rarr;</button></div></div>
  <div class="wiz-step"><h3>Confirm &amp; send</h3><div class="sub">Summary</div><div class="card" style="margin-bottom:20px"><div class="mono" style="color:var(--acc2)">Your request</div><div id="wizSummary" style="font-family:var(--disp);font-size:22px;margin-top:8px">Project</div></div><p style="margin-bottom:20px" id="wizBlurb">Send this over and we'll confirm your slot by email &mdash; usually within a few hours.</p><div id="wizDone" style="display:none"><div class="card" style="margin-bottom:20px;border-color:var(--acc2)"><div class="mono" style="color:var(--acc2)">Request received</div><div style="font-family:var(--disp);font-size:22px;margin-top:8px">Thank you &mdash; we'll confirm your slot by email shortly.</div><p style="margin-top:10px">If it's urgent, message us on <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a>.</p></div></div><div id="wizFail" style="display:none"><div class="card" style="margin-bottom:20px;border-color:#ff6b6b"><div class="mono" style="color:#ff6b6b">Couldn't send</div><p style="margin-top:8px">Something went wrong on our side. Please reach us directly &mdash; we'll come straight back to you:</p><p style="margin-top:10px"><a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a> &nbsp;&middot;&nbsp; <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></p></div></div><div class="wiz-nav" id="wizNav5"><button class="btn btn-ghost" data-prev>&larr; Back</button><button class="btn btn-fill" id="wizSend" data-sending="Sending&hellip;">Send request &rarr;</button></div></div>
</div></div></section>'''
    return page("booking.html","Book a call — Ummah Collective","Book a free scoping call with Ummah Collective.",body,aurora="contact")

def _legal_head(crumb,h1,intro):
    return phero('<a href="index.html">Home</a> / '+crumb,'Legal',h1,intro)

def imprint_page():
    body=_legal_head('Legal notice','Legal <em>notice</em>',"Who runs this website, and how to reach us.")+'''
<section style="padding-top:24px"><div class="wrap"><div class="article reveal">
  <h2>Company</h2>
  <p><strong>Ummah Collective Sdn. Bhd.</strong><br>Kuala Lumpur / Petaling Jaya, Malaysia<br>
  A private limited company incorporated in Malaysia.</p>
  <h2>Contact</h2>
  <p>Email: <a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a><br>
  Phone / WhatsApp: <a href="https://wa.me/601133262709">+60 11 3326 2709</a><br>
  Web: <a href="index.html">ummah-collective.com</a></p>
  <h2>Responsible for content</h2>
  <p>Attila von Barloewen, Founder &mdash; Ummah Collective Sdn. Bhd., Kuala Lumpur.</p>
  <h2>Our legal documents</h2>
  <p><a href="privacy.html">Privacy Policy</a> &mdash; how we handle personal data (PDPA 2010, with a Bahasa Malaysia notice).<br>
  <a href="terms.html">Terms of Use</a> &mdash; the terms for using this website and engaging our services.</p>
  <h2>Liability for links</h2>
  <p>This site links to external websites operated by third parties. We have no influence over their content and accept no liability for it; the respective operator is responsible.</p>
  <h2>Copyright</h2>
  <p>All content on this website &mdash; text, design, graphics and code &mdash; is &copy; Ummah Collective Sdn. Bhd. unless otherwise noted. Reproduction requires our written consent. Client work shown remains the trademark of the respective owners.</p>
</div></div></section>'''
    return page("imprint.html","Legal Notice — Ummah Collective","Legal notice for Ummah Collective Sdn. Bhd., Kuala Lumpur — company details, contact and responsibility for content.",body,aurora="default")

def privacy_page():
    body=_legal_head('Privacy','Privacy <em>Policy</em>',"How we collect, use and protect personal data. Short version: we collect little, we sell nothing, you stay in control.")+'''
<section style="padding-top:24px"><div class="wrap"><div class="article reveal">
  <p><em>Last updated: 11 July 2026 &middot; This policy is issued in English with a Bahasa Malaysia notice below, in line with the Personal Data Protection Act 2010 (PDPA).</em></p>

  <h2>1 &middot; Who we are</h2>
  <p>Ummah Collective Sdn. Bhd. ("we", "us"), Kuala Lumpur / Petaling Jaya, Malaysia, is the data user responsible for personal data processed through this website. Contact: <a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a>.</p>

  <h2>2 &middot; What we collect, and why</h2>
  <p><strong>Enquiries &amp; bookings.</strong> When you book a call or send a brief, we receive what you type: name, email, phone (optional), company, and your project details. We use it solely to respond, scope, and deliver what you asked for.</p>
  <p><strong>Newsletter.</strong> Your email address, if you subscribe &mdash; used only to send our insights, with one-click unsubscribe in every issue.</p>
  <p><strong>Analytics.</strong> We use Google Analytics 4 behind a consent banner (Google Consent Mode v2): analytics run only after you accept, and measure aggregate usage &mdash; pages viewed, approximate region, device type. Decline, and the site works fully.</p>
  <p><strong>Technical logs.</strong> Our hosting provider records standard server logs (IP address, browser, timestamp) for security and operation of the service.</p>
  <p>We do not collect sensitive personal data, we do not profile you, and we never sell or rent personal data.</p>

  <h2>3 &middot; Legal basis &amp; consent</h2>
  <p>We process personal data with your consent (forms you choose to submit, analytics you accept) and where necessary for the performance of a contract or steps you request before one, in line with the PDPA's General Principle. You may withdraw consent at any time by contacting us &mdash; this does not affect processing already carried out lawfully.</p>

  <h2>4 &middot; Who we share data with</h2>
  <p>Only service providers who help us operate &mdash; hosting (Vercel), email delivery and newsletter (our email provider), form delivery, and analytics (Google) &mdash; each processing data on our instructions under their own safeguards. We disclose data beyond this only where the law requires it. We never sell personal data.</p>

  <h2>5 &middot; International transfers</h2>
  <p>Some providers store data on servers outside Malaysia (including the EU and the US). Where personal data is transferred outside Malaysia, we take reasonable steps to ensure it is protected to a standard comparable to the PDPA, and for visitors from the EEA we rely on our providers' GDPR safeguards, including standard contractual clauses.</p>

  <h2>6 &middot; Retention</h2>
  <p>Enquiry data is kept for as long as needed to handle your matter and for legitimate business records, then deleted. Newsletter data is kept until you unsubscribe. Aggregated analytics follow Google Analytics' standard retention settings. We do not keep personal data longer than necessary for the purpose it was collected.</p>

  <h2>7 &middot; Security</h2>
  <p>Data is transmitted encrypted (HTTPS) and access is limited to those who need it. No internet transmission is 100% secure, but we take practical steps &mdash; reputable providers, minimal collection, restricted access &mdash; to protect what you entrust to us.</p>

  <h2>8 &middot; Your rights</h2>
  <p>Under the PDPA you may request access to your personal data, request correction, and withdraw consent to processing. Visitors from the EEA additionally have GDPR rights to erasure, restriction, portability, and objection, and may lodge a complaint with their supervisory authority. To exercise any right, email <a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a> &mdash; we respond promptly and without charge for reasonable requests.</p>

  <h2>9 &middot; Cookies</h2>
  <p>We use only what the site needs: a consent choice (stored locally), your language preference, and &mdash; after you accept &mdash; Google Analytics cookies. No advertising cookies, no cross-site tracking.</p>

  <h2>10 &middot; Children</h2>
  <p>This website is a business service and is not directed at children. We do not knowingly collect personal data from minors.</p>

  <h2>11 &middot; Changes</h2>
  <p>We will post updates here with a new date. Material changes will be flagged clearly on this page.</p>

  <h2>Notis Privasi (Bahasa Malaysia)</h2>
  <p>Selaras dengan Akta Perlindungan Data Peribadi 2010, Ummah Collective Sdn. Bhd. memproses data peribadi anda (nama, e-mel, telefon, butiran projek) yang anda berikan melalui borang di laman web ini, semata-mata untuk membalas pertanyaan anda, menyediakan perkhidmatan yang diminta, dan &mdash; jika anda melanggan &mdash; menghantar surat berita kami. Data anda tidak akan dijual. Data mungkin diproses oleh pembekal perkhidmatan kami (pengehosan, e-mel, analitik) termasuk di luar Malaysia dengan perlindungan yang sewajarnya. Anda berhak mengakses dan membetulkan data peribadi anda serta menarik balik persetujuan pada bila-bila masa dengan menghubungi <a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a>.</p>
</div></div></section>'''
    return page("privacy.html","Privacy Policy — Ummah Collective","How Ummah Collective handles personal data under Malaysia's PDPA 2010 — minimal collection, no selling, GDPR-aware, with a Bahasa Malaysia notice.",body,aurora="default")

def terms_page():
    body=_legal_head('Terms','Terms of <em>Use</em>',"The terms for using this website and working with us. Written to be read, not to hide behind.")+'''
<section style="padding-top:24px"><div class="wrap"><div class="article reveal">
  <p><em>Last updated: 11 July 2026</em></p>

  <h2>1 &middot; Who these terms cover</h2>
  <p>These terms govern your use of ummah-collective.com, operated by Ummah Collective Sdn. Bhd., Kuala Lumpur, Malaysia. By using the site you accept them.</p>

  <h2>2 &middot; Using this website</h2>
  <p>You may browse, link to, and share our content for lawful purposes. You may not scrape the site at scale, attempt to disrupt it, misrepresent an affiliation with us, or reuse our content commercially without written consent.</p>

  <h2>3 &middot; Our content</h2>
  <p>Everything we publish &mdash; copy, design, graphics, code, and insights articles &mdash; is our intellectual property unless credited otherwise. Client names, logos and work shown remain the property of their respective owners and appear with permission or as factual portfolio reference.</p>

  <h2>4 &middot; Information, not advice</h2>
  <p>Content on this site &mdash; including articles, guides and audits &mdash; is general information and our professional opinion. It is not legal, financial, or religious advice. On Shariah questions we defer to qualified scholars; on legal and financial specifics, consult licensed professionals.</p>

  <h2>5 &middot; Engaging our services</h2>
  <p>Client engagements are governed by the individual proposal, quotation or agreement we issue for that project &mdash; including scope, fees, timelines, and deliverables. If anything in such an agreement differs from these terms, the agreement prevails. Free consultations and audits are provided as-is, without obligation on either side.</p>

  <h2>6 &middot; No guarantees of outcomes</h2>
  <p>We hold ourselves to a high standard of craft, and we are honest about the rest: marketing, search and growth outcomes depend on markets and platforms we do not control. Unless expressly agreed in writing, results described on this site are illustrations of past work, not promises of future performance.</p>

  <h2>7 &middot; Third-party links &amp; tools</h2>
  <p>Links to external sites and embedded third-party tools (for example booking or messaging) are provided for convenience. Their content and their terms are their operators' responsibility.</p>

  <h2>8 &middot; Liability</h2>
  <p>To the fullest extent permitted by Malaysian law, we are not liable for indirect or consequential loss arising from use of this website. Nothing in these terms excludes liability that cannot lawfully be excluded.</p>

  <h2>9 &middot; Privacy</h2>
  <p>How we handle personal data is set out in our <a href="privacy.html">Privacy Policy</a>, which forms part of these terms.</p>

  <h2>10 &middot; Governing law</h2>
  <p>These terms are governed by the laws of Malaysia. Disputes are subject to the exclusive jurisdiction of the courts of Kuala Lumpur.</p>

  <h2>11 &middot; Changes &amp; contact</h2>
  <p>We may update these terms; the current version always lives at this address. Questions: <a href="mailto:info@ummah-collective.com">info@ummah-collective.com</a>.</p>
</div></div></section>'''
    return page("terms.html","Terms of Use — Ummah Collective","Terms of use for ummah-collective.com and for engaging Ummah Collective Sdn. Bhd. — plain language, Malaysian law.",body,aurora="default")

LOTTIE='{"v":"5.7.4","fr":30,"ip":0,"op":60,"w":200,"h":200,"nm":"pulse","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"pulse","sr":1,"ks":{"o":{"a":1,"k":[{"t":0,"s":[40]},{"t":30,"s":[100]},{"t":60,"s":[40]}]},"r":{"a":0,"k":0},"p":{"a":0,"k":[100,100,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":1,"k":[{"t":0,"s":[55,55,100]},{"t":30,"s":[100,100,100]},{"t":60,"s":[55,55,100]}]}},"shapes":[{"ty":"gr","it":[{"ty":"el","d":1,"s":{"a":0,"k":[150,150]},"p":{"a":0,"k":[0,0]}},{"ty":"st","c":{"a":0,"k":[0.12,0.85,0.54,1]},"o":{"a":0,"k":100},"w":{"a":0,"k":8},"lc":2,"lj":1},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","it":[{"ty":"el","d":1,"s":{"a":0,"k":[36,36]},"p":{"a":0,"k":[0,0]}},{"ty":"fl","c":{"a":0,"k":[0.12,0.85,0.54,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":60,"st":0,"bm":0}]}'
def noon_os_page():
    cap=agent_chat('Intake &middot; WhatsApp','Intake from any channel &mdash; straight into the system, assigned and tracked',[('a','Hi! Do you ship halal beef to Riyadh? We need ~2 tonnes monthly.'),('u','Salam! Yes &mdash; setting you up now&hellip;'),('u','&#9989; Added to your pipeline as a new deal, assigned to Omar, follow-up booked for tomorrow 10am.'),('a','That was fast &#128077;'),('typing',''),('u','Omar will call with a quote &mdash; it&rsquo;s already in your CRM &#128210;')])
    feat=[("Your processes, your stages","Any workflow &mdash; sales, ops or fulfilment &mdash; modelled on how you really work, not a vendor&rsquo;s template."),
      ("Records &amp; 360 views","Every call, email, deal and document in one place &mdash; customers, suppliers, anything."),
      ("Live dashboards","Real-time sales, ops and finance tracking &mdash; in your branding."),
      ("Automations built in","Quotes, invoices, reminders and reports on autopilot."),
      ("WhatsApp &amp; AI agents","Capture and qualify leads on the channels SEA &amp; MENA actually use."),
      ("Integrations &amp; APIs","Wired into your accounting, email, calendar and payments."),
      ("Multi-language","EN / BM / AR-RTL / ZH and more, out of the box."),
      ("You own it","Your data, your code, your roadmap &mdash; no per-seat tax.")]
    fc="".join(f'<div class="card reveal"><div class="no">{i:02d}</div><h3 style="font-size:19px">{t}</h3><p>{d}</p></div>' for i,(t,d) in enumerate(feat,1))
    steps=[("01","Audit","We map your workflows, your data and the tools you use today."),("02","Design","Stages, fields, dashboards and automations &mdash; on paper first."),("03","Build","On a modern, secure stack, in your branding and your domain."),("04","Migrate","Your data and your team moved over, cleanly."),("05","Evolve","We tune and extend it as you grow.")]
    stc="".join(f'<div class="card reveal"><div class="no">{n}</div><h3 style="font-size:19px">{t}</h3><p>{d}</p></div>' for n,t,d in steps)
    faq=[("How long does it take?","A working v1 in weeks, then we phase the rest so you get value fast &mdash; not a year-long project."),
         ("Who owns the system and the data?","You do. The code, the data and the roadmap are yours &mdash; no lock-in, no per-seat tax."),
         ("Can it be in our branding?","Yes &mdash; your logo, colours and domain, so it feels like your own product."),
         ("Will it connect to our other tools?","Yes &mdash; accounting, email, calendar, payments and WhatsApp, via APIs."),
         ("Can AI agents work inside it?","Absolutely &mdash; capture, qualify and follow up leads 24/7, in any language."),
         ("What does it cost?","Every build is scoped to you. Book an audit and we&rsquo;ll map the work &mdash; and the savings.")]
    faqs="".join(f'<details class="reveal"><summary>{q}<span class="pl">+</span></summary><p>{a}</p></details>' for q,a in faq)
    body=phero('<a href="index.html">Home</a> / Services / Custom Systems','Service / Custom Systems &amp; CRM','The custom system<br>your business <em>runs on.</em>',
        "We build bespoke internal systems that optimize how your business actually runs &mdash; sales, operations, finance and every workflow in between &mdash; cutting manual work and cost. A CRM is one shape it takes; white-labelling or reselling it is just an option.")+f'''
<section style="padding-top:6px"><div class="wrap"><div class="reveal" style="max-width:66ch"><div class="eyebrow"><span class="t"></span><span class="mono">See it live</span></div><h2 style="font-size:clamp(26px,3vw,40px);margin-bottom:10px">A system that works the way you do</h2><p>Real features from the systems we&rsquo;ve built &mdash; boards, records, dashboards and automations &mdash; wired to how your team actually works, not a vendor&rsquo;s template.</p></div>
<div class="grid g2 crmprev" style="gap:18px;margin-top:24px">{crm_pipeline()}{crm_contact()}{crm_dash()}{crm_auto()}{cap}</div></div></section>
{crm_savings()}
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What we build into it</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Capabilities</span></div></div><div class="grid g4" style="gap:14px">{fc}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="depth reveal"><div class="eyebrow"><span class="t"></span><span class="mono">Off the shelf, off the mark</span></div>
<h2 class="depth-h">Off-the-shelf software makes you work its way.</h2>
<p class="depth-lead">Generic tools force your team to bend to someone else&rsquo;s process &mdash; so people work around them, data scatters and cost quietly creeps. A system built for you fits exactly, removes the manual glue between your tools, and your team actually uses it.</p>
<div class="grid g3 depth-cards" style="gap:16px;margin-top:26px"><div class="dpc reveal"><div class="dpc-k">Fits your process</div><div class="dpc-b">Stages, fields and views that match how you really operate.</div></div><div class="dpc reveal"><div class="dpc-k">Actually adopted</div><div class="dpc-b">When the tool fits, the team logs everything &mdash; so the data is real.</div></div><div class="dpc reveal"><div class="dpc-k">Grows with you</div><div class="dpc-b">New product line, market or workflow &mdash; the system bends, you don&rsquo;t.</div></div></div>
<div class="depth-cta"><p>See what we&rsquo;d build for you &mdash; book a free workflow audit.</p><a href="booking.html?service=noon-os" class="btn btn-fill" data-i18n="book">Book a call</a></div></div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">How it works</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Idea to live in weeks</span></div></div><div class="grid g3" style="gap:14px">{stc}</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Custom systems, answered</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">FAQ</span></div></div><div class="faq">{faqs}</div></div></section>
'''+cta('Book a<br><em>CRM audit.</em>')
    return page("noon-os.html","Noon OS — Halal CRM & Business Software for Muslim Founders","Noon OS is the halal CRM and business operating system for Muslim founders and halal-economy brands — sales, projects, finance and community in one panel. We also build bespoke CRMs you own.",body,aurora="services",ld=faq_ld(faq))

def launch_bundle_page():
    incl=[("Premium website &mdash; new or redesign","A conversion-built, multilingual site, designed and developed by us &mdash; built fresh, or your existing one rebuilt and modernised. Fast, secure and structured to turn visitors into real enquiries, not just views."),
      ("90-day posting plan","A done-for-you content calendar mapped to your goals and your launch moment &mdash; so you know exactly what to post, and when, across the first three months."),
      ("Template content pack","A set of ready-to-use post and caption templates in your brand voice and colours, so your team can keep publishing consistently without ever starting from a blank page."),
      ("Social media setup","Your profiles created or cleaned up and optimised across the platforms that matter for your market &mdash; consistent handles, bios, links and branding, ready to grow."),
      ("Noon OS &mdash; 6 months included","Six months of our halal-industry CRM, free: leads, bookings, clients and follow-ups in one panel, in your branding &mdash; so nothing slips through the cracks after launch."),
      ("Brand guide","Your logo usage, colour palette, typography and tone of voice in one simple guide &mdash; so everything you and we produce stays consistent, credible and unmistakably yours.")]
    li="".join(f'<li><span class="ck">&#10003;</span><div><b>{t}</b><p>{d}</p></div></li>' for t,d in incl)
    faq=[("Why only four slots a month?","We deliver every bundle hands-on, as a studio &mdash; not a factory. Capping onboarding at four new businesses a month is how we protect the quality, attention and speed you see here."),
         ("Is this only for halal-industry businesses?","Yes &mdash; this bundle is built specifically for halal-certified and Muslim-market companies. If you&rsquo;re close or adjacent, talk to us and we&rsquo;ll tell you honestly whether it&rsquo;s the right fit."),
         ("New brand or a redesign?","Either. We build you a brand and site from scratch, or redesign and modernise the one you already have."),
         ("How fast do we launch?","Typically 2&ndash;3 weeks from kickoff, depending on how ready your content is."),
         ("Who is this for?","Halal-certified and Muslim-market founders launching a new brand &mdash; or relaunching an existing one &mdash; who need a credible, complete presence fast, without hiring five separate vendors."),
         ("What do you need from us?","Your logo and any assets you have, plus about 30 minutes to align. We handle everything else and keep you updated throughout.")]
    faqs="".join(f'<details class="reveal"><summary>{q}<span class="pl">+</span></summary><p>{a}</p></details>' for q,a in faq)
    body=f'''<header class="phero bundle-hero"><div class="lottie-box pmark" data-src="orbit-lottie.json"></div><div class="wrap">
  <div class="crumb reveal"><a href="index.html">Home</a> / Products / Launch Bundle</div>
  <div class="reveal bundle-solo">
    <div class="eyebrow" style="justify-content:flex-start;margin:12px 0 12px"><span class="t"></span><span class="mono">Exclusive &middot; Halal-industry businesses</span></div>
    <div class="urgency"><span class="udot"></span>Only 4 onboarding slots left this month</div>
    <h1 class="bundle-h1">Launch &mdash; or relaunch &mdash;<br><em>the right way.</em></h1>
    <p class="bundle-lead">A complete, done-for-you launch, built exclusively for halal-industry brands: a premium website (new or redesigned), a content &amp; social system and a brand guide, plus <strong>6 months of Noon OS</strong> &mdash; delivered end-to-end by Ummah Collective. It&rsquo;s by application, and we only take on <strong>four new businesses a month</strong> so every launch gets our full attention.</p>
    <div class="bundle-meta">By application &middot; 4 slots / month &middot; 2&ndash;3 weeks to live</div>
    <div class="bundle-cta"><a href="booking.html?service=launch-bundle" class="btn btn-fill">Claim your slot &rarr;</a><a href="{WA}" class="btn btn-ghost" target="_blank" rel="noopener">WhatsApp us</a></div>
  </div>
</div></header>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">What's included</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">6 deliverables &middot; done-for-you</span></div></div>
  <p class="reveal" style="max-width:680px;color:var(--dim2);margin:-6px 0 26px">Everything you need to launch credibly &mdash; without hiring five separate vendors or stitching tools together yourself. We build it, set it up and hand it over, ready to run.</p>
  <ul class="incl reveal" style="max-width:760px">{li}</ul></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Why founders trust us</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">Proof</span></div></div>
  <div class="grid g4"><div class="card reveal"><div class="no">Flagship</div><h3 style="font-size:30px">18.45%</h3><p>of ANAAKA revenue from organic &mdash; an asset, not ads.</p></div>
  <div class="card reveal"><div class="no">Scale</div><h3 style="font-size:30px">100+</h3><p>projects delivered across SEA, EU &amp; MENA.</p></div>
  <div class="card reveal"><div class="no">Reach</div><h3 style="font-size:30px">60+</h3><p>clients worldwide trust the studio.</p></div>
  <div class="card reveal"><div class="no">Speed</div><h3 style="font-size:30px">2&ndash;3 wks</h3><p>from kickoff to a live launch.</p></div></div></div></section>
<section style="padding-top:0"><div class="wrap" style="text-align:center"><div class="quote reveal" style="margin:0 auto">&ldquo;They built our entire ecosystem &mdash; brand, site, tracking and a flagship store. <em>Not a campaign. An asset.</em>&rdquo;</div><div class="quote-by reveal">ANAAKA &mdash; Halal Skincare &middot; Flagship @ TRX, KL</div></div></section>
<section style="padding-top:0"><div class="wrap"><div class="sh"><h2 class="reveal">Questions</h2><div class="eyebrow reveal"><span class="t"></span><span class="mono">FAQ</span></div></div><div class="faq">{faqs}</div></div></section>
'''+cta('Claim your<br><em>launch slot.</em>')
    return page("launch-bundle.html","Launch Bundle — Exclusive Launch for Halal-Industry Businesses | Ummah Collective","An exclusive, done-for-you launch bundle for halal-industry businesses: premium website, content, social, brand guide and 6 months of Noon OS. By application — only 4 onboarding slots a month.",body,aurora="market",ld=faq_ld(faq))

def liquid_preview():
    body=phero('<a href="index.html">Home</a> / Background variant','Prototype / Liquid background','Liquid &mdash; <em>metaball</em> background.',
        "An alternative high-tech background in UC jade: glossy metaballs that flow, merge and part around your cursor. Move your mouse anywhere on this page to feel it.")+'''
<section><div class="wrap"><div class="grid g3">
  <div class="card reveal"><div class="no">01</div><h3>Mouse-reactive</h3><p>A liquid blob follows and merges with your cursor in real time.</p></div>
  <div class="card reveal"><div class="no">02</div><h3>UC jade only</h3><p>Pure CI palette &mdash; no orange, no off-brand accents.</p></div>
  <div class="card reveal"><div class="no">03</div><h3>GPU shader</h3><p>Rendered on the graphics card at 60fps; light on the CPU.</p></div>
</div>
<div class="reveal" style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap"><a href="index.html" class="btn btn-ghost">&larr; Back to Aurora (default)</a><a href="booking.html" class="btn btn-fill" data-i18n="book">Book a call</a></div>
</div></section>'''
    return page("liquid-preview.html","Liquid Background Variant — Ummah Collective","A high-tech liquid metaball background in UC jade, mouse-reactive.",body,aurora="services",bg="liquid")

def not_found_page():
    body='''<section style="min-height:58vh;display:flex;align-items:center"><div class="wrap" style="text-align:center">
  <div class="eyebrow reveal" style="justify-content:center"><span class="t"></span><span class="mono">404 &middot; Not found</span></div>
  <h1 class="reveal" style="margin-top:14px">This page moved on.<br><em>The work didn&rsquo;t.</em></h1>
  <p class="lead reveal" style="margin:18px auto 0;max-width:52ch">The address you followed doesn&rsquo;t exist anymore &mdash; we rebuild fast. Everything current lives one click away.</p>
  <div class="reveal" style="margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a href="index.html" class="btn btn-fill">Back to home</a><a href="work.html" class="btn btn-ghost">See the work</a><a href="booking.html" class="btn btn-ghost" data-i18n="book">Book a call</a></div>
</div></section>'''
    fn=page("404.html","Page not found — Ummah Collective","This page doesn't exist anymore. See Ummah Collective's current work, services and ventures.",body,aurora="home")
    p=os.path.join(OUT,"404.html"); h=open(p,encoding="utf-8").read()
    open(p,"w",encoding="utf-8").write(h.replace('<meta name="robots" content="index,follow">','<meta name="robots" content="noindex,follow">'))
    return fn

REDIR={"custom-crm":"noon-os.html","seo":"service-seo-content.html","content-marketing":"service-seo-content.html","digital-marketing":"service-lead-generation.html","digital-advertising":"service-lead-generation.html","social-media":"service-social-media-automation.html","digital-strategies":"service-branding.html","market-entry":"service-branding.html",
 # 2026-07-04 consolidation: 3 retired service pages 301 to their merged/renamed successors
 "marketing-ads":"service-lead-generation.html","strategy":"service-branding.html","graphic-design":"service-social-media-automation.html"}
# ---------------- STATIC LANGUAGE TREES (hreflang SEO fix, 2026-07-05) ----------------
# Generates /de/ /ms/ /ar/ /zh/ /tr/ full page trees from the English build:
#  - data-i18n elements statically replaced from the uc.js I18N core (parsed at build time)
#  - free text statically replaced from TRMAP (exact-match, entity-aware)
#  - per-language canonical/og:url/og:locale + hreflang alternates on EVERY variant incl. EN roots
#  - asset paths made absolute; internal links stay relative (keep visitors inside their tree)
import re as _re
LOC_LANGS=['de','ms','ar','zh','tr']
OGLOC={'en':'en_US','de':'de_DE','ms':'ms_MY','ar':'ar_AR','zh':'zh_CN','tr':'tr_TR'}

def _parse_i18n_core():
    js=open('uc.js',encoding='utf-8').read()
    core={}
    def _scan(seg):
        for blk in _re.finditer(r'(\w\w):\{((?:[^{}]|\{[^{}]*\})*?)\}(?=,?\s*\n\s*(?:\w\w:\{|\};))',seg):
            lang=blk.group(1); d=core.setdefault(lang,{})
            for m2 in _re.finditer(r'(\w+):"((?:[^"\\]|\\.)*)"',blk.group(2)): d[m2.group(1)]=m2.group(2)
            for m2 in _re.finditer(r"(\w+):'((?:[^'\\]|\\.)*)'",blk.group(2)): d[m2.group(1)]=m2.group(2)
    i=js.find('I18N={'); _scan(js[i:i+24000])
    j=js.find('var _CTA={'); _scan(js[j:j+8000])
    return core

_ENT=[('€','&euro;'),('−','&minus;'),('&','&amp;'),('—','&mdash;'),('–','&ndash;'),('’','&rsquo;'),('‘','&lsquo;'),('“','&ldquo;'),('”','&rdquo;'),('„','&bdquo;'),('·','&middot;'),('…','&hellip;'),('→','&rarr;'),('ü','&uuml;'),('ö','&ouml;'),('ä','&auml;'),('ß','&szlig;')]
def _escvariant(t):
    for a,b in _ENT: t=t.replace(a,b)
    return t

def _hreflinks(path):
    ls=''.join(f'<link rel="alternate" hreflang="{l}" href="{SITE}/{l}/{path}">' for l in LOC_LANGS)
    ls+=f'<link rel="alternate" hreflang="en" href="{SITE}/{path}"><link rel="alternate" hreflang="x-default" href="{SITE}/{path}">'
    return ls

def localize(pages):
    core=_parse_i18n_core()
    tree_pages=[f for f in pages if f not in ('liquid-preview.html','404.html')]
    # 1) inject hreflang into English root pages
    for f in tree_pages:
        p=os.path.join(OUT,f); h=open(p,encoding='utf-8').read()
        path='' if f=='index.html' else f
        if 'hreflang' not in h:
            h=h.replace('</head>',_hreflinks(path)+'</head>',1)
            open(p,'w',encoding='utf-8').write(h)
    # 2) build each language tree
    counts={}
    for l in LOC_LANGS:
        os.makedirs(os.path.join(OUT,l),exist_ok=True)
        tr=dict(TRMAP.get(l,{}))
        # longest keys first so long phrases win
        keys=sorted(tr.keys(),key=len,reverse=True)
        cd=core.get(l,{}); ce=core.get('en',{})
        n=0
        for f in tree_pages:
            h=open(os.path.join(OUT,f),encoding='utf-8').read()
            path='' if f=='index.html' else f
            # lang + locale + canonical/og
            h=h.replace('<html lang="en"','<html lang="'+l+'"',1)
            h=h.replace('content="en_US"','content="'+OGLOC[l]+'"',1)
            h=h.replace(f'rel="canonical" href="{SITE}/{path}"',f'rel="canonical" href="{SITE}/{l}/{path}"',1)
            h=h.replace(f'property="og:url" content="{SITE}/{path}"',f'property="og:url" content="{SITE}/{l}/{path}"',1)
            # data-i18n statically applied
            def _rep(m3):
                tag,attrs,inner=m3.group(1),m3.group(2),m3.group(3)
                k=_re.search(r'data-i18n="(\w+)"',attrs).group(1)
                v=cd.get(k)
                return '<'+tag+attrs+'>'+(v if v else inner)+'</'+tag+'>' 
            h=_re.sub(r'<(\w+)([^>]*data-i18n="\w+"[^>]*)>(.*?)</\1>',_rep,h,flags=_re.S)
            # free-text replacement (text nodes; whitespace- and entity-tolerant, 2026-07-05)
            import html as _htmlmod
            def _txrep(m4):
                raw=m4.group(1); s=raw.strip()
                if not s: return m4.group(0)
                v=tr.get(s)
                if v is None: v=tr.get(_htmlmod.unescape(s))
                if v is None: return m4.group(0)
                pre=raw[:len(raw)-len(raw.lstrip())]; post=raw[len(raw.rstrip()):]
                return '>'+pre+v+post+'<'
            h=_re.sub(r'>([^<>]+)<',_txrep,h)
            for k in keys:
                v=tr[k]
                for kk in ({k,_escvariant(k)}):
                    h=h.replace('<title>'+kk+'</title>','<title>'+v+'</title>')
                    h=h.replace('content="'+kk+'"','content="'+v+'"')
            # translate inside <title> and meta description (substring-level)
            tm=_re.search(r'<title>(.*?)</title>',h)
            if tm:
                t0=tm.group(1); t1=t0
                for k in keys:
                    ke=_escvariant(k)
                    if ke in t1: t1=t1.replace(ke,tr[k])
                    elif k in t1: t1=t1.replace(k,tr[k])
                if t1!=t0: h=h.replace('<title>'+t0+'</title>','<title>'+t1+'</title>',1)
            dm=_re.search(r'name="description" content="(.*?)"',h)
            if dm:
                d0=dm.group(1); d1=d0
                for k in keys:
                    ke=_escvariant(k)
                    if ke in d1: d1=d1.replace(ke,tr[k])
                    elif k in d1: d1=d1.replace(k,tr[k])
                if d1!=d0: h=h.replace('name="description" content="'+d0+'"','name="description" content="'+d1+'"',1)
            # absolute asset paths (page lives one level down)
            for a in ['uc.css','uc.js','translations.js','favicon.ico','favicon.svg','apple-touch-icon.png','site.webmanifest','orbit-lottie.json','pulse-lottie.json']:
                h=h.replace('href="'+a+'"','href="/'+a+'"').replace('src="'+a+'"','src="/'+a+'"').replace('data-src="'+a+'"','data-src="/'+a+'"')
            open(os.path.join(OUT,l,f),'w',encoding='utf-8').write(h); n+=1
        counts[l]=n
    return counts

def main():
    open(os.path.join(OUT,"pulse-lottie.json"),"w",encoding="utf-8").write(LOTTIE)
    ORBIT='{"v":"5.7.4","fr":30,"ip":0,"op":90,"w":200,"h":200,"nm":"orbit","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"o","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":1,"k":[{"t":0,"s":[0]},{"t":90,"s":[360]}]},"p":{"a":0,"k":[100,100,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"shapes":[{"ty":"gr","it":[{"ty":"el","s":{"a":0,"k":[24,24]},"p":{"a":0,"k":[0,-58]}},{"ty":"fl","c":{"a":0,"k":[0.12,0.85,0.54,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","it":[{"ty":"el","s":{"a":0,"k":[16,16]},"p":{"a":0,"k":[50,30]}},{"ty":"fl","c":{"a":0,"k":[0.36,0.88,0.74,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]},{"ty":"gr","it":[{"ty":"el","s":{"a":0,"k":[16,16]},"p":{"a":0,"k":[-50,30]}},{"ty":"fl","c":{"a":0,"k":[0.36,0.88,0.75,1]},"o":{"a":0,"k":100}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":90,"st":0,"bm":0},{"ddd":0,"ind":2,"ty":4,"nm":"core","sr":1,"ks":{"o":{"a":0,"k":100},"r":{"a":0,"k":0},"p":{"a":0,"k":[100,100,0]},"a":{"a":0,"k":[0,0,0]},"s":{"a":0,"k":[100,100,100]}},"shapes":[{"ty":"gr","it":[{"ty":"el","s":{"a":0,"k":[20,20]},"p":{"a":0,"k":[0,0]}},{"ty":"st","c":{"a":0,"k":[1,1,1,1]},"o":{"a":0,"k":80},"w":{"a":0,"k":2}},{"ty":"tr","p":{"a":0,"k":[0,0]},"a":{"a":0,"k":[0,0]},"s":{"a":0,"k":[100,100]},"r":{"a":0,"k":0},"o":{"a":0,"k":100}}]}],"ip":0,"op":90,"st":0,"bm":0}]}'
    open(os.path.join(OUT,"orbit-lottie.json"),"w",encoding="utf-8").write(ORBIT)
    pass  # translations.js retired 2026-07-06 — trees are pre-localized; client-side TR swap is dead code
    m=[home(),services_overview()]
    for s in SERVICES: m.append(service_page(*s))
    m+=[noon_os_page(),launch_bundle_page(),work_page()]
    for p in PROJECTS: m.append(project_page(*p))
    m+=[ventures_page(),about_page(),process_page(),insights_page(),founders_club()]
    for a in ARTICLES: m.append(article_page(*a))
    m+=[contact_page(),booking_page(),imprint_page(),privacy_page(),terms_page(),liquid_preview(),not_found_page()]
    # ---- sitemap.xml + robots.txt ----
    EXCLUDE={"liquid-preview.html","404.html"}
    _loc=localize(m)
    print("Localized trees:",_loc)
    urls=[SITE+"/"+("" if f=="index.html" else f) for f in m if f not in EXCLUDE]
    urls+= [SITE+"/"+l+"/"+("" if f=="index.html" else f) for l in LOC_LANGS for f in m if f not in EXCLUDE]
    sm='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join('  <url><loc>'+u+'</loc></url>\n' for u in urls)+'</urlset>\n'
    open(os.path.join(OUT,"sitemap.xml"),"w",encoding="utf-8").write(sm)
    open(os.path.join(OUT,"robots.txt"),"w",encoding="utf-8").write("User-agent: *\nAllow: /\nDisallow: /liquid-preview.html\n\nSitemap: "+SITE+"/sitemap.xml\n")
    # PWA manifest (app-like mobile experience, 2026-07-05)
    open(os.path.join(OUT,"site.webmanifest"),"w",encoding="utf-8").write(json.dumps({
        "name":"Ummah Collective","short_name":"UMMAH","description":"Applied-AI Studio — Software, Automation, Growth.",
        "start_url":"/","scope":"/","display":"standalone","orientation":"portrait",
        "background_color":"#0B0F0E","theme_color":"#0B0F0E",
        "icons":[{"src":"favicon-192.png","sizes":"192x192","type":"image/png"},
                 {"src":"icon-512.png","sizes":"512x512","type":"image/png"},
                 {"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"maskable"}]},separators=(',',':')))
    for old,new in REDIR.items():
        fn=("service-"+old+".html") if old!="market-entry" else "market-entry.html"
        open(os.path.join(OUT,fn),"w",encoding="utf-8").write('<!DOCTYPE html><html><head><meta charset="UTF-8"><meta http-equiv="refresh" content="0;url='+new+'"><link rel="canonical" href="'+new+'"></head><body>Redirecting to <a href="'+new+'">'+new+'</a></body></html>')
    print(f"Generated {len(m)} pages + {len(REDIR)} redirects")

if __name__=="__main__": main()
