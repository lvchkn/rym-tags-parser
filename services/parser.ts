import playwright from "playwright";
import { Release } from "../models/release.js";
import { ParseRequest } from "../models/parseRequest.js";

const DATA_URL = process.env.DATA_URL || "";

async function getReleasesFromPage(page: playwright.Page): Promise<Release[]> {
  const locator = page.locator(".or_q_albumartist");
  const locatorsCount = await locator.count();

  const releases: Release[] = [];

  for (let i = 0; i < locatorsCount; i++) {
    const currentRelease = locator.nth(i);

    const artistLocator = currentRelease.locator(".artist");
    // there may be more than 1 artist credited for a release
    const artist = (await artistLocator.allTextContents())[0] ?? "";

    const albumLocator = currentRelease.locator(".album");
    const album = (await albumLocator.textContent()) ?? "";

    const genreLocator = currentRelease.locator(".genre");
    const genres = await genreLocator.allTextContents();

    const yearLocator = currentRelease.locator("span.smallgray");
    const yearWithParentheses = (await yearLocator.textContent()) ?? "";
    const yearString = yearWithParentheses.replace("(", "").replace(")", "");
    const year = Number(yearString);

    releases.push({
      artist,
      album,
      genres,
      year,
    });
  }

  return releases;
}

async function parseAllPages(
  page: playwright.Page,
  url: string,
  fromPage: number,
  toPage: number
): Promise<Release[]> {
  let hasNextPage: boolean;
  let currentPageNumber = fromPage;
  const releaseChunks: Release[][] = [];

  do {
    await page.goto(`${url}/${currentPageNumber}`);
    await page.waitForSelector(".mbgen");

    hasNextPage = (await page.$("a.navlinknext")) !== null;

    if (hasNextPage) currentPageNumber++;

    const chunk: Release[] = await getReleasesFromPage(page);
    releaseChunks.push(chunk);

    await page.waitForTimeout(5_000);
  } while (hasNextPage && currentPageNumber <= toPage);

  const flattenedReleases = releaseChunks.flat();

  return flattenedReleases;
}

async function getRYMData(
  url: string,
  fromPage: number,
  toPage: number
): Promise<Release[]> {
  const browser = await playwright.chromium.launch({
    headless: true,
    logger: {
      isEnabled: (name) => name === "browser",
      log: (name, message) => console.log(`${name} ${message}`),
    },
  });

  const page = await browser.newPage();
  const releases = await parseAllPages(page, url, fromPage, toPage);

  await page.waitForTimeout(1_000);
  await browser.close();

  return releases;
}

export async function parse(parseRequest: ParseRequest): Promise<Release[]> {
  const { profile, tag, fromPage, toPage } = parseRequest;

  const url = `${DATA_URL}/${profile}/stag/${tag}`;
  const releases = await getRYMData(url, fromPage, toPage);

  return releases;
}
