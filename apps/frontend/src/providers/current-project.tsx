import { atom, useSetAtom } from "jotai";
import { useParams } from "@tanstack/react-router";

export const currentProjectIdAtom = atom<string | null>(null);

/**
 * Syncs the current projectId from URL params to the Jotai atom.
 */
export function CurrentProjectSync() {
  const params = useParams({ from: "/app/$projectId/dashboard/" });
  const setProjectId = useSetAtom(currentProjectIdAtom);

  if (params.projectId) {
    setProjectId(params.projectId);
  }

  return null;
}
