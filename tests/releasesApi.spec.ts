import test, { expect } from "@playwright/test";
import { addNewReleases } from "../db/releasesWriteRepo.js";
import { runServer, stopServer } from "../server.js";
import { testReleases } from "../testData.js";

let baseUrl: string;

test.beforeAll(async () => {
  baseUrl = `http://localhost:${Number(await runServer())}`;
  await addNewReleases(testReleases);
});

test("getAllReleases", async ({ request }) => {
  test.setTimeout(300_000);

  const releasesApiResponse = await request.get(`${baseUrl}/releases`);
  const releases = await releasesApiResponse.json();

  expect(releasesApiResponse.ok()).toBeTruthy();
  expect(releasesApiResponse.status()).toBe(200);

  expect(releases.length).toBe(testReleases.length);

  console.log(`${releases.length} releases retrieved`);
});

test.afterAll(async () => {
  await stopServer();
});
