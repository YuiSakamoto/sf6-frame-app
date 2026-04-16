import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const OUT = resolve(process.cwd(), "public/og-image.png");
const WIDTH = 1200;
const HEIGHT = 630;

const HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @import url("https://fonts.googleapis.com/css2?family=Inter:wght@600;800&family=Noto+Sans+JP:wght@700&display=swap");
      html, body { margin: 0; padding: 0; }
      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        font-family: "Inter", "Noto Sans JP", system-ui, sans-serif;
        color: #F5F5F7;
        background:
          radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.35), transparent 55%),
          radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.30), transparent 55%),
          linear-gradient(135deg, #0A0A0F 0%, #14141C 100%);
        position: relative;
        overflow: hidden;
      }
      .grid {
        position: absolute; inset: 0;
        background-image:
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
        background-size: 48px 48px;
      }
      .frame {
        position: absolute; inset: 32px;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
      }
      .content {
        position: relative;
        height: 100%;
        padding: 80px 96px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 18px;
        background: rgba(239, 68, 68, 0.15);
        border: 1px solid rgba(239, 68, 68, 0.4);
        border-radius: 999px;
        color: #FCA5A5;
        font-size: 22px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        width: max-content;
      }
      .badge::before {
        content: "";
        width: 10px; height: 10px;
        background: #EF4444;
        border-radius: 50%;
        box-shadow: 0 0 12px #EF4444;
      }
      h1 {
        font-size: 112px;
        line-height: 1.0;
        font-weight: 800;
        margin: 28px 0 0;
        letter-spacing: -0.03em;
        background: linear-gradient(180deg, #FFFFFF 0%, #C7C7D1 100%);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .sub {
        margin-top: 20px;
        font-size: 34px;
        font-weight: 600;
        color: #A1A1AA;
        letter-spacing: -0.01em;
      }
      .footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 24px;
        color: #71717A;
      }
      .stats {
        display: flex;
        gap: 32px;
      }
      .stat b {
        display: block;
        color: #F5F5F7;
        font-size: 36px;
        font-weight: 800;
      }
      .stat span {
        font-size: 18px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #71717A;
      }
      .url {
        font-family: ui-monospace, "SF Mono", Menlo, monospace;
        color: #A1A1AA;
      }
    </style>
  </head>
  <body>
    <div class="grid"></div>
    <div class="frame"></div>
    <div class="content">
      <div>
        <div class="badge">Street Fighter 6</div>
        <h1>SF6 Frame Data</h1>
        <div class="sub">全28キャラのフレームデータ &middot; 確定反撃ファインダー</div>
      </div>
      <div class="footer">
        <div class="stats">
          <div class="stat"><b>28</b><span>Characters</span></div>
          <div class="stat"><b>Punish</b><span>Finder</span></div>
          <div class="stat"><b>JP / EN</b><span>i18n</span></div>
        </div>
        <div class="url">sf6-frame-app.pages.dev</div>
      </div>
    </div>
  </body>
</html>`;

async function main() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH,
  });
  try {
    const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
    await page.setContent(HTML, { waitUntil: "networkidle" });
    const png = await page.screenshot({ type: "png", omitBackground: false });
    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, png);
    console.log(`Generated ${OUT} (${png.length} bytes)`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
