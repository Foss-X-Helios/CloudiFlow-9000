import type { CanvasNode } from "~/types";
import { toPascalCase, toSnakeCase } from "../types";

export function generateAWSTerraform(nodes: CanvasNode[]): string {
  let code = "";

  nodes.forEach((node) => {
    const { component, config } = node.data;
    const resourceName = toPascalCase(node.data.label);

    switch (component.id) {
      // ==================== AWS Infrastructure ====================
      case "aws-region":
        code += `
# AWS Region: ${config.regionName || "us-east-1"}
# This is a container for visual organization
`;
        break;

      case "aws-az":
        code += `
# Availability Zone: ${config.azName || "us-east-1a"}
# This is a container for visual organization
`;
        break;

      // ==================== AWS Compute ====================
      case "aws-ec2":
        code += `
resource "aws_instance" "${toSnakeCase(resourceName)}" {
  ami           = "${config.ami || "ami-0c55b159cbfafe1f0"}"
  instance_type = "${config.instanceType || "t2.micro"}"

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-lambda":
        code += `
resource "aws_lambda_function" "${toSnakeCase(resourceName)}" {
  function_name = "${resourceName}"
  runtime      = "${config.runtime || "nodejs20.x"}"
  timeout      = ${config.timeout || 30}
  memory_size   = ${config.memory || 128}

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-ecs":
        code += `
resource "aws_ecs_cluster" "${toSnakeCase(resourceName)}" {
  name = "${config.clusterName || "my-cluster"}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "${resourceName}"
  }
}

resource "aws_ecs_cluster_capacity_providers" "${toSnakeCase(resourceName)}_cp" {
  cluster_name       = aws_ecs_cluster.${toSnakeCase(resourceName)}.name
  capacity_providers = ["${config.capacityProvider || "FARGATE"}"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "${config.capacityProvider || "FARGATE"}"
  }
}
`;
        break;

      case "aws-sns":
        code += `
resource "aws_sns_topic" "${toSnakeCase(resourceName)}" {
  name       = "${config.topicName || "my-topic"}${config.fifoTopic ? ".fifo" : ""}"
  fifo_topic = ${config.fifoTopic ?? false}

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-sqs":
        code += `
resource "aws_sqs_queue" "${toSnakeCase(resourceName)}" {
  name                       = "${config.queueName || "my-queue"}${config.fifoQueue ? ".fifo" : ""}"
  fifo_queue                 = ${config.fifoQueue ?? false}
  visibility_timeout_seconds = ${config.visibilityTimeout || 30}

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      // ==================== AWS Network ====================
      case "aws-vpc":
        code += `
resource "aws_vpc" "${toSnakeCase(resourceName)}" {
  cidr_block           = "${config.cidrBlock || "10.0.0.0/16"}"
  enable_dns_hostnames = ${config.enableDnsHostnames ?? true}
  enable_dns_support   = true

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-subnet":
        code += `
resource "aws_subnet" "${toSnakeCase(resourceName)}" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "${config.cidrBlock || "10.0.1.0/24"}"
  availability_zone       = "${config.availabilityZone || "us-east-1a"}"
  map_public_ip_on_launch = ${config.isPublic ?? true}

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-elb":
        code += `
resource "aws_lb" "${toSnakeCase(resourceName)}" {
  name               = "${toSnakeCase(resourceName)}"
  internal           = ${config.scheme === "internal"}
  load_balancer_type = "${config.loadBalancerType || "application"}"

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-cloudfront":
        code += `
resource "aws_cloudfront_distribution" "${toSnakeCase(resourceName)}" {
  enabled             = true
  is_ipv6_enabled     = true
  price_class         = "${config.priceClass || "PriceClass_100"}"
  default_root_object = "index.html"

  origin {
    domain_name = "example.s3.amazonaws.com"
    origin_id   = "S3-${resourceName}"
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${resourceName}"
    viewer_protocol_policy = "redirect-to-https"
    default_ttl            = ${config.defaultTtl || 86400}

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-route53":
        code += `
resource "aws_route53_zone" "${toSnakeCase(resourceName)}" {
  name = "${config.domainName || "example.com"}"

  tags = {
    Name = "${resourceName}"
  }
}

resource "aws_route53_record" "${toSnakeCase(resourceName)}_record" {
  zone_id = aws_route53_zone.${toSnakeCase(resourceName)}.zone_id
  name    = "${config.domainName || "example.com"}"
  type    = "${config.recordType || "A"}"
  ttl     = 300
  records = ["192.0.2.1"]
}
`;
        break;

      // ==================== AWS Storage ====================
      case "aws-s3":
        code += `
resource "aws_s3_bucket" "${toSnakeCase(resourceName)}" {
  bucket = "${config.bucketName || "my-bucket"}"

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      // ==================== AWS Database ====================
      case "aws-rds":
        code += `
resource "aws_db_instance" "${toSnakeCase(resourceName)}" {
  identifier           = "${toSnakeCase(resourceName)}"
  engine              = "${config.engine || "mysql"}"
  instance_class      = "${config.instanceClass || "db.t3.micro"}"
  allocated_storage   = ${config.allocatedStorage || 20}
  username            = "admin"
  password            = var.rds_password
  skip_final_snapshot = true
}

variable "rds_password" {
  description = "RDS Password"
  type        = string
  sensitive   = true
}
`;
        break;

      // ==================== AWS Security ====================
      case "aws-sg":
        code += `
resource "aws_security_group" "${toSnakeCase(resourceName)}" {
  name        = "${resourceName}"
  description = "${config.description || "Security group"}"

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;

      case "aws-iam-role":
        code += `
resource "aws_iam_role" "${toSnakeCase(resourceName)}" {
  name = "${config.roleName || "my-role"}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "${config.service || "ec2.amazonaws.com"}"
        }
      }
    ]
  })

  tags = {
    Name = "${resourceName}"
  }
}
`;
        break;
    }
  });

  return code;
}
