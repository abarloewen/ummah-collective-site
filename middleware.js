// Vercel Routing Middleware — password gate for private client rooms.
// Everything under /tqh/ (page, PDFs, HTML files, images) is served only after the password is entered.

export const config = { matcher: ['/tqh', '/tqh/:path*'] };

const PASSWORD = 'uc26';
const COOKIE = 'uc_room_tqh';
const TOKEN = 'k7Qz2fW9pLr4Xv8NcT3m'; // value of the session cookie once the password is accepted
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const NEXT = () => new Response(null, { headers: { 'x-middleware-next': '1' } });

function cookieValue(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(/;\s*/)) {
    const i = part.indexOf('=');
    if (i > -1 && part.slice(0, i) === name) return part.slice(i + 1);
  }
  return null;
}

function loginPage(error) {
  const html = `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>Client room · Ummah Collective</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=clash-display@500&display=swap">
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=general-sans@400,600&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400&display=swap">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{min-height:100vh;display:grid;place-items:center;padding:24px 16px;background:radial-gradient(60% 50% at 85% 0%,rgba(22,209,150,.18),transparent 70%),radial-gradient(50% 40% at 0% 100%,rgba(79,224,189,.08),transparent 70%),#040605;color:#F1F5EF;font-family:'General Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.box{width:100%;max-width:420px;border:1px solid rgba(241,245,239,.14);border-radius:20px;padding:36px 30px;background:rgba(241,245,239,.035)}
img{width:48px;height:auto;display:block;margin-bottom:26px}
.k{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#16d196;margin-bottom:12px}
h1{font-family:'Clash Display',system-ui,sans-serif;font-weight:500;font-size:30px;letter-spacing:-.02em;line-height:1.08;margin-bottom:10px}
p{color:rgba(241,245,239,.76);font-size:15px;line-height:1.55}
label{display:block;font-size:14px;margin:24px 0 8px;color:rgba(241,245,239,.9)}
input{width:100%;min-height:50px;padding:12px 16px;font:inherit;font-size:16px;color:#F1F5EF;background:rgba(4,6,5,.6);border:1px solid rgba(241,245,239,.22);border-radius:12px}
input:focus{outline:2px solid #4fe0bd;outline-offset:2px;border-color:transparent}
button{width:100%;min-height:50px;margin-top:14px;border:0;border-radius:999px;background:#16d196;color:#04140a;font:inherit;font-weight:600;font-size:14px;letter-spacing:.06em;text-transform:uppercase;cursor:pointer}
button:hover{filter:brightness(1.08)}
button:focus-visible{outline:2px solid #4fe0bd;outline-offset:3px}
.err{margin-top:12px;color:#ff9b8f;font-size:14px}
.foot{margin-top:24px;font-size:13px;color:rgba(241,245,239,.5)}
.foot a{color:rgba(241,245,239,.8)}
</style></head>
<body><main class="box">
<img src="/assets/logo-white.png" alt="Ummah Collective" width="48" height="45">
<div class="k">Private client room</div>
<h1>The Quran Hub</h1>
<p>Our proposal, audit and website concepts. Please enter the password we shared with you.</p>
<form method="post" action="/tqh/login/">
<label for="pw">Password</label>
<input id="pw" name="password" type="password" autocomplete="current-password" required autofocus${error ? ' aria-invalid="true" aria-describedby="err"' : ''}>
${error ? '<p class="err" id="err" role="alert">That password didn’t match. Please try again.</p>' : ''}
<button type="submit">Open</button>
</form>
<p class="foot">Need help? WhatsApp <a href="https://wa.me/601133262709">+60 11 3326 2709</a></p>
</main></body></html>`;
  return new Response(html, {
    status: 401,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'x-robots-tag': 'noindex, nofollow',
    },
  });
}

export default async function middleware(request) {
  const { pathname } = new URL(request.url);
  const path = pathname.replace(/\/+$/, '');

  if (path === '/tqh/logout') {
    return new Response(null, {
      status: 303,
      headers: {
        location: '/tqh/',
        'set-cookie': `${COOKIE}=; Path=/tqh; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
        'cache-control': 'no-store',
      },
    });
  }

  if (path === '/tqh/login') {
    if (request.method !== 'POST') return Response.redirect(new URL('/tqh/', request.url), 303);
    let password = '';
    try {
      const form = await request.formData();
      password = String(form.get('password') || '').trim().toLowerCase();
    } catch (e) { /* malformed body: treat as wrong password */ }
    if (password === PASSWORD) {
      return new Response(null, {
        status: 303,
        headers: {
          location: '/tqh/',
          'set-cookie': `${COOKIE}=${TOKEN}; Path=/tqh; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
          'cache-control': 'no-store',
        },
      });
    }
    return loginPage(true);
  }

  if (cookieValue(request, COOKIE) === TOKEN) return NEXT();
  return loginPage(false);
}
