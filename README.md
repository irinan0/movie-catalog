# 🎬 Movie Catalog — DevOps Infrastructure & CI/CD Pipeline

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Jenkins](https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Prometheus](https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white)
![Grafana](https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)

A production-ready, fully containerized microservice web application featuring an automated Jenkins CI/CD pipeline, real-time Prometheus/Grafana monitoring, and infrastructure provisioning via Terraform.

---

## 📌 Executive Summary

The **Movie Catalog** project demonstrates an end-to-end DevOps workflow engineered for single-command deployment, automated continuous integration, service orchestration, and real-time observability.

The infrastructure stack runs completely isolated within Docker containers, eliminating local runtime dependencies while maintaining high availability and rapid developer turnaround.

---

## 🏗️ System Architecture

```text
                        +----------------------------+
                        |   GitHub Code Repository   |
                        +----------------------------+
                                      |
                                  ( Poll SCM )
                                      v
                        +----------------------------+
                        |      Jenkins CI/CD         |
                        |       Port: 9090           |
                        +----------------------------+
                                      |
                           ( Docker Socket Mount )
                                      v
                        +----------------------------+
                        |       Docker Engine        |
                        +----------------------------+
                                      |
      +-------------------+-----------+-----------+-------------------+
      |                   |                       |                   |
      v                   v                       v                   v
+-----------+       +-----------+           +------------+      +-----------+
| Frontend  |       |  Backend  |           | Prometheus |      |  Grafana  |
| Nginx:8080|       |FastAPI:8000           |Metrics:9091|      | Dashboards|
+-----------+       +-----------+           +------------+      +-----------+
```

### Stack Components & Port Allocations

| Service | Technology | Internal Port | Host Port | Role / Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend** | Nginx / Vanilla JS | `80` | `8080` | Serves static web assets and interacts with REST API |
| **Backend** | Python (FastAPI) | `8000` | `8000` | Handles business logic and provides OpenAPI/Swagger docs |
| **CI/CD Engine** | Jenkins LTS | `8080` | `9090` | Automated build, test, and container deployment controller |
| **Metrics Collector** | Prometheus | `9090` | `9091` | Scrapes performance and health metrics (`scrape_interval: 15s`) |
| **Visualization** | Grafana | `3000` | `3000` | Interactive metrics visualization and operational dashboards |
| **Infrastructure** | Terraform | — | — | Declarative AWS cloud infrastructure template |

---

## 🚀 Key Technical Features

### 1. Infrastructure as Code (IaC) & Container Orchestration
* **Unified Setup:** Single `docker-compose.yml` orchestrates all 5 containers across an isolated bridge network.
* **Jenkins Host Access:** Docker socket (`/var/run/docker.sock`) mounted inside the Jenkins container to allow sibling image builds.
* **Data Persistence:** Jenkins configuration and build history are saved to a named Docker volume (`jenkins_home`).

### 2. Autonomous CI/CD Pipeline
* **Jenkins Pipeline from SCM:** Jenkins loads build steps dynamically from the repository's `Jenkinsfile`.
* **Automated Poll SCM:** Periodically polls GitHub (`H/5 * * * *`) to trigger builds upon new code commits without requiring public webhooks or tunnels.

### 3. Comprehensive Observability
* **Prometheus:** Collects health and status data directly from target services.
* **Grafana Integration:** Connected internally via `http://prometheus:9090` for monitoring container availability (`up` metric) and operational trends.

---

## 📂 Project Structure

```text
movie-catalog/
├── backend/                  # FastAPI Application Source & Dockerfile
├── frontend/                 # Web UI (Nginx config, HTML, CSS, JS) & Dockerfile
├── jenkins/                  # Custom Jenkins Dockerfile & configuration
├── monitoring/
│   ├── prometheus.yml        # Prometheus target configurations
│   └── grafana/              # Grafana dashboards & datasources
├── terraform/
│   ├── providers.tf          # Template AWS provider configuration
│   ├── variables.tf          # Configurable input variables
│   └── terraform.tfvars.example # Sample variable overrides for testing
├── docker-compose.yml        # Main multi-container service definition
├── Jenkinsfile               # CI/CD pipeline definition script
├── PROJECT_PRESENTATION.md   # Presentation script and slide outlines
└── README.md                 # Project documentation
```

---

## 💻 Quick Start Guide

### Prerequisites
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
* [Git](https://git-scm.com/) installed.

### 1. Clone & Launch
```bash
# Clone the repository
git clone https://github.com/irinan0/movie-catalog.git
cd movie-catalog

# Launch the entire infrastructure in detached mode
docker-compose up -d
```

### 2. Verify Container Status
```bash
docker ps
```
All 5 containers (`movie-catalog-backend`, `movie-catalog-frontend`, `jenkins-server`, `prometheus`, and `grafana`) should show status `Up`.

---

## 🌐 Endpoint Directory

| Resource | Local URL | Credentials / Details |
| :--- | :--- | :--- |
| **Movie Catalog App** | `http://localhost:8080` | Public Web Interface |
| **FastAPI Swagger Docs** | `http://localhost:8000/docs` | Interactive REST API Documentation |
| **Jenkins Dashboard** | `http://localhost:9090` | Initial login setup required on first run |
| **Prometheus Targets** | `http://localhost:9091/targets` | Service status checks |
| **Grafana Dashboard** | `http://localhost:3000` | Default credentials: `admin` / `admin` |

---

## ☁️ Terraform Infrastructure Setup (Template Mode)

The `terraform/` directory contains template configuration designed for verification in cloud environments.

To deploy or test using your own AWS credentials:

```bash
cd terraform

# Copy template variables
cp terraform.tfvars.example terraform.tfvars

# Set AWS Credentials in environment
export AWS_ACCESS_KEY_ID="your_access_key"
export AWS_SECRET_ACCESS_KEY="your_secret_key"
export AWS_SESSION_TOKEN="your_session_token"

# Initialize and plan
terraform init
terraform plan
```

---

## 🔧 Resolved Engineering Challenges

1. **Host Port Collisions (`9090`):**
   * *Issue:* Both Jenkins and Prometheus default to port `9090`.
   * *Resolution:* Remapped Prometheus host port to `9091:9090` while preserving internal container communication.
2. **Container Network Routing:**
   * *Issue:* Grafana failed to query Prometheus when using the host port `9091`.
   * *Resolution:* Configured Grafana data source using internal Docker network DNS `http://prometheus:9090`.
3. **Secret Security & Git History Sanitization:**
   * *Issue:* Temporary laboratory credentials triggered GitHub Push Protection blocks.
   * *Resolution:* Refactored Terraform manifests to read credentials dynamically from environment variables, removing all static tokens from revision control.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.