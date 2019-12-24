// how to set region - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-region.html
// how to load credentials - https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/setting-credentials-node.html
// how to change region - AWS.config.update({region: 'eu-west-2'});


var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
var ec2 = new AWS.EC2();

console.log(`Config loaded`);

(async function() {
  try {
    console.log(`allocating elastic IP`);
    var params = {
      Domain: "vpc"
    };
    let ra = await ec2.allocateAddress(params).promise();
    console.log(ra);
  } catch (e) {
    console.log(e);
  }
}());
