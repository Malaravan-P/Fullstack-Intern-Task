/**
 * Seed the templates table with 3 templates in each of 6 categories (18 total).
 * Each template ships a self-contained HTML document (preview_html) that the
 * client renders in a sandboxed iframe to show "how the template will look".
 * Run: npm run seed
 *
 * Previews are built from one reusable layout per category, with three
 * palette/copy variants each.
 *
 * NOTE: re-seeding deletes all templates (favorites/ratings cascade).
 */

/* Shared reset + small helper classes used by every template preview. */
const baseCss = `
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1c1917;background:#fff;line-height:1.5;-webkit-font-smoothing:antialiased}
img{display:block;max-width:100%}
a{color:inherit;text-decoration:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
.btn{display:inline-block;border-radius:999px;padding:12px 22px;font-weight:600;font-size:14px;cursor:pointer}
`;

/* Wrap a body in a minimal HTML shell with the given extra styles.
 *
 * Theme colors (accent = primary, accent2 = secondary, plus their soft/shadow
 * variants) are exposed as CSS custom properties and every literal occurrence
 * in the template CSS is rewritten to `var(--x)`. This lets the client-side
 * Customization Playground re-theme a live preview at runtime by overriding
 * :root without touching the stored markup. */
function shell(title, css, body, v = {}) {
  const themeKeys = ["accent", "accent2", "accentSoft", "accentShadow"];
  const decls = [];
  const replacements = [];
  for (const key of themeKeys) {
    const val = v[key];
    if (typeof val === "string" && val && !val.startsWith("var(")) {
      decls.push(`--${key}:${val}`);
      replacements.push([val, `var(--${key})`]);
    }
  }

  let themed = css;
  for (const [val, ref] of replacements) {
    themed = themed.split(val).join(ref);
  }

  const root = decls.length ? `:root{${decls.join(";")}}` : "";
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${baseCss}${root}${themed}</style>
</head>
<body>
${body}
</body>
</html>`;
}

/* ---------------------------------------------------------------- Landing */

function landingPage(v) {
  const css = `
  body{background:${v.bg}}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
  .brand{display:flex;align-items:center;gap:10px;font-weight:800;font-size:18px;color:${v.ink}}
  .brand i{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,${v.accent},${v.accent2});display:inline-block}
  .nav ul{display:flex;gap:26px;list-style:none;font-size:14px;color:${v.muted}}
  .nav .btn{background:${v.accent};color:#fff}
  .hero{text-align:center;padding:64px 0 40px}
  .pill{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${v.accent};background:${v.accentSoft};border-radius:999px;padding:7px 14px}
  h1{font-size:52px;line-height:1.05;letter-spacing:-.03em;margin:20px 0 0;font-weight:800;color:${v.ink}}
  h1 span{background:linear-gradient(90deg,${v.accent},${v.accent2});-webkit-background-clip:text;background-clip:text;color:transparent}
  .lead{max-width:560px;margin:18px auto 0;color:${v.muted};font-size:18px}
  .cta{margin-top:28px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
  .cta .primary{background:${v.accent};color:#fff;box-shadow:0 12px 24px ${v.accentShadow}}
  .cta .ghost{border:1px solid ${v.line};color:${v.muted}}
  .shots{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-top:48px}
  .shots img{height:150px;width:100%;object-fit:cover;border-radius:14px;box-shadow:0 10px 30px rgba(15,23,42,.12)}
  .pricing{padding:56px 0;background:${v.panel}}
  .pricing h2{text-align:center;font-size:32px;font-weight:800;color:${v.ink}}
  .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:36px}
  .card{border:1px solid ${v.line};border-radius:18px;padding:26px;background:${v.cardBg}}
  .card.featured{background:linear-gradient(160deg,${v.accent},${v.accent2});color:#fff;border:0;transform:translateY(-8px)}
  .card h3{font-size:16px;font-weight:700}
  .price{font-size:38px;font-weight:800;margin:10px 0 4px}
  .card ul{list-style:none;margin:16px 0 22px;font-size:14px;color:${v.muted};display:grid;gap:9px}
  .card.featured ul{color:rgba(255,255,255,.85)}
  .card .btn{width:100%;text-align:center;background:${v.ink};color:#fff}
  .card.featured .btn{background:#fff;color:${v.accent}}
  .foot{padding:30px 0;text-align:center;color:${v.muted};font-size:13px;border-top:1px solid ${v.line};background:${v.panel}}
  `;
  const body = `<header class="wrap"><nav class="nav">
    <span class="brand"><i></i> ${v.brand}</span>
    <ul>${v.links.map((l) => `<li>${l}</li>`).join("")}</ul>
    <span class="btn">${v.ctaPrimary}</span>
  </nav></header>
  <section class="hero wrap">
    <span class="pill">${v.pill}</span>
    <h1>${v.title} <span>${v.titleHi}</span></h1>
    <p class="lead">${v.lead}</p>
    <div class="cta"><span class="btn primary">${v.ctaPrimary}</span><span class="btn ghost">${v.ctaGhost}</span></div>
    <div class="shots">${v.shots.map((s) => `<img src="${s}" alt="preview" />`).join("")}</div>
  </section>
  <section class="pricing"><div class="wrap">
    <h2>${v.pricingTitle}</h2>
    <div class="cards">${v.plans
      .map(
        (p) => `<div class="card${p.featured ? " featured" : ""}"><h3>${p.name}</h3><div class="price">${p.price}</div><ul>${p.items
          .map((it) => `<li>${it}</li>`)
          .join("")}</ul><span class="btn">Choose plan</span></div>`
      )
      .join("")}</div>
  </div></section>
  <footer class="foot">${v.footer}</footer>`;
  return shell(v.name, css, body, v);
}

/* -------------------------------------------------------------- Dashboard */

function dashboardPage(v) {
  const css = `
  body{background:${v.bg};color:${v.text}}
  .app{display:flex;min-height:100vh}
  .side{width:220px;background:${v.side};border-right:1px solid ${v.line};padding:20px 16px;flex-shrink:0}
  .logo{display:flex;align-items:center;gap:10px;font-weight:800;font-size:17px;color:${v.head};margin-bottom:26px}
  .logo i{width:30px;height:30px;border-radius:9px;background:linear-gradient(135deg,${v.accent},${v.accent2});display:inline-block}
  .menu{list-style:none;display:grid;gap:6px;font-size:14px;color:${v.muted}}
  .menu li{padding:10px 12px;border-radius:10px}
  .menu li.on{background:${v.onBg};color:${v.onText};font-weight:600}
  .main{flex:1;padding:24px 28px;min-width:0}
  .top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}
  .top h1{font-size:22px;font-weight:800;color:${v.head}}
  .search{background:${v.inputBg};border-radius:10px;padding:9px 14px;font-size:13px;color:${v.muted};width:240px}
  .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
  .stat{background:${v.card};border:1px solid ${v.line};border-radius:16px;padding:18px}
  .stat p{font-size:12px;color:${v.muted};text-transform:uppercase;letter-spacing:.05em}
  .stat b{font-size:26px;font-weight:800;color:${v.head};display:block;margin-top:8px}
  .stat span{font-size:12px;font-weight:700}
  .up{color:${v.up}}.down{color:${v.down}}
  .panels{display:grid;grid-template-columns:1.6fr 1fr;gap:16px;margin-top:16px}
  .panel{background:${v.card};border:1px solid ${v.line};border-radius:16px;padding:20px}
  .panel h3{font-size:14px;color:${v.panelHead};margin-bottom:18px}
  .bars{display:flex;align-items:flex-end;gap:12px;height:170px}
  .bars div{flex:1;border-radius:6px 6px 0 0;background:linear-gradient(180deg,${v.accent},${v.accent2})}
  .rows{display:grid;gap:12px;font-size:13px}
  .row{display:flex;justify-content:space-between;color:${v.muted}}
  .row b{color:${v.head}}
  `;
  const body = `<div class="app">
    <aside class="side">
      <div class="logo"><i></i> ${v.brand}</div>
      <ul class="menu">${v.menu
        .map((m, i) => `<li class="${i === 0 ? "on" : ""}">${m}</li>`)
        .join("")}</ul>
    </aside>
    <main class="main">
      <div class="top"><h1>${v.title}</h1><div class="search">Search…</div></div>
      <div class="stats">${v.stats
        .map(
          (s) =>
            `<div class="stat"><p>${s.label}</p><b>${s.value}</b><span class="${s.dir}">${s.delta}</span></div>`
        )
        .join("")}</div>
      <div class="panels">
        <div class="panel"><h3>${v.chartTitle}</h3><div class="bars">${v.bars
          .map((h) => `<div style="height:${h}%"></div>`)
          .join("")}</div></div>
        <div class="panel"><h3>${v.listTitle}</h3><div class="rows">${v.rows
          .map((r) => `<div class="row"><span>${r.label}</span><b>${r.value}</b></div>`)
          .join("")}</div></div>
      </div>
    </main>
  </div>`;
  return shell(v.name, css, body, v);
}

/* -------------------------------------------------------------- Portfolio */

function portfolioPage(v) {
  const css = `
  body{background:${v.bg};color:${v.ink};font-family:${v.font}}
  .nav{display:flex;justify-content:space-between;align-items:center;padding:26px 0;font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:${v.muted}}
  .nav b{color:${v.ink}}
  .hero{text-align:center;padding:56px 0 30px}
  .hero .hi{font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:${v.faint}}
  .hero h1{font-size:58px;line-height:1.08;font-weight:${v.weight};margin:18px 0 0;letter-spacing:-.01em}
  .hero p{max-width:520px;margin:20px auto 0;color:${v.muted};font-size:17px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;padding:44px 0 60px}
  .work{position:relative;overflow:hidden;border-radius:${v.radius}}
  .work img{height:240px;width:100%;object-fit:cover;transition:transform .6s ease}
  .work:hover img{transform:scale(1.04)}
  .work figcaption{padding:14px 2px}
  .work figcaption small{display:block;font-family:-apple-system,'Segoe UI',sans-serif;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${v.faint};margin-bottom:6px}
  .work figcaption span{font-size:19px}
  .foot{text-align:center;padding:30px 0;border-top:1px solid ${v.line};font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;color:${v.faint}}
  `;
  const body = `<div class="wrap">
    <nav class="nav"><span>${v.brand}</span><span style="display:flex;gap:22px"><b>Work</b><span>About</span><span>Contact</span></span></nav>
    <section class="hero">
      <div class="hi">${v.role}</div>
      <h1>${v.title}</h1>
      <p>${v.lead}</p>
    </section>
    <div class="grid">${v.works
      .map(
        (w) => `<figure class="work">
        <img src="${w.img}" alt="Case study" />
        <figcaption><small>${w.meta}</small><span>${w.title}</span></figcaption>
      </figure>`
      )
      .join("")}</div>
    <div class="foot">${v.footer}</div>
  </div>`;
  return shell(v.brand, css, body, v);
}

/* ------------------------------------------------------------ E-commerce */

function storePage(v) {
  const css = `
  body{background:${v.bg};color:${v.ink}}
  .bar{background:${v.bar};color:${v.barText};text-align:center;font-size:12px;letter-spacing:.04em;padding:9px 0}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
  .brand{font-weight:800;font-size:20px;letter-spacing:${v.tracking};color:${v.ink}}
  .nav ul{display:flex;gap:24px;list-style:none;font-size:14px;color:${v.muted}}
  .cart{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600;color:${v.ink}}
  .cart i{width:22px;height:22px;border-radius:6px;background:${v.bar};display:inline-block}
  .hero{display:grid;grid-template-columns:1fr 1fr;gap:0;border-radius:20px;overflow:hidden;background:${v.heroBg};margin:8px 0 40px}
  .hero img{height:280px;width:100%;object-fit:cover}
  .hero .copy{padding:44px 40px;display:flex;flex-direction:column;justify-content:center}
  .hero .copy small{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:${v.muted};font-weight:700}
  .hero .copy h1{font-size:38px;line-height:1.1;font-weight:800;margin:12px 0;color:${v.ink};letter-spacing:-.02em}
  .hero .copy span{color:${v.muted};margin-bottom:20px}
  .hero .btn{background:${v.accent};color:${v.accentText};width:max-content}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;padding-bottom:50px}
  .product .ph{position:relative;border-radius:14px;overflow:hidden;background:${v.tileBg}}
  .product img{height:170px;width:100%;object-fit:cover}
  .tag{position:absolute;top:10px;left:10px;background:${v.accent};color:${v.accentText};font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;padding:4px 8px;border-radius:999px}
  .product h3{font-size:14px;font-weight:600;margin-top:10px;color:${v.ink}}
  .product p{font-size:13px;color:${v.muted};margin-top:2px}
  .price{font-weight:700;color:${v.ink};margin-top:2px}
  .foot{background:${v.footBg};border-top:1px solid ${v.line};padding:22px 0;text-align:center;color:${v.faint};font-size:12px}
  `;
  const body = `<div class="bar">${v.barTextMsg}</div>
  <header class="wrap"><nav class="nav">
    <span class="brand">${v.brand}</span>
    <ul>${v.links.map((l) => `<li>${l}</li>`).join("")}</ul>
    <span class="cart"><i></i> Cart (${v.cartCount})</span>
  </nav></header>
  <div class="wrap">
    <section class="hero">
      <img src="${v.heroImg}" alt="Collection" />
      <div class="copy">
        <small>${v.collection}</small>
        <h1>${v.headline}</h1>
        <span>${v.sub}</span>
        <span class="btn">Shop the collection</span>
      </div>
    </section>
    <section class="grid">${v.products
      .map(
        (p) => `<div class="product"><div class="ph">${
          p.tag ? `<span class="tag">${p.tag}</span>` : ""
        }<img src="${p.img}" alt="${p.name}"/></div><h3>${p.name}</h3><p>${p.desc}</p><div class="price">${p.price}</div></div>`
      )
      .join("")}</section>
  </div>
  <div class="foot">${v.footer}</div>`;
  return shell(v.name, css, body, v);
}

/* ------------------------------------------------------------------ Blog */

function blogPage(v) {
  const css = `
  body{background:${v.bg};color:${v.ink}}
  .head{border-bottom:1px solid ${v.line}}
  .nav{display:flex;align-items:center;justify-content:space-between;padding:22px 0}
  .brand{font-family:${v.brandFont};font-size:24px;font-weight:700;letter-spacing:-.01em}
  .nav ul{display:flex;gap:24px;list-style:none;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:${v.muted}}
  .intro{text-align:center;padding:48px 0 22px;border-bottom:1px solid ${v.line}}
  .intro h1{font-family:${v.titleFont};font-size:40px;font-weight:700;letter-spacing:-.01em}
  .intro p{color:${v.muted};margin-top:10px;font-size:15px}
  article{display:grid;grid-template-columns:1.1fr 1fr;gap:34px;align-items:center;padding:40px 0;border-bottom:1px solid ${v.line}}
  article img{height:260px;width:100%;object-fit:cover;border-radius:10px}
  .meta{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${v.faint};font-weight:600}
  article h2{font-family:${v.titleFont};font-size:30px;line-height:1.2;font-weight:700;margin:12px 0}
  article p{color:${v.muted};font-size:16px;line-height:1.7}
  .byline{display:flex;align-items:center;gap:10px;margin-top:18px;font-size:13px;color:${v.muted}}
  .byline b{color:${v.ink}}
  .byline i{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,${v.accent},${v.accent2});display:inline-block}
  .more{display:grid;grid-template-columns:1fr 1fr;gap:26px;padding:40px 0 56px}
  .more .item .meta{margin-bottom:8px}
  .more h3{font-family:${v.titleFont};font-size:20px;font-weight:700;line-height:1.3}
  .more .item img{height:150px;width:100%;object-fit:cover;border-radius:10px;margin-bottom:14px}
  .foot{border-top:1px solid ${v.line};padding:24px 0;text-align:center;color:${v.faint};font-size:12px}
  `;
  const body = `<header class="head"><div class="wrap"><nav class="nav">
    <span class="brand">${v.brand}</span>
    <ul>${v.links.map((l) => `<li>${l}</li>`).join("")}</ul>
  </nav></div></header>
  <div class="wrap">
    <div class="intro">
      <h1>${v.introTitle}</h1>
      <p>${v.introSub}</p>
    </div>
    <article>
      <img src="${v.featured.img}" alt="Featured" />
      <div>
        <div class="meta">${v.featured.meta}</div>
        <h2>${v.featured.title}</h2>
        <p>${v.featured.excerpt}</p>
        <div class="byline"><i></i> By <b>${v.featured.author}</b> · ${v.featured.read}</div>
      </div>
    </article>
    <div class="more">${v.posts
      .map(
        (p) =>
          `<div class="item"><img src="${p.img}" alt="Post"/><div class="meta">${p.meta}</div><h3>${p.title}</h3></div>`
      )
      .join("")}</div>
  </div>
  <div class="foot">${v.footer}</div>`;
  return shell(v.name, css, body, v);
}

/* -------------------------------------------------------------- Business */

function businessPage(v) {
  const css = `
  body{background:${v.bg};color:${v.ink};font-family:${v.font}}
  .top{position:relative}
  .top img{height:300px;width:100%;object-fit:cover;opacity:${v.imgOpacity}}
  .top .overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.2),${v.overlay})}
  .top .content{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 20px}
  .top small{font-family:-apple-system,'Segoe UI',sans-serif;letter-spacing:.32em;text-transform:uppercase;font-size:11px;color:${v.accent}}
  .top h1{font-size:56px;font-weight:${v.weight};letter-spacing:.04em;margin:16px 0 8px;color:${v.heroText}}
  .top p{color:${v.heroMuted};font-size:15px}
  .menu{max-width:720px;margin:0 auto;padding:56px 24px 20px}
  .menu h2{text-align:center;font-size:14px;letter-spacing:.28em;text-transform:uppercase;color:${v.accent};font-family:-apple-system,'Segoe UI',sans-serif;margin-bottom:30px}
  .item{display:flex;align-items:baseline;gap:14px;padding:16px 0;border-bottom:1px solid ${v.line}}
  .item .name{font-size:20px;color:${v.ink}}
  .item .desc{font-size:13px;color:${v.muted};font-family:-apple-system,'Segoe UI',sans-serif;margin-top:4px}
  .item .dots{flex:1;border-bottom:1px dotted ${v.dot};margin:0 4px}
  .item .price{font-size:18px;color:${v.accent};white-space:nowrap}
  .res{max-width:520px;margin:20px auto 0;background:${v.panel};border:1px solid ${v.panelLine};border-radius:14px;padding:28px;text-align:center}
  .res h3{font-size:24px;font-weight:${v.weight};margin-bottom:8px;color:${v.ink}}
  .res p{font-family:-apple-system,'Segoe UI',sans-serif;font-size:13px;color:${v.muted};margin-bottom:18px}
  .res .btn{background:${v.accent};color:${v.accentText};font-family:-apple-system,'Segoe UI',sans-serif}
  .foot{text-align:center;padding:36px 0;color:${v.faint};font-size:12px;font-family:-apple-system,'Segoe UI',sans-serif}
  `;
  const body = `<div class="top">
    <img src="${v.heroImg}" alt="${v.name}" />
    <div class="overlay"></div>
    <div class="content">
      <small>${v.kicker}</small>
      <h1>${v.brand}</h1>
      <p>${v.tagline}</p>
    </div>
  </div>
  <div class="menu">
    <h2>${v.listTitle}</h2>
    ${v.items
      .map(
        (it) =>
          `<div class="item"><div><div class="name">${it.name}</div><div class="desc">${it.desc}</div></div><span class="dots"></span><span class="price">${it.price}</span></div>`
      )
      .join("")}
    <div class="res">
      <h3>${v.ctaTitle}</h3>
      <p>${v.ctaSub}</p>
      <span class="btn">${v.ctaBtn}</span>
    </div>
  </div>
  <div class="foot">${v.footer}</div>`;
  return shell(v.name, css, body, v);
}

/* ============================================================ Definitions */

const thumb = (id) => `https://images.unsplash.com/photo-${id}?w=800&q=80`;

