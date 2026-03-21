import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getConfigRpc, updateConfigRpc } from "@/server/features/config/rpc";
import type { Config } from "@/shared/schema/config";

export function useConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: () => getConfigRpc() as Promise<Config>,
    staleTime: Infinity,
  });
}

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<Config>) =>
      updateConfigRpc(config as unknown as Config) as Promise<Config>,
    onSuccess: (data) => {
      queryClient.setQueryData(["config"], data);
    },
  });
}
