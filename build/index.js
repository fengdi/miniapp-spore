
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require('fs');
const packageData = JSON.parse(fs.readFileSync('../package.json'));
const version = packageData.version;
const argv = process.argv.slice(2);

argv.push(`--define PACKAGE_VERSION=${version}`);

(async ()=>{
  await exec(`microbundle ${argv.join(' ')}`, {cwd:"../"});
})()


