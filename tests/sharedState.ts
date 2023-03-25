import { StartedDockerComposeEnvironment } from "testcontainers";

export const state: {
  dockerEnvironment: StartedDockerComposeEnvironment | undefined;
} = {
  dockerEnvironment: undefined,
};