const definitions = [
  /* ---------------------------- Landing Page --------------------------- */
  {
    name: "SaaS Landing Pro",
    description:
      "A conversion-focused landing page with hero, pricing, testimonials and FAQ sections.",
    thumbnail_url: thumb("1460925895917-afdab827c52f"),
    category: "Landing Page",
    preview_html: landingPage({
      name: "SaaS Landing Pro",
      brand: "Nebula",
      links: ["Product", "Pricing", "Docs", "Blog"],
      pill: "New · v2.0 is here",
      title: "Ship your SaaS",
      titleHi: "10x faster",
      lead: "The all-in-one platform to launch, bill, and scale your product — without the boilerplate.",
      ctaPrimary: "Get started",
      ctaGhost: "Book a demo",
      shots: [thumb("1551434678-e076c223a692"), thumb("1553877522-43269d4ea984"), thumb("1531482615713-2afd69097998")],
      pricingTitle: "Simple, transparent pricing",
      plans: [
        { name: "Starter", price: "$0", items: ["1 project", "Community support", "1 GB storage"] },
        { name: "Pro", price: "$29", featured: true, items: ["Unlimited projects", "Priority support", "100 GB storage"] },
        { name: "Team", price: "$79", items: ["Everything in Pro", "SSO &amp; roles", "Audit logs"] },
      ],
      footer: "© 2026 Nebula Inc. · Privacy · Terms · Status",
      bg: "#fafaff",
      ink: "#1e1b4b",
      accent: "#4f46e5",
      accent2: "#8b5cf6",
      accentSoft: "#eef2ff",
      accentShadow: "rgba(79,70,229,.25)",
      muted: "#57534e",
      line: "#e7e5e4",
      panel: "#fff",
      cardBg: "#fafafa",
    }),
  },
  {
    name: "Startup Launchpad",
    description:
      "A fresh startup landing page with feature grid, metrics band and a bold call to action.",
    thumbnail_url: thumb("1551434678-e076c223a692"),
    category: "Landing Page",
    preview_html: landingPage({
      name: "Startup Launchpad",
      brand: "Launchpad",
      links: ["Features", "Pricing", "Customers", "Login"],
      pill: "Backed by operators",
      title: "Launch your idea",
      titleHi: "this week",
      lead: "Everything early teams need to go from prototype to first paying customers.",
      ctaPrimary: "Start free",
      ctaGhost: "See it in action",
      shots: [thumb("1556761175-b413da4baf72"), thumb("1522071820081-009f0129c71c"), thumb("1552664730-d307ca884978")],
      pricingTitle: "Plans that grow with you",
      plans: [
        { name: "Free", price: "$0", items: ["1 product", "100 users", "Email support"] },
        { name: "Growth", price: "$39", featured: true, items: ["Unlimited products", "5k users", "Chat support"] },
        { name: "Scale", price: "$99", items: ["Everything in Growth", "SLA", "Dedicated CSM"] },
      ],
      footer: "© 2026 Launchpad · Terms · Privacy",
      bg: "#f3fdf9",
      ink: "#064e3b",
      accent: "#059669",
      accent2: "#0d9488",
      accentSoft: "#d1fae5",
      accentShadow: "rgba(5,150,105,.25)",
      muted: "#4b5563",
      line: "#d1fae5",
      panel: "#ffffff",
      cardBg: "#f0fdf4",
    }),
  },
  {
    name: "Agency Spotlight",
    description:
      "A bold agency landing page with services, case-study strip and package pricing.",
    thumbnail_url: thumb("1531482615713-2afd69097998"),
    category: "Landing Page",
    preview_html: landingPage({
      name: "Agency Spotlight",
      brand: "Spotlight",
      links: ["Work", "Services", "Team", "Contact"],
      pill: "Design partner",
      title: "We build brands",
      titleHi: "that stand out",
      lead: "A senior studio for ambitious companies — strategy, design, and build under one roof.",
      ctaPrimary: "Book a call",
      ctaGhost: "View our work",
      shots: [thumb("1552664730-d307ca884978"), thumb("1600880292203-757bb62b4baf"), thumb("1542744173-8e7e53415bb0")],
      pricingTitle: "Engagements &amp; packages",
      plans: [
        { name: "Sprint", price: "$6k", items: ["1 week", "Design only", "Loom handoff"] },
        { name: "Studio", price: "$18k", featured: true, items: ["4 weeks", "Design + build", "Weekly demos"] },
        { name: "Retainer", price: "$9k", items: ["Ongoing", "Pod of 3", "Priority queue"] },
      ],
      footer: "© 2026 Spotlight Studio · hello@spotlight.co",
      bg: "#fff7f5",
      ink: "#7c2d12",
      accent: "#e11d48",
      accent2: "#f97316",
      accentSoft: "#ffe4e6",
      accentShadow: "rgba(225,29,72,.25)",
      muted: "#57534e",
      line: "#fee2e2",
      panel: "#ffffff",
      cardBg: "#fff1f2",
    }),
  },

  /* ------------------------------ Dashboard ---------------------------- */
  {
    name: "Dashboard Analytics",
    description:
      "Modern admin dashboard template with charts, tables, and dark mode support.",
    thumbnail_url: thumb("1551288049-bebda4e38f71"),
    category: "Dashboard",
    preview_html: dashboardPage({
      name: "Dashboard Analytics",
      brand: "Metrics",
      menu: ["Overview", "Analytics", "Customers", "Billing", "Settings"],
      title: "Overview",
      chartTitle: "Monthly recurring revenue",
      listTitle: "Top plans",
      stats: [
        { label: "Revenue", value: "$84.2k", delta: "▲ 12.4%", dir: "up" },
        { label: "Users", value: "12,480", delta: "▲ 8.1%", dir: "up" },
        { label: "Churn", value: "1.9%", delta: "▼ 0.3%", dir: "down" },
        { label: "Sessions", value: "98.3k", delta: "▲ 5.6%", dir: "up" },
      ],
      bars: [45, 62, 50, 78, 66, 92, 70, 85],
      rows: [
        { label: "Enterprise", value: "$41.2k" },
        { label: "Pro", value: "$28.7k" },
        { label: "Starter", value: "$9.4k" },
        { label: "Free", value: "$4.9k" },
      ],
      bg: "#0b1120",
      text: "#e2e8f0",
      side: "#0f172a",
      line: "rgba(255,255,255,.06)",
      head: "#ffffff",
      muted: "#94a3b8",
      onBg: "#1e293b",
      onText: "#ffffff",
      inputBg: "#1e293b",
      card: "#111c34",
      panelHead: "#cbd5e1",
      accent: "#6366f1",
      accent2: "#22d3ee",
      up: "#34d399",
      down: "#f87171",
    }),
  },
  {
    name: "Crypto Tracker",
    description:
      "A dark trading dashboard with portfolio balance, candlestick panel and watchlist.",
    thumbnail_url: thumb("1556155092-490a1ba16284"),
    category: "Dashboard",
    preview_html: dashboardPage({
      name: "Crypto Tracker",
      brand: "Ledger",
      menu: ["Portfolio", "Markets", "Trades", "Alerts", "Settings"],
      title: "Portfolio",
      chartTitle: "ETH / USD · 24h",
      listTitle: "Watchlist",
      stats: [
        { label: "Balance", value: "$128.4k", delta: "▲ 3.2%", dir: "up" },
        { label: "24h P/L", value: "+$2,140", delta: "▲ 1.7%", dir: "up" },
        { label: "BTC", value: "$67,320", delta: "▲ 2.4%", dir: "up" },
        { label: "SOL", value: "$148.10", delta: "▼ 4.1%", dir: "down" },
      ],
      bars: [30, 48, 40, 65, 82, 58, 90, 74],
      rows: [
        { label: "Bitcoin", value: "$67,320" },
        { label: "Ethereum", value: "$3,480" },
        { label: "Solana", value: "$148" },
        { label: "Chainlink", value: "$17.2" },
      ],
      bg: "#06120f",
      text: "#d1fae5",
      side: "#0a1a16",
      line: "rgba(255,255,255,.07)",
      head: "#ffffff",
      muted: "#6ee7b7",
      onBg: "#123b30",
      onText: "#ffffff",
      inputBg: "#0f2a23",
      card: "#0b1f1a",
      panelHead: "#a7f3d0",
      accent: "#10b981",
      accent2: "#22d3ee",
      up: "#34d399",
      down: "#f87171",
    }),
  },
  {
    name: "CRM Console",
    description:
      "A light CRM dashboard with pipeline stages, contact table and activity feed.",
    thumbnail_url: thumb("1554224155-6726b3ff858f"),
    category: "Dashboard",
    preview_html: dashboardPage({
      name: "CRM Console",
      brand: "Pulse CRM",
      menu: ["Pipeline", "Contacts", "Deals", "Reports", "Settings"],
      title: "Pipeline",
      chartTitle: "Deals closed",
      listTitle: "Activity",
      stats: [
        { label: "Open deals", value: "184", delta: "▲ 9.2%", dir: "up" },
        { label: "Won", value: "42", delta: "▲ 4.8%", dir: "up" },
        { label: "Value", value: "$612k", delta: "▲ 6.1%", dir: "up" },
        { label: "Lost", value: "7", delta: "▼ 2.0%", dir: "down" },
      ],
      bars: [55, 40, 70, 52, 88, 61, 75, 95],
      rows: [
        { label: "Acme Corp", value: "$120k" },
        { label: "Globex", value: "$86k" },
        { label: "Initech", value: "$54k" },
        { label: "Umbrella", value: "$31k" },
      ],
      bg: "#f8fafc",
      text: "#0f172a",
      side: "#ffffff",
      line: "#e2e8f0",
      head: "#0f172a",
      muted: "#64748b",
      onBg: "#eef2ff",
      onText: "#4338ca",
      inputBg: "#f1f5f9",
      card: "#ffffff",
      panelHead: "#334155",
      accent: "#4f46e5",
      accent2: "#0ea5e9",
      up: "#059669",
      down: "#dc2626",
    }),
  },

  /* ------------------------------ Portfolio ---------------------------- */
  {
    name: "Elegant Portfolio",
    description:
      "Minimal portfolio template for designers and developers to showcase their work.",
    thumbnail_url: thumb("1486312338219-ce68d2c6f44d"),
    category: "Portfolio",
    preview_html: portfolioPage({
      brand: "Elena Marsh",
      role: "Product Designer &amp; Art Director",
      title: "Design that feels<br/>inevitable.",
      lead: "I craft calm, considered interfaces for ambitious brands — from first sketch to shipped pixels.",
      font: "Georgia,'Times New Roman',serif",
      weight: 400,
      radius: "4px",
      works: [
        { img: thumb("1486312338219-ce68d2c6f44d"), meta: "Fintech · 2025", title: "Aurora Banking App" },
        { img: thumb("1522542550221-31fd19575a2d"), meta: "Identity · 2024", title: "Northwind Rebrand" },
        { img: thumb("1467232004584-a241de8bcf5d"), meta: "SaaS · 2024", title: "Loop Analytics" },
        { img: thumb("1507003211169-0a1dd7228f2d"), meta: "Editorial · 2023", title: "Field Notes Journal" },
      ],
      footer: "Available for select projects · hello@elenamarsh.design",
      bg: "#fcfbf9",
      ink: "#292524",
      muted: "#57534e",
      faint: "#a8a29e",
      line: "#e7e5e4",
    }),
  },
  {
    name: "Studio Showcase",
    description:
      "A bold, high-contrast studio portfolio with oversized type and layered case studies.",
    thumbnail_url: thumb("1522542550221-31fd19575a2d"),
    category: "Portfolio",
    preview_html: portfolioPage({
      brand: "OFFGRID",
      role: "Digital Studio · Berlin",
      title: "Bold work for<br/>brave brands.",
      lead: "We design identities and digital products that refuse to blend in.",
      font: "'Helvetica Neue',Arial,sans-serif",
      weight: 800,
      radius: "14px",
      works: [
        { img: thumb("1550009158-9ebf69173e03"), meta: "Brand · 2025", title: "Ferox Athletics" },
        { img: thumb("1600880292203-757bb62b4baf"), meta: "Web · 2025", title: "Nova Capital" },
        { img: thumb("1526494878030-1e6b4d9c6d3c"), meta: "App · 2024", title: "Orbit Wallet" },
        { img: thumb("1517245386807-bb43f82c33c4"), meta: "Campaign · 2024", title: "Neon Nights" },
      ],
      footer: "OFFGRID STUDIO · Berlin &amp; Lisbon",
      bg: "#0a0a0a",
      ink: "#fafafa",
      muted: "#a1a1aa",
      faint: "#71717a",
      line: "#27272a",
    }),
  },
  {
    name: "Lumen Photography",
    description:
      "A clean photography portfolio with a masonry gallery and quiet typography.",
    thumbnail_url: thumb("1507003211169-0a1dd7228f2d"),
    category: "Portfolio",
    preview_html: portfolioPage({
      brand: "Lumen",
      role: "Weddings · Portraits · Editorial",
      title: "Light, held still.",
      lead: "Natural-light photography for people and the places they love.",
      font: "-apple-system,'Segoe UI',sans-serif",
      weight: 300,
      radius: "10px",
      works: [
        { img: thumb("1519741497674-611481863552"), meta: "Wedding · Amalfi", title: "The Rossi Wedding" },
        { img: thumb("1524253482453-3fed8d2fe12b"), meta: "Portrait · Studio", title: "Golden Hour" },
        { img: thumb("1500530855697-b586d89ba3ee"), meta: "Editorial · Issue 04", title: "Coastal Light" },
        { img: thumb("1508672019048-805c876b67e2"), meta: "Travel · Iceland", title: "Northern Quiet" },
      ],
      footer: "Booking 2026 · hello@lumen.photo",
      bg: "#ffffff",
      ink: "#1c1917",
      muted: "#57534e",
      faint: "#a8a29e",
      line: "#f0efee",
    }),
  },

  /* ----------------------------- E-commerce ---------------------------- */
  {
    name: "Storefront Commerce",
    description:
      "Clean e-commerce template with product grid, cart drawer, and checkout flow.",
    thumbnail_url: thumb("1472851294608-062f824d29cc"),
    category: "E-commerce",
    preview_html: storePage({
      name: "Storefront Commerce",
      bar: "#111827",
      barText: "#f9fafb",
      barTextMsg: "Free shipping on orders over $75 · 30-day returns",
      brand: "ATELIER",
      tracking: "-.02em",
      links: ["New", "Women", "Men", "Accessories"],
      cartCount: 2,
      collection: "Autumn Collection",
      headline: "Essentials for the modern wardrobe",
      sub: "Timeless pieces, responsibly made.",
      heroImg: thumb("1472851294608-062f824d29cc"),
      heroBg: "#f3f4f6",
      accent: "#111827",
      accentText: "#ffffff",
      tileBg: "#f9fafb",
      products: [
        { img: thumb("1521572163474-6864f9cf17ab"), tag: "New", name: "Organic Cotton Tee", desc: "Soft everyday essential", price: "$38" },
        { img: thumb("1556905055-8f358a7a47b2"), name: "Heavyweight Hoodie", desc: "Brushed fleece interior", price: "$84" },
        { img: thumb("1542291026-7eec264c27ff"), name: "Court Sneaker", desc: "Leather &amp; recycled rubber", price: "$120" },
        { img: thumb("1523381210434-271e8be1f52b"), tag: "Sale", name: "Wool Overshirt", desc: "Warm layered staple", price: "$96" },
      ],
      footBg: "#f9fafb",
      line: "#e5e7eb",
      muted: "#6b7280",
      faint: "#9ca3af",
      footer: "© 2026 ATELIER · Secure checkout · Free returns",
      bg: "#ffffff",
      ink: "#111827",
    }),
  },
  {
    name: "Sneaker Drop",
    description:
      "A bold streetwear store with a dark hero, product release grid and countdown CTA.",
    thumbnail_url: thumb("1542291026-7eec264c27ff"),
    category: "E-commerce",
    preview_html: storePage({
      name: "Sneaker Drop",
      bar: "#f59e0b",
      barText: "#1c1917",
      barTextMsg: "🔥 Drop 07 live now · Limited pairs · Free returns",
      brand: "HYPED",
      tracking: ".02em",
      links: ["Drops", "Men", "Women", "Collabs"],
      cartCount: 1,
      collection: "Drop 07 · Air Series",
      headline: "Heat that moves fast",
      sub: "Limited runs. No restocks. Cop yours before it's gone.",
      heroImg: thumb("1552346154-21d32810aba3"),
      heroBg: "#1c1917",
      accent: "#f59e0b",
      accentText: "#1c1917",
      tileBg: "#292524",
      products: [
        { img: thumb("1600269452121-4f2416e55c28"), tag: "Drop", name: "Air Flux 01", desc: "Triple black", price: "$180" },
        { img: thumb("1595950653106-6c9ebd614d3a"), name: "Runner X", desc: "Retro runner", price: "$140" },
        { img: thumb("1549298916-b41d501d3772"), name: "Court High", desc: "OG colorway", price: "$160" },
        { img: thumb("1560769629-975ec94e6a86"), tag: "Sale", name: "Street Low", desc: "Everyday pair", price: "$95" },
      ],
      footBg: "#111111",
      line: "#292524",
      muted: "#a8a29e",
      faint: "#78716c",
      footer: "© 2026 HYPED · Sneakers &amp; streetwear",
      bg: "#0c0a09",
      ink: "#fafaf9",
    }),
  },
  {
    name: "Hearth Home Goods",
    description:
      "A warm, minimal home-goods storefront with soft product cards and category tiles.",
    thumbnail_url: thumb("1556228453-efd6c1ff04f6"),
    category: "E-commerce",
    preview_html: storePage({
      name: "Hearth Home Goods",
      bar: "#78350f",
      barText: "#fffbeb",
      barTextMsg: "Handmade in small batches · Free carbon-neutral shipping",
      brand: "Hearth",
      tracking: ".04em",
      links: ["Kitchen", "Living", "Bedroom", "Gifting"],
      cartCount: 3,
      collection: "Winter Warmth",
      headline: "Considered goods for the home",
      sub: "Natural materials, made to last a lifetime.",
      heroImg: thumb("1556228720-195a672e8a03"),
      heroBg: "#fef3c7",
      accent: "#78350f",
      accentText: "#fffbeb",
      tileBg: "#fffbeb",
      products: [
        { img: thumb("1584990347449-a2d4c2c8d9f1"), tag: "New", name: "Ceramic Mug", desc: "Speckled stoneware", price: "$24" },
        { img: thumb("1522708323590-d24dbb6b0267"), name: "Linen Throw", desc: "Stonewashed natural", price: "$68" },
        { img: thumb("1616486338812-3dadae4b4ace"), name: "Oak Board", desc: "Cutting &amp; serving", price: "$42" },
        { img: thumb("1615874959474-d609969a20ed"), tag: "Sale", name: "Soy Candle", desc: "Amber &amp; cedar", price: "$19" },
      ],
      footBg: "#fffbeb",
      line: "#fde68a",
      muted: "#78716c",
      faint: "#a8a29e",
      footer: "© 2026 Hearth Goods · Sustainably made",
      bg: "#fffaeb",
      ink: "#431407",
    }),
  },

  /* -------------------------------- Blog ------------------------------- */
  {
    name: "Blog Studio",
    description:
      "Content-first blog template with typography focused reading experience.",
    thumbnail_url: thumb("1499750310107-5fef28a66643"),
    category: "Blog",
    preview_html: blogPage({
      name: "Blog Studio",
      brand: "The Studio",
      brandFont: "Georgia,serif",
      titleFont: "Georgia,serif",
      links: ["Design", "Engineering", "Culture", "About"],
      introTitle: "Writing on craft &amp; code",
      introSub: "Essays on building thoughtful digital products.",
      featured: {
        img: thumb("1499750310107-5fef28a66643"),
        meta: "Featured · Engineering",
        title: "The quiet power of good defaults",
        excerpt: "How thoughtful defaults reduce friction, teach users, and make products feel effortless from the very first second.",
        author: "Amara Okoye",
        read: "8 min read",
      },
      posts: [
        { img: thumb("1517245386807-bb43f82c33c4"), meta: "Design · 6 min", title: "Designing for the space between states" },
        { img: thumb("1454165804606-c3d57bc86b40"), meta: "Culture · 4 min", title: "Why small teams ship better software" },
      ],
      footer: "© 2026 The Studio · Subscribe · RSS",
      bg: "#ffffff",
      ink: "#1f2937",
      muted: "#4b5563",
      faint: "#9ca3af",
      line: "#f3f4f6",
      accent: "#fbbf24",
      accent2: "#f97316",
    }),
  },
  {
    name: "Tech Journal",
    description:
      "A dark developer blog with code-friendly typography and a release-notes feed.",
    thumbnail_url: thumb("1517180102446-f3ece451e9d8"),
    category: "Blog",
    preview_html: blogPage({
      name: "Tech Journal",
      brand: "devlog",
      brandFont: "'SF Mono',Menlo,monospace",
      titleFont: "'SF Mono',Menlo,monospace",
      links: ["Posts", "Guides", "Changelog", "RSS"],
      introTitle: "Notes from the terminal",
      introSub: "Deep dives on systems, performance, and shipping software.",
      featured: {
        img: thumb("1517180102446-f3ece451e9d8"),
        meta: "Featured · Systems",
        title: "Understanding backpressure at scale",
        excerpt: "A practical tour of flow control — from TCP windows to async queues — and how to keep producers honest.",
        author: "Ravi Patel",
        read: "12 min read",
      },
      posts: [
        { img: thumb("1555066931-4365d14bab8c"), meta: "Guides · 9 min", title: "A field guide to database indexes" },
        { img: thumb("1461749280684-dccba630e2f6"), meta: "Changelog · 3 min", title: "v3.2 — streaming and observability" },
      ],
      footer: "devlog © 2026 · Built with too much coffee",
      bg: "#0d1117",
      ink: "#e6edf3",
      muted: "#8b949e",
      faint: "#6e7681",
      line: "#21262d",
      accent: "#7c3aed",
      accent2: "#22d3ee",
    }),
  },
  {
    name: "Wander",
    description:
      "A food and travel magazine blog with rich imagery and a relaxed editorial feel.",
    thumbnail_url: thumb("1504609773096-104ff2c73ba4"),
    category: "Blog",
    preview_html: blogPage({
      name: "Wander",
      brand: "Wander",
      brandFont: "Georgia,serif",
      titleFont: "Georgia,serif",
      links: ["Destinations", "Food", "Guides", "Shop"],
      introTitle: "Stories from the road",
      introSub: "Slow travel, good food, and the people in between.",
      featured: {
        img: thumb("1504609773096-104ff2c73ba4"),
        meta: "Featured · Lisbon",
        title: "48 hours eating through Lisbon",
        excerpt: "From pastéis at dawn to late-night tascas — a hungry traveller's field notes on Portugal's capital.",
        author: "Mara Lindqvist",
        read: "7 min read",
      },
      posts: [
        { img: thumb("1476224203421-9ac39bcb3327"), meta: "Food · 5 min", title: "The case for cooking on holiday" },
        { img: thumb("1488646953014-85cb44e25828"), meta: "Guides · 6 min", title: "A weekend in the Dolomites" },
      ],
      footer: "Wander Magazine © 2026 · Slow travel, always",
      bg: "#fefcf8",
      ink: "#292524",
      muted: "#57534e",
      faint: "#a8a29e",
      line: "#f0ece3",
      accent: "#ea580c",
      accent2: "#f59e0b",
    }),
  },

  /* ------------------------------ Business ----------------------------- */
  {
    name: "Restaurant Menu",
    description:
      "Elegant restaurant template with menu layout, reservations, and gallery sections.",
    thumbnail_url: thumb("1414235077428-338989a2e8c0"),
    category: "Business",
    preview_html: businessPage({
      name: "Restaurant Menu",
      font: "Georgia,'Times New Roman',serif",
      brand: "Maison Lumière",
      kicker: "Est. 2014 · Downtown",
      tagline: "Seasonal French cuisine, crafted daily.",
      heroImg: thumb("1414235077428-338989a2e8c0"),
      imgOpacity: ".65",
      overlay: "rgba(15,13,11,.9)",
      heroText: "#f5f0e8",
      heroMuted: "#cbbfa8",
      listTitle: "Dinner Menu",
      items: [
        { name: "Seared Scallops", desc: "Cauliflower purée, brown butter, capers", price: "$24" },
        { name: "Duck Confit", desc: "Crispy leg, cherry gastrique, root vegetables", price: "$32" },
        { name: "Wild Mushroom Risotto", desc: "Aged parmesan, truffle oil, chives", price: "$26" },
        { name: "Crème Brûlée", desc: "Vanilla bean, caramelized sugar", price: "$12" },
      ],
      ctaTitle: "Reserve a table",
      ctaSub: "Open Tue–Sun · 5pm – 11pm",
      ctaBtn: "Book now",
      footer: "Maison Lumière · 12 Rue du Marché · +1 (555) 018-2244",
      bg: "#0f0d0b",
      ink: "#f5f0e8",
      muted: "#a89c88",
      faint: "#6f665a",
      line: "rgba(245,240,232,.1)",
      dot: "rgba(245,240,232,.25)",
      accent: "#d6b163",
      accentText: "#1a1613",
      panel: "#1a1613",
      panelLine: "rgba(214,177,99,.25)",
      weight: 400,
    }),
  },
  {
    name: "Northwind Consulting",
    description:
      "A professional consulting template with service list, credentials and a contact CTA.",
    thumbnail_url: thumb("1454165804606-c3d57bc86b40"),
    category: "Business",
    preview_html: businessPage({
      name: "Northwind Consulting",
      font: "-apple-system,'Segoe UI',sans-serif",
      brand: "Northwind",
      kicker: "Strategy &amp; Operations",
      tagline: "We help leaders make better decisions, faster.",
      heroImg: thumb("1600880292203-757bb62b4baf"),
      imgOpacity: ".75",
      overlay: "rgba(2,6,23,.85)",
      heroText: "#ffffff",
      heroMuted: "#cbd5e1",
      listTitle: "What we do",
      items: [
        { name: "Growth Strategy", desc: "Market sizing, positioning, go-to-market", price: "From $25k" },
        { name: "Operational Excellence", desc: "Process design &amp; cost optimisation", price: "From $18k" },
        { name: "Digital Transformation", desc: "Systems, data, and change enablement", price: "From $40k" },
        { name: "Executive Coaching", desc: "1:1 leadership advisory", price: "$1,500/mo" },
      ],
      ctaTitle: "Book a discovery call",
      ctaSub: "30 minutes, no obligation",
      ctaBtn: "Schedule now",
      footer: "Northwind Consulting LLP · London · New York · Singapore",
      bg: "#ffffff",
      ink: "#0f172a",
      muted: "#64748b",
      faint: "#94a3b8",
      line: "#e2e8f0",
      dot: "#cbd5e1",
      accent: "#1d4ed8",
      accentText: "#ffffff",
      panel: "#f1f5f9",
      panelLine: "#e2e8f0",
      weight: 700,
    }),
  },
  {
    name: "Pulse Fitness Studio",
    description:
      "An energetic fitness studio template with class schedule, memberships and booking CTA.",
    thumbnail_url: thumb("1534258936925-c58bed479fcb"),
    category: "Business",
    preview_html: businessPage({
      name: "Pulse Fitness Studio",
      font: "'Helvetica Neue',Arial,sans-serif",
      brand: "PULSE",
      kicker: "Train · Sweat · Repeat",
      tagline: "Strength, conditioning, and community under one roof.",
      heroImg: thumb("1534258936925-c58bed479fcb"),
      imgOpacity: ".6",
      overlay: "rgba(17,17,17,.88)",
      heroText: "#ffffff",
      heroMuted: "#d4d4d8",
      listTitle: "Class Schedule",
      items: [
        { name: "HIIT Blast", desc: "45 min · All levels · Mon &amp; Wed", price: "6:30am" },
        { name: "Strength Lab", desc: "60 min · Barbell focus · Tue &amp; Thu", price: "7:00pm" },
        { name: "Mobility Flow", desc: "40 min · Recovery · Fri", price: "6:00pm" },
        { name: "Spin Sprint", desc: "50 min · Cardio · Sat", price: "9:00am" },
      ],
      ctaTitle: "Claim your free week",
      ctaSub: "First class is on us — no card required",
      ctaBtn: "Start free week",
      footer: "PULSE Studio · 88 Riverside Ave · @pulse.studio",
      bg: "#111111",
      ink: "#fafafa",
      muted: "#a1a1aa",
      faint: "#71717a",
      line: "rgba(255,255,255,.08)",
      dot: "rgba(255,255,255,.2)",
      accent: "#a3e635",
      accentText: "#111111",
      panel: "#1c1c1e",
      panelLine: "rgba(163,230,53,.25)",
      weight: 800,
    }),
  },
];

exports.seed = async function seed(knex) {
  await knex("templates").del();
  await knex("templates").insert(definitions);
  console.log(`Seeded ${definitions.length} templates with live previews.`);
};
