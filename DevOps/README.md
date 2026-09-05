# List of things to learn. (DevOps)

## [Week-0](./Week-0/README.md) : **Orientation.**

- What is DevOps & why it exists,
- DevOps vs SRE vs Platform Engineering,
- The DevOps Lifecycle,
- Culture, Collaboration & CALMS Framework,
- Tools Landscape Overview,
- Setting up a Home Lab / Cloud Sandbox.

## [Week-1](./Week-1/README.md) : **Linux Fundamentals.**

- Linux Architecture & Distributions,
- File System Hierarchy,
- File Permissions & Ownership,
- Process Management,
- Package Managers (apt/yum/dnf),
- Systemd & Services,
- Users & Groups,
- Disk & Storage Management,
- Cron Jobs & Scheduling.

## [Week-2](./Week-2/README.md) : **Shell Scripting & Automation.**

- Bash Fundamentals,
- Variables & Data Types,
- Conditionals & Loops,
- Functions,
- String & File Manipulation,
- Regular Expressions,
- `sed`, `awk`, `grep`,
- Writing Automation Scripts,
- Error Handling in Scripts.

## [Week-3](./Week-3/README.md) : **Networking for DevOps.**

- OSI & TCP/IP Model,
- IP Addressing & Subnetting,
- DNS Fundamentals,
- HTTP/HTTPS & TLS Handshake,
- Load Balancers (L4 vs L7),
- Reverse Proxies (Nginx/HAProxy),
- Firewalls & Security Groups,
- VPNs & Network Troubleshooting Tools.

## [Week-4](./Week-4/README.md) : **Git for DevOps Workflows.**

- Advanced Git (Rebase, Cherry-pick, Bisect),
- Branching Strategies (GitFlow, Trunk-Based),
- Git Hooks,
- Monorepo vs Polyrepo,
- Code Review Practices,
- Git in CI/CD Pipelines.

## [Week-5](./Week-5/README.md) : **Cloud Computing Fundamentals.**

- IaaS vs PaaS vs SaaS,
- Public vs Private vs Hybrid Cloud,
- Shared Responsibility Model,
- Regions & Availability Zones,
- Cloud Pricing Models,
- Choosing a Cloud Provider (AWS/GCP/Azure).

## [Week-6](./Week-6/README.md) : **AWS Core Services.**

- IAM (Users, Roles, Policies),
- EC2 & Auto Scaling Groups,
- VPC, Subnets & Security Groups,
- S3 & Storage Classes,
- RDS & Managed Databases,
- Route 53,
- CloudWatch Basics,
- AWS CLI & SDK.

## [Week-7](./Week-7/README.md) : **GCP & Azure Core Services (Cross-Cloud Awareness).**

- GCP: IAM, Compute Engine & GKE Basics,
- GCP: Cloud Storage, Cloud SQL & VPC,
- Azure: Azure AD/Entra ID, Virtual Machines & AKS Basics,
- Azure: Blob Storage, Azure SQL & Virtual Networks,
- AWS vs GCP vs Azure Service-Equivalence Mapping,
- Choosing the Right Provider per Use Case.

## [Week-8](./Week-8/README.md) : **Virtualization & Docker Basics.**

- VMs vs Containers,
- Docker Architecture,
- Images, Containers & Layers,
- Dockerfile Best Practices,
- Docker Networking,
- Docker Volumes & Persistence,
- Docker Compose,
- Container Registries (Docker Hub/ECR).

## [Week-9](./Week-9/README.md) : **Docker Advanced.**

- Multi-Stage Builds,
- Image Optimization & Security Scanning,
- Docker Networking Deep Dive (Bridge/Host/Overlay),
- Docker Swarm Basics,
- Health Checks & Resource Limits,
- Debugging Containers,
- Rootless & Distroless Containers.

## [Week-10](./Week-10/README.md) : **Kubernetes Fundamentals.**

- Kubernetes Architecture (Control Plane & Nodes),
- Pods, ReplicaSets & Deployments,
- Services & Networking (ClusterIP, NodePort, LoadBalancer),
- ConfigMaps & Secrets,
- Namespaces,
- Labels & Selectors,
- `kubectl` Essentials.

