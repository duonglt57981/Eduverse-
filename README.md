# Eduverse Deployment & Development Links

This repository contains the deployment configurations and workflows for **Eduverse**. Below are the access links, ports, and configuration details for both local development and production environments.

---

## 💻 Local Development Environment

For running the application locally on your computer.

| Service | Address / Link | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | [http://localhost:3000](http://localhost:3000) | `3000` | Next.js website UI |
| **API Backend** | [http://localhost:5002](http://localhost:5002) | `5002` | ASP.NET Core API |
| **Swagger UI** | [http://localhost:5002/swagger](http://localhost:5002/swagger) | - | Interactive API documentation |
| **Elasticsearch** | [http://localhost:9200](http://localhost:9200) | `9200` | Search engine service |
| **SQL Server** | `localhost,1433` | `1433` | Database server (SA password: `YourStr0ng!Password`) |

---

## 🚀 Production Environment

For the live deployment hosted on your server (`110.172.29.244`).

| Service | Public Address / Link | Port | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | [https://eduverse.website](https://eduverse.website) <br> [https://www.eduverse.website](https://www.eduverse.website) | `443` (HTTPS) | Main production website |
| **API Backend** | [https://api.eduverse.website/swagger/index.html](https://api.eduverse.website/swagger/index.html) | `443` (HTTPS) | Production API endpoint |
| **NPM Admin Panel** | [http://110.172.29.244:81](http://110.172.29.244:81) | `81` (HTTP) | Nginx Proxy Manager dashboard |

### 🔑 Default Credentials (Nginx Proxy Manager)
*   **Email:** `luonghau1808182006@gmail.com`
*   **Password:** `hrKtE*CP$oOPhAwR`
*   *(Note: You will be asked to update these details on your first login).*

---

## 🛠️ Nginx Proxy Manager Setup Instructions

Once your GitHub Actions CI/CD deployment runs successfully, you must configure the following proxy routing in Nginx Proxy Manager:

### 1. DNS Configuration
Ensure the following DNS **`A` records** are set up with your domain provider pointing to your server IP `110.172.29.244`:
*   `eduverse.website`
*   `www.eduverse.website`
*   `api.eduverse.website`

### 2. Frontend Proxy Host Setup (Next.js Client)
1. Add a **Proxy Host** with the following Details:
   * **Domain Names:** `eduverse.website`, `www.eduverse.website`
   * **Scheme:** `http`
   * **Forward Hostname:** `client` (Docker internal service name)
   * **Forward Port:** `3000`
   * **Websockets Support:** Enabled (Toggle ON)
2. In the **SSL Tab**:
   * Select **Request a new SSL Certificate**
   * Enable **Force SSL**, **HTTP/2 Support**, and **HSTS Enabled**
   * Agree to the Let's Encrypt Terms of Service and click **Save**.

### 3. Backend Proxy Host Setup (.NET API)
1. Add a **Proxy Host** with the following Details:
   * **Domain Names:** `api.eduverse.website`
   * **Scheme:** `http`
   * **Forward Hostname:** `api` (Docker internal service name)
   * **Forward Port:** `5002`
2. In the **SSL Tab**:
   * Select **Request a new SSL Certificate**
   * Enable **Force SSL**, **HTTP/2 Support**, and **HSTS Enabled**
   * Agree to the Let's Encrypt Terms of Service and click **Save**.