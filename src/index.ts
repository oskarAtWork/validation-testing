import fs from "fs";
import https from "https";
import path from "path";
import axios from "axios";
import { AppSettings, parseAppsettings } from "./validation/app-settings";
import { ZodError } from "zod";

type TestResult =
  | {
      passed: true;
      filePath: string;
    }
  | {
      passed: false;
      filePath: string;
      error: ZodError | undefined;
    };

const log = process.env.NODE_ENV !== "test" ? console.log : () => {};
const logError = process.env.NODE_ENV !== "test" ? console.error : () => {};

function validateJSON(data: AppSettings, filePath: string): TestResult {
  try {
    parseAppsettings(data);
    return {
      passed: true,
      filePath: filePath,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        passed: false,
        filePath: filePath,
        error,
      };
    } else {
      if (error instanceof Error) {
        logError("Unknown error:", error.message);
      } else {
        logError("Unknown error:", error);
      }

      return {
        passed: false,
        filePath: filePath,
        error: undefined,
      };
    }
  }
}

function validateSingleFile(filePath: string) {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const data = JSON.parse(fileContent) as AppSettings;
  return validateJSON(data, filePath);
}

// not recursive
function validateAllJsonFilesInFolder(folderPath: string): TestResult[] {
  const files = fs.readdirSync(folderPath);
  let testResults: TestResult[] = [];

  for (const file of files) {
    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isFile() && file.endsWith(".json")) {
      testResults.push(validateSingleFile(fullPath));
    }
  }

  return testResults;
}

export async function main(args: string[]): Promise<TestResult[]> {
  if (args.length === 0) {
    logError("Please provide a file or folder path");
    process.exit(1);
  }

  if (args[0] === "ARG") {
    logError(
      "Don't just follow README without thinking. Please provide a file or folder path"
    );
    log("For example:\n  npm start example-input");

    process.exit(1);
  }

  log("🔥 PP-BE's new fancy breaking change tester 🔥\n");

  const arg = args[0];
  if (arg.startsWith("http")) {
    try {
      console.log("Fetching JSON from URL:", arg);
      const response = await axios.get(arg, {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        timeout: 10000, // 10 seconds timeout
      });
      const data = response.data as AppSettings;
      return [validateJSON(data, arg)];
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        error.response?.data === "RBAC: access denied"
      ) {
        logError("\n❌RBAC: access denied. Is your vpn on?\n");
        process.exit(1);
      } else if (error instanceof Error) {
        logError(
          `\n❌Error fetching JSON from URL ${arg} :`,
          error.message,
          "\n"
        );
        process.exit(1);
      } else {
        logError(`\n❌Error fetching JSON from URL ${arg} :`, error, "\n");
        process.exit(1);
      }
    }
  } else if (fs.existsSync(arg)) {
    if (fs.statSync(arg).isFile() && arg.endsWith(".json")) {
      return [validateSingleFile(arg)];
    } else if (fs.statSync(arg).isDirectory()) {
      return validateAllJsonFilesInFolder(arg);
    } else {
      logError("The provided path is neither a directory nor a JSON file");
    }
  } else {
    logError("The provided path does not exist");
  }

  return [];
}

// If the script is run directly, execute the main function

async function runClient() {
  const testResults = await main(process.argv.slice(2)); //first two args are node and script path

  const totalTests = testResults.length;
  const passedTests = testResults.filter((result) => result.passed).length;

  if (totalTests === 0) {
    logError("❌ No JSON files found to validate\n");
    process.exit(1);
  }

  const emoji = totalTests === passedTests ? "✅" : "";

  log(`${emoji}Results: ${passedTests} out of ${totalTests} tests passed`);
  if (process.argv[2] === "example-input") {
    if (totalTests === 2 && passedTests === 1) {
      log(
        "(This is the expected output of the example-input, let's try some real files)"
      );
    } else {
      log("Unexpected output of the example-input, weird...");
    }
  }

  log("\n");

  testResults.forEach((result) => {
    if (result.passed) {
      log(`✅ ${result.filePath}`);
    } else {
      logError(`❌ Invalid: ${result.filePath}`);
      if (!result.error) {
        logError("  - Unknown error");
      } else {
        logError(result.error.message);
      }
    }
  });

  log("\n");
}

if (require.main === module) {
  runClient();
}