## [Week-11](./Week-11/README.md) : **Kubernetes Intermediate.**

- Volumes & Persistent Storage (PV/PVC),
- StatefulSets & DaemonSets,
- Ingress Controllers,
- Resource Requests & Limits,
- Horizontal Pod Autoscaler (HPA),
- Liveness & Readiness Probes,
- RBAC in Kubernetes.

## [Week-12](./Week-12/README.md) : **Kubernetes Advanced.**

- Custom Resource Definitions (CRDs),
- Operators Pattern,
- Admission Controllers,
- Network Policies,
- Cluster Autoscaler,
- Multi-Cluster & Federation Concepts,
- Troubleshooting Kubernetes Clusters.

## [Week-13](./Week-13/README.md) : **Helm & Kubernetes Package Management.**

- What is Helm & Why use it,
- Charts, Templates & Values,
- Helm Repositories,
- Releases & Rollbacks,
- Writing Custom Helm Charts,
- Kustomize as an Alternative.

## [Week-14](./Week-14/README.md) : **Container Orchestration Alternatives.**

- HashiCorp Nomad Overview,
- AWS ECS & Fargate,
- Docker Swarm vs Kubernetes vs Nomad,
- When Not to Use Kubernetes,
- Choosing the Right Orchestrator for the Job.

## [Week-15](./Week-15/README.md) : **Infrastructure as Code (Terraform Basics).**

- IaC Concepts & Benefits,
- Terraform Architecture,
- Providers, Resources & Data Sources,
- HCL Syntax,
- State Management,
- Variables & Outputs,
- Terraform CLI Workflow (init/plan/apply/destroy).

## [Week-16](./Week-16/README.md) : **Terraform Advanced.**

- Modules,
- Remote State & State Locking,
- Workspaces,
- Provisioners,
- Terraform Cloud/Enterprise Basics,
- Managing Multiple Environments,
- Terraform Best Practices & Testing,
- Pulumi & AWS CDK Overview (Code-First IaC Alternatives).

## [Week-17](./Week-17/README.md) : **Configuration Management (Ansible).**

- Ansible Architecture (Agentless),
- Inventory & Playbooks,
- Modules & Roles,
- Variables & Templates (Jinja2),
- Handlers & Idempotency,
- Ansible Vault,
- Ansible vs Terraform vs Chef/Puppet.

## [Week-18](./Week-18/README.md) : **CI/CD Fundamentals.**

- What is CI/CD,
- Continuous Integration vs Delivery vs Deployment,
- Build, Test & Deploy Stages,
- Artifact Management,
- Pipeline as Code,
- Blue-Green, Canary & Rolling Deployments.

## [Week-19](./Week-19/README.md) : **CI/CD with GitHub Actions.**

- Workflows, Jobs & Steps,
- Actions Marketplace,
- Secrets & Environment Variables,
- Matrix Builds,
- Self-Hosted Runners,
- Building a Full CI/CD Pipeline for a Real App.

## [Week-20](./Week-20/README.md) : **CI/CD with Jenkins & GitLab CI.**

- Jenkins Architecture & Plugins,
- Jenkinsfile (Declarative & Scripted),
- Jenkins Agents & Distributed Builds,
- GitLab CI/CD Pipelines (`.gitlab-ci.yml`),
- Comparing Jenkins vs GitHub Actions vs GitLab CI.

## [Week-21](./Week-21/README.md) : **Artifact & Package Management.**

- Why Dedicated Artifact Repositories Matter,
- JFrog Artifactory Overview,
- Sonatype Nexus Overview,
- Versioning & Retention Policies,
- Container Image Registries Revisited (Private/Self-Hosted),
- Dependency Proxying & Caching.

## [Week-22](./Week-22/README.md) : **GitOps.**

- What is GitOps,
- Git as the Single Source of Truth,
- ArgoCD Architecture & Setup,
- FluxCD Overview,
- Sync Strategies & Rollbacks,
- GitOps vs Traditional CI/CD.

## [Week-23](./Week-23/README.md) : **Progressive Delivery & Feature Flags.**

