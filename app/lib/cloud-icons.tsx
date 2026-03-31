// --- Azure Official Icons (direct imports to avoid broken barrel export) ---
import { VirtualMachine as AzureVirtualMachineIcon } from "@threeveloper/azure-react-icons/dist/components/compute/10021-icon-service-Virtual-Machine";
import { FunctionApps as AzureFunctionAppsIcon } from "@threeveloper/azure-react-icons/dist/components/compute/10029-icon-service-Function-Apps";
import { KubernetesServices as AzureKubernetesIcon } from "@threeveloper/azure-react-icons/dist/components/containers/10023-icon-service-Kubernetes-Services";
import { AzureSQL as AzureSQLIcon } from "@threeveloper/azure-react-icons/dist/components/databases/02390-icon-service-Azure-SQL";
import { ResourceGroups as AzureResourceGroupsIcon } from "@threeveloper/azure-react-icons/dist/components/general/10007-icon-service-Resource-Groups";
import { VirtualNetworks as AzureVirtualNetworksIcon } from "@threeveloper/azure-react-icons/dist/components/networking/10061-icon-service-Virtual-Networks";
import { StorageAccounts as AzureStorageAccountsIcon } from "@threeveloper/azure-react-icons/dist/components/storage/10086-icon-service-Storage-Accounts";
import ArchitectureGroupPrivatesubnet from "aws-react-icons/icons/ArchitectureGroupPrivatesubnet";
import ArchitectureGroupRegion from "aws-react-icons/icons/ArchitectureGroupRegion";
import ArchitectureGroupVirtualprivatecloudVPC from "aws-react-icons/icons/ArchitectureGroupVirtualprivatecloudVPC";
import ArchitectureServiceAmazonCloudFront from "aws-react-icons/icons/ArchitectureServiceAmazonCloudFront";
// --- AWS Official Icons ---
import ArchitectureServiceAmazonEC2 from "aws-react-icons/icons/ArchitectureServiceAmazonEC2";
import ArchitectureServiceAmazonElasticContainerService from "aws-react-icons/icons/ArchitectureServiceAmazonElasticContainerService";
import ArchitectureServiceAmazonRDS from "aws-react-icons/icons/ArchitectureServiceAmazonRDS";
import ArchitectureServiceAmazonRoute53 from "aws-react-icons/icons/ArchitectureServiceAmazonRoute53";
import ArchitectureServiceAmazonSecurityLake from "aws-react-icons/icons/ArchitectureServiceAmazonSecurityLake";
import ArchitectureServiceAmazonSimpleNotificationService from "aws-react-icons/icons/ArchitectureServiceAmazonSimpleNotificationService";
import ArchitectureServiceAmazonSimpleQueueService from "aws-react-icons/icons/ArchitectureServiceAmazonSimpleQueueService";
import ArchitectureServiceAmazonSimpleStorageService from "aws-react-icons/icons/ArchitectureServiceAmazonSimpleStorageService";
import ArchitectureServiceAWSIdentityandAccessManagement from "aws-react-icons/icons/ArchitectureServiceAWSIdentityandAccessManagement";
import ArchitectureServiceAWSLambda from "aws-react-icons/icons/ArchitectureServiceAWSLambda";
import ArchitectureServiceElasticLoadBalancing from "aws-react-icons/icons/ArchitectureServiceElasticLoadBalancing";
import gcpCloudStorageSvg from "gcp-icons/dist/icons/cloud-storage-512-color.svg";
import gcpCloudSqlSvg from "gcp-icons/dist/icons/cloudsql-512-color.svg";
// --- GCP Icons (raw SVG files — wrapped as <img> components) ---
import gcpComputeEngineSvg from "gcp-icons/dist/icons/computeengine-512-color-rgb.svg";
import gcpGkeSvg from "gcp-icons/dist/icons/gke-512-color.svg";
import gcpVpcSvg from "gcp-icons/dist/icons/networking-512-color-rgb.svg";
import gcpCloudFunctionSvg from "gcp-icons/dist/icons/serverlesscomputing-512-color.svg";
import type { ComponentType } from "react";

// --- Types ---

interface CloudIconProps {
  className?: string;
  width?: number;
  height?: number;
}

type CloudIcon = ComponentType<CloudIconProps>;

// --- GCP img wrappers ---

function gcpImgIcon(src: string, alt: string): CloudIcon {
  return function GcpIcon({
    className,
    width = 24,
    height = 24,
  }: CloudIconProps) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  };
}

const GcpComputeEngine = gcpImgIcon(gcpComputeEngineSvg, "Compute Engine");
const GcpCloudFunction = gcpImgIcon(gcpCloudFunctionSvg, "Cloud Function");
const GcpGke = gcpImgIcon(gcpGkeSvg, "GKE Cluster");
const GcpVpc = gcpImgIcon(gcpVpcSvg, "VPC Network");
const GcpCloudStorage = gcpImgIcon(gcpCloudStorageSvg, "Cloud Storage");
const GcpCloudSql = gcpImgIcon(gcpCloudSqlSvg, "Cloud SQL");

// --- AWS wrappers (normalize props: size → width/height) ---

