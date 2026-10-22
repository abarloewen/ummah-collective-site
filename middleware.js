// Password gate for client concept pages under /concepts/.
// Only a salted PBKDF2 fingerprint of the password lives here; the cookie holds the
// derived key, and requests are let through when sha256(cookie) matches the fingerprint.
const SALT = "1afcfa42aeae61b062614ad474e22716";
const KEY_SHA256 = "4edf93a8030a01bdf290fb1c8a8654c26c986f3b90a62d417216cf8b1078b7f3";
const ITERATIONS = 210000;
const COOKIE = "uc_concepts";

export const config = { matcher: ["/concepts", "/concepts/:path*"] };

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const bytes = (h) => new Uint8Array(h.match(/../g).map((x) => parseInt(x, 16)));

async function deriveKey(password) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: bytes(SALT), iterations: ITERATIONS }, base, 256);
  return hex(bits);
}
async function sha256(s) {
  return hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)));
}
function readCookie(req, name) {
  const m = (req.headers.get("cookie") || "").match(new RegExp("(?:^|;\\s*)" + name + "=([0-9a-f]{64})"));
  return m ? m[1] : null;
}
function safeNext(n) {
  return typeof n === "string" && n.startsWith("/concepts/") && !n.startsWith("//") ? n : "/concepts/logsco/";
}

export default async function middleware(req) {
  const url = new URL(req.url);
  const isLogin = url.pathname === "/concepts/login" || url.pathname === "/concepts/login/";

  if (isLogin && req.method === "POST") {
    const form = await req.formData();
    const next = safeNext(form.get("next"));
    const key = await deriveKey(String(form.get("password") || ""));
    if ((await sha256(key)) === KEY_SHA256) {
      return new Response(null, {
        status: 303,
        headers: {
          Location: next,
          "Set-Cookie": `${COOKIE}=${key}; Path=/concepts; Max-Age=2592000; HttpOnly; Secure; SameSite=Lax`,
          "Cache-Control": "no-store",
        },
      });
    }
    return page(next, true);
  }

  const cookie = readCookie(req, COOKIE);
  if (cookie && (await sha256(cookie)) === KEY_SHA256) {
    return new Response(null, { headers: { "x-middleware-next": "1" } });
  }
  return page(isLogin ? "/concepts/logsco/" : url.pathname, false);
}

function page(next, failed) {
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Private preview · Ummah Collective</title>
<link rel="icon" href="/favicon.svg">
<link href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600&f[]=general-sans@400,500&display=swap" rel="stylesheet">
<style>
:root{--bg:#040605;--bone:#f1f5ef;--dim:rgba(241,245,239,.62);--line:rgba(241,245,239,.16);--acc:#19d98f}
*{box-sizing:border-box}html,body{height:100%}
body{margin:0;background:radial-gradient(1000px 600px at 80% -10%,rgba(25,217,143,.16),transparent 60%),var(--bg);color:var(--bone);font:16px/1.6 "General Sans",system-ui,sans-serif;display:grid;place-items:center;padding:24px}
.card{width:min(420px,100%);border:1px solid var(--line);border-radius:20px;padding:36px 32px;background:rgba(241,245,239,.03);backdrop-filter:blur(8px)}
img{width:72px;height:auto;display:block;margin-bottom:28px}
.k{font:500 12px/1 "IBM Plex Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--acc)}
h1{font:600 30px/1.1 "Clash Display",system-ui,sans-serif;letter-spacing:-.01em;margin:12px 0 10px}
p{margin:0 0 24px;color:var(--dim)}
label{display:block;font-size:13px;color:var(--dim);margin-bottom:8px}
input{width:100%;height:50px;border-radius:12px;border:1px solid var(--line);background:rgba(241,245,239,.05);color:var(--bone);font:inherit;padding:0 16px;outline:none}
input:focus{border-color:var(--acc)}
button{margin-top:14px;width:100%;height:50px;border:0;border-radius:999px;background:var(--acc);color:#04120b;font:600 15px "General Sans",system-ui,sans-serif;cursor:pointer}
.err{color:#ff8a7a;font-size:14px;margin:10px 0 0}
small{display:block;margin-top:22px;color:var(--dim);font-size:12.5px}
</style></head><body><form class="card" method="post" action="/concepts/login/">
<img src="/assets/logo-white.png" alt="Ummah Collective">
<span class="k">Private preview</span><h1>Design concepts</h1>
<p>These pages are shared privately with our client. Enter the password you received to continue.</p>
<label for="pw">Password</label><input id="pw" name="password" type="password" autocomplete="current-password" required autofocus>
<input type="hidden" name="next" value="${esc(next)}">
${failed ? '<p class="err" role="alert">That password didn’t match. Please try again.</p>' : ""}
<button type="submit">View concepts</button>
<small>Ummah Collective · Intelligence, with integrity.</small></form></body></html>`;
  return new Response(html, {
    status: failed ? 401 : 401,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
