# AgentConnect 🧑‍💼⚙️

_A full-stack HR dashboard inspired by State Farm's Sales Service and Assignment Application (SSAA)_

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

```

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/agentconnect.git
   cd agentconnect
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/agentconnect
   ```

4. Create the database:
   ```bash
   createdb agentconnect
   ```

5. Run the database migrations:
   ```bash
   psql -d agentconnect -f src/db/schema.sql
   ```

6. Seed the database with initial data:
   ```bash
   node src/db/seed.js
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Agents
- `GET /api/agents` - Get all agents
- `GET /api/agents/:id` - Get agent by ID
- `POST /api/agents` - Create new agent

### Team Members
- `GET /api/team-members?agentId=:id` - Get team members by agent ID
- `POST /api/team-members` - Create new team member

### Tasks
- `GET /api/tasks?assignedTo=:id` - Get tasks by assigned team member
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task status

## Project Structure

```
src/
├── db/
│   ├── schema.sql
│   └── seed.js
├── routes/
│   ├── agents.js
│   ├── team-members.js
│   └── tasks.js
└── index.js
```

## Deployment

1. Frontend (Vercel):
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy

2. Backend (AWS Lambda):
   - Install Serverless Framework
   - Configure AWS credentials
   - Deploy using `serverless deploy`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
