import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { rpc } from "@/lib/rpc";
import type { CreateProjectInput, ListProjectsInput } from "@pixxl/shared";

export function useCreateProject() {
  return useMutation({
    mutationFn: (input: CreateProjectInput) => rpc.project.createProject(input),
  });
}

export function useListProjects(options: ListProjectsInput = {}) {
  return useQuery({
    queryKey: ["projects", options],
    queryFn: () => rpc.project.listProjects(options),
  });
}
