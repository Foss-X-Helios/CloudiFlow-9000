import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateGCPPulumi(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== GCP Infrastructure ====================
      case "gcp-region":
        code += `// GCP Region: ${config.regionName || "us-central1"}
`;
        break;

      case "gcp-zone":
        code += `// GCP Zone: ${config.zoneName || "us-central1-a"}
`;
        break;

      // ==================== GCP Compute ====================
      case "gcp-compute":
        code += `
const ${resourceName} = new gcp.compute.Instance("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  machineType: "${config.machineType || "e2-micro"}",
  zone: "${config.zone || "us-central1-a"}",
  bootDisk: {
    initializeParams: { image: "debian-cloud/debian-11" },
  },
  networkInterfaces: [{
    network: "default",
    accessConfigs: [{}],
  }],
  labels: { name: "${toSnakeCase(resourceName)}" },
});
`;
        break;

      case "gcp-function":
        code += `
const ${resourceName} = new gcp.cloudfunctions.Function("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  runtime: "${config.runtime || "nodejs20"}",
  region: "${config.region || "us-central1"}",
  entryPoint: "handler",
  availableMemoryMb: ${config.memory || 256},
  triggerHttp: true,
  labels: { name: "${toSnakeCase(resourceName)}" },
});
`;
        break;

      case "gcp-gke":
        code += `
const ${resourceName} = new gcp.container.Cluster("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  location: "${config.region || "us-central1"}",
  initialNodeCount: ${config.initialNodeCount || 3},
  nodeConfig: {
    machineType: "${config.machineType || "e2-medium"}",
  },
});
`;
        break;

      // ==================== GCP Network ====================
      case "gcp-vpc":
        code += `
const ${resourceName} = new gcp.compute.Network("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  autoCreateSubnetworks: ${config.autoCreateSubnetworks ?? true},
});
`;
        break;

      // ==================== GCP Storage ====================
      case "gcp-gcs":
        code += `
const ${resourceName} = new gcp.storage.Bucket("${resourceName}", {
  name: "${config.bucketName || "my-bucket"}",
  location: "${config.region || "US"}",
  storageClass: "${config.storageClass || "STANDARD"}",
  forceDestroy: true,
  labels: { name: "${toSnakeCase(resourceName)}" },
});
`;
        break;

      // ==================== GCP Database ====================
      case "gcp-cloudsql":
        code += `
const ${resourceName} = new gcp.sql.DatabaseInstance("${resourceName}", {
  name: "${toSnakeCase(resourceName)}",
  databaseVersion: "${config.databaseVersion || "MYSQL_8_0"}",
  region: "${config.region || "us-central1"}",
  settings: { tier: "${config.tier || "db-f1-micro"}" },
  deletionProtection: false,
});

const ${resourceName}Db = new gcp.sql.Database("${resourceName}Db", {
  name: "${toSnakeCase(resourceName)}-database",
  instance: ${resourceName}.name,
});
`;
        break;
    }
  });

  return code;
}
