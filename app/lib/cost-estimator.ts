import type { CanvasNode } from "~/types";

interface CostLineItem {
  name: string;
  service: string;
  detail: string;
  monthlyCost: number;
}

export interface CostEstimate {
  items: CostLineItem[];
  totalMonthly: number;
  totalYearly: number;
}

// Approximate monthly costs in USD (on-demand, us-east-1 / default region)
const awsPricing: Record<string, Record<string, number>> = {
  "aws-ec2": {
    "t2.micro": 8.35,
    "t2.small": 16.7,
    "t2.medium": 33.41,
    "t3.micro": 7.49,
    "t3.small": 14.98,
    "t3.medium": 29.95,
  },
  "aws-rds": {
    "db.t3.micro": 12.41,
    "db.t3.small": 24.82,
    "db.t3.medium": 49.64,
  },
  "aws-lambda": { _base: 0 }, // pay-per-request, shown as ~$0
  "aws-s3": { _base: 0.023 }, // per GB, shown as base
  "aws-vpc": { _base: 0 },
  "aws-subnet": { _base: 0 },
  "aws-sg": { _base: 0 },
  "aws-iam-role": { _base: 0 },
  "aws-elb": { _base: 16.2 },
  "aws-route53": { _base: 0.5 },
  "aws-cloudfront": { _base: 0 },
  "aws-sns": { _base: 0 },
  "aws-sqs": { _base: 0 },
  "aws-ecs": { FARGATE: 36.43, FARGATE_SPOT: 12.72, EC2: 0 },
};

const gcpPricing: Record<string, Record<string, number>> = {
  "gcp-compute": {
    "e2-micro": 6.11,
    "e2-small": 12.23,
    "e2-medium": 24.46,
    "n1-standard-1": 24.27,
  },
  "gcp-cloudsql": { "db-f1-micro": 7.67, "db-g1-small": 25.55 },
  "gcp-function": { _base: 0 },
  "gcp-gcs": { _base: 0.02 },
  "gcp-vpc": { _base: 0 },
  "gcp-gke": { _base: 73.0 }, // cluster management fee
};

const azurePricing: Record<string, Record<string, number>> = {
  "azure-vm": {
    Standard_B1s: 7.59,
    Standard_B2s: 30.37,
    Standard_DS1_v2: 43.8,
  },
  "azure-sql": { Basic: 4.9, Standard: 14.72, Premium: 464.0 },
  "azure-function": { _base: 0 },
  "azure-storage": {
    Standard_LRS: 0.018,
    Standard_GRS: 0.036,
    Premium_LRS: 0.15,
  },
  "azure-vnet": { _base: 0 },
  "azure-aks": { _base: 73.0 },
};

const allPricing: Record<string, Record<string, Record<string, number>>> = {
  aws: awsPricing,
  gcp: gcpPricing,
  azure: azurePricing,
};

function getNodeCost(node: CanvasNode): CostLineItem | null {
  const { component, config, label } = node.data;
  const providerPricing = allPricing[component.provider];
  if (!providerPricing) return null;

  const servicePricing = providerPricing[component.id];
  if (!servicePricing) return null;

  // Try to find cost based on the config values
  let monthlyCost = 0;
  let detail = "";

  // Check common sizing fields
  const sizeFields = [
    "instanceType",
    "instanceClass",
    "machineType",
    "vmSize",
    "tier",
    "skuName",
    "capacityProvider",
    "accountType",
    "storageClass",
  ];

  for (const field of sizeFields) {
    const val = config[field] as string;
    if (val && servicePricing[val] !== undefined) {
      monthlyCost = servicePricing[val];
      detail = val;
      break;
    }
  }

  // Fallback to _base
  if (!detail && servicePricing._base !== undefined) {
    monthlyCost = servicePricing._base;
    detail = monthlyCost === 0 ? "Pay-per-use" : "Base cost";
  }

  if (!detail) return null;

  return {
    name: label,
    service: component.name,
    detail,
    monthlyCost,
  };
}

export function estimateCost(nodes: CanvasNode[]): CostEstimate {
  const items: CostLineItem[] = [];

  for (const node of nodes) {
    // Skip container/infrastructure nodes (regions, AZs, etc.)
    if (node.data.component.isContainer) continue;
    const item = getNodeCost(node);
    if (item) items.push(item);
  }

  const totalMonthly = items.reduce((sum, item) => sum + item.monthlyCost, 0);

  return {
    items,
    totalMonthly,
    totalYearly: totalMonthly * 12,
  };
}
