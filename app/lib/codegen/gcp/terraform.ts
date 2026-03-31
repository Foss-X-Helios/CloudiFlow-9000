import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateGCPTerraform(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== GCP Infrastructure ====================
      case "gcp-region":
        code += `
# GCP Region: ${config.regionName || "us-central1"}
# This is a container for visual organization
`;
        break;

      case "gcp-zone":
        code += `
# GCP Zone: ${config.zoneName || "us-central1-a"}
# This is a container for visual organization
`;
        break;

      // ==================== GCP Compute ====================
      case "gcp-compute":
        code += `
resource "google_compute_instance" "${toSnakeCase(resourceName)}" {
  name         = "${toSnakeCase(resourceName)}"
  machine_type = "${config.machineType || "e2-micro"}"
  zone         = "${config.zone || "us-central1-a"}"

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
    }
  }

  network_interface {
    network = "default"
    access_config {}
  }

  labels = {
    name = "${toSnakeCase(resourceName)}"
  }
}
`;
        break;

      case "gcp-function":
        code += `
resource "google_cloudfunctions_function" "${toSnakeCase(resourceName)}" {
  name        = "${toSnakeCase(resourceName)}"
  runtime     = "${config.runtime || "nodejs20"}"
  region      = "${config.region || "us-central1"}"
  entry_point = "handler"

  available_memory_mb   = ${config.memory || 256}
  source_archive_bucket = google_storage_bucket.function_bucket.name
  source_archive_object = google_storage_bucket_object.function_zip.name
  trigger_http          = true

  labels = {
    name = "${toSnakeCase(resourceName)}"
  }
}
`;
        break;

      case "gcp-gke":
        code += `
resource "google_container_cluster" "${toSnakeCase(resourceName)}" {
  name     = "${toSnakeCase(resourceName)}"
  location = "${config.region || "us-central1"}"

  initial_node_count       = ${config.initialNodeCount || 3}
  remove_default_node_pool = true

  node_config {
    machine_type = "${config.machineType || "e2-medium"}"
  }
}

resource "google_container_node_pool" "${toSnakeCase(resourceName)}_nodes" {
  name       = "${toSnakeCase(resourceName)}-node-pool"
  location   = "${config.region || "us-central1"}"
  cluster    = google_container_cluster.${toSnakeCase(resourceName)}.name
  node_count = ${config.initialNodeCount || 3}

  node_config {
    machine_type = "${config.machineType || "e2-medium"}"
  }
}
`;
        break;

      // ==================== GCP Network ====================
      case "gcp-vpc":
        code += `
resource "google_compute_network" "${toSnakeCase(resourceName)}" {
  name                    = "${toSnakeCase(resourceName)}"
  auto_create_subnetworks = ${config.autoCreateSubnetworks ?? true}
}
`;
        break;

      // ==================== GCP Storage ====================
      case "gcp-gcs":
        code += `
resource "google_storage_bucket" "${toSnakeCase(resourceName)}" {
  name          = "${config.bucketName || "my-bucket"}"
  location      = "${config.region || "US"}"
  storage_class = "${config.storageClass || "STANDARD"}"
  force_destroy = true

  labels = {
    name = "${toSnakeCase(resourceName)}"
  }
}
`;
        break;

      // ==================== GCP Database ====================
      case "gcp-cloudsql":
        code += `
resource "google_sql_database_instance" "${toSnakeCase(resourceName)}" {
  name             = "${toSnakeCase(resourceName)}"
  database_version = "${config.databaseVersion || "MYSQL_8_0"}"
  region           = "${config.region || "us-central1"}"

  settings {
    tier = "${config.tier || "db-f1-micro"}"
  }

  deletion_protection = false
}

resource "google_sql_database" "${toSnakeCase(resourceName)}_db" {
  name     = "${toSnakeCase(resourceName)}-database"
  instance = google_sql_database_instance.${toSnakeCase(resourceName)}.name
}
`;
        break;
    }
  });

  return code;
}
