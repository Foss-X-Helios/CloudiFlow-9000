import type { CloudComponent, ComponentCategory } from "~/types";

// Fallback category rules (used when connectsTo is not defined)
export const CATEGORY_RULES: Record<ComponentCategory, ComponentCategory[]> = {
  infrastructure: ["infrastructure", "network", "compute"],
  compute: ["network", "storage", "database", "security", "dns"],
  network: ["compute", "security", "dns", "network"],
  storage: ["compute", "security"],
  database: ["compute", "security", "network"],
  security: ["compute", "network", "storage", "database"],
  dns: ["network", "compute"],
};

/**
 * Check if a connection from source to target is valid.
 * Uses component-level connectsTo if available, falls back to category rules.
 */
export function isValidConnection(
  sourceComponent: CloudComponent,
  targetComponent: CloudComponent,
): boolean {
  // If source has explicit connectsTo rules, use those
  if (sourceComponent.connectsTo.length > 0) {
    return sourceComponent.connectsTo.includes(targetComponent.id);
  }

  // Fallback to category-based rules
  const allowed = CATEGORY_RULES[sourceComponent.category];
  return allowed ? allowed.includes(targetComponent.category) : false;
}

/**
 * Get a human-readable explanation of why a connection is valid/invalid
 */
export function getConnectionHint(
  sourceComponent: CloudComponent,
  targetComponent: CloudComponent,
): string {
  if (isValidConnection(sourceComponent, targetComponent)) {
    return getValidConnectionExplanation(sourceComponent, targetComponent);
  }
  return getInvalidConnectionExplanation(sourceComponent, targetComponent);
}

function getValidConnectionExplanation(
  source: CloudComponent,
  target: CloudComponent,
): string {
  const hints: Record<string, string> = {
    // AWS
    "aws-ec2→aws-vpc":
      "EC2 instances run inside a VPC. This is required for networking.",
    "aws-ec2→aws-sg":
      "Security Groups act as a firewall for your EC2 instance.",
    "aws-ec2→aws-s3": "EC2 can read/write to S3 buckets (needs IAM role).",
    "aws-ec2→aws-rds": "EC2 connects to RDS for database access.",
    "aws-ec2→aws-subnet": "EC2 instances are launched in a specific subnet.",
    "aws-ec2→aws-iam-role":
      "EC2 needs an IAM role for AWS service permissions.",
    "aws-vpc→aws-subnet":
      "Subnets divide the VPC into smaller network segments.",
    "aws-vpc→aws-sg": "Security Groups are associated with a VPC.",
    "aws-elb→aws-ec2":
      "Load Balancer distributes traffic across EC2 instances.",
    "aws-elb→aws-vpc": "Load Balancer needs to be in a VPC.",
    "aws-elb→aws-sg": "Load Balancer needs Security Group for access control.",
    "aws-route53→aws-elb": "Route53 DNS points to the Load Balancer.",
    "aws-route53→aws-cloudfront":
      "Route53 can point to CloudFront distribution.",
    "aws-cloudfront→aws-s3": "CloudFront serves static content from S3.",
    "aws-cloudfront→aws-elb": "CloudFront can use Load Balancer as origin.",
    "aws-lambda→aws-s3": "Lambda can be triggered by S3 events.",
    "aws-lambda→aws-sqs": "Lambda can process messages from SQS queue.",
    "aws-lambda→aws-sns": "Lambda can be triggered by SNS notifications.",
    "aws-lambda→aws-rds": "Lambda can query RDS databases.",
    "aws-lambda→aws-iam-role": "Lambda needs an IAM execution role.",
    "aws-sns→aws-sqs": "SNS can fan out messages to SQS queues.",
    "aws-sns→aws-lambda": "SNS can trigger Lambda functions.",
    "aws-sqs→aws-lambda": "SQS queues can trigger Lambda processing.",
    "aws-ecs→aws-vpc": "ECS tasks run inside a VPC.",
    "aws-ecs→aws-elb": "ECS services use Load Balancer for traffic.",
    "aws-ecs→aws-iam-role": "ECS tasks need IAM roles for permissions.",
    "aws-subnet→aws-ec2": "Subnet hosts EC2 instances.",
    "aws-sg→aws-ec2": "Security Group protects EC2 instances.",
    "aws-sg→aws-rds": "Security Group controls database access.",
    "aws-sg→aws-elb": "Security Group controls load balancer access.",
    "aws-iam-role→aws-ec2": "IAM Role grants permissions to EC2.",
    "aws-iam-role→aws-lambda": "IAM Role grants permissions to Lambda.",
    "aws-iam-role→aws-ecs": "IAM Role grants permissions to ECS tasks.",
    // GCP
    "gcp-compute→gcp-vpc": "Compute Engine instances run in a VPC network.",
    "gcp-compute→gcp-gcs": "Compute Engine can access Cloud Storage.",
    "gcp-compute→gcp-cloudsql": "Compute Engine connects to Cloud SQL.",
    "gcp-function→gcp-gcs":
      "Cloud Functions can be triggered by Storage events.",
    "gcp-function→gcp-cloudsql": "Cloud Functions can access Cloud SQL.",
    "gcp-gke→gcp-vpc": "GKE clusters run in a VPC network.",
    "gcp-gke→gcp-cloudsql": "GKE pods can connect to Cloud SQL.",
    // Azure
    "azure-vm→azure-vnet": "VMs run inside a Virtual Network.",
    "azure-vm→azure-storage": "VMs can access Storage Accounts.",
    "azure-vm→azure-sql": "VMs connect to Azure SQL databases.",
    "azure-function→azure-storage":
      "Functions use Storage for triggers and state.",
    "azure-function→azure-sql": "Functions can query Azure SQL.",
    "azure-aks→azure-vnet": "AKS clusters run in a Virtual Network.",
    "azure-aks→azure-sql": "AKS pods can connect to Azure SQL.",
  };

  const key = `${source.id}→${target.id}`;
  return hints[key] || `${source.name} can connect to ${target.name}.`;
}

function getInvalidConnectionExplanation(
  source: CloudComponent,
  target: CloudComponent,
): string {
  if (source.category === target.category && source.category === "storage") {
    return `${source.name} cannot connect to ${target.name}. Storage services don't directly connect to each other.`;
  }
  if (source.id === target.id) {
    return "A component cannot connect to itself.";
  }
  return `${source.name} doesn't directly connect to ${target.name} in standard infrastructure. Check the component descriptions for valid connections.`;
}
