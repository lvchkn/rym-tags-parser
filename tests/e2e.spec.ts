import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from "testcontainers";
import test, { expect } from "@playwright/test";
import path from "path";

let environment: StartedDockerComposeEnvironment;

test.beforeAll(async () => {
  test.setTimeout(300_000);

  const composeFilePath = path.resolve(path.dirname("../"));
  const composeFile = "docker-compose.yml";

  environment = await new DockerComposeEnvironment(composeFilePath, composeFile)
    .withBuild()
    .withWaitStrategy("rabbitmq-1", Wait.forHealthCheck())
    .withWaitStrategy("mongodb-1", Wait.forHealthCheck())
    .withStartupTimeout(180_000)
    .up();
});

test("parse-check_status-get_releases-flow", async ({ request }) => {
  test.setTimeout(300_000);

  const parseResult = await request.post(`/parse`, {
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
    const response = await request.get(`/tasks/${parseResultJson.id}`);
    const json = await response.json();

    expect(json.status).toBe("Completed");
  }).toPass({
    intervals: [5_000, 10_000, 20_000],
    timeout: 60_000,
  });

  const releases = await request.get(`/`);

  expect(releases.ok()).toBeTruthy();
  expect(releases.status()).toBe(200);

  const res = await releases.json();
  console.log(`${res.length} releases retrieved`);
});

test.afterAll(async () => {
  await environment.down();
});
