import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rfpApi } from '@/lib/api';

export function useRFPs() {
  return useQuery({
    queryKey: ['rfps'],
    queryFn: async () => {
      const response = await rfpApi.getAll();
      return response.data.data;
    },
  });
}

export function useRFP(id: string) {
  return useQuery({
    queryKey: ['rfps', id],
    queryFn: async () => {
      const response = await rfpApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (requirements: string) => rfpApi.create(requirements),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}

export function useSendRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ rfpId, vendorIds }: { rfpId: string; vendorIds: string[] }) => 
      rfpApi.send(rfpId, vendorIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rfps', variables.rfpId] });
    },
  });
}

export function useDeleteRFP() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => rfpApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}