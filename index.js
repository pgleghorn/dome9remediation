var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');
// AWS.config.update({region: 'eu-west-2'});

console.log(`Config loaded`);

async function addNameOriginTags(resourceId, tagNameValue) {
  var ec2 = new AWS.EC2();
  try {
    var params = {
      Resources: [
        resourceId
      ],
      Tags: [
        {
          Key: "Name",
          Value: tagNameValue
        },
	{
	  Key: "Origin",
	  Value: "Created by pang " + new Date().toISOString()
	}
      ]
    };
    let rTag = await ec2.createTags(params).promise();
    console.log(rTag);
  } catch (e) {
    console.log(e);
  }
}

/*
Remediation1

Rule name:
Ensure AWS NAT Gateways are being utilized instead of the default route

Description:
NAT Gateway is a scalable and resilient method for allowing outbound internet traffic from your private VPC subnets. It is recommended to use NAT gateways and not the default route which permits all traffic in Route Tables.

Remediation:
To create a NAT gateway:  1. Sign into the AWS console  2. In the console select the specific region    3. Navigate to VPC Dashboard  4. In the navigation pane select 'NAT Gateways'  5. Click 'Create NAT Gateway' Specify the subnet in which to create the NAT gateway and select the allocation ID of an Elastic IP address to associate with the NAT gateway. When you're done click 'Create a NAT Gateway'. The NAT gateway displays in the console. After a few moments its status changes to Available after which it's ready for you to use.    To update Route Table:  After you've created your NAT gateway you must update your route tables for your private subnets to point internet traffic to the NAT gateway. We use the most specific route that matches the traffic to determine how to route the traffic.  1. Sign into the AWS console  2. In the console select the region   3. Navigate to VPC Dashboard  4. In the navigation pane select 'Route Tables'  5. Select the reported route table associated with your private subnet   6. Select 'Routes' and Click 'Edit routes'  7. Replace the current route that points to the NAT instance with a route to the NAT gateway  8. Click 'Save routes'.
*/
async function remediation1() {
  console.log(`running remediation1`);
  var ec2 = new AWS.EC2();
  try {
    console.log(`allocating elastic IP`);
    let rIp = await ec2.allocateAddress({ Domain: "vpc" }).promise();
    console.log(rIp);
    await addNameOriginTags(rIp.AllocationId, "pang-vip");

    console.log(`creating default vpc`);
    let rVpc = await ec2.createDefaultVpc().promise();
    console.log(rVpc);
    await addNameOriginTags(rVpc.Vpc.VpcId, "pang-vpc");

	  /*
	   * creating a "default vpc" takes care of this, creates a subnet for each AZ, igw and attaches it
	   *
    console.log(`creating subnet`);
    let rSubnet = await ec2.createSubnet({ CidrBlock: "10.0.0.0/24", VpcId: rVpc.Vpc.VpcId }).promise();
    console.log(rSubnet);
    await addNameOriginTags(rSubnet.Subnet.SubnetId, "pang-subnet");

    console.log(`creating internet gateway`);
    let rIg = await ec2.createInternetGateway({}).promise();
    console.log(rIg);
    await addNameOriginTags(rIg.InternetGateway.InternetGatewayId, "pang-ig");

    console.log(`attaching internet gateway to vpc`);
    let rIgAttach = await ec2.attachInternetGateway({InternetGatewayId: rIg.InternetGateway.InternetGatewayId, VpcId: rVpc.Vpc.VpcId}).promise();
    console.log(rIgAttach);
	  */

    console.log(`fetching the subnets`);
    let rSubnets = await ec2.describeSubnets().promise();
    console.log(rSubnets);

    let firstSubnetId = rSubnets.Subnets[0].SubnetId;
    await addNameOriginTags(firstSubnetId, "pang-firstSubnet");

    console.log(`creating NAT gateway to first subnet ${firstSubnetId}`);
    let rNat = await ec2.createNatGateway({ AllocationId: rIp.AllocationId, SubnetId: firstSubnetId }).promise();
    console.log(rNat);
    await addNameOriginTags(rNat.NatGateway.NatGatewayId, "pang-nat");

  } catch (e) {
    console.log(e);
  }
}

(async function () {
  remediation1();
}());
