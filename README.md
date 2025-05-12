# AgentConnect 🧑‍💼⚙️

_A full-stack HR dashboard inspired by State Farm’s Sales Service and Assignment Application (SSAA)_

AgentConnect is a cloud-native HR platform designed to simulate key SSAA functionalities, allowing users to manage agents, team members, and assignments in one streamlined interface. This project demonstrates modern full-stack development using React, Node.js, PostgreSQL, and AWS.

---

## 🚀 Project Scope

This application was built to demonstrate alignment with the goals of the SSAA team at State Farm. AgentConnect empowers internal users to:
- View and manage agent profiles and regions
- Track and assign tasks to individual team members
- (Bonus) Display agent performance metrics (mock data)

---

## 🛠️ Tech Stack

### Frontend
- **React** – Component-based UI
- **TailwindCSS** – Utility-first CSS framework
- **Axios** – API consumption

### Backend
- **Node.js + Express** – REST API
- **PostgreSQL** – Relational database
- **AWS Lambda + API Gateway** – Serverless deployment (in progress)

### DevOps / Tools
- **GitHub + GitLab CI/CD**
- **Docker** – Local containerization
- **Vercel** – Frontend deployment
- **Serverless Framework** – Backend deployment

---

## 📦 Features

- ✅ Agent & Team Member Directory  
- ✅ Search and filter by region and office  
- ✅ Task Assignment Tracker  
- ✅ RESTful API for CRUD operations  
- ✅ Responsive, mobile-friendly design  
- 🔄 (Optional) Agent Insight Dashboard (mock analytics)

---

## 🧪 Testing

AgentConnect includes unit and component testing to ensure reliability:

- **Jest + Supertest** – Backend route testing
- **React Testing Library** – Component behavior tests
- **Manual QA** – Full UI validation

You can run tests using:

```bash
# Backend tests
cd agentconnect-backend
npm test

# Frontend tests
cd agentconnect-frontend
npm test
