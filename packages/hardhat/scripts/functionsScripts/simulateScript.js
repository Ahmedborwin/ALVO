const { simulateScript, decodeResult } = require("@chainlink/functions-toolkit");
const path = require("path");
const process = require("process");
const fs = require("fs");

// Default path to the Functions request config file
const defaultConfigPath = path.join(__dirname, "../../Functions-request-config.js");

// Get the config path from the command line arguments or use the default
const args = process.argv.slice(2);
let configPath = defaultConfigPath;
if (args[0]) {
  configPath = path.isAbsolute(args[0]) ? args[0] : path.join(process.cwd(), args[0]);
}

// Check if the config file exists
if (!fs.existsSync(configPath)) {
  console.error(`Configuration file not found: ${configPath}`);
  process.exit(1);
}

// Load the configuration
const requestConfig = require(configPath);

// Simulate the JavaScript execution locally
(async () => {
  try {
    const { responseBytesHexstring, errorString, capturedTerminalOutput } = await simulateScript(requestConfig);
    console.log(`${capturedTerminalOutput}\n`);
    if (responseBytesHexstring) {
      console.log(
        `Response returned by script during local simulation: ${decodeResult(
          responseBytesHexstring,
          requestConfig.expectedReturnType,
        ).toString()}\n`,
      );
    }
    if (errorString) {
      console.log(`Error returned by simulated script:\n${errorString}\n`);
    }
  } catch (error) {
    console.error(`Error during script simulation: ${error.message}`);
  }
})();
