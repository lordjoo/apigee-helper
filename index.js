#!/usr/bin/env node

const { Command } = require('commander');
const {prepareToBundle} = require("./actions/prepareToBundle");
const {extractPolicyFromXML} = require("./actions/extractPolicyFromXML");
const program = new Command();

program.name("apigee-helper")
    .description("Some Spells I made to help you develop apigee proxies")
    .version("0.0.1")

program.command('prepareToBundle')
    .description("Prepare your proxy to be bundled, app the main proxy.xml file ")
    .argument("<proxyPath>", "The path to the proxy folder")
    .option("-n, --displayName <string> ","Proxy Display Name")
    .option("-v <integer>","Proxy Revision Number")
    .option("-d <string>","Proxy Description")
    .option("-p, --basePath <string>","Proxy Description")
    .option("-c, --createdBy <string>","Proxy Description")
    .action(prepareToBundle)


program.command("extractFromXML")
    .description("Generate EV Policy for XML Payload")
    .argument("<proxyPath>", "The path to the proxy folder")
    .option("-n, --name <string>","Policy Name")
    .option("-i, --input <string>","Input XML File")
    .action(extractPolicyFromXML)


program.parse();
