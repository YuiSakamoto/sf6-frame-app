import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_CHARACTERS } from "./characters.js";
import type { CharacterFrameData, ScrapedMove, MoveCategory } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "../../../data");
const FRAMES_DIR = join(DATA_DIR, "frames");
const BASE_URL = "https://www.streetfighter.com/6/ja-jp/character";

/**
 * Capcom公式サイトからフレームデータをスクレイピング
 *
 * ページ構造（推定）:
 * - 各技は行で表示される
 * - カテゴリ別にグループ化されている
 * - テーブル形式でフレームデータが表示される
 */
async function scrapeCharacter(
  slug: string,
): Promise<ScrapedMove[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    const url = `${BASE_URL}/${slug}/frame`;
    console.log(`  Fetching: ${url}`);
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // ページが完全にレンダリングされるまで待機
    await page.waitForTimeout(2000);

    // フレームデータテーブルの行を取得
    const moves = await page.evaluate(() => {
      const results: Array<{
        name: string;
        input: string;
        startup: string;
        active: string;
        recovery: string;
        onBlock: string;
        onHit: string;
        damage: string;
        category: string;
      }> = [];

      // Capcom公式サイトの構造に基づいてセレクタを調整
      // 技のリスト行を取得（サイト構造に応じて調整が必要）
      const rows = document.querySelectorAll(
        "[class*='frame'] tr, [class*='move'] tr, table tr",
      );

      let currentCategory = "normal";

      rows.forEach((row) => {
        // カテゴリヘッダーの検出
        const headerEl = row.querySelector("th, [class*='category']");
        if (headerEl) {
          const headerText = headerEl.textContent?.trim().toLowerCase() ?? "";
          if (headerText.includes("通常") || headerText.includes("normal")) {
            currentCategory = "normal";
          } else if (
            headerText.includes("必殺") ||
            headerText.includes("special")
          ) {
            currentCategory = "special";
          } else if (
            headerText.includes("sa") ||
            headerText.includes("super")
          ) {
            currentCategory = "super";
          } else if (
            headerText.includes("固有") ||
            headerText.includes("unique")
          ) {
            currentCategory = "unique";
          } else if (
            headerText.includes("投げ") ||
            headerText.includes("throw")
          ) {
            currentCategory = "throw";
          }
        }

        const cells = row.querySelectorAll("td");
        if (cells.length >= 6) {
          // 典型的なフレームデータテーブル: 技名, コマンド, 発生, 持続, 硬直, ガード時, ヒット時, ダメージ
          const getText = (idx: number) =>
            cells[idx]?.textContent?.trim() ?? "";
          results.push({
            name: getText(0),
            input: getText(1),
            startup: getText(2),
            active: getText(3),
            recovery: getText(4),
            onBlock: getText(5),
            onHit: cells.length > 6 ? getText(6) : "",
            damage: cells.length > 7 ? getText(7) : "",
            category: currentCategory,
          });
        }
      });

      return results;
    });

    return moves.map((m) => ({
      name: m.name,
      nameJa: m.name,
      input: m.input,
      startup: m.startup,
      active: m.active,
      recovery: m.recovery,
      onBlock: m.onBlock,
      onHit: m.onHit,
      damage: m.damage,
      category: m.category as MoveCategory,
    }));
  } finally {
    await browser.close();
  }
}

async function main() {
  const targetSlug = process.argv.find((_, i, arr) => arr[i - 1] === "--character");
  const characters = targetSlug
    ? ALL_CHARACTERS.filter((c) => c.slug === targetSlug)
    : ALL_CHARACTERS;

  if (characters.length === 0) {
    console.error(`キャラクター "${targetSlug}" が見つかりません`);
    process.exit(1);
  }

  await mkdir(FRAMES_DIR, { recursive: true });

  const version = new Date().toISOString().split("T")[0];
  const successfulSlugs: string[] = [];

  for (const char of characters) {
    console.log(`\nスクレイピング中: ${char.name} (${char.slug})`);
    try {
      const moves = await scrapeCharacter(char.slug);
      if (moves.length === 0) {
        console.warn(`  ⚠ 技データが取得できませんでした: ${char.name}`);
        console.warn(
          "  サイト構造が変更されている可能性があります。セレクタの調整が必要です。",
        );
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
      console.log(`  ✓ ${moves.length}個の技を保存: ${filePath}`);
      successfulSlugs.push(char.slug);
    } catch (error) {
      console.error(`  ✗ エラー: ${char.name}`, error);
    }
  }

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

  console.log(`\n完了: ${successfulSlugs.length}/${characters.length} キャラクター`);
}

main().catch(console.error);
