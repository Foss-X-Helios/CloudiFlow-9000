# CloudiFlow-9000 Components & Code Generation

This document lists all available cloud components and their code generation status.

**Last updated:** March 31, 2026

---

## Summary

| Provider | Total Components | Terraform | Pulumi   |
| -------- | ---------------- | --------- | -------- |
| AWS      | 20               | ✅ 20/20  | ✅ 20/20 |
| GCP      | 8                | ✅ 8/8    | ✅ 8/8   |
| Azure    | 8                | ✅ 8/8    | ✅ 8/8   |

---

## AWS Components (20 total)

### Infrastructure

| Component         | ID           | Terraform | Pulumi | Description                                                                     |
| ----------------- | ------------ | --------- | ------ | ------------------------------------------------------------------------------- |
| AWS Region        | `aws-region` | ✅        | ✅     | Container for visual organization. Generates comment block with region context. |
| Availability Zone | `aws-az`     | ✅        | ✅     | Container for visual organization. Generates comment block for AZ context.      |

### Compute

| Component       | ID           | Terraform | Pulumi | Description                                                                                        |
| --------------- | ------------ | --------- | ------ | -------------------------------------------------------------------------------------------------- |
| EC2 Instance    | `aws-ec2`    | ✅        | ✅     | `aws_instance` / `aws.ec2.Instance` - Virtual server with AMI, instance type, tags.                |
| Lambda Function | `aws-lambda` | ✅        | ✅     | `aws_lambda_function` / `aws.lambda.Function` - Serverless function with runtime, timeout, memory. |
| SNS Topic       | `aws-sns`    | ✅        | ✅     | `aws_sns_topic` / `aws.sns.Topic` - Notification service with FIFO support.                        |
| SQS Queue       | `aws-sqs`    | ✅        | ✅     | `aws_sqs_queue` / `aws.sqs.Queue` - Message queue with FIFO, visibility timeout.                   |
| ECS Cluster     | `aws-ecs`    | ✅        | ✅     | `aws_ecs_cluster` / `aws.ecs.Cluster` - Container cluster with Fargate/EC2 capacity.               |

### Network

| Component     | ID               | Terraform | Pulumi | Description                                                                                                   |
| ------------- | ---------------- | --------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| VPC           | `aws-vpc`        | ✅        | ✅     | `aws_vpc` / `aws.ec2.Vpc` - Virtual network with CIDR block, DNS settings.                                    |
| Subnet        | `aws-subnet`     | ✅        | ✅     | `aws_subnet` / `aws.ec2.Subnet` - VPC subnet with AZ, public/private config.                                  |
| Load Balancer | `aws-elb`        | ✅        | ✅     | `aws_lb` / `aws.lb.LoadBalancer` - ALB/NLB with scheme configuration.                                         |
| CloudFront    | `aws-cloudfront` | ✅        | ✅     | `aws_cloudfront_distribution` / `aws.cloudfront.Distribution` - CDN with origin, cache behavior, price class. |
| Route 53      | `aws-route53`    | ✅        | ✅     | `aws_route53_zone` + `aws_route53_record` - DNS hosted zone and records.                                      |

### Storage

| Component | ID       | Terraform | Pulumi | Description                                                                |
| --------- | -------- | --------- | ------ | -------------------------------------------------------------------------- |
| S3 Bucket | `aws-s3` | ✅        | ✅     | `aws_s3_bucket` / `aws.s3.Bucket` - Object storage with bucket name, tags. |

### Database

| Component    | ID        | Terraform | Pulumi | Description                                                                               |
| ------------ | --------- | --------- | ------ | ----------------------------------------------------------------------------------------- |
| RDS Database | `aws-rds` | ✅        | ✅     | `aws_db_instance` / `aws.rds.Instance` - Managed DB with engine, instance class, storage. |

### Security

| Component      | ID             | Terraform | Pulumi | Description                                                                       |
| -------------- | -------------- | --------- | ------ | --------------------------------------------------------------------------------- |
| Security Group | `aws-sg`       | ✅        | ✅     | `aws_security_group` / `aws.ec2.SecurityGroup` - Firewall rules with description. |
| IAM Role       | `aws-iam-role` | ✅        | ✅     | `aws_iam_role` / `aws.iam.Role` - Service role with assume role policy.           |

---

## GCP Components (8 total)

