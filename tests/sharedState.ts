import { StartedDockerComposeEnvironment } from "testcontainers";

export const state: {
  dockerEnvironment: StartedDockerComposeEnvironment | undefined;
  baseUrlWithRandomPort: string | undefined;
} = {
  dockerEnvironment: undefined,
  baseUrlWithRandomPort: undefined,
};
