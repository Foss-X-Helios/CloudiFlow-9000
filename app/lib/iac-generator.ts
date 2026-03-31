/**
 * IaC Code Generator - Main Entry Point
 *
 * This module orchestrates code generation for Terraform and Pulumi
 * across multiple cloud providers (AWS, GCP, Azure).
 *
 * The implementation is modularized into provider-specific files:
 * - aws/terraform.ts & aws/pulumi.ts
 * - gcp/terraform.ts & gcp/pulumi.ts
 * - azure/terraform.ts & azure/pulumi.ts
 *
 * Each provider module handles its own resource generation logic,
 * making it easy to maintain and extend individual providers.
 */

export {
  generateCode,
  generatePulumi,
  generateTerraform,
} from "./codegen/index";
