import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorApi } from '@/lib/api';
import type { Vendor } from '@/lib/types';

export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async () => {
      const response = await vendorApi.getAll();
      return response.data.data;
    },
  });
}

export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: async () => {
      const response = await vendorApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt' | 'isActive'>) => 
      vendorApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vendor> }) => 
      vendorApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendors', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => vendorApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}