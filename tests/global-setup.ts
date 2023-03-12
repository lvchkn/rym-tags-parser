import path from "path";
import { DockerComposeEnvironment } from "testcontainers";
import { state } from "./sharedState.js";

export default async function globalSetup(): Promise<void> {
  await startCompose();
}

async function startCompose(): Promise<void> {
  const composeFilePath = path.resolve(path.dirname("../"));
  const composeFile = "docker-compose.yml";

  state.dockerEnvironment = await new DockerComposeEnvironment(
    composeFilePath,
    composeFile
  )
    .withNoRecreate()
    .withBuild()
    .up();
}
