# pang
Node utility to implement dome9 aws remediations, aka PANG "Phils Amazon Network Generator"

# remediation 1
"Ensure AWS NAT Gateways are being utilized instead of the default route" -
This creates a vpc with 10.0.0.0/24 address range and a nat gateway. It creates the supporting resources such as elastic ip, subnet with same address range 10.0.0.0/24, internet gateway, and route table. All resources are named like "pang-<resource>" and have an Origin tag with creation date.

# usage

 * cp config.json,tmpl config.json and update with aws secret key
 * npm install
 * npm start

# references

 * how to set region - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html
 * how to load credentials - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
