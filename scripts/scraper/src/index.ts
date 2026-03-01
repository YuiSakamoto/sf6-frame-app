import { chromium, type Page } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_CHARACTERS } from "./characters.js";
import type {
  CharacterFrameData,
  ScrapedMove,
  MoveCategory,
} from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../../data");
const FRAMES_DIR = join(DATA_DIR, "frames");
const BASE_URL = "https://www.streetfighter.com/6";

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

interface RawRow {
  name: string;
  startup: string;
  active: string;
  recovery: string;
  onHit: string;
  onBlock: string;
  cancel: string;
  damage: string;
  comboScaling: string;
  driveGaugeGain: string;
  driveGaugeLossBlock: string;
  driveGaugeLossPc: string;
  saGaugeGain: string;
  properties: string;
  notes: string;
  category: string;
}

const CAT_KEYWORDS: Record<string, string> = {
  通常技: "normal",
  特殊技: "unique",
  必殺技: "special",
  スーパーアーツ: "super",
  通常投げ: "throw",
  共通システム: "common",
  "normal moves": "normal",
  "unique attacks": "unique",
  "special moves": "special",
  "super arts": "super",
  throws: "throw",
  "common moves": "common",
};

async function scrapePage(page: Page, url: string): Promise<RawRow[]> {
  console.log(`    ${url}`);
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  try {
    await page.waitForSelector("table", { timeout: 30000 });
  } catch {
    console.warn(`      テーブル未検出: ${url}`);
    return [];
  }

  await page.evaluate(
    `window.__CAT_KEYWORDS = ${JSON.stringify(CAT_KEYWORDS)}`,
  );

  const results = await page.evaluate(`
    (function() {
      var catKeywords = window.__CAT_KEYWORDS;
      var table = document.querySelector("table");
      if (!table) return [];

      var rows = table.querySelectorAll("tr");
      var results = [];
      var currentCategory = "normal";

      rows.forEach(function(row) {
        var cells = row.querySelectorAll("td");

        if (cells.length <= 2 && cells.length > 0) {
          var text = (cells[0].textContent || "").trim().toLowerCase();
          var keys = Object.keys(catKeywords);
          for (var k = 0; k < keys.length; k++) {
            if (text.indexOf(keys[k].toLowerCase()) !== -1) {
              currentCategory = catKeywords[keys[k]];
              break;
            }
          }
          return;
        }

        if (cells.length < 6) return;

        var skillCell = cells[0];
        var artsEl = skillCell.querySelector("[class*='arts']");
        var name = artsEl
          ? (artsEl.textContent || "").trim()
          : (skillCell.textContent || "").trim();

        results.push({
          name: name,
          startup: (cells[1].textContent || "").trim(),
          active: (cells[2].textContent || "").trim(),
          recovery: (cells[3].textContent || "").trim(),
          onHit: (cells[4].textContent || "").trim(),
          onBlock: (cells[5].textContent || "").trim(),
          cancel: cells[6] ? (cells[6].textContent || "").trim() : "",
          damage: cells[7] ? (cells[7].textContent || "").trim() : "",
          comboScaling: cells[8] ? (cells[8].textContent || "").trim() : "",
          driveGaugeGain: cells[9] ? (cells[9].textContent || "").trim() : "",
          driveGaugeLossBlock: cells[10] ? (cells[10].textContent || "").trim() : "",
          driveGaugeLossPc: cells[11] ? (cells[11].textContent || "").trim() : "",
          saGaugeGain: cells[12] ? (cells[12].textContent || "").trim() : "",
          properties: cells[13] ? (cells[13].textContent || "").trim() : "",
          notes: cells[14] ? (cells[14].textContent || "").trim() : "",
          category: currentCategory,
        });
      });

      return results;
    })()
  `);

  return results as RawRow[];
}

/**
 * 日本語版と英語版の2ページからデータを取得してマージ
 * Capcom公式サイトは全言語で技名が英語/ローマ字統一なので日英だけで十分
 */
