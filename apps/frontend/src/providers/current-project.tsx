import { atom, useAtom } from "jotai";
import { useEffect } from "react";
import { useParams } from "@tanstack/react-router";
import { queryClient } from "@/lib/query-client";

export const currentProjectIdAtom = atom<string | null>(null);

/**
 * Syncs the current projectId from URL params to the Jotai atom and invalidates
 * TanStack Query caches when switching projects.
 */
export function CurrentProjectSync() {
  const projectIdFromParams = useParams({ strict: false, select: (p) => p.projectId });
  const [projectId, setProjectId] = useAtom(currentProjectIdAtom);

  useEffect(() => {
    if (projectIdFromParams && projectIdFromParams !== projectId) {
      // Invalidate all project-scoped queries when switching projects
      void queryClient.invalidateQueries({ queryKey: ["terminals"] });
      void queryClient.invalidateQueries({ queryKey: ["agents"] });
      void queryClient.invalidateQueries({ queryKey: ["commands"] });

      setProjectId(projectIdFromParams);
    }
  }, [projectIdFromParams, projectId, setProjectId]);

  return null;
}
