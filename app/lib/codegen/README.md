# Code Generation Module

This directory contains the modularized code generation logic for CloudiFlow-9000.

## Structure

```
codegen/
├── index.ts              # Main orchestrator
├── types.ts              # Shared types and utilities
├── aws/
│   ├── terraform.ts      # AWS Terraform generator
│   └── pulumi.ts         # AWS Pulumi generator
├── gcp/
│   ├── terraform.ts      # GCP Terraform generator
│   └── pulumi.ts         # GCP Pulumi generator
└── azure/
    ├── terraform.ts      # Azure Terraform generator
    └── pulumi.ts         # Azure Pulumi generator
```

## How it Works

### 1. Main Orchestrator (`index.ts`)

- Detects which cloud providers are used in the canvas
- Generates appropriate provider configuration blocks
- Filters nodes by provider
- Delegates to provider-specific generators
- Combines all generated code into a single output

### 2. Provider-Specific Modules

Each provider has two files:

- **`terraform.ts`** - Generates Terraform HCL for that provider's resources
- **`pulumi.ts`** - Generates Pulumi TypeScript for that provider's resources

### 3. Shared Utilities (`types.ts`)

- `toPascalCase()` - Converts strings to PascalCase (used for Pulumi)
- `toSnakeCase()` - Converts strings to snake_case (used for Terraform)
- `CodeGenerator` interface

## Adding a New Component

### Step 1: Add to Provider Module

Edit the appropriate provider file (e.g., `aws/terraform.ts`):

```typescript
case "aws-new-service":
  code += `
resource "aws_new_service" "${toSnakeCase(resourceName)}" {
  name = "${config.name || "default"}"
  // ... more config
}
`;
  break;
```

### Step 2: Add Pulumi Version

Edit the corresponding Pulumi file (e.g., `aws/pulumi.ts`):

```typescript
case "aws-new-service":
  code += `
const ${resourceName} = new aws.newService.Resource("${resourceName}", {
  name: "${config.name || "default"}",
  // ... more config
});
`;
  break;
```

### Step 3: Test

The orchestrator automatically includes the new component in the output.

## Benefits of This Structure

1. **Separation of Concerns** - Each provider is isolated
2. **Easy Maintenance** - Fix bugs in one provider without touching others
3. **Scalability** - Add new providers by creating new directories
4. **Readability** - Smaller files are easier to understand
5. **Parallel Development** - Multiple devs can work on different providers
6. **Testing** - Test each provider's codegen independently

## Example: Adding a New Provider

To add support for IBM Cloud:

1. Create `ibm/terraform.ts` and `ibm/pulumi.ts`
2. Implement `generateIBMTerraform()` and `generateIBMPulumi()`
3. Update `index.ts`:
   - Add IBM to `detectProviders()`
   - Add IBM provider block
   - Import and call IBM generators
4. Done!

## Code Flow

```
User drags components → CanvasNode[]
                            ↓
                    generateCode()
                            ↓
                  detectProviders()
                            ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         AWS Nodes      GCP Nodes      Azure Nodes
              ↓              ↓              ↓
    generateAWS...  generateGCP...  generateAzure...
              ↓              ↓              ↓
              └──────────────┼──────────────┘
                            ↓
                    Combined Output
                            ↓
                  CodePreview Panel
```

## Performance Notes

- Each provider generator only processes its own nodes
- No unnecessary iterations over the full node list
- Provider detection is O(n) where n = number of nodes
- Code generation is O(m) per provider where m = nodes for that provider

## Future Enhancements

- [ ] Add validation for each provider's resources
- [ ] Generate provider-specific dependency graphs
- [ ] Add resource cross-referencing (e.g., VPC ID in EC2)
- [ ] Support for custom resource templates
- [ ] Provider-specific optimization passes
