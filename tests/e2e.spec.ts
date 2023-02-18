import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from "testcontainers";
import test, { expect } from "@playwright/test";
import path from "path";
import { run } from "../server.js";

let environment: StartedDockerComposeEnvironment;
let port: number;

test.beforeAll(async () => {
  test.setTimeout(300_000);

  const composeFilePath = path.resolve(path.dirname("../"));
  const composeFile = "docker-compose.yml";

  environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withBuild()
    .up();

  port = Number(await run());
  console.log(`Containers are up. Port is ${port}`);
});

test("parse-check_status-get_releases-flow", async ({ request }) => {
  test.setTimeout(300_000);
  console.log("Test started executing");

  const parseResult = await request.post(`http://localhost:${port}/parse`, {
    data: {
      profile: process.env.PROFILE,
      tag: process.env.TAG,
      fromPage: process.env.FROM_PAGE,
      toPage: process.env.TAG,
    },
  });

  expect(parseResult.ok()).toBeTruthy();
  expect(parseResult.status()).toBe(202);

  const parseResultJson = await parseResult.json();

  expect(parseResultJson).toMatchObject({
    status: "pending",
  });

  await expect(async () => {
    const response = await request.get(
      `http://localhost:${port}/tasks/${parseResultJson.id}`
    );
    const json = await response.json();
    console.log(`Task status: ${json.status}`);

    expect(json.status).toBe("Completed");
  }).toPass({
    intervals: [5_000],
    timeout: 90_000,
  });

  const releases = await request.get(`http://localhost:${port}/`);

  expect(releases.ok()).toBeTruthy();
  expect(releases.status()).toBe(200);

  const res = await releases.json();
  console.log(`${res.length} releases retrieved`);
});

test.afterAll(async () => {
  await environment.down();
});
