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
      profile: "CaptainCat",
      tag: "1nteresting+metal",
      fromPage: 30,
      toPage: 30,
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
    console.log("FROM TEST!!!", json);
    expect(json.status).toBe("Completed");
  }).toPass({
    intervals: [5_000, 5_000, 5_000],
    timeout: 30_000,
  });

  const releases = await request.get(`/`);

  expect(releases.ok()).toBeTruthy();
  expect(releases.status()).toBe(200);

  const res = await releases.json();
  console.log(JSON.stringify(res));
});

test.afterAll(async () => {
  await environment.down();
});
