import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateAzureTerraform(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== Azure Infrastructure ====================
      case "azure-region":
        code += `
# Azure Region: ${config.regionName || "eastus"}
# This is a container for visual organization
`;
        break;

      case "azure-resource-group":
        code += `
resource "azurerm_resource_group" "${toSnakeCase(resourceName)}" {
  name     = "${config.name || "my-resource-group"}"
  location = var.azure_location

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      // ==================== Azure Compute ====================
      case "azure-vm":
        code += `
resource "azurerm_network_interface" "${toSnakeCase(resourceName)}_nic" {
  name                = "${toSnakeCase(resourceName)}-nic"
  location            = var.azure_location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.main.id
    private_ip_address_allocation = "Dynamic"
  }
}

resource "azurerm_linux_virtual_machine" "${toSnakeCase(resourceName)}" {
  name                = "${toSnakeCase(resourceName)}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.azure_location
  size                = "${config.vmSize || "Standard_B1s"}"
  admin_username      = "${config.adminUsername || "adminuser"}"

  network_interface_ids = [
    azurerm_network_interface.${toSnakeCase(resourceName)}_nic.id
  ]

  admin_ssh_key {
    username   = "${config.adminUsername || "adminuser"}"
    public_key = file("~/.ssh/id_rsa.pub")
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts"
    version   = "latest"
  }

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "azure-function":
        code += `
resource "azurerm_service_plan" "${toSnakeCase(resourceName)}_plan" {
  name                = "${toSnakeCase(resourceName)}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.azure_location
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "${toSnakeCase(resourceName)}" {
  name                = "${toSnakeCase(resourceName)}"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.azure_location

  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.${toSnakeCase(resourceName)}_plan.id

  site_config {
    application_stack {
      node_version = "${config.runtime === "node" ? "18" : "18"}"
    }
  }

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "azure-aks":
        code += `
resource "azurerm_kubernetes_cluster" "${toSnakeCase(resourceName)}" {
  name                = "${toSnakeCase(resourceName)}"
  location            = var.azure_location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${toSnakeCase(resourceName)}"

  default_node_pool {
    name       = "default"
    node_count = ${config.nodeCount || 3}
    vm_size    = "${config.vmSize || "Standard_DS2_v2"}"
  }

  identity {
    type = "SystemAssigned"
  }

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      // ==================== Azure Network ====================
      case "azure-vnet":
        code += `
resource "azurerm_virtual_network" "${toSnakeCase(resourceName)}" {
  name                = "${toSnakeCase(resourceName)}"
  address_space       = ["${config.addressSpace || "10.0.0.0/16"}"]
  location            = var.azure_location
  resource_group_name = azurerm_resource_group.main.name

  tags = {
    Name = "${resourceName}"
  }
}

resource "azurerm_subnet" "${toSnakeCase(resourceName)}_subnet" {
  name                 = "${toSnakeCase(resourceName)}-subnet"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.${toSnakeCase(resourceName)}.name
  address_prefixes     = ["10.0.1.0/24"]
}
`;
        break;

      // ==================== Azure Storage ====================
      case "azure-storage":
        code += `
resource "azurerm_storage_account" "${toSnakeCase(resourceName)}" {
  name                     = "${toSnakeCase(resourceName).replace(/_/g, "").slice(0, 24)}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = var.azure_location
  account_tier             = "Standard"
  account_replication_type = "${String(config.accountType || "Standard_LRS").replace("Standard_", "")}"

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      // ==================== Azure Database ====================
      case "azure-sql":
        code += `
resource "azurerm_mssql_server" "${toSnakeCase(resourceName)}_server" {
  name                         = "${toSnakeCase(resourceName)}-server"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = var.azure_location
  version                      = "12.0"
  administrator_login          = "sqladmin"
  administrator_login_password = var.azure_sql_password

  tags = {
    Name = "${resourceName}"
  }
}

resource "azurerm_mssql_database" "${toSnakeCase(resourceName)}" {
  name      = "${toSnakeCase(resourceName)}"
  server_id = azurerm_mssql_server.${toSnakeCase(resourceName)}_server.id
  sku_name  = "${config.skuName || "Basic"}"

  tags = {
    Name = "${resourceName}"
  }
}

variable "azure_sql_password" {
  description = "Azure SQL Server admin password"
  type        = string
  sensitive   = true
}
`;
        break;
    }
  });

  return code;
}
