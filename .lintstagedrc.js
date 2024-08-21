const path = require("path");

const buildReactEslintCommand = (filenames) =>
  `yarn react:lint --fix --file ${filenames
    .map((f) => path.relative(path.join("packages", "reactjs"), f))
    .join(" --file ")}`;

const checkTypesReactCommand = () => "yarn react:check-types";

const buildHardhatEslintCommand = (filenames) =>
  `yarn hardhat:lint-staged --fix ${filenames
    .map((f) => path.relative(path.join("packages", "hardhat"), f))
    .join(" ")}`;

module.exports = {
  "packages/reactjs/**/*.{ts,tsx}": [
    buildReactEslintCommand,
    checkTypesReactCommand,
  ],
  "packages/hardhat/**/*.{ts,tsx}": [buildHardhatEslintCommand],
};