### Infrastructure

| Component  | ID           | Terraform | Pulumi | Description                                                      |
| ---------- | ------------ | --------- | ------ | ---------------------------------------------------------------- |
| GCP Region | `gcp-region` | ✅        | ✅     | Container for visual organization. Sets provider region context. |
| GCP Zone   | `gcp-zone`   | ✅        | ✅     | Container for visual organization. Generates zone comment.       |

### Compute

| Component      | ID             | Terraform | Pulumi | Description                                                                                                       |
| -------------- | -------------- | --------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| Compute Engine | `gcp-compute`  | ✅        | ✅     | `google_compute_instance` / `gcp.compute.Instance` - VM with machine type, zone, boot disk.                       |
| Cloud Function | `gcp-function` | ✅        | ✅     | `google_cloudfunctions_function` / `gcp.cloudfunctions.Function` - Serverless with runtime, memory, HTTP trigger. |
| GKE Cluster    | `gcp-gke`      | ✅        | ✅     | `google_container_cluster` / `gcp.container.Cluster` - Kubernetes cluster with node pool.                         |

### Network

| Component   | ID        | Terraform | Pulumi | Description                                                                     |
| ----------- | --------- | --------- | ------ | ------------------------------------------------------------------------------- |
| VPC Network | `gcp-vpc` | ✅        | ✅     | `google_compute_network` / `gcp.compute.Network` - VPC with auto-subnet option. |

### Storage

| Component     | ID        | Terraform | Pulumi | Description                                                                           |
| ------------- | --------- | --------- | ------ | ------------------------------------------------------------------------------------- |
| Cloud Storage | `gcp-gcs` | ✅        | ✅     | `google_storage_bucket` / `gcp.storage.Bucket` - Bucket with location, storage class. |

### Database

| Component | ID             | Terraform | Pulumi | Description                                                                                  |
| --------- | -------------- | --------- | ------ | -------------------------------------------------------------------------------------------- |
| Cloud SQL | `gcp-cloudsql` | ✅        | ✅     | `google_sql_database_instance` / `gcp.sql.DatabaseInstance` - Managed DB with version, tier. |

---

## Azure Components (8 total)

### Infrastructure

| Component      | ID                     | Terraform | Pulumi | Description                                                                                              |
| -------------- | ---------------------- | --------- | ------ | -------------------------------------------------------------------------------------------------------- |
| Azure Region   | `azure-region`         | ✅        | ✅     | Container for visual organization. Sets location context.                                                |
| Resource Group | `azure-resource-group` | ✅        | ✅     | `azurerm_resource_group` / `azure.resources.ResourceGroup` - Required container for all Azure resources. |

### Compute

| Component       | ID               | Terraform | Pulumi | Description                                                                                         |
| --------------- | ---------------- | --------- | ------ | --------------------------------------------------------------------------------------------------- |
| Virtual Machine | `azure-vm`       | ✅        | ✅     | `azurerm_linux_virtual_machine` / `azure.compute.VirtualMachine` - VM with NIC, size, SSH key.      |
| Azure Functions | `azure-function` | ✅        | ✅     | `azurerm_linux_function_app` / `azure.web.WebApp` - Serverless with runtime, service plan.          |
| AKS Cluster     | `azure-aks`      | ✅        | ✅     | `azurerm_kubernetes_cluster` / `azure.containerservice.ManagedCluster` - Kubernetes with node pool. |

### Network

| Component       | ID           | Terraform | Pulumi | Description                                                                                   |
| --------------- | ------------ | --------- | ------ | --------------------------------------------------------------------------------------------- |
| Virtual Network | `azure-vnet` | ✅        | ✅     | `azurerm_virtual_network` / `azure.network.VirtualNetwork` - VNet with address space, subnet. |

### Storage

| Component       | ID              | Terraform | Pulumi | Description                                                                                      |
| --------------- | --------------- | --------- | ------ | ------------------------------------------------------------------------------------------------ |
| Storage Account | `azure-storage` | ✅        | ✅     | `azurerm_storage_account` / `azure.storage.StorageAccount` - Blob/file storage with replication. |

### Database

| Component | ID          | Terraform | Pulumi | Description                                                                      |
| --------- | ----------- | --------- | ------ | -------------------------------------------------------------------------------- |
| Azure SQL | `azure-sql` | ✅        | ✅     | `azurerm_mssql_server` + `azurerm_mssql_database` - Managed SQL Server with SKU. |

