import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: RedirectToAuth,
});

function RedirectToAuth() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/auth" });
  }, []);

  return null;
}
