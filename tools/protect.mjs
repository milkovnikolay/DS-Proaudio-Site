// Защита превью сайта паролем (только для публикации на GitHub Pages; рабочие файлы не меняются).
// Каждая HTML-страница в папке публикации шифруется (AES-256-GCM, ключ из пароля через PBKDF2-SHA256)
// и заменяется страницей входа. Без верного пароля содержимое страницы прочитать нельзя — даже в исходном коде.
// После входа ключ запоминается в браузере, и остальные страницы открываются без повторного ввода.
// Запуск: SITE_PASSWORD=... node tools/protect.mjs <папка>
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';

const dir = process.argv[2];
const pass = process.env.SITE_PASSWORD || '';
if (!dir) { console.error('Укажите папку'); process.exit(1); }
if (pass.length < 4) { console.error('Нет пароля (секрет SITE_PASSWORD) — публикация остановлена, чтобы сайт не оказался открытым'); process.exit(1); }

if (pass.length < 12) console.log('::warning::Пароль превью короче 12 символов — замените секрет SITE_PASSWORD на более длинный (план безопасности, п. 1)');

const ITER = 600000;
const salt = randomBytes(16);
const key = pbkdf2Sync(pass, salt, ITER, 32, 'sha256');
const b64 = (b) => Buffer.from(b).toString('base64');

function gate(payload) {
  return `<!doctype html>
<html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>DS PROAUDIO — вход</title>
<style>
html,body{margin:0;height:100%;background:#0A0A0B;color:#F2F2F2;font-family:"IBM Plex Sans",system-ui,-apple-system,"Segoe UI",Arial,sans-serif}
.g{min-height:100%;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box}
form{width:100%;max-width:340px;display:flex;flex-direction:column;gap:14px}
.l{font-size:22px;font-weight:300;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px}
.s{font-size:13px;color:#9A9A9E;margin:-6px 0 8px}
input{font:inherit;font-size:16px;padding:13px 14px;border-radius:10px;border:1px solid rgba(255,255,255,.18);background:#141416;color:#F2F2F2;outline:none}
input:focus{border-color:rgba(255,255,255,.5)}
button{font:inherit;font-size:14px;letter-spacing:.1em;text-transform:uppercase;padding:13px;border-radius:10px;border:0;background:#F2F2F2;color:#0A0A0B;cursor:pointer}
button:disabled{opacity:.5;cursor:default}
.e{min-height:18px;font-size:13px;color:#E0766B}
</style></head><body>
<div class="g" id="g" hidden><form id="f" autocomplete="on">
<div class="l">DS PROAUDIO</div>
<div class="s">Рабочая версия сайта. Введите пароль.</div>
<input id="p" type="password" name="password" placeholder="Пароль" autocomplete="current-password" required autofocus>
<button id="b" type="submit">Войти</button>
<div class="e" id="e"></div>
</form></div>
<script>
(function(){
var D=${JSON.stringify(payload)},K='dsp-preview-key',S=D.s;
function u8(s){var b=atob(s),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return a}
function hex(a){return Array.prototype.map.call(new Uint8Array(a),function(x){return('0'+x.toString(16)).slice(-2)}).join('')}
function unhex(h){var a=new Uint8Array(h.length/2);for(var i=0;i<a.length;i++)a[i]=parseInt(h.substr(i*2,2),16);return a}
function get(){try{return localStorage.getItem(K)}catch(e){return null}}
function put(v){try{localStorage.setItem(K,v)}catch(e){}}
function del(){try{localStorage.removeItem(K)}catch(e){}}
function open(raw){
  return crypto.subtle.importKey('raw',raw,'AES-GCM',false,['decrypt']).then(function(k){
    return crypto.subtle.decrypt({name:'AES-GCM',iv:u8(D.i)},k,u8(D.c));
  }).then(function(buf){
    var html=new TextDecoder().decode(buf);
    // страницу подменяем только после полной загрузки страницы входа, иначе браузер допишет её внутрь
    return new Promise(function(ok){
      function go(){setTimeout(function(){document.open();document.write(html);document.close();ok()},0)}
      if(document.readyState==='complete')go();else addEventListener('load',go);
    });
  });
}
function show(){document.getElementById('g').hidden=false;document.getElementById('p').focus()}
var saved=get();
if(saved&&saved.indexOf(S+':')===0){open(unhex(saved.slice(S.length+1))).catch(function(){del();show()})}else show();
document.getElementById('f').addEventListener('submit',function(ev){
  ev.preventDefault();
  var b=document.getElementById('b'),e=document.getElementById('e');b.disabled=true;e.textContent='';
  crypto.subtle.importKey('raw',new TextEncoder().encode(document.getElementById('p').value),'PBKDF2',false,['deriveBits']).then(function(pk){
    return crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:u8(D.s),iterations:D.n},pk,256);
  }).then(function(bits){
    return open(bits).then(function(){put(S+':'+hex(bits))});
  }).catch(function(){b.disabled=false;e.textContent='Неверный пароль'});
});
})();
</script></body></html>
`;
}

let n = 0;
(function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!/\.html?$/i.test(name)) continue;
    const iv = randomBytes(12);
    const c = createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([c.update(readFileSync(p)), c.final(), c.getAuthTag()]);
    writeFileSync(p, gate({ s: b64(salt), n: ITER, i: b64(iv), c: b64(enc) }));
    n++;
  }
})(dir);
writeFileSync(join(dir, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
console.log('Защищено страниц: ' + n);
