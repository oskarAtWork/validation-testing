const fs = require("fs");
const path = require("path");


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

function copyBeUrls(directory) {
  const beUrlsPath = path.join(directory, "scripts/local", "be-urls.json");
  const destPath = path.join("./be-urls.json");
  if (fs.existsSync(beUrlsPath)) {
    fs.copyFileSync(beUrlsPath, destPath);
  } else {
    console.error("❌ be-urls.ts not found in the repository.");
  }
}

module.exports = {
  clearDirectory,
  copyReachableFiles,
  copyBeUrls,
};


