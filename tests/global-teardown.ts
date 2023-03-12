import { state } from "./sharedState.js";

export default async function globalTeardown(): Promise<void> {
  await state.dockerEnvironment?.down();
}
