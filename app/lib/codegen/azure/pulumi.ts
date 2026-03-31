import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateAzurePulumi(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== Azure Infrastructure ====================
      case "azure-region":
        code += `// Azure Region: ${config.regionName || "eastus"}
`;
        break;

      case "azure-resource-group":
        code += `
const ${resourceName} = new azure.resources.ResourceGroup("${resourceName}", {
  resourceGroupName: "${config.name || "my-resource-group"}",
  location: azureLocation,
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== Azure Compute ====================
      case "azure-vm":
        code += `
const ${resourceName}Nic = new azure.network.NetworkInterface("${resourceName}Nic", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  ipConfigurations: [{
    name: "internal",
    privateIPAllocationMethod: "Dynamic",
    subnet: { id: mainSubnet.id },
  }],
});

const ${resourceName} = new azure.compute.VirtualMachine("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  vmSize: "${config.vmSize || "Standard_B1s"}",
  networkProfile: {
    networkInterfaces: [{ id: ${resourceName}Nic.id }],
  },
  osProfile: {
    computerName: "${toSnakeCase(resourceName)}",
    adminUsername: "${config.adminUsername || "adminuser"}",
  },
  storageOsDisk: {
    createOption: "FromImage",
    managedDiskType: "Standard_LRS",
  },
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "azure-function":
        code += `
const ${resourceName}Plan = new azure.web.AppServicePlan("${resourceName}Plan", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  kind: "FunctionApp",
  sku: { name: "Y1", tier: "Dynamic" },
});

const ${resourceName} = new azure.web.WebApp("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  serverFarmId: ${resourceName}Plan.id,
  kind: "FunctionApp",
  siteConfig: {
    appSettings: [{ name: "FUNCTIONS_WORKER_RUNTIME", value: "${config.runtime || "node"}" }],
  },
  tags: { Name: "${resourceName}" },
});
`;
        break;

      case "azure-aks":
        code += `
const ${resourceName} = new azure.containerservice.ManagedCluster("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  dnsPrefix: "${toSnakeCase(resourceName)}",
  agentPoolProfiles: [{
    name: "default",
    count: ${config.nodeCount || 3},
    vmSize: "${config.vmSize || "Standard_DS2_v2"}",
    mode: "System",
  }],
  identity: { type: "SystemAssigned" },
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== Azure Network ====================
      case "azure-vnet":
        code += `
const ${resourceName} = new azure.network.VirtualNetwork("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  addressSpace: { addressPrefixes: ["${config.addressSpace || "10.0.0.0/16"}"] },
  tags: { Name: "${resourceName}" },
});

const ${resourceName}Subnet = new azure.network.Subnet("${resourceName}Subnet", {
  resourceGroupName: mainResourceGroup.name,
  virtualNetworkName: ${resourceName}.name,
  addressPrefix: "10.0.1.0/24",
});
`;
        break;

      // ==================== Azure Storage ====================
      case "azure-storage":
        code += `
const ${resourceName} = new azure.storage.StorageAccount("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  sku: { name: "${config.accountType || "Standard_LRS"}" },
  kind: "StorageV2",
  tags: { Name: "${resourceName}" },
});
`;
        break;

      // ==================== Azure Database ====================
      case "azure-sql":
        code += `
const ${resourceName}Server = new azure.sql.Server("${resourceName}Server", {
  resourceGroupName: mainResourceGroup.name,
  location: azureLocation,
  administratorLogin: "sqladmin",
  administratorLoginPassword: config.requireSecret("azureSqlPassword"),
  version: "12.0",
  tags: { Name: "${resourceName}" },
});

const ${resourceName} = new azure.sql.Database("${resourceName}", {
  resourceGroupName: mainResourceGroup.name,
  serverName: ${resourceName}Server.name,
  sku: { name: "${config.skuName || "Basic"}" },
  tags: { Name: "${resourceName}" },
});
`;
        break;
    }
  });

  return code;
}
