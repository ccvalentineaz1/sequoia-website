#!/usr/bin/env node
/*
 * Sequoia Assisted Living - site builder (no dependencies).
 * Reads content/*.json + templates/index.template.html and writes the finished site to dist/.
 * Netlify runs this automatically (see netlify.toml) every time content changes.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const json = (p) => JSON.parse(read(p));

// ---------- helpers ----------
const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const get = (obj, p) => p.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

// Tiny template engine: {{path}} (escaped), {{{path}}} (raw), {{#each path}}...{{/each}}
function render(tpl, ctx) {
  tpl = tpl.replace(/\{\{#each ([\w.]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_, p, inner) => {
    const list = get(ctx, p);
    if (!Array.isArray(list)) throw new Error(`Template loop "${p}" is not a list`);
    return list.map((item) => render(inner, { ...ctx, ...item })).join('');
  });
  tpl = tpl.replace(/\{\{\{([\w.]+)\}\}\}/g, (_, p) => String(get(ctx, p) ?? ''));
  return tpl.replace(/\{\{([\w.]+)\}\}/g, (_, p) => {
    const v = get(ctx, p);
    if (v === undefined) throw new Error(`Template placeholder "${p}" has no value`);
    return esc(v);
  });
}

// ---------- load content ----------
const content = {};
for (const f of fs.readdirSync(path.join(ROOT, 'content'))) {
  if (f.endsWith('.json')) content[f.replace(/\.json$/, '')] = json(`content/${f}`);
}
content.developer = json('developer/settings.json');
const icons = json('developer/icons.json');

// ---------- derived values (links are generated so editors can't break them) ----------
const digits = String(content.site.phone).replace(/\D/g, '');
content.site.phone_tel = digits.length === 10 ? `+1${digits}` : digits.length === 11 && digits[0] === '1' ? `+${digits}` : `+${digits}`;
content.site.maps_url =
  'https://maps.google.com/?q=' +
  String(content.site.address).trim().split(/\s+/).map((w) => encodeURIComponent(w).replace(/%2C/g, ',')).join('+');

content.services.items = content.services.items.map((s) => ({ ...s, icon_svg: icons[s.icon] || icons.person }));
content.why.items = content.why.items.map((w, i) => ({ ...w, number: String(i + 1).padStart(2, '0') }));
content.footer_services = content.services.items.slice(0, 4).map((s) => ({ label: (s.short_name || '').trim() || s.title }));
content.year = String(new Date().getFullYear());

// ---------- write site ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), render(read('templates/index.template.html'), content));

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, e.name), d = path.join(dest, e.name);
    e.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
};
copyDir(path.join(ROOT, 'images'), path.join(DIST, 'images'));
copyDir(path.join(ROOT, 'admin'), path.join(DIST, 'admin'));

// ---------- admin config: fill in the GitHub repo + site URL automatically ----------
function detectRepo() {
  if (process.env.CMS_REPO) return process.env.CMS_REPO.trim();
  const url = process.env.REPOSITORY_URL || '';
  const m = url.match(/github\.com[:/]+([^/\s]+\/[^/\s]+?)(?:\.git)?\/?$/i);
  return m ? m[1] : null;
}
const cfgPath = path.join(DIST, 'admin', 'config.yml');
let cfg = fs.readFileSync(cfgPath, 'utf8');
const repo = detectRepo();
if (repo) cfg = cfg.replace(/__REPO__/g, repo);
else console.warn('WARNING: GitHub repo not detected; set the CMS_REPO environment variable (e.g. myname/sequoia-site).');
const siteUrl = (process.env.URL || '').replace(/\/$/, '');
cfg = cfg.replace(/__SITE_URL__/g, siteUrl || 'http://localhost:8080');
fs.writeFileSync(cfgPath, cfg);

console.log(`Built ${path.relative(ROOT, DIST)}/ (repo: ${repo || 'NOT SET'})`);
