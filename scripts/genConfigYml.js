const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const config = require("../config.json");

const srcFile = path.join(__dirname, "../_config_tmp.yml");
const targetFile = path.join(__dirname, "../_config.yml");
try {
  const data = yaml.load(fs.readFileSync(srcFile, "utf8"));
  Object.assign(data.deploy, config.deploy);
  fs.writeFileSync(targetFile, yaml.dump(data));
  console.log("yml file generated successfully");
} catch (err) {
  console.log("yml file generation failure", err);
}
