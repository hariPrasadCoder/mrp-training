export type Week = {
  id: number;
  eyebrow: string;
  title: string;
  outcome: string;
  accent: "pink" | "blue" | "green" | "yellow" | "coral";
  status: "complete" | "current" | "locked";
};

export const weeks: Week[] = [
  { id: 0, eyebrow: "Before we begin", title: "Set your foundation", outcome: "Arrive ready with your tools, support group and product direction.", accent: "coral", status: "current" },
  { id: 1, eyebrow: "AI app", title: "Ship something real", outcome: "Build a useful AI product and publish it at a live URL.", accent: "pink", status: "locked" },
  { id: 2, eyebrow: "RAG", title: "Give it your data", outcome: "Add retrieval over real documents and test the answers.", accent: "blue", status: "locked" },
  { id: 3, eyebrow: "AI agents", title: "Make it take action", outcome: "Build a multi-step workflow with tools, state and approvals.", accent: "green", status: "locked" },
  { id: 4, eyebrow: "LLMOps + evals", title: "Make it production-ready", outcome: "Deploy, observe, evaluate and guard the system.", accent: "yellow", status: "locked" },
];

export const onboardingItems = [
  { id: "profile", group: "Your plan", title: "Complete your learner profile", detail: "Tell us your timezone, current experience, weekly availability and what success looks like.", meta: "5 min" },
  { id: "whatsapp", group: "Your plan", title: "Join your private WhatsApp group", detail: "This is where you, Hari and the support team communicate during the program.", meta: "2 min" },
  { id: "calendar", group: "Your plan", title: "Book your first Saturday checkpoint", detail: "Choose a one-to-one slot. Cal.com creates your Google Meet link automatically.", meta: "2 min" },
  { id: "github", group: "Builder setup", title: "Create or confirm your GitHub account", detail: "You will submit one repository that grows throughout the four weeks.", meta: "5 min" },
  { id: "editor", group: "Builder setup", title: "Install an AI coding workspace", detail: "Install Cursor or Claude Code and make sure you can open a local project.", meta: "15 min" },
  { id: "runtime", group: "Builder setup", title: "Check your development setup", detail: "Confirm Git, Python, Node.js and a code editor are working on your machine.", meta: "15 min" },
  { id: "ideas", group: "Your product", title: "Write three problem ideas", detail: "Choose problems you understand. Describe who has the problem and why it matters.", meta: "20 min" },
  { id: "brief", group: "Your product", title: "Draft your one-page product brief", detail: "Pick one problem, outline the AI-assisted solution, expected user and smallest useful result.", meta: "25 min" },
];

export const learners = [
  { id: "ritvika", name: "Ritvika", initials: "RI", timezone: "Asia/Kolkata", week: 0, progress: 38, status: "Onboarding", activity: "Today", next: "Join WhatsApp", whatsapp: false, saturday: "Not booked", accent: "pink" },
  { id: "arun", name: "Arun", initials: "AR", timezone: "Europe/London", week: 2, progress: 56, status: "On track", activity: "2h ago", next: "Submit retrieval test", whatsapp: true, saturday: "Sat · 10:00", accent: "blue" },
  { id: "sumit", name: "Sumit", initials: "SU", timezone: "America/New_York", week: 3, progress: 68, status: "Review due", activity: "Yesterday", next: "Review agent workflow", whatsapp: true, saturday: "Sat · 18:30", accent: "green" },
  { id: "maya", name: "Maya", initials: "MA", timezone: "Europe/Berlin", week: 1, progress: 22, status: "Needs attention", activity: "4d ago", next: "Complete FastAPI lesson", whatsapp: true, saturday: "Sat · 13:00", accent: "yellow" },
] as const;

export const projectIdeas = [
  "A policy assistant that answers from a company handbook",
  "A research copilot that compares evidence across reports",
  "A customer-support assistant that drafts grounded replies",
  "A meeting follow-up agent that turns notes into approved actions",
  "A career coach that evaluates a portfolio against target roles",
  "A document intake assistant that extracts and validates key fields",
];
