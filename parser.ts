import playwright from "playwright";
import * as dotenv from "dotenv";
dotenv.config();

const DATA_URL = process.env.DATA_URL || "";

export interface Release {
  artist: string;
  album: string;
  genre: string;
  year: number;
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

const parseAll = async (page: playwright.Page): Promise<Release[]> => {
  let hasNextPage: boolean;
  let currentPageNumber = 31;
  const releaseChunks: Release[][] = [];

  do {
    await page.goto(`${DATA_URL}/${currentPageNumber}`);

    hasNextPage = (await page.$("a.navlinknext")) !== null;

    if (hasNextPage) currentPageNumber++;

    const chunk: Release[] = await page.$$eval(
      ".or_q_albumartist",
      getReleases
    );

    releaseChunks.push(chunk);

    await page.waitForTimeout(5000);
  } while (hasNextPage);

  const flattenedReleases = releaseChunks.flat();

  return flattenedReleases;
};

export const getRYMData = async (): Promise<Release[]> => {
  const browser = await playwright.chromium.launch({
    headless: true,
  });

  const page = await browser.newPage();

  const releases = await parseAll(page);

  await page.waitForTimeout(1000);
  await browser.close();

  return releases;
};
