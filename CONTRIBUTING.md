# Contributing to CloudiFlow-9000

Thank you for your interest in contributing! This guide will help you get started.

## Code of Conduct

Be respectful, inclusive, and collaborative. We're all here to learn and build something great together.

## How Can I Contribute?

### Reporting Bugs

- Use GitHub Issues
- Include steps to reproduce
- Describe expected vs actual behavior
- Include screenshots if relevant

### Suggesting Features

- Check existing issues first
- Describe the use case
- Explain why it would benefit users

### Code Contributions

#### Adding New Cloud Components

1. **Define the component** in `app/lib/components.ts`:

```typescript
{
  id: "aws-dynamodb",
  name: "DynamoDB Table",
  icon: "Database",
  category: "database",
  provider: "aws",
  description: "NoSQL database service",
  useCase: "Fast, flexible NoSQL database for any scale",
  connectsTo: ["aws-lambda", "aws-ecs"],
  fields: [
    {
      name: "tableName",
      label: "Table Name",
      type: "string",
      default: "my-table",
    },
    {
      name: "billingMode",
      label: "Billing Mode",
      type: "select",
      default: "PAY_PER_REQUEST",
      options: ["PAY_PER_REQUEST", "PROVISIONED"],
    },
  ],
  outputs: ["Table ARN", "Table Name"],
}
```

2. **Add Terraform generation** in `app/lib/codegen/aws/terraform.ts`:

```typescript
case "aws-dynamodb":
  code += `
resource "aws_dynamodb_table" "${toSnakeCase(resourceName)}" {
  name         = "${config.tableName || "my-table"}"
  billing_mode = "${config.billingMode || "PAY_PER_REQUEST"}"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "${resourceName}"
  }
}
`;
  break;
```

3. **Add Pulumi generation** in `app/lib/codegen/aws/pulumi.ts`:

```typescript
case "aws-dynamodb":
  code += `
const ${resourceName} = new aws.dynamodb.Table("${resourceName}", {
  name: "${config.tableName || "my-table"}",
  billingMode: "${config.billingMode || "PAY_PER_REQUEST"}",
  hashKey: "id",
  attributes: [{ name: "id", type: "S" }],
  tags: { Name: "${resourceName}" },
});
`;
  break;
```

4. **Test your changes**:

```bash
pnpm run typecheck
pnpm run dev
```

## Development Setup

```bash
# Install dependencies
pnpm install

# Start database
docker run -d --rm --name cloudiflow-db -p 5432:5432 \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=cloudiflow_db \
  postgres:17-alpine

docker run -d --rm --name cloudiflow-redis -p 6379:6379 redis:alpine

# Start backend
cd cloudiflow-backend
pnpm install
pnpm run dev

# Start frontend (in another terminal)
cd ..
pnpm run dev
```

## Code Style

- Use TypeScript strict mode
- Follow existing naming conventions
- Keep functions small and focused
- Write descriptive variable names
- No console.log in production code
- Format with Prettier before committing

## Pull Request Process

1. Update documentation if needed
2. Ensure tests pass (`pnpm run typecheck`)
3. Keep PRs focused on a single feature/fix
4. Write clear commit messages
5. Reference related issues

## Project Structure

```
app/
├── lib/
│   ├── codegen/          # Code generation
│   │   ├── aws/          # AWS generators
│   │   ├── gcp/          # GCP generators
│   │   └── azure/        # Azure generators
│   ├── components.ts     # Component definitions
│   └── cost-estimator.ts # Cost calculations
├── components/           # React components
└── routes/              # Pages

cloudiflow-backend/
├── src/
│   ├── routes/          # API routes
│   └── services/        # Business logic
```

## Questions?

Open a GitHub Discussion or reach out in Issues.

Thank you for contributing! 🎉
