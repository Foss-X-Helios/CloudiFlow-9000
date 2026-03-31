# CloudiFlow-9000 🌩️

> **Visual Infrastructure as Code Generator**  
> Design cloud infrastructure visually, generate production-ready Terraform & Pulumi code

<p align="center">
  <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/React-Router-orange.svg" alt="React Router">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" alt="TypeScript">
</p>

CloudiFlow-9000 is an open-source visual Infrastructure as Code (IaC) generator that lets you design cloud architectures through an intuitive drag-and-drop interface and automatically generates production-ready Terraform or Pulumi code.

**No more writing boilerplate IaC from scratch** — design visually, deploy confidently.

---

## ✨ Features

- **🎨 Visual Designer** - Drag-and-drop interface for designing cloud infrastructure
- **☁️ Multi-Cloud Support** - AWS, Google Cloud Platform, and Microsoft Azure
- **📝 Code Generation** - Export to Terraform HCL or Pulumi TypeScript
- **💰 Cost Estimation** - Real-time cost estimates for your infrastructure
- **🔗 Smart Connections** - Automatic validation of resource connections
- **🎯 36+ Components** - EC2, Lambda, S3, VPC, GKE, Cloud Functions, Azure VMs, and more
- **🔄 Real-Time Preview** - See generated code as you design
- **📦 Project Management** - Organize designs by organizations and projects

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh/)
- [pnpm](https://pnpm.io/) 8+
- [Docker](https://www.docker.com/) (for local database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/CloudiFlow-9000.git
   cd CloudiFlow-9000
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up infrastructure** (PostgreSQL & Redis)

   ```bash
   docker run -d --rm --name cloudiflow-db -p 5432:5432 \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=cloudiflow_db \
     postgres:17-alpine -c max_connections=1000

   docker run -d --rm --name cloudiflow-redis -p 6379:6379 redis:alpine
   ```

4. **Start backend** (in `cloudiflow-backend/`)

   ```bash
   cd cloudiflow-backend
   pnpm install
   pnpm run dev
   ```

5. **Start frontend** (in root directory)

   ```bash
   cd ..
   pnpm run dev
   ```

6. **Visit** → `http://localhost:5173`

---

## 🎯 Usage

1. **Create Organization & Project** - Set up your workspace
2. **Design Infrastructure** - Drag components, connect resources
3. **Configure Resources** - Set properties for each component
4. **Generate Code** - Export as Terraform or Pulumi
5. **Deploy** - Use generated code with your IaC tool

---

## 📦 Supported Resources

**AWS** (20): EC2, Lambda, ECS, VPC, S3, RDS, Load Balancer, CloudFront, Route 53, SNS, SQS, Security Groups, IAM  
**GCP** (8): Compute Engine, Cloud Functions, GKE, Cloud Storage, Cloud SQL, VPC Network  
**Azure** (8): Virtual Machines, Azure Functions, AKS, Storage Accounts, Azure SQL, Virtual Network

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Documentation

- [Component Reference](./COMPONENTS_CODEGEN.md) - All supported resources
- [Architecture](./MODULARIZATION.md) - Code generation system
- [Backend API](./cloudiflow-backend/README.md) - API documentation

---

## 🗺️ Roadmap

- [ ] Direct cloud deployment
- [ ] Ansible playbook generation
- [ ] Multi-region support
- [ ] Team collaboration
- [ ] Terraform Cloud integration
- [ ] Import existing infrastructure

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

Built with: [React Router](https://reactrouter.com/), [React Flow](https://reactflow.dev/), [Hono](https://hono.dev/), [Drizzle ORM](https://orm.drizzle.team/), [TailwindCSS](https://tailwindcss.com/), [Bun](https://bun.sh/)

---

<p align="center">Made with ❤️ by the open-source community</p>
<p align="center"><strong>Design visually. Deploy confidently. ☁️</strong></p>