---

## Code Generation Details

### Multi-Provider Support

The code generator automatically detects which cloud providers are used and generates:

- **Provider blocks** for each detected provider (AWS, GCP, Azure)
- **Required providers** in terraform block
- **Variables** for region/location configuration
- **Sensitive variables** for passwords (RDS, Azure SQL)

### Terraform Generation Flow

```
CanvasNode[]
    → detectProviders()
    → generateProviderBlock()
    → switch(component.id)
    → HCL output
```

**Output format:** Valid `.tf` file with:

- Provider configuration
- Resource blocks with proper attributes
- Variable declarations for sensitive data
- Tags for resource identification

### Pulumi Generation Flow

```
CanvasNode[]
    → detectProviders()
    → import statements
    → switch(component.id)
    → TypeScript output
```

**Output format:** Valid TypeScript with:

- Conditional imports (`@pulumi/aws`, `@pulumi/gcp`, `@pulumi/azure-native`)
- Config for secrets and region settings
- Typed resource constructors
- Export section

### Naming Conventions

| Format         | Terraform       | Pulumi        |
| -------------- | --------------- | ------------- |
| Resource names | `snake_case`    | `PascalCase`  |
| Example        | `my_web_server` | `MyWebServer` |

### Configuration Mapping

Each component's `fields` array maps to resource attributes:

| Field Type | Terraform       | Pulumi          |
| ---------- | --------------- | --------------- |
| `string`   | Direct value    | Direct value    |
| `number`   | Numeric         | Numeric         |
| `boolean`  | `true`/`false`  | `true`/`false`  |
| `select`   | Selected option | Selected option |

---

## Adding New Components

1. **Define component** in `app/lib/components.ts`:

   ```typescript
   {
     id: "aws-new-service",
     name: "New Service",
     category: "compute",
     provider: "aws",
     fields: [...],
     ...
   }
   ```

2. **Add Terraform codegen** in `app/lib/iac-generator.ts` → `generateTerraform()`:

   ```typescript
   case "aws-new-service":
     code += `resource "aws_new_service" "..." {...}`;
     break;
   ```

3. **Add Pulumi codegen** in `app/lib/iac-generator.ts` → `generatePulumi()`:

   ```typescript
   case "aws-new-service":
     code += `const X = new aws.newService.Resource(...);`;
     break;
   ```

4. **Add cost estimation** (optional) in `app/lib/cost-estimator.ts`

5. **Add icon** (optional) in `app/lib/cloud-icons.tsx`

---

## File Locations

| File                          | Purpose                             |
| ----------------------------- | ----------------------------------- |
| `app/lib/components.ts`       | Component definitions with fields   |
| `app/lib/codegen/`            | **Modularized code generation**     |
| `app/lib/codegen/index.ts`    | Main orchestrator                   |
| `app/lib/codegen/aws/`        | AWS Terraform & Pulumi generators   |
| `app/lib/codegen/gcp/`        | GCP Terraform & Pulumi generators   |
| `app/lib/codegen/azure/`      | Azure Terraform & Pulumi generators |
| `app/lib/cost-estimator.ts`   | Cost calculation logic              |
| `app/lib/cloud-icons.tsx`     | Provider-specific icons             |
| `app/lib/connection-rules.ts` | Node connection validation          |

---

## Code Architecture

The code generation is now **modularized** for better maintenance:

```
app/lib/codegen/
├── index.ts              # Orchestrator (detects providers, combines output)
├── types.ts              # Shared utilities (toPascalCase, toSnakeCase)
├── aws/
│   ├── terraform.ts      # 20 AWS resources → Terraform
│   └── pulumi.ts         # 20 AWS resources → Pulumi
├── gcp/
│   ├── terraform.ts      # 8 GCP resources → Terraform
│   └── pulumi.ts         # 8 GCP resources → Pulumi
└── azure/
    ├── terraform.ts      # 8 Azure resources → Terraform
    └── pulumi.ts         # 8 Azure resources → Pulumi
```

**Benefits:**

- Each provider is isolated (fix AWS without touching GCP)
- Smaller files are easier to understand and maintain
- Multiple developers can work on different providers simultaneously
- Easy to add new providers (just create a new directory)
