const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { clearDirectory, copyReachableFiles, copyBeUrls } = require("./utils");

const REPO_HTTPS_URL = "https://github.com/inter-ikea/ROSS-MVProfilePages-Frontend.git";
const REPO_BRANCH = "master";
const REPO_PATH = "backend/src/validation";
const ENTRY_FILE = "app-settings.ts";
const OUTPUT_DIR = path.resolve(__dirname, "src/validation");
const TEMP_REPO_DIR = path.resolve(__dirname, "temp-repo");

function cloneRepository() {
  clearDirectory(TEMP_REPO_DIR);
  execSync(`git clone --branch ${REPO_BRANCH} --single-branch ${REPO_HTTPS_URL} ${TEMP_REPO_DIR}`, {
    stdio: "inherit",
  });
}

function main() {
  if (fs.existsSync(TEMP_REPO_DIR)) {
    console.log("🧹 Cleaning up temporary repository...");
    clearDirectory(TEMP_REPO_DIR);
    fs.rmdirSync(TEMP_REPO_DIR);
  }

  cloneRepository()
  console.log("👯 Repository cloned successfully!");

  console.log("🧹 Cleaning up src/validation");
  clearDirectory(OUTPUT_DIR);

  const sourceDir = path.join(TEMP_REPO_DIR, REPO_PATH);
  console.log("🧱 Putting new files into folder src/validation");
  copyReachableFiles(ENTRY_FILE, sourceDir, OUTPUT_DIR);

  copyBeUrls(TEMP_REPO_DIR);

  if (fs.existsSync(TEMP_REPO_DIR)) {
    console.log("😨🔫 Getting rid of temp directory");
    clearDirectory(TEMP_REPO_DIR);
    fs.rmdirSync(TEMP_REPO_DIR);
  }

  console.log("✅ appsettings.ts and its dependencies downloaded successfully!\n");
}

main();