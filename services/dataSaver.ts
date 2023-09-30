import { addNewReleases } from "../db/releasesWriteRepo.js";
import { ParseRequest } from "../models/parseRequest.js";
import { parse } from "./parser.js";
import { testReleases } from "../testData.js";

export async function save(
  parseRequest: ParseRequest
): Promise<ReturnType<typeof addNewReleases>> {
  if (parseRequest.isTest) {
    const result = await addNewReleases(testReleases);
    return result;
  }

  const releases = await parse(parseRequest);
  const result = await addNewReleases(releases);

  return result;
}