- Feature Flags vs Environment Branching,
- Feature Flag Tools (LaunchDarkly/Unleash/Flagsmith),
- Canary Analysis,
- Traffic Shifting Strategies,
- Argo Rollouts & Flagger Overview,
- Rollback Strategies with Feature Flags.

## [Week-24](./Week-24/README.md) : **Monitoring & Observability.**

- The Three Pillars (Metrics, Logs, Traces),
- Prometheus Architecture & PromQL,
- Grafana Dashboards & Alerting,
- Node Exporter & Custom Exporters,
- Alertmanager,
- SLIs, SLOs & SLAs.

## [Week-25](./Week-25/README.md) : **Logging & Centralized Log Management.**

- Why Centralized Logging Matters,
- ELK/EFK Stack (Elasticsearch, Logstash/Fluentd, Kibana),
- Log Shipping & Parsing,
- Structured Logging Practices,
- Loki & Grafana for Logs,
- Log Retention & Cost Management.

## [Week-26](./Week-26/README.md) : **Distributed Tracing & APM.**

- What is Distributed Tracing,
- OpenTelemetry Fundamentals,
- Jaeger & Zipkin,
- Application Performance Monitoring (APM) Tools,
- Correlating Metrics, Logs & Traces.

## [Week-27](./Week-27/README.md) : **DevSecOps & Security.**

- Shift-Left Security,
- Static & Dynamic Application Security Testing (SAST/DAST),
- Container Image Scanning (Trivy/Snyk),
- Secrets Detection in Pipelines,
- Compliance as Code,
- Security in Kubernetes (Pod Security Standards).

## [Week-28](./Week-28/README.md) : **Secret Management.**

- Why Secret Management Matters,
- HashiCorp Vault Architecture,
- Dynamic Secrets & Leasing,
- Secrets in Kubernetes (Sealed Secrets/External Secrets Operator),
- Cloud-Native Secret Managers (AWS Secrets Manager/Parameter Store).

## [Week-29](./Week-29/README.md) : **Service Mesh & API Gateways.**

- What Problem a Service Mesh Solves,
- Istio Architecture (Data Plane vs Control Plane),
- Traffic Management & Canary Releases,
- mTLS & Security Policies,
- Linkerd as a Lightweight Alternative,
- API Gateways (Kong/NGINX/AWS API Gateway) & Service Discovery.

## [Week-30](./Week-30/README.md) : **Serverless & Event-Driven Infrastructure.**

- Serverless Concepts,
- AWS Lambda Fundamentals,
- API Gateway Integration,
- Event Sources & Triggers,
- Serverless Framework/SAM,
- Cold Starts & Cost Trade-offs.

## [Week-31](./Week-31/README.md) : **Site Reliability Engineering (SRE).**

- SRE vs DevOps,
- Error Budgets,
- Toil Reduction,
- On-Call Practices & Incident Management,
- Postmortems & Blameless Culture,
- Capacity Planning.

## [Week-32](./Week-32/README.md) : **Chaos Engineering & Resilience.**

- Principles of Chaos Engineering,
- Chaos Monkey & Chaos Mesh,
- Failure Injection Testing,
- Building Resilient Systems,
- Game Days & Disaster Recovery Drills.

## [Week-33](./Week-33/README.md) : **Backup, Disaster Recovery & Business Continuity.**

- Backup Strategies (Full/Incremental/Snapshot),
- RTO & RPO Concepts,
- Database Backup & Restore Automation,
- Multi-Region Failover Design,
- Disaster Recovery Runbooks,
- Testing Recovery Plans.

## [Week-34](./Week-34/README.md) : **Cloud Cost Optimization & FinOps.**

- FinOps Fundamentals,
- Cost Monitoring & Tagging Strategies,
- Right-Sizing Resources,
- Spot Instances & Reserved Capacity,
- Kubernetes Cost Optimization Tools.

## [Week-35](./Week-35/README.md) : **Multi-Cloud, Hybrid Cloud & Interview Prep.**

- Multi-Cloud Strategy & Trade-offs,
- Hybrid Cloud Patterns,
- Vendor Lock-in Considerations,
- End-to-End DevOps Pipeline Recap (Code → Build → Test → Deploy → Monitor),
- DevOps Interview Preparation.
