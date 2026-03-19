import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("org/:orgId/project/:projectId", "routes/editor.tsx"),
] satisfies RouteConfig;
