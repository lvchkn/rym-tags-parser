import playwright from "playwright";
import { addNewReleases, AddResult } from "./db/releasesWriteRepo.js";

const DATA_URL = process.env.DATA_URL || "";

export interface Release {
  artist: string;
  album: string;
  genre: string;
  year: number;
}

export interface ParseRequest {
  profile: string;
  tag: string;
  fromPage: number;
  toPage: number;
}

const getReleases = (tableRows: HTMLElement[]): Release[] => {
  const releases: Release[] = [];

  tableRows.forEach((row) => {
    const artist = row.querySelector(".artist")?.innerHTML || "";
    const album = row.querySelector(".album")?.innerHTML || "";
    const genre = row.querySelector(".genre")?.innerHTML || "";

    const yearWithParentheses =
      row.querySelector("span.smallgray")?.innerHTML || "";

    const yearString = yearWithParentheses.replace("(", "").replace(")", "");

    const year = Number(yearString);

    releases.push({
      artist,
      album,
      genre,
      year,
    });
  });

  return releases;
};

const parseAll = async (
  page: playwright.Page,
  url: string,
  fromPage: number,
  toPage: number
): Promise<Release[]> => {
  let hasNextPage: boolean;
  let currentPageNumber = fromPage;
  const releaseChunks: Release[][] = [];

  do {
    await page.goto(`${url}/${currentPageNumber}`);

    hasNextPage = (await page.$("a.navlinknext")) !== null;

    if (hasNextPage) currentPageNumber++;

    const chunk: Release[] = await page.$$eval(
      ".or_q_albumartist",
      getReleases
    );

    releaseChunks.push(chunk);

    await page.waitForTimeout(5_000);
  } while (hasNextPage && currentPageNumber <= toPage);

  const flattenedReleases = releaseChunks.flat();

  return flattenedReleases;
};

const getRYMData = async (
  url: string,
  fromPage: number,
  toPage: number
): Promise<Release[]> => {
  const browser = await playwright.chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const releases = await parseAll(page, url, fromPage, toPage);

  await page.waitForTimeout(1_000);
  await browser.close();

  return releases;
};

export const parseAndSave = async (
  parseRequest: ParseRequest
): Promise<AddResult> => {
  const { profile, tag, fromPage, toPage } = parseRequest;
  const url = `${DATA_URL}/${profile}/stag/${tag}`;
  const releases = await getRYMData(url, fromPage, toPage);

  const result = await addNewReleases(releases);

  return result;
};
