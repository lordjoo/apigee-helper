const fs = require('fs');
const path = require('path');
const policiesFolder = "policies";
const proxiesFolder = "proxies";
const targetsFolder = "targets";
const chalk = require('chalk');


/**
 *
 * @param proxyPath (string) The path to the proxy folder
 * @param options (object) The options object
 */
module.exports.prepareToBundle = function (proxyPath,options) {
    let requiredOptions = ["displayName","v",'basePath'];
    let pathDir = path.resolve(proxyPath);
    if (!fs.existsSync(pathDir)) {
        console.error("The path does not exist");
        return;
    }

    console.log(options)
    // check if a required option is missing
    let missingOptions = requiredOptions.filter(option => !options[option]);
    if (missingOptions.length > 0) {
        console.error(chalk.red("Missing required options: " + missingOptions.join(",")));
        return;
    }

    let revision = options.v;
    let displayName = options.displayName;
    let description = options.d || displayName + " Proxy";
    let basePath = options.basePath;
    let createdBy = options.createdBy || "apigee-toolkit";

    let policies = fs.readdirSync(path.join(pathDir,policiesFolder));
    let proxies = fs.readdirSync(path.join(pathDir,proxiesFolder));
    let targets = fs.readdirSync(path.join(pathDir,targetsFolder));

    console.log(chalk.yellow("Proxy has " + policies.length + " policies"));
    console.log(chalk.yellow("Proxy has " + proxies.length + " proxies"));
    console.log(chalk.yellow("Proxy has " + targets.length + " targets"));

    let policiesXML = '';
    let proxiesXML = '';
    let targetsXML = '';

    policies.forEach(policy => {
        policiesXML += `<Policy>${policy.replaceAll('.xml','')}</Policy>
`;
    });

    proxies.forEach(proxy => {
        proxiesXML += `<ProxyEndpoint>${proxy.replaceAll('.xml','')}</ProxyEndpoint>
`;
    });

    targets.forEach(target => {
        targetsXML += `<TargetEndpoint>${target.replaceAll('.xml','')}</TargetEndpoint>
`;
    });

    let stubText = fs.readFileSync(path.join(__dirname,"../stubs/proxyFile.stub"),'utf8');
    stubText = stubText
        .replace('{{policies}}',policiesXML)
        .replace('{{proxyEndpoints}}',proxiesXML)
        .replace('{{targetEndpoints}}',targetsXML)
        .replaceAll('{{displayName}}',displayName)
        .replace('{{revision}}',revision)
        .replace('{{description}}',description)
        .replace('{{basePath}}',basePath)
        .replace('{{createdBy}}',createdBy);

    fs.writeFileSync(path.join(pathDir,"proxy.xml"),stubText);

    console.log(chalk.green("Proxy.xml file created successfully"));
}


