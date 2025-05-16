import { ZodError } from "zod";
import { main } from ".";

const passObject = {
  passed: true,
  filePath: "example-input/app-settings.json",
};
const failObject = {
  passed: false,
  filePath: "example-input/app-settings-invalid.json",
  error: new ZodError([
    {
      code: "invalid_type",
      expected: "array",
      received: "number",
      path: ["adjacentCountries"],
      message: "Expected array, received number",
    },
  ]),
};

describe("JSON Validation Script", async () => {
  it("should validate a single valid JSON file", async () => {
    const results = await main(["example-input/app-settings.json"]);

    expect(results).toEqual([passObject]);
  });

  it("should fail validation for an invalid JSON file", async () => {
    const results = await main(["example-input/app-settings-invalid.json"]);

    expect(results).toEqual([failObject]);
  });

  it("should validate all JSON files in a folder", async () => {
    const results = await main(["./example-input"]);

    expect(results).toEqual([failObject, passObject]);
  });

  it("should handle an empty folder gracefully", async () => {
    const results = await main(["./non-existent-folder"]);
    expect(results).toEqual([]);
  });

  it("should handle non existant file gracefully", async () => {
    const results = await main(["./non-existent-folder/file.json"]);
    expect(results).toEqual([]);
  });

  it("should handle non JSON file gracefully", async () => {
    const results = await main(["./get-from-github.js"]);
    expect(results).toEqual([]);
  });
});
