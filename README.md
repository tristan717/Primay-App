This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.













My Documentation:

# 📋 PRIMARY - Project Management Application

## Project Overview

**Primary** is a comprehensive, role-based project management system designed to streamline team collaboration, task assignment, and workload distribution. Built with modern web technologies, it provides intelligent workload balancing, real-time analytics, and AI-powered decision support to help managers optimize team productivity.

### Key Capabilities

- **Multi-Role Management**: Support for Admins, Employees, and System Administrators with distinct permission levels
- **Project & Task Management**: Create, track, and manage projects and tasks with priority levels and deadline monitoring
- **Employee Workload Balancing**: Visual analytics to identify overloaded employees and optimize task distribution
- **AI-Powered Insights**: Google Gemini integration for intelligent recommendations on workload optimization
- **Comprehensive Audit Trail**: Complete activity logging with user tracking and IP monitoring
- **File Submission**: Employees can submit work deliverables directly within tasks
- **Real-time Analytics**: Workload charts, progress tracking, and risk detection
- **Secure Authentication**: Clerk-based authentication with role-based access control

---

## Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend Framework** | Next.js | 16.2.6 |
| **React** | React | 19.2.4 |
| **Styling** | TailwindCSS | 4 |
| **UI Components** | Shadcn/ui | 4.8.0 |
| **Authentication** | Clerk | 7.4.0 |
| **Database** | Supabase (PostgreSQL) | 2.106.2 |
| **AI/ML** | Google Generative AI (Gemini) | 0.24.1 |
| **HTTP Client** | Axios | 1.16.1 |
| **Data Visualization** | Recharts | 3.8.1 |
| **Icons** | Lucide React | 1.16.0 |

---

## Features by User Role

### 👨‍💼 Admin (Department Manager)
- Create and manage projects within department
- Create and assign tasks to employees
- Monitor employee workload with visual analytics
- View employee details and task history
- Generate AI Decision Support insights for workload optimization
- Track activity logs
- Access: `/admin/projects`, `/admin/tasks`, `/admin/users`, `/admin/myOrg`

### 👥 Employee (Team Member)
- View assigned tasks and projects
- Update task status (Pending/Done)
- Submit work files (PDF, Word, images up to 5MB)
- Track personal workload and deadlines
- Access: `/employee/tasks`, `/employee/projects`, `/employee/employeeHome`

### 🔐 System Administrator
- Manage all users across organization
- Assign roles and departments
- Ban/activate user accounts
- View complete system activity audit trail
- Register and manage organization profile
- Access: `/sysadmin/users`, `/sysadmin/actLogs`, `/sysadmin/myOrg`

---

## Database Schema

### Core Tables

**users**
- User profiles with Clerk integration
- Roles: ADMIN, EMPLOYEE, SYSADMIN
- Department-based access control
- Soft delete via user_status flag

**project**
- Projects with priority levels (LOW, MID, HIGH)
- Project metadata (location, description, lead)
- Status tracking and archive capability
- Created by admin user

**task**
- Tasks assigned to employees
- Deadline tracking and status management
- Project association
- File submission support

**organization**
- Company/department profile
- Contact information
- Associated users

**activity_log**
- Comprehensive audit trail
- IP address tracking
- User, role, and department information
- Method tracking (GET, POST, PUT, DELETE)
- File attachment logging

### Storage
- **task_submitted** bucket: Employee task submission files

---

## API Endpoints

### Projects
- `GET /api/project` - List projects
- `POST /api/project` - Create project
- `PUT /api/project` - Update project
- `POST /api/project_task` - Get project details

### Tasks
- `GET /api/task?project_id=X` - List project tasks
- `POST /api/task` - Create task
- `PUT /api/task/[id]` - Update task
- `PUT /api/task/archive` - Archive task
- `GET /api/all_task` - Get all admin tasks
- `PUT /api/employee/tasks` - Update task status (employee)
- `GET /api/employee/tasks` - Employee's assigned tasks

### Employees & Workload
- `GET /api/admin_employee` - List department employees
- `GET /api/admin_employee_workload?project_id=X` - Workload data
- `GET /api/my_employee?id=X` - Employee details
- `GET /api/my_employee/contribution` - Employee contributions

### Users & Organization
- `GET /api/users` - Current user info
- `GET /api/userSelect` - Users for dropdown
- `GET /api/users/getUsers` - All users (sysadmin)
- `POST /api/organization` - Create/update organization

### AI & Analytics
- `POST /api/gemini` - Generate AI insights
- `GET /api/activity_logs` - Activity audit trail
- `POST /api/employee/task_submit` - Submit task file

---

