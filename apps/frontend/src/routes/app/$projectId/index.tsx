import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/$projectId/")({
  component: () => null,
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/app/$projectId/dashboard",
      params: { projectId: params.projectId },
    });
  },
});
