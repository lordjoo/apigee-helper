const fs = require("fs");
const path = require("path");
const prompts = require('prompts');
const chalk = require('chalk');
const {XMLValidator,XMLParser} = require("fast-xml-parser");

function flattenObj(obj, parent, res = {}){
    for(let key in obj){
        let propName = parent ? parent + '/' + key : key;
        if(typeof obj[key] == 'object'){
            flattenObj(obj[key], propName, res);
        } else {

            res[propName] = obj[key];
        }
    }
    return res;
}


module.exports.extractPolicyFromXML = async (str, options) => {
    let requiredOptions = ["name"];
    let missingOptions = requiredOptions.filter((option) => !options[option]);
    if (missingOptions.length > 0) {
        console.error(chalk.red(`Missing required options: ${missingOptions.join(", ")}`));
        return;
    }

    let xmlData = "";

    if (options.input) {
        let inputPath = path.join(options.input);
        if (!fs.existsSync(inputPath)) {
            console.error(chalk.red(`Input file ${inputPath} does not exist`));
            return;
        }
        xmlData = fs.readFileSync(inputPath, "utf8");
    } else {    
        const _xmlData = await prompts({
            type: 'text',
            name: 'value',
            message: 'Enter The XML Payload'
        });
        xmlData = _xmlData.value;
    }

    const isValid = XMLValidator.validate(xmlData);
    if (!isValid) {
        console.error(chalk.red("Invalid XML"));
        return;
    }

    let parserOptions = {
        ignoreAttributes: false,
        attributeNamePrefix : "@_"
    };
    const parser = new XMLParser(parserOptions);
    let jsonObj = parser.parse(xmlData);
    let rootKey = Object.keys(jsonObj)[0];
    jsonObj = flattenObj(jsonObj);
    let namespacesKeys = Object.keys(jsonObj).filter((key) => key.includes("@_xmlns:"));
    let namespacesXMLStr = "";
    namespacesKeys.forEach((key) => {
        let namespace = key.split("@_xmlns:")[1];
        namespacesXMLStr += `
            <Namespace prefix="${key.split("@_xmlns:")[1]}">${jsonObj[key]}</Namespace>
`;

    });

    let variablesXMLStr = "";
    let variablesKeys = Object.keys(jsonObj).filter(
        (key) => !key.includes("@_xmlns") || !key.includes("#text")
    );

    variablesKeys.forEach((key) => {
        let variableName = key.replaceAll(rootKey,"");
        variableName = variableName.replace("/","")
            .replaceAll("/",".");
        variableName = variableName.replaceAll(/(\w+):/g,"");
        variablesXMLStr += `
            <Variable name="${variableName}">
                <XPath>/${key}/text()</XPath>
            </Variable>
`;
    });

    let policyStub = fs.readFileSync(path.join(__dirname,"../stubs/evPolicy.stub"),"utf8");
    policyStub = policyStub.replaceAll("{{policyName}}",options.name)
        .replace("{{namespaces}}",namespacesXMLStr)
        .replace("{{variables}}",variablesXMLStr);

    if (!fs.existsSync(path.join(str,"policies"))) {
        fs.mkdirSync(path.join(str,"policies"));
    }
    fs.writeFileSync(path.join(path.join(str,"policies"),`${options.name}.xml`),policyStub);
    console.log(chalk.green("Policy Generated Successfully"));
}
