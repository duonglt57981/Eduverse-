# Eduverse — Deployment & Development Guide

> ⚠️ **Dự án đã ngưng hoạt động** — Repository này được lưu giữ làm portfolio.
> Mọi thông tin hạ tầng (IP, domain, mật khẩu) đã được **ẩn danh** và **thay bằng placeholder**.

This repository contains the deployment configurations and workflows for **Eduverse**.
Below are the access links, ports, and configuration details for both local development and production environments.

---

## 💻 Local Development Environment

For running the application locally on your computer.

| Service | Address / Link | Internal Port | Description |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | [http://localhost:3000](http://localhost:3000) | `3000` | Next.js website UI |
| **API Backend** | [http://localhost:5002](http://localhost:5002) | `5002` | ASP.NET Core API |
| **Swagger UI** | [http://localhost:5002/swagger](http://localhost:5002/swagger) | - | Interactive API documentation |
| **Elasticsearch** | [http://localhost:9200](http://localhost:9200) | `9200` | Search engine service |
| **SQL Server** | `localhost,1433` | `1433` | Database server (SA password: `${SA_PASSWORD}`) |

> 💡 **Ghi chú:** Mật khẩu SA được cấu hình qua biến môi trường `SA_PASSWORD` trong file `.env` (xem `.env.example`).

---

## 🚀 Production Environment

For the live deployment hosted on our server.

| Service | Public Address / Link | Port | Details |
| :--- | :--- | :--- | :--- |
| **Frontend Client** | `https://<your-domain>` <br> `https://www.<your-domain>` | `443` (HTTPS) | Main production website |
| **API Backend** | `https://api.<your-domain>/swagger/index.html` | `443` (HTTPS) | Production API endpoint |
| **NPM Admin Panel** | `http://<server-ip>:81` | `81` (HTTP) | Nginx Proxy Manager dashboard |

> 🔒 **Ghi chú bảo mật:**
> - Domain thật: `<your-domain>` (đã ẩn để tránh lộ hạ tầng)
> - IP server: `<server-ip>` (đã ẩn)
> - NPM Admin Panel **không nên public** — chỉ truy cập qua VPN hoặc firewall whitelist.

---

## 🛠️ Nginx Proxy Manager Setup Instructions

Once the GitHub Actions CI/CD deployment runs successfully, configure the following proxy routing in Nginx Proxy Manager:

### 1. DNS Configuration

Ensure the following DNS **`A` records** are set up with your domain provider pointing to your server IP:

- `<your-domain>`
- `www.<your-domain>`
- `api.<your-domain>`

> 📝 **Ví dụ:** Nếu domain là `example.com` và IP server là `203.0.113.10`:
> ```
> A    @              203.0.113.10
> A    www            203.0.113.10
> A    api            203.0.113.10
> ```

---

### 2. Frontend Proxy Host Setup (Next.js Client)

1. Add a **Proxy Host** with the following details:
   - **Domain Names:** `<your-domain>`, `www.<your-domain>`
   - **Scheme:** `http`
   - **Forward Hostname:** `client` (Docker internal service name)
   - **Forward Port:** `3000`
   - **Websockets Support:** Enabled (Toggle ON)

2. In the **SSL Tab**:
   - Select **Request a new SSL Certificate**
   - Enable **Force SSL**, **HTTP/2 Support**, and **HSTS Enabled**
   - Agree to the Let's Encrypt Terms of Service and click **Save**

---

### 3. Backend Proxy Host Setup (.NET API)

1. Add a **Proxy Host** with the following details:
   - **Domain Names:** `api.<your-domain>`
   - **Scheme:** `http`
   - **Forward Hostname:** `api` (Docker internal service name)
   - **Forward Port:** `5002`

2. In the **SSL Tab**:
   - Select **Request a new SSL Certificate**
   - Enable **Force SSL**, **HTTP/2 Support**, and **HSTS Enabled**
   - Agree to the Let's Encrypt Terms of Service and click **Save**

---

## 🔐 Environment Variables

Tất cả thông tin nhạy cảm (mật khẩu, IP, domain thật) được quản lý qua biến môi trường.

### File `.env.example` (mẫu)

```bash
# ===== Database =====
SA_PASSWORD=your_strong_password_here

# ===== Domain & Server =====
DOMAIN=your-domain.com
SERVER_IP=your.server.ip.here

# ===== Elasticsearch =====
ELASTIC_PASSWORD=your_elastic_password_here

# ===== API =====
JWT_SECRET=your_jwt_secret_here
```

> ⚠️ **KHÔNG commit file `.env` thật** lên Git. File này đã có trong `.gitignore`.

---

## 🏗️ Architecture Overview

```
                    ┌─────────────────┐
                    │   Internet      │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Nginx Proxy Mgr │  (port 80/443)
                    │   (Docker)      │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
      ┌───────▼──────┐ ┌─────▼─────┐ ┌─────▼──────┐
      │   client     │ │    api    │ │  elastic   │
      │  (Next.js)   │ │  (.NET)   │ │  (search)  │
      │   :3000      │ │  :5002    │ │   :9200    │
      └──────────────┘ └─────┬─────┘ └────────────┘
                             │
                      ┌──────▼──────┐
                      │ SQL Server  │
                      │   :1433     │
                      └─────────────┘
```

---

## 🚀 CI/CD Pipeline

Pipeline được định nghĩa trong `.github/workflows/`:

1. **Build** — build Docker images cho `client` và `api`
2. **Test** — chạy unit tests
3. **Push** — push images lên container registry
4. **Deploy** — SSH vào server, pull images mới, restart containers

> 📝 Trong repo này, các bước deploy dùng **GitHub Secrets** để lưu credential (không hardcode).

---

## 📄 License

MIT — xem file [LICENSE](LICENSE) để biết chi tiết.
