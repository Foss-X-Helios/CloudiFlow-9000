import {
  GENERATOR_COMMENT_HASH,
  GENERATOR_COMMENT_SLASH,
} from "~/lib/constants";
import type { CanvasNode } from "~/types";
import { generateAWSPulumi, generateAWSTerraform } from "./aws";
import { generateAzurePulumi, generateAzureTerraform } from "./azure";
import { generateGCPPulumi, generateGCPTerraform } from "./gcp";

function detectProviders(nodes: CanvasNode[]): Set<string> {
  const providers = new Set<string>();
  nodes.forEach((node) => {
    const id = node.data.component.id;
    if (id.startsWith("aws-")) providers.add("aws");
    else if (id.startsWith("gcp-")) providers.add("gcp");
    else if (id.startsWith("azure-")) providers.add("azure");
  });
  return providers;
}

function generateProviderBlock(providers: Set<string>): string {
  let block = `terraform {
  required_providers {\n`;

  if (providers.has("aws")) {
    block += `    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }\n`;
  }
  if (providers.has("gcp")) {
    block += `    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }\n`;
  }
  if (providers.has("azure")) {
    block += `    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }\n`;
  }

  block += `  }
}

`;

  if (providers.has("aws")) {
    block += `provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

`;
  }

  if (providers.has("gcp")) {
    block += `provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

variable "gcp_project" {
  description = "GCP Project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

`;
  }

  if (providers.has("azure")) {
    block += `provider "azurerm" {
  features {}
}

variable "azure_location" {
  description = "Azure Location"
  type        = string
  default     = "eastus"
}

`;
  }

  return block;
}

export function generateTerraform(nodes: CanvasNode[]): string {
  const providers = detectProviders(nodes);
  let code = `${GENERATOR_COMMENT_HASH}
# Terraform Configuration

${generateProviderBlock(providers)}`;

  // Filter nodes by provider and generate code
  const awsNodes = nodes.filter((n) => n.data.component.id.startsWith("aws-"));
  const gcpNodes = nodes.filter((n) => n.data.component.id.startsWith("gcp-"));
  const azureNodes = nodes.filter((n) =>
    n.data.component.id.startsWith("azure-"),
  );

  if (awsNodes.length > 0) {
    code += generateAWSTerraform(awsNodes);
  }

  if (gcpNodes.length > 0) {
    code += generateGCPTerraform(gcpNodes);
  }

  if (azureNodes.length > 0) {
    code += generateAzureTerraform(azureNodes);
  }

  return code;
}

export function generatePulumi(nodes: CanvasNode[]): string {
  const providers = detectProviders(nodes);

  let imports = `${GENERATOR_COMMENT_SLASH}
// Pulumi Configuration

import * as pulumi from "@pulumi/pulumi";
`;

  if (providers.has("aws")) {
    imports += `import * as aws from "@pulumi/aws";
`;
  }
  if (providers.has("gcp")) {
    imports += `import * as gcp from "@pulumi/gcp";
`;
  }
  if (providers.has("azure")) {
    imports += `import * as azure from "@pulumi/azure-native";
`;
  }

  let code =
    imports +
    `
const config = new pulumi.Config();
`;

  if (providers.has("aws")) {
    code += `const awsRegion = config.get("awsRegion") || "us-east-1";
`;
  }
  if (providers.has("gcp")) {
    code += `const gcpRegion = config.get("gcpRegion") || "us-central1";
const gcpProject = config.require("gcpProject");
`;
  }
  if (providers.has("azure")) {
    code += `const azureLocation = config.get("azureLocation") || "eastus";
`;
  }

  code += `
`;

  // Filter nodes by provider and generate code
  const awsNodes = nodes.filter((n) => n.data.component.id.startsWith("aws-"));
  const gcpNodes = nodes.filter((n) => n.data.component.id.startsWith("gcp-"));
  const azureNodes = nodes.filter((n) =>
    n.data.component.id.startsWith("azure-"),
  );

  if (awsNodes.length > 0) {
    code += generateAWSPulumi(awsNodes);
  }

  if (gcpNodes.length > 0) {
    code += generateGCPPulumi(gcpNodes);
  }

  if (azureNodes.length > 0) {
    code += generateAzurePulumi(azureNodes);
  }

  // Add exports section
  code += `
// Exports
`;

  return code;
}

export function generateCode(
  nodes: CanvasNode[],
  format: "terraform" | "pulumi",
): string {
  switch (format) {
    case "terraform":
      return generateTerraform(nodes);
    case "pulumi":
      return generatePulumi(nodes);
    default:
      return generateTerraform(nodes);
  }
}
