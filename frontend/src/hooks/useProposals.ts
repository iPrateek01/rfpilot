import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalApi, emailApi } from '@/lib/api';

export function useProposalsByRFP(rfpId: string) {
  return useQuery({
    queryKey: ['proposals', 'rfp', rfpId],
    queryFn: async () => {
      const response = await proposalApi.getByRFP(rfpId);
      return response.data.data;
    },
    enabled: !!rfpId,
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const response = await proposalApi.getById(id);
      return response.data.data;
    },
    enabled: !!id,
  });
}

export function useProposalComparison(rfpId: string) {
  return useQuery({
    queryKey: ['proposals', 'comparison', rfpId],
    queryFn: async () => {
      const response = await proposalApi.getComparison(rfpId);
      return response.data.data;
    },
    enabled: !!rfpId,
  });
}

export function useEvaluateProposals() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (rfpId: string) => proposalApi.evaluate(rfpId),
    onSuccess: (_, rfpId) => {
      queryClient.invalidateQueries({ queryKey: ['proposals', 'rfp', rfpId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'comparison', rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfps', rfpId] });
    },
  });
}

export function useCheckEmails() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => emailApi.checkEmails(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['rfps'] });
    },
  });
}