async function scrapeCharacter(
  context: Awaited<ReturnType<Awaited<ReturnType<typeof chromium.launch>>["newContext"]>>,
  slug: string,
): Promise<ScrapedMove[]> {
  const page = await context.newPage();

  try {
    const jaRows = await scrapePage(
      page,
      `${BASE_URL}/ja-jp/character/${slug}/frame`,
    );
    if (jaRows.length === 0) return [];

    const enRows = await scrapePage(
      page,
      `${BASE_URL}/en-us/character/${slug}/frame`,
    );

    if (enRows.length !== jaRows.length) {
      console.warn(
        `    ⚠ 行数不一致: ja=${jaRows.length} en=${enRows.length}`,
      );
    }

    const moves: ScrapedMove[] = jaRows.map((ja, i) => {
      const en = enRows[i];
      return {
        name: en?.name ?? ja.name,
        nameJa: ja.name,
        input: "",
        startup: ja.startup,
        active: ja.active,
        recovery: ja.recovery,
        onHit: ja.onHit,
        onBlock: ja.onBlock,
        cancel: ja.cancel,
        damage: ja.damage,
        comboScaling: ja.comboScaling,
        comboScalingEn: en?.comboScaling ?? ja.comboScaling,
        driveGaugeGain: ja.driveGaugeGain,
        driveGaugeLossBlock: ja.driveGaugeLossBlock,
        driveGaugeLossPc: ja.driveGaugeLossPc,
        saGaugeGain: ja.saGaugeGain,
        properties: ja.properties,
        propertiesEn: en?.properties ?? ja.properties,
        notes: ja.notes,
        notesEn: en?.notes ?? ja.notes,
        category: ja.category as MoveCategory,
      };
    });

    return moves;
  } finally {
    await page.close();
  }
}

async function main() {
  const targetSlug = process.argv.find(
    (_, i, arr) => arr[i - 1] === "--character",
  );
  const characters = targetSlug
    ? ALL_CHARACTERS.filter((c) => c.slug === targetSlug)
    : ALL_CHARACTERS;

  if (characters.length === 0) {
    console.error(`キャラクター "${targetSlug}" が見つかりません`);
    process.exit(1);
  }

  await mkdir(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
  });
  const context = await browser.newContext({ userAgent: UA });

  // Cookie同意ダイアログを事前にクリック
  console.log("Cookie同意処理中...");
  const initPage = await context.newPage();
  await initPage.goto(
    `${BASE_URL}/ja-jp/character/ryu/frame`,
    { waitUntil: "networkidle", timeout: 60000 },
  );
  await initPage.waitForTimeout(2000);
  try {
    await initPage.click(
      "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
      { timeout: 5000 },
    );
    console.log("  ✓ Cookie同意完了");
  } catch {
    console.log("  Cookie同意ダイアログなし（スキップ）");
  }
  await initPage.close();

  const version = new Date().toISOString().split("T")[0];
  const successfulSlugs: string[] = [];

  for (const char of characters) {
    console.log(`\n[${char.slug}] ${char.name} スクレイピング中...`);
    try {
      const moves = await scrapeCharacter(context, char.slug);
      if (moves.length === 0) {
        console.warn(`  ⚠ 技データなし: ${char.name}`);
        continue;
      }

      const data: CharacterFrameData = {
        slug: char.slug,
        name: char.name,
        nameJa: char.nameJa,
        version,
        moves,
      };

      const filePath = join(FRAMES_DIR, `${char.slug}.json`);
      await writeFile(filePath, JSON.stringify(data, null, 2));
      console.log(`  ✓ ${moves.length}個の技を保存`);
      successfulSlugs.push(char.slug);
    } catch (error) {
      console.error(`  ✗ エラー: ${char.name}`, error);
    }
  }

  await browser.close();

  // characters.json を出力
  const charactersJson = ALL_CHARACTERS.map((c) => ({
    slug: c.slug,
    name: c.name,
    nameJa: c.nameJa,
  }));
  await writeFile(
    join(DATA_DIR, "characters.json"),
    JSON.stringify(charactersJson, null, 2),
  );

  // version.json を出力
  const versionJson = {
    version,
    updatedAt: new Date().toISOString(),
    characters: successfulSlugs,
  };
  await writeFile(
    join(DATA_DIR, "version.json"),
    JSON.stringify(versionJson, null, 2),
  );

  console.log(
    `\n完了: ${successfulSlugs.length}/${characters.length} キャラクター`,
  );
}

main().catch(console.error);
