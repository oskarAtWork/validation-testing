const path = require('path');
const { clearDirectory, copyReachableFiles, copyBeUrls } = require('./utils');

if (!process.env.LOCAL_PP_FE_PATH) {
  console.error("❌ LOCAL_PP_FE_PATH environment variable is not set. Create a .env file in the root of the project and add LOCAL_PP_FE_PATH=<path_to_your_local_PP_FE>.");
  console.error("💡 Example: LOCAL_PP_FE_PATH=/Users/yourusername/Projects/ROSS-MVProfilePages-Frontend/");
  process.exit(1);
}

const OUTPUT_DIR = path.join(__dirname, 'src', 'validation');
const VALIDATION_DIR = path.join(process.env.LOCAL_PP_FE_PATH, 'backend/src/validation');
const ENTRY_FILE = 'app-settings.ts';

console.log("🧹 Cleaning up src/validation");
clearDirectory(OUTPUT_DIR);
console.log("🧱 Putting new files into folder src/validation");
copyReachableFiles(ENTRY_FILE, VALIDATION_DIR, OUTPUT_DIR);
console.log("🧱 Copying be-urls.json");
copyBeUrls(process.env.LOCAL_PP_FE_PATH);
console.log("✅ appsettings.ts and its dependencies copied successfully!\n");