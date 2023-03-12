import test, { expect } from "@playwright/test";
import { addNewReleases } from "../db/releasesWriteRepo.js";
import { Release } from "../parser.js";
import { runServer, stopServer } from "../server.js";
import { testReleases } from "../testData.js";

let baseUrl: string;

test.beforeAll(async () => {
  baseUrl = `http://localhost:${Number(await runServer())}`;
  await addNewReleases(testReleases);
});

test("get all releases", async ({ request }) => {
  const releasesApiResponse = await request.get(`${baseUrl}/releases`);
  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(testReleases.length);

  console.log(`${releases.length} releases retrieved`);
});

test("get all releases by genre", async ({ request }) => {
  const filterByGenre = "Progressive Rock";
  const expectedResults = testReleases.filter((release) =>
    release.genres.includes(filterByGenre)
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?genres=${filterByGenre}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(release.genres).toContainEqual(filterByGenre);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get all releases that have multiple genres", async ({ request }) => {
  const firstGenre = "Progressive Rock";
  const secondGenre = "Art Rock";

  const expectedResults = testReleases.filter(
    (release) =>
      release.genres.includes(firstGenre) &&
      release.genres.includes(secondGenre)
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?genres=${firstGenre},${secondGenre}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(release.genres).toContainEqual(firstGenre);
    expect(release.genres).toContainEqual(secondGenre);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get all releases by artist", async ({ request }) => {
  const artist = "Madvillain";

  const expectedResults = testReleases.filter(
    (release) => release.artist === artist
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?artists=${artist}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(release.artist).toBe(artist);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get all releases by multiple artists", async ({ request }) => {
  const artists = ["Madvillain", "Pink Floyd"];

  const expectedResults = testReleases.filter(
    (release) => release.artist === artists[0] || release.artist === artists[1]
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?artists=${artists[0]},${artists[1]}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(artists).toContainEqual(release.artist);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get a release by an album name", async ({ request }) => {
  const album = "In the Court of the Crimson King";

  const expectedResults = testReleases.filter(
    (release) => release.album === album
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?albums=${album}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    console.log(release.album);
    expect(release.album).toBe(album);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get releases by album names", async ({ request }) => {
  const albums = ["In the Court of the Crimson King", "To Pimp a Butterfly"];

  const expectedResults = testReleases.filter(
    (release) => release.album === albums[0] || release.album === albums[1]
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?albums=${albums[0]},${albums[1]}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(albums).toContainEqual(release.album);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get all releases by year", async ({ request }) => {
  const year = 1997;

  const expectedResults = testReleases.filter(
    (release) => release.year === year
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?years=${year}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(release.year).toBe(year);
  });

  console.log(`${releases.length} releases retrieved`);
});

test("get releases by given years", async ({ request }) => {
  const years = [2015, 1997];

  const expectedResults = testReleases.filter(
    (release) => release.year === years[0] || release.year === years[1]
  );

  const releasesApiResponse = await request.get(
    `${baseUrl}/releases?years=${years[0]},${years[1]}`
  );

  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(expectedResults.length);

  (<Release[]>releases).forEach((release) => {
    expect(years).toContainEqual(release.year);
  });

  console.log(`${releases.length} releases retrieved`);
});

test.afterAll(async () => {
  await stopServer();
});