## Installation & Local Setup

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- Accounts for:
  - [Clerk](https://clerk.com) - Authentication
  - [Supabase](https://supabase.com) - Database
  - [Google AI Studio](https://ai.google.dev) - Gemini API (optional feature)
- RLS is strict, run these Bypass commands at the SQL Editor of Supabase:
GRANT SELECT ON public.documents TO anon
GRANT SELECT ON public.document_shares TO anon
GRANT SELECT ON public.document_attachments TO anon
GRANT INSERT ON public.documents TO anon
GRANT UPDATE ON public.documents TO anon
GRANT INSERT, UPDATE ON public.document_shares TO anon
GRANT SELECT ON public.app_users TO anon

### Step 1: Clone Repository

```bash
git clone https://github.com/tristan717/Primay-App.git
cd primary-app

Step 2: Install Dependencies
# install framework
npm install

Step 3: Configure Environment Variables

add a period in front of the file name of env file
that is already in the repo.

If you want to recreate the database, auth, and AI dependencies
on your own here are the steps: 
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# API Configuration
NEXT_PUBLIC_API_URL=/api

# key acquisistion
How to get these keys:

Clerk Keys
Go to clerk.com
Create project or sign in
Go to API Keys
Copy "Publishable Key" and "Secret Key"

Supabase Keys
Go to supabase.com
Create project or sign in
Go to Project Settings → API
Copy "Project URL", "Anon Key", and "Service Role Key"

Gemini API Key
Go to ai.google.dev
Click "Get API Key"
Create new API key in Google Cloud Console
Copy the key



Step 4: Run Development Server
npm run dev


Step 5: Create Organization (First Login)
Sign up with Clerk
You will be created as a SYSADMIN
Complete organization setup form
Add team members and assign roles
Users can now log in



primary-app/
├── app/
│   ├── layout.js                    # Root layout
│   ├── page.js                      # Landing page
│   ├── (auth)/                      # Auth routes (Clerk)
│   ├── (admin)/                     # Admin dashboard
│   ├── (employee)/                  # Employee dashboard
│   ├── (sysadmin)/                  # System admin dashboard
│   ├── api/                         # RESTful API routes
│   └── company-setup/               # Organization setup
├── components/
│   ├── Core UI                      # Layout, navigation, shell
│   ├── Tables                       # Data tables & lists
│   ├── Widgets                      # Dashboard widgets
│   └── ui/                          # Shadcn UI components
├── lib/
│   ├── checkUser.js                 # Auth verification
│   ├── activityLogger.js            # Audit logging
│   └── utils.js                     # Helper functions
├── utils/
│   ├── axios.js                     # HTTP client
│   ├── dbServer.js                  # Supabase server
│   └── supabase.js                  # Supabase client
├── actions/                         # Server actions
├── public/                          # Static assets
└── package.json


Key Features Explained
1. Multi-Role Authentication
Clerk handles secure user authentication
Users automatically created in database on first login
Role assignment: ADMIN, EMPLOYEE, SYSADMIN
Department-based data isolation
Soft delete capability (ban/activate users)

2. Project Management
Create projects with metadata (name, location, lead, priority)
Set project status and priority levels
Archive completed projects
View project progress and associated tasks
Department-specific access control

3. Task Management
Create tasks within projects
Assign tasks to specific employees
Set deadlines with visual indicators
Track task status (Pending/Done)
Enable file submissions for deliverables
Support PDF, Word, JPG, PNG uploads (max 5MB)

4. Workload Analytics
Real-time area charts showing task distribution
Employee workload visualization
Identify overloaded team members
See pending vs. completed tasks per employee
Export/analyze workload data

5. AI Decision Support
Google Gemini Integration: Analyzes employee workload and task data
Smart Recommendations: Suggests optimal task reallocation
Admin-Only Feature: Available in employee detail view
Contextual Insights: Considers deadlines, priorities, and employee capacity

6. Activity Audit Trail
Complete system audit log
Tracks: User, Action, Timestamp, IP Address, Department
Queryable by date range or user
Supports compliance and security audits


AI Integration Details
Decision Support Feature
The Decision Support component uses Generative AI (Gemini) of Google to provide intelligent workload analysis:

Trigger: Admin clicks "Generate AI Insights" in employee detail view
Data Sent: Employee profile, assigned tasks, and workload metrics
Processing: Gemini analyzes and generates recommendations
Display: Insights show in formatted card on dashboard
Use Cases:
Workload balancing suggestions
Task reallocation recommendations
Deadline risk identification
Employee capacity analysis
Backend Route: POST /api/gemini
Model: Google Generative AI (Gemini 3.5 Flash)
Security: API key server-side only, role-based access (Admin required)

Incomplete Functionality & Known Issues
Error message may not occure, I focused on writing logics that make the features do what it needs to do.



Troubleshooting
Common Issues
"Unauthenticated User" Error

Verify Clerk keys are correct
Check user is signed in via Clerk
Clear browser cookies and retry
"Unauthorized Access" Error

Verify user role matches required role for route
Check department assignment
Confirm user_status is active (not banned)
Database Connection Failed

Verify Supabase credentials in .env.local
Check Supabase project is active
Verify RLS policies are disabled or properly configured
Gemini API Errors

Verify GEMINI_API_KEY is set and valid
Check API quota hasn't been exceeded
Ensure request payload is valid JSON
File Upload Fails

Verify file size under 5MB
Check file type (PDF, Word, JPG, PNG only)
Ensure Supabase storage bucket exists
