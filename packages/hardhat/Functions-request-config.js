const fs = require("fs");
const path = require("path");
const { Location, ReturnType, CodeLanguage } = require("@chainlink/functions-toolkit");

let ArgsArray = [];
const getAthleteScript = path.join(process.cwd(), "packages/hardhat/scripts/APICallsJS/getAthleteData.js");

// Configure the request by setting the fields below
const requestConfig = {
  // String containing the source code to be executed
  source: fs.readFileSync(getAthleteScript).toString(),
  // Location of source code (only Inline is currently supported)
  codeLocation: Location.Inline,
  // Optional. Secrets can be accessed within the source code with `secrets.varName` (ie: secrets.apiKey). The secrets object can only contain string values.
  secrets: { accessToken: "d24b0c1d3bb679473170d46b6b32b40ae7246797" },
  // Optional if secrets are expected in the sourceLocation of secrets (only Remote or DONHosted is supported)
  secretsLocation: Location.DONHosted,
  // Args (string only array) can be accessed within the source code with `args[index]` (ie: args[0]).
  args: ["116415"],
  // Code language (only JavaScript is currently supported)
  codeLanguage: CodeLanguage.JavaScript,
  // Expected type of the returned value
  expectedReturnType: ReturnType.bytes,
};

module.exports = requestConfig;