function awsIcon(Icon: ComponentType<{ size?: number | string }>): CloudIcon {
  return function AwsIcon({ width = 24 }: CloudIconProps) {
    return <Icon size={width} />;
  };
}

// --- Azure wrappers (normalize props: size → width/height) ---

function azureIcon(
  Icon: ComponentType<{ size?: string; className?: string }>,
): CloudIcon {
  return function AzureIcon({ className, width = 24 }: CloudIconProps) {
    return <Icon size={String(width)} className={className} />;
  };
}

// --- Fallback icons for Region/AZ containers (no official icon exists) ---

function AwsAzIcon({ width = 24, height = 24, className }: CloudIconProps) {
  return (
    <svg
      role="img"
      aria-label="Availability Zone"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <title>Availability Zone</title>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="#FF9900"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="1.5"
        fill="#FF9900"
        fillOpacity="0.1"
        stroke="#FF9900"
        strokeWidth="1"
      />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fill="#FF9900"
        fontSize="7"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        AZ
      </text>
    </svg>
  );
}

function GcpRegionIcon({ width = 24, height = 24, className }: CloudIconProps) {
  return (
    <svg
      role="img"
      aria-label="GCP Region"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <title>GCP Region</title>
      <circle cx="12" cy="12" r="9" stroke="#4285F4" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="5" ry="9" stroke="#4285F4" strokeWidth="1" />
      <path d="M3 12h18" stroke="#4285F4" strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="#4285F4" />
    </svg>
  );
}

function GcpZoneIcon({ width = 24, height = 24, className }: CloudIconProps) {
  return (
    <svg
      role="img"
      aria-label="GCP Zone"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <title>GCP Zone</title>
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke="#4285F4"
        strokeWidth="1.5"
        strokeDasharray="4 2"
      />
      <rect
        x="6"
        y="6"
        width="12"
        height="12"
        rx="1.5"
        fill="#4285F4"
        fillOpacity="0.1"
        stroke="#4285F4"
        strokeWidth="1"
      />
      <text
        x="12"
        y="14"
        textAnchor="middle"
        fill="#4285F4"
        fontSize="6"
        fontWeight="bold"
        fontFamily="sans-serif"
      >
        Zone
      </text>
    </svg>
  );
}

function AzureRegionIcon({
  width = 24,
  height = 24,
  className,
}: CloudIconProps) {
  return (
    <svg
      role="img"
      aria-label="Azure Region"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <title>Azure Region</title>
      <circle cx="12" cy="12" r="9" stroke="#0078D4" strokeWidth="1.5" />
      <ellipse cx="12" cy="12" rx="5" ry="9" stroke="#0078D4" strokeWidth="1" />
      <path d="M3 12h18" stroke="#0078D4" strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="#0078D4" />
    </svg>
  );
}

// --- Cloud Icon Map ---

export const cloudIconMap: Record<string, CloudIcon> = {
  // AWS (official aws-react-icons)
  "aws-ec2": awsIcon(ArchitectureServiceAmazonEC2),
  "aws-lambda": awsIcon(ArchitectureServiceAWSLambda),
  "aws-vpc": awsIcon(ArchitectureGroupVirtualprivatecloudVPC),
  "aws-s3": awsIcon(ArchitectureServiceAmazonSimpleStorageService),
  "aws-rds": awsIcon(ArchitectureServiceAmazonRDS),
  "aws-sg": awsIcon(ArchitectureServiceAmazonSecurityLake),
  "aws-elb": awsIcon(ArchitectureServiceElasticLoadBalancing),
  "aws-route53": awsIcon(ArchitectureServiceAmazonRoute53),
  "aws-subnet": awsIcon(ArchitectureGroupPrivatesubnet),
  "aws-iam-role": awsIcon(ArchitectureServiceAWSIdentityandAccessManagement),
  "aws-cloudfront": awsIcon(ArchitectureServiceAmazonCloudFront),
  "aws-sns": awsIcon(ArchitectureServiceAmazonSimpleNotificationService),
  "aws-sqs": awsIcon(ArchitectureServiceAmazonSimpleQueueService),
  "aws-ecs": awsIcon(ArchitectureServiceAmazonElasticContainerService),
  "aws-region": awsIcon(ArchitectureGroupRegion),
  "aws-az": AwsAzIcon,
  // GCP (official SVGs from gcp-icons)
  "gcp-compute": GcpComputeEngine,
  "gcp-function": GcpCloudFunction,
  "gcp-gke": GcpGke,
  "gcp-vpc": GcpVpc,
  "gcp-gcs": GcpCloudStorage,
  "gcp-cloudsql": GcpCloudSql,
  "gcp-region": GcpRegionIcon,
  "gcp-zone": GcpZoneIcon,
  // Azure (official @threeveloper/azure-react-icons)
  "azure-vm": azureIcon(AzureVirtualMachineIcon),
  "azure-function": azureIcon(AzureFunctionAppsIcon),
  "azure-aks": azureIcon(AzureKubernetesIcon),
  "azure-vnet": azureIcon(AzureVirtualNetworksIcon),
  "azure-storage": azureIcon(AzureStorageAccountsIcon),
  "azure-sql": azureIcon(AzureSQLIcon),
  "azure-region": AzureRegionIcon,
  "azure-resource-group": azureIcon(AzureResourceGroupsIcon),
};
