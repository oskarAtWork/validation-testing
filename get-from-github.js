const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const REPO_HTTPS_URL = "https://github.com/inter-ikea/ROSS-MVProfilePages-Frontend.git";
const REPO_BRANCH = "master";
const REPO_PATH = "backend/src/validation";
const ENTRY_FILE = "app-settings.ts";
const OUTPUT_DIR = path.resolve(__dirname, "src/validation");
const TEMP_REPO_DIR = path.resolve(__dirname, "temp-repo");

function clearDirectory(directory) {
  if (fs.existsSync(directory)) {
    fs.readdirSync(directory).forEach((file) => {
      const filePath = path.join(directory, file);
      if (fs.lstatSync(filePath).isDirectory()) {
        clearDirectory(filePath);
        fs.rmdirSync(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
  } else {
    fs.mkdirSync(directory, { recursive: true });
  }
}

function cloneRepository() {
  try {
    clearDirectory(TEMP_REPO_DIR);
    execSync(`git clone --branch ${REPO_BRANCH} --single-branch ${REPO_HTTPS_URL} ${TEMP_REPO_DIR}`, {
      stdio: "inherit",
    });
    return true;
  } catch (error) {
    return false;
  }
}

function extractImports(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const importRegex = /from\s+['"](.*?)['"]/g;
  const imports = [];
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }
  return imports.filter((imp) => imp.startsWith("."));
}

function copyBeUrls() {
  const beUrlsPath = path.join(TEMP_REPO_DIR, "scripts/local", "be-urls.json");
  const destPath = path.join("./be-urls.json");
  if (fs.existsSync(beUrlsPath)) {
    fs.copyFileSync(beUrlsPath, destPath);
  } else {
    console.error("❌ be-urls.ts not found in the repository.");
  }
}

function copyReachableFiles(entryFile, sourceDir, destDir, visited = new Set()) {
  const entryPath = path.join(sourceDir, entryFile);
  if (visited.has(entryPath)) return; // Avoid infinite loops
  visited.add(entryPath);

  const destPath = path.join(destDir, entryFile);
  const destDirPath = path.dirname(destPath);
  if (!fs.existsSync(destDirPath)) {
    fs.mkdirSync(destDirPath, { recursive: true });
  }
  fs.copyFileSync(entryPath, destPath);

  const imports = extractImports(entryPath);
  imports.forEach((imp) => {
    const importedFile = imp.endsWith(".ts") ? imp : `${imp}.ts`;
    const importedFilePath = path.join(path.dirname(entryFile), importedFile);
    copyReachableFiles(importedFilePath, sourceDir, destDir, visited);
  });
}

function main() {
  if (fs.existsSync(TEMP_REPO_DIR)) {
    console.log("🧹 Cleaning up temporary repository...");
    clearDirectory(TEMP_REPO_DIR);
    fs.rmdirSync(TEMP_REPO_DIR);
  }

  if (cloneRepository()) {
    console.log("👯 Repository cloned successfully!");
  } else {
    console.error("❌ Failed to clone the repository. Please check your HTTPS access.");
    process.exit(1);
  }

  console.log("🧹 Cleaning up src/validation");
  clearDirectory(OUTPUT_DIR);

  const sourceDir = path.join(TEMP_REPO_DIR, REPO_PATH);
  console.log("🧱 Putting new files into folder src/validation");
  copyReachableFiles(ENTRY_FILE, sourceDir, OUTPUT_DIR);

  copyBeUrls();

  if (fs.existsSync(TEMP_REPO_DIR)) {
    console.log("😨🔫 Getting rid of temp directory");
    clearDirectory(TEMP_REPO_DIR);
    fs.rmdirSync(TEMP_REPO_DIR);
  }

  console.log("✅ appsettings.ts and its dependencies downloaded successfully!\n");
}

main();