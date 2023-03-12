import { state } from "./sharedState.js";

export default async function globalTeardown() {
  await state.dockerEnvironment?.down();
}
