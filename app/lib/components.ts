import type { CloudComponent, CloudProvider } from "~/types";
import type { IconName } from "./icons";

export const cloudComponents: Record<CloudProvider, CloudComponent[]> = {
  aws: [
    {
      id: "aws-ec2",
      name: "EC2 Instance",
      icon: "Server" satisfies IconName,
      category: "compute",
      provider: "aws",
      description: "Virtual server in the cloud",
      fields: [
        {
          name: "instanceType",
          label: "Instance Type",
          type: "select",
          default: "t2.micro",
          options: [
            "t2.micro",
            "t2.small",
            "t2.medium",
            "t3.micro",
            "t3.small",
            "t3.medium",
          ],
        },
        {
          name: "ami",
          label: "AMI ID",
          type: "string",
          default: "ami-0c55b159cbfafe1f0",
        },
        {
          name: "region",
          label: "Region",
          type: "select",
          default: "us-east-1",
          options: ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"],
        },
      ],
    },
    {
      id: "aws-lambda",
      name: "Lambda Function",
      icon: "Zap" satisfies IconName,
      category: "compute",
      provider: "aws",
      description: "Serverless compute service",
      fields: [
        {
          name: "runtime",
          label: "Runtime",
          type: "select",
          default: "nodejs20.x",
          options: ["nodejs20.x", "python3.11", "python3.12", "java17"],
        },
        {
          name: "timeout",
          label: "Timeout (seconds)",
          type: "number",
          default: 30,
        },
        { name: "memory", label: "Memory (MB)", type: "number", default: 128 },
      ],
    },
    {
      id: "aws-vpc",
      name: "VPC",
      icon: "Network" satisfies IconName,
      category: "network",
      provider: "aws",
      description: "Virtual Private Cloud",
      fields: [
        {
          name: "cidrBlock",
          label: "CIDR Block",
          type: "string",
          default: "10.0.0.0/16",
        },
        {
          name: "enableDnsHostnames",
          label: "Enable DNS Hostnames",
          type: "boolean",
          default: true,
        },
      ],
    },
    {
      id: "aws-s3",
      name: "S3 Bucket",
      icon: "Archive" satisfies IconName,
      category: "storage",
      provider: "aws",
      description: "Object storage service",
      fields: [
        {
          name: "bucketName",
          label: "Bucket Name",
          type: "string",
          default: "my-bucket",
        },
        {
          name: "acl",
          label: "ACL",
          type: "select",
          default: "private",
          options: ["private", "public-read", "authenticated-read"],
        },
      ],
    },
    {
      id: "aws-rds",
      name: "RDS Database",
      icon: "Database" satisfies IconName,
      category: "database",
      provider: "aws",
      description: "Managed relational database",
      fields: [
        {
          name: "engine",
          label: "Engine",
          type: "select",
          default: "mysql",
          options: ["mysql", "postgres", "mariadb", "aurora-mysql"],
        },
        {
          name: "instanceClass",
          label: "Instance Class",
          type: "select",
          default: "db.t3.micro",
          options: ["db.t3.micro", "db.t3.small", "db.t3.medium"],
        },
        {
          name: "allocatedStorage",
          label: "Allocated Storage (GB)",
          type: "number",
          default: 20,
        },
      ],
    },
    {
      id: "aws-sg",
      name: "Security Group",
      icon: "Shield" satisfies IconName,
      category: "security",
      provider: "aws",
      description: "Virtual firewall",
      fields: [
        {
          name: "description",
          label: "Description",
          type: "string",
          default: "Security group",
        },
      ],
    },
    {
      id: "aws-elb",
      name: "Load Balancer",
      icon: "GitBranch" satisfies IconName,
      category: "network",
      provider: "aws",
      description: "Elastic Load Balancer",
      fields: [
        {
          name: "loadBalancerType",
          label: "Type",
          type: "select",
          default: "application",
          options: ["application", "network", "gateway"],
        },
        {
          name: "scheme",
          label: "Scheme",
          type: "select",
          default: "internet-facing",
          options: ["internet-facing", "internal"],
        },
      ],
    },
    {
      id: "aws-route53",
      name: "Route 53",
      icon: "Globe" satisfies IconName,
      category: "dns",
      provider: "aws",
      description: "DNS service",
      fields: [
        {
          name: "domainName",
          label: "Domain Name",
          type: "string",
          default: "example.com",
        },
        {
          name: "recordType",
          label: "Record Type",
          type: "select",
          default: "A",
          options: ["A", "AAAA", "CNAME", "MX"],
        },
      ],
    },
    {
      id: "aws-subnet",
      name: "Subnet",
      icon: "Layers" satisfies IconName,
      category: "network",
      provider: "aws",
      description: "VPC subnet",
      fields: [
        {
          name: "cidrBlock",
          label: "CIDR Block",
          type: "string",
          default: "10.0.1.0/24",
        },
        {
          name: "availabilityZone",
          label: "Availability Zone",
          type: "select",
          default: "us-east-1a",
          options: ["us-east-1a", "us-east-1b", "us-east-1c"],
        },
        {
          name: "isPublic",
          label: "Public Subnet",
          type: "boolean",
          default: true,
        },
      ],
    },
    {
      id: "aws-iam-role",
      name: "IAM Role",
      icon: "KeyRound" satisfies IconName,
      category: "security",
      provider: "aws",
      description: "Identity and access management role",
      fields: [
        {
          name: "roleName",
          label: "Role Name",
          type: "string",
          default: "my-role",
        },
        {
          name: "service",
          label: "Trusted Service",
          type: "select",
          default: "ec2.amazonaws.com",
          options: [
            "ec2.amazonaws.com",
            "lambda.amazonaws.com",
            "ecs-tasks.amazonaws.com",
          ],
        },
      ],
    },
    {
      id: "aws-cloudfront",
      name: "CloudFront",
      icon: "Globe" satisfies IconName,
      category: "network",
      provider: "aws",
      description: "Content delivery network",
      fields: [
        {
          name: "priceClass",
          label: "Price Class",
          type: "select",
          default: "PriceClass_100",
          options: ["PriceClass_100", "PriceClass_200", "PriceClass_All"],
        },
        {
          name: "defaultTtl",
          label: "Default TTL (seconds)",
          type: "number",
          default: 86400,
        },
      ],
    },
    {
      id: "aws-sns",
      name: "SNS Topic",
      icon: "Mail" satisfies IconName,
      category: "compute",
      provider: "aws",
      description: "Simple Notification Service",
      fields: [
        {
          name: "topicName",
          label: "Topic Name",
          type: "string",
          default: "my-topic",
        },
        {
          name: "fifoTopic",
          label: "FIFO Topic",
          type: "boolean",
          default: false,
        },
      ],
    },
    {
      id: "aws-sqs",
      name: "SQS Queue",
      icon: "MessageSquare" satisfies IconName,
      category: "compute",
      provider: "aws",
      description: "Simple Queue Service",
      fields: [
        {
          name: "queueName",
          label: "Queue Name",
          type: "string",
          default: "my-queue",
        },
        {
          name: "fifoQueue",
          label: "FIFO Queue",
          type: "boolean",
          default: false,
        },
        {
          name: "visibilityTimeout",
          label: "Visibility Timeout (s)",
          type: "number",
          default: 30,
        },
      ],
    },
    {
      id: "aws-ecs",
      name: "ECS Cluster",
      icon: "Container" satisfies IconName,
      category: "compute",
      provider: "aws",
      description: "Elastic Container Service",
      fields: [
        {
          name: "clusterName",
          label: "Cluster Name",
          type: "string",
          default: "my-cluster",
        },
        {
          name: "capacityProvider",
          label: "Capacity Provider",
          type: "select",
          default: "FARGATE",
          options: ["FARGATE", "FARGATE_SPOT", "EC2"],
        },
      ],
    },
  ],
  gcp: [
    {
      id: "gcp-compute",
      name: "Compute Engine",
      icon: "Server" satisfies IconName,
      category: "compute",
      provider: "gcp",
      description: "Virtual machine instance",
      fields: [
        {
          name: "machineType",
          label: "Machine Type",
          type: "select",
          default: "e2-micro",
          options: ["e2-micro", "e2-small", "e2-medium", "n1-standard-1"],
        },
        {
          name: "zone",
          label: "Zone",
          type: "select",
          default: "us-central1-a",
          options: ["us-central1-a", "us-east1-b", "europe-west1-c"],
        },
      ],
    },
    {
      id: "gcp-gcs",
      name: "Cloud Storage",
      icon: "Archive" satisfies IconName,
      category: "storage",
      provider: "gcp",
      description: "Object storage",
      fields: [
        {
          name: "bucketName",
          label: "Bucket Name",
          type: "string",
          default: "my-bucket",
        },
        {
          name: "storageClass",
          label: "Storage Class",
          type: "select",
          default: "STANDARD",
          options: ["STANDARD", "NEARLINE", "COLDLINE"],
        },
      ],
    },
    {
      id: "gcp-cloudsql",
      name: "Cloud SQL",
      icon: "Database" satisfies IconName,
      category: "database",
      provider: "gcp",
      description: "Managed database service",
      fields: [
        {
          name: "databaseVersion",
          label: "Database Version",
          type: "select",
          default: "MYSQL_8_0",
          options: ["MYSQL_8_0", "POSTGRES_15", "POSTGRES_14"],
        },
        {
          name: "tier",
          label: "Tier",
          type: "select",
          default: "db-f1-micro",
          options: ["db-f1-micro", "db-g1-small"],
        },
      ],
    },
    {
      id: "gcp-function",
      name: "Cloud Function",
      icon: "Zap" satisfies IconName,
      category: "compute",
      provider: "gcp",
      description: "Serverless function",
      fields: [
        {
          name: "runtime",
          label: "Runtime",
          type: "select",
          default: "nodejs20",
          options: ["nodejs20", "python312", "go121", "java17"],
        },
        { name: "memory", label: "Memory (MB)", type: "number", default: 256 },
      ],
    },
    {
      id: "gcp-vpc",
      name: "VPC Network",
      icon: "Network" satisfies IconName,
      category: "network",
      provider: "gcp",
      description: "Virtual Private Cloud network",
      fields: [
        {
          name: "autoCreateSubnetworks",
          label: "Auto Create Subnets",
          type: "boolean",
          default: true,
        },
      ],
    },
    {
      id: "gcp-gke",
      name: "GKE Cluster",
      icon: "Container" satisfies IconName,
      category: "compute",
      provider: "gcp",
      description: "Google Kubernetes Engine",
      fields: [
        {
          name: "initialNodeCount",
          label: "Initial Node Count",
          type: "number",
          default: 3,
        },
        {
          name: "machineType",
          label: "Machine Type",
          type: "select",
          default: "e2-medium",
          options: ["e2-medium", "e2-standard-2", "n1-standard-2"],
        },
      ],
    },
  ],
  azure: [
    {
      id: "azure-vm",
      name: "Virtual Machine",
      icon: "Server" satisfies IconName,
      category: "compute",
      provider: "azure",
      description: "Windows or Linux VM",
      fields: [
        {
          name: "vmSize",
          label: "VM Size",
          type: "select",
          default: "Standard_B1s",
          options: ["Standard_B1s", "Standard_B2s", "Standard_DS1_v2"],
        },
        {
          name: "adminUsername",
          label: "Admin Username",
          type: "string",
          default: "admin",
        },
      ],
    },
    {
      id: "azure-storage",
      name: "Storage Account",
      icon: "Warehouse" satisfies IconName,
      category: "storage",
      provider: "azure",
      description: "Blob, file, and table storage",
      fields: [
        {
          name: "accountType",
          label: "Account Type",
          type: "select",
          default: "Standard_LRS",
          options: ["Standard_LRS", "Standard_GRS", "Premium_LRS"],
        },
      ],
    },
    {
      id: "azure-sql",
      name: "Azure SQL",
      icon: "Database" satisfies IconName,
      category: "database",
      provider: "azure",
      description: "Managed SQL database",
      fields: [
        {
          name: "skuName",
          label: "SKU Name",
          type: "select",
          default: "Basic",
          options: ["Basic", "Standard", "Premium"],
        },
      ],
    },
    {
      id: "azure-vnet",
      name: "Virtual Network",
      icon: "Network" satisfies IconName,
      category: "network",
      provider: "azure",
      description: "Azure Virtual Network",
      fields: [
        {
          name: "addressSpace",
          label: "Address Space",
          type: "string",
          default: "10.0.0.0/16",
        },
      ],
    },
    {
      id: "azure-function",
      name: "Azure Functions",
      icon: "Zap" satisfies IconName,
      category: "compute",
      provider: "azure",
      description: "Serverless compute",
      fields: [
        {
          name: "runtime",
          label: "Runtime",
          type: "select",
          default: "node",
          options: ["node", "python", "dotnet", "java"],
        },
      ],
    },
    {
      id: "azure-aks",
      name: "AKS Cluster",
      icon: "Container" satisfies IconName,
      category: "compute",
      provider: "azure",
      description: "Azure Kubernetes Service",
      fields: [
        { name: "nodeCount", label: "Node Count", type: "number", default: 3 },
        {
          name: "vmSize",
          label: "VM Size",
          type: "select",
          default: "Standard_DS2_v2",
          options: ["Standard_DS2_v2", "Standard_B2s", "Standard_D4s_v3"],
        },
      ],
    },
  ],
};

export function getComponentsByProvider(
  provider: CloudProvider,
): CloudComponent[] {
  return cloudComponents[provider] || [];
}

export function getComponentsByCategory(
  provider: CloudProvider,
  category: string,
): CloudComponent[] {
  return (
    cloudComponents[provider]?.filter((c) => c.category === category) || []
  );
}
