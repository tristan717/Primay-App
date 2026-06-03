export const users = [
  {
    id: "u-001",
    name: "Mika Santos",
    email: "mika@primary.test",
    role: "ADMIN",
    position: "Project Manager",
    status: "Active",
    activeTasks: 4,
    overdueTasks: 1,
  },
  {
    id: "u-002",
    name: "Paolo Reyes",
    email: "paolo@primary.test",
    role: "EMPLOYEE",
    position: "Frontend Developer",
    status: "Active",
    activeTasks: 6,
    overdueTasks: 2,
  },
  {
    id: "u-003",
    name: "Nina Cruz",
    email: "nina@primary.test",
    role: "EMPLOYEE",
    position: "QA Analyst",
    status: "Active",
    activeTasks: 2,
    overdueTasks: 0,
  },
  {
    id: "u-004",
    name: "Jon Lim",
    email: "jon@primary.test",
    role: "SYSADMIN",
    position: "IT Admin",
    status: "Active",
    activeTasks: 1,
    overdueTasks: 0,
  },
];

export const projects = [
  {
    id: "prj-001",
    name: "Client Portal Revamp",
    lead: "Mika Santos",
    status: "At Risk",
    startDate: "2026-05-20",
    endDate: "2026-06-15",
    location: "Calamba HQ",
    company: "Bandaria",
    progress: 48,
    details: "Redesign the client portal and improve task visibility for external collaborators.",
    members: ["Mika Santos", "Paolo Reyes", "Nina Cruz"],
  },
  {
    id: "prj-002",
    name: "Operations Tracker",
    lead: "Mika Santos",
    status: "On Track",
    startDate: "2026-05-28",
    endDate: "2026-06-25",
    location: "Remote",
    company: "Internal",
    progress: 32,
    details: "Build monitoring dashboards for operations workload and deadline tracking.",
    members: ["Mika Santos", "Nina Cruz"],
  },
  {
    id: "prj-003",
    name: "Support Knowledge Base",
    lead: "Nina Cruz",
    status: "Planning",
    startDate: "2026-06-01",
    endDate: "2026-06-18",
    location: "Optional",
    company: "Internal",
    progress: 12,
    details: "Organize support guides, approvals, and publishing workflow.",
    members: ["Nina Cruz"],
  },
];

export const tasks = [
  {
    id: "tsk-001",
    projectId: "prj-001",
    project: "Client Portal Revamp",
    name: "Implement employee dashboard",
    assignee: "Paolo Reyes",
    createdBy: "Mika Santos",
    status: "In Progress",
    priority: "High",
    deadline: "2026-06-01",
    location: "Remote",
    company: "Bandaria",
    details: "Create dashboard cards for active tasks, overdue work, and upcoming deadlines.",
  },
  {
    id: "tsk-002",
    projectId: "prj-001",
    project: "Client Portal Revamp",
    name: "Validate project forms",
    assignee: "Nina Cruz",
    createdBy: "Mika Santos",
    status: "Pending",
    priority: "Medium",
    deadline: "2026-06-03",
    location: "Calamba HQ",
    company: "Bandaria",
    details: "Check required fields and deadline validation against project duration.",
  },
  {
    id: "tsk-003",
    projectId: "prj-002",
    project: "Operations Tracker",
    name: "Design workload risk indicators",
    assignee: "Paolo Reyes",
    createdBy: "Mika Santos",
    status: "Blocked",
    priority: "High",
    deadline: "2026-05-31",
    location: "Remote",
    company: "Internal",
    details: "Show overloaded employees and at-risk task groups for managers.",
  },
  {
    id: "tsk-004",
    projectId: "prj-003",
    project: "Support Knowledge Base",
    name: "Draft article approval workflow",
    assignee: "Nina Cruz",
    createdBy: "Mika Santos",
    status: "Completed",
    priority: "Low",
    deadline: "2026-06-08",
    location: "Remote",
    company: "Internal",
    details: "Map roles and status transitions for publishing support articles.",
  },
];

export const activityLogs = [
  {
    id: "log-001",
    actor: "Mika Santos",
    action: "Created task",
    target: "Implement employee dashboard",
    area: "Task",
    timestamp: "2026-05-29 09:20",
  },
  {
    id: "log-002",
    actor: "Paolo Reyes",
    action: "Changed status to Blocked",
    target: "Design workload risk indicators",
    area: "Task",
    timestamp: "2026-05-29 10:45",
  },
  {
    id: "log-003",
    actor: "Mika Santos",
    action: "Updated project duration",
    target: "Client Portal Revamp",
    area: "Project",
    timestamp: "2026-05-29 12:10",
  },
];

export const userLogs = [
  {
    id: "ulog-001",
    user: "Mika Santos",
    event: "Signed in",
    ipAddress: "192.168.1.12",
    timestamp: "2026-05-29 08:55",
  },
  {
    id: "ulog-002",
    user: "Paolo Reyes",
    event: "Signed out",
    ipAddress: "192.168.1.22",
    timestamp: "2026-05-29 11:30",
  },
  {
    id: "ulog-003",
    user: "Jon Lim",
    event: "Updated user role",
    ipAddress: "192.168.1.7",
    timestamp: "2026-05-29 13:02",
  },
];

export const company = {
  name: "Primary Project Management",
  address: "3rd Floor Yulo Bldg., Banga Road, Brgy. Parian, Calamba City, Laguna",
  email: "primary@bsns.com",
  phone: "09463251459",
  industry: "Project Operations",
};

export function getStatusTone(status) {
  switch (status) {
    case "At Risk":
    case "Blocked":
    case "Banned":
      return "border-red-200 bg-red-50 text-red-700";
    case "On Track":
    case "Active":
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "In Progress":
      return "border-blue-200 bg-blue-50 text-blue-700";
    default:
      return "border-zinc-200 bg-zinc-50 text-zinc-700";
  }
}

export function getTaskRisk(task) {
  if (task.status === "Completed") return "Clear";
  if (task.status === "Blocked") return "Needs attention";

  const deadline = new Date(`${task.deadline}T00:00:00`);
  const now = new Date();
  const daysLeft = Math.ceil((deadline - now) / 86400000);

  if (daysLeft < 0) return "Overdue";
  if (daysLeft <= 3) return "Due soon";
  return "Clear";
}

export function getDashboardStats() {
  const activeTasks = tasks.filter((task) => task.status !== "Completed").length;
  const riskyTasks = tasks.filter((task) => ["Overdue", "Due soon", "Needs attention"].includes(getTaskRisk(task))).length;
  const overloadedUsers = users.filter((user) => user.activeTasks >= 5).length;
  const atRiskProjects = projects.filter((project) => project.status === "At Risk").length;

  return { activeTasks, riskyTasks, overloadedUsers, atRiskProjects };
}
