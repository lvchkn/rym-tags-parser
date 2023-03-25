import playwright from "playwright";
import { addNewReleases, AddResult } from "./db/releasesWriteRepo.js";
import { testReleases } from "./testData.js";

const DATA_URL = process.env.DATA_URL || "";

export interface Release {
  artist: string;
  album: string;
  genres: string[];
  year: number;
}

export interface ParseRequest {
  profile: string;
  tag: string;
  fromPage: number;
  toPage: number;
  isTest?: boolean;
}

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

async function parseAll(
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
  const releases = await parseAll(page, url, fromPage, toPage);

  await page.waitForTimeout(1_000);
  await browser.close();

  return releases;
}

export async function parseAndSave(
  parseRequest: ParseRequest
): Promise<AddResult> {
  const { profile, tag, fromPage, toPage, isTest } = parseRequest;

  if (isTest) {
    const result = await addNewReleases(testReleases);
    return result;
  }

  const url = `${DATA_URL}/${profile}/stag/${tag}`;
  const releases = await getRYMData(url, fromPage, toPage);

  const result = await addNewReleases(releases);

  return result;
}
