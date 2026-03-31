import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateAWSPulumi(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== AWS Infrastructure ====================
      case "aws-region":
        code += `// AWS Region: ${config.regionName || "us-east-1"}
`;
        break;

      case "aws-az":
        code += `// Availability Zone: ${config.azName || "us-east-1a"}
`;
        break;

      // ==================== AWS Compute ====================
      case "aws-ec2":
        code += `
const ${resourceName} = new aws.ec2.Instance("${resourceName}", {
  ami: "${config.ami || "ami-0c55b159cbfafe1f0"}",
  instanceType: "${config.instanceType || "t2.micro"}",
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-lambda":
        code += `
const ${resourceName} = new aws.lambda.Function("${resourceName}", {
  runtime: "${config.runtime || "nodejs20.x"}",
  timeout: ${config.timeout || 30},
  memorySize: ${config.memory || 128},
  handler: "index.handler",
  role: ${resourceName}Role.arn,
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-ecs":
        code += `
const ${resourceName} = new aws.ecs.Cluster("${resourceName}", {
  name: "${config.clusterName || "my-cluster"}",
  settings: [{ name: "containerInsights", value: "enabled" }],
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-sns":
        code += `
const ${resourceName} = new aws.sns.Topic("${resourceName}", {
  name: "${config.topicName || "my-topic"}${config.fifoTopic ? ".fifo" : ""}",
  fifoTopic: ${config.fifoTopic ?? false},
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-sqs":
        code += `
const ${resourceName} = new aws.sqs.Queue("${resourceName}", {
  name: "${config.queueName || "my-queue"}${config.fifoQueue ? ".fifo" : ""}",
  fifoQueue: ${config.fifoQueue ?? false},
  visibilityTimeoutSeconds: ${config.visibilityTimeout || 30},
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== AWS Network ====================
      case "aws-vpc":
        code += `
const ${resourceName} = new aws.ec2.Vpc("${resourceName}", {
  cidrBlock: "${config.cidrBlock || "10.0.0.0/16"}",
  enableDnsHostnames: ${config.enableDnsHostnames ?? true},
  enableDnsSupport: true,
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-subnet":
        code += `
const ${resourceName} = new aws.ec2.Subnet("${resourceName}", {
  vpcId: mainVpc.id,
  cidrBlock: "${config.cidrBlock || "10.0.1.0/24"}",
  availabilityZone: "${config.availabilityZone || "us-east-1a"}",
  mapPublicIpOnLaunch: ${config.isPublic ?? true},
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-elb":
        code += `
const ${resourceName} = new aws.lb.LoadBalancer("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  internal: ${config.scheme === "internal"},
  loadBalancerType: "${config.loadBalancerType || "application"}",
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-cloudfront":
        code += `
const ${resourceName} = new aws.cloudfront.Distribution("${resourceName}", {
  enabled: true,
  isIpv6Enabled: true,
  priceClass: "${config.priceClass || "PriceClass_100"}",
  defaultRootObject: "index.html",
  origins: [{
    domainName: "example.s3.amazonaws.com",
    originId: "S3-${resourceName}",
  }],
  defaultCacheBehavior: {
    allowedMethods: ["GET", "HEAD"],
    cachedMethods: ["GET", "HEAD"],
    targetOriginId: "S3-${resourceName}",
    viewerProtocolPolicy: "redirect-to-https",
    defaultTtl: ${config.defaultTtl || 86400},
    forwardedValues: { queryString: false, cookies: { forward: "none" } },
  },
  restrictions: { geoRestriction: { restrictionType: "none" } },
  viewerCertificate: { cloudfrontDefaultCertificate: true },
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-route53":
        code += `
const ${resourceName}Zone = new aws.route53.Zone("${resourceName}Zone", {
  name: "${config.domainName || "example.com"}",
  tags: { Name: "${resourceName}" },
});

const ${resourceName}Record = new aws.route53.Record("${resourceName}Record", {
  zoneId: ${resourceName}Zone.zoneId,
  name: "${config.domainName || "example.com"}",
  type: "${config.recordType || "A"}",
  ttl: 300,
  records: ["192.0.2.1"],
});
`;
        break;

      // ==================== AWS Storage ====================
      case "aws-s3":
        code += `
const ${resourceName} = new aws.s3.Bucket("${resourceName}", {
  bucket: "${config.bucketName || "my-bucket"}",
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== AWS Database ====================
      case "aws-rds":
        code += `
const ${resourceName} = new aws.rds.Instance("${resourceName}", {
  identifier: "${toSnakeCase(resourceName)}",
  engine: "${config.engine || "mysql"}",
  instanceClass: "${config.instanceClass || "db.t3.micro"}",
  allocatedStorage: ${config.allocatedStorage || 20},
  username: "admin",
  password: config.requireSecret("rdsPassword"),
  skipFinalSnapshot: true,
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== AWS Security ====================
      case "aws-sg":
        code += `
const ${resourceName} = new aws.ec2.SecurityGroup("${resourceName}", {
  name: "${resourceName}",
  description: "${config.description || "Security group"}",
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "aws-iam-role":
        code += `
const ${resourceName} = new aws.iam.Role("${resourceName}", {
  name: "${config.roleName || "my-role"}",
  assumeRolePolicy: JSON.stringify({
    Version: "2012-10-17",
    Statement: [{
      Action: "sts:AssumeRole",
      Effect: "Allow",
      Principal: { Service: "${config.service || "ec2.amazonaws.com"}" },
    }],
  }),
  tags: { Name: "${resourceName}" },
});
`;
        break;
    }
  });

  return code;
}
