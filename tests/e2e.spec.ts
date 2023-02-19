import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from "testcontainers";
import test, { expect } from "@playwright/test";
import path from "path";
import { runServer, stopServer } from "../server.js";

let environment: StartedDockerComposeEnvironment;
let baseUrl: string;

test.beforeAll(async () => {
  test.setTimeout(300_000);

  const composeFilePath = path.resolve(path.dirname("../"));
  const composeFile = "docker-compose.yml";

  environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withNoRecreate()
    .withBuild()
    .up();

  const port = Number(await runServer());
  baseUrl = `http://localhost:${port}`;

  console.log(`Containers are up. Test server port is ${port}`);
});

test("parse-check_status-get_releases-flow", async ({ request }) => {
  test.setTimeout(300_000);

  const parseResult = await request.post(`${baseUrl}/parse`, {
    data: {
      profile: process.env.PROFILE,
      tag: process.env.TAG,
      fromPage: process.env.FROM_PAGE,
      toPage: process.env.TO_PAGE,
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
      `${baseUrl}/tasks/${parseResultJson.id}`
    );
    const json = await response.json();
    console.log(`Task status: ${json.status}`);

    expect(json.status).toBe("Completed");
  }).toPass({
    intervals: [5_000],
    timeout: 90_000,
  });

  const releases = await request.get(`${baseUrl}/releases`);

  expect(releases.ok()).toBeTruthy();
  expect(releases.status()).toBe(200);

  const res = await releases.json();
  console.log(`${res.length} releases retrieved`);
});

test.afterAll(async () => {
  await stopServer();
  await environment.down();
});
