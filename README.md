# Apogi
Apogi is a small Node CLI that helps Apigee Eng make their life easier while they're developing
in a local env and have to deploy on private Apigee edge env

## Commands
Run ```npx apogi ``` to see all the commands available

1. Prepare for bundle
   When you are developing localy and want to deploy to a private Apigee edge instance, you have to bundle your proxy into a .zip archive and upload it, and to do so you must create a custom XML file to define your proxy information and  the policies for your proxy, it's like a proxy definition,   
This command will generate this file for you     
```
npx apogi prepareToBundle [proxyPath] --displayName <string> -v <reveisionNumber> --basePath <proxyBasePath> --createdBy <creatorEmail>
```
- proxyPath is the directory where your proxy lies in (where the 3 main folders exists, policies,proxies,targets)

2. Extract Varaibles From XML
This command asks you for a XML Payloa dand generate a EV policy for you :-)
```
npx apogi extractFromXML [proxyPath] --name <policyName>
```

