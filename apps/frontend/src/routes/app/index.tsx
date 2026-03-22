import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/app/")({
  component: () => null,
  beforeLoad: () => {
    // TODO: this should in theory never happen unless the user is changing the url manually
    throw redirect({ to: "/" });
  },
});
