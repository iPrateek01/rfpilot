import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import type { Proposal, ProposalStatus } from '@/lib/types';

interface ProposalListProps {
  proposals: Proposal[];
}

const statusIcons: Record<ProposalStatus, typeof Clock> = {
  RECEIVED: Clock,
  PARSING: Clock,
  PARSED: CheckCircle,
  EVALUATED: CheckCircle,
  ACCEPTED: CheckCircle,
  REJECTED: XCircle,
};

const statusColors: Record<ProposalStatus, string> = {
  RECEIVED: 'text-gray-500',
  PARSING: 'text-blue-500',
  PARSED: 'text-green-500',
  EVALUATED: 'text-green-600',
  ACCEPTED: 'text-green-700',
  REJECTED: 'text-red-500',
};

export function ProposalList({ proposals }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-center">No proposals received yet</p>
          <p className="text-sm text-gray-400 mt-2">Proposals will appear here once vendors respond</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => {
        const StatusIcon = statusIcons[proposal.status];
        
        return (
          <Card key={proposal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{proposal.vendor.name}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Received {formatDateTime(proposal.receivedAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <StatusIcon className={`h-5 w-5 ${statusColors[proposal.status]}`} />
                  <Badge variant="outline">{proposal.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {proposal.totalPrice && (
                  <div>
                    <p className="text-sm text-gray-500">Total Price</p>
                    <p className="text-lg font-semibold">{formatCurrency(proposal.totalPrice)}</p>
                  </div>
                )}
                
                {proposal.deliveryTimeline && (
                  <div>
                    <p className="text-sm text-gray-500">Delivery</p>
                    <p className="font-medium">{proposal.deliveryTimeline}</p>
                  </div>
                )}
                
                {proposal.paymentTerms && (
                  <div>
                    <p className="text-sm text-gray-500">Payment Terms</p>
                    <p className="font-medium">{proposal.paymentTerms}</p>
                  </div>
                )}
                
                {proposal.warrantyOffered && (
                  <div>
                    <p className="text-sm text-gray-500">Warranty</p>
                    <p className="font-medium">{proposal.warrantyOffered}</p>
                  </div>
                )}
              </div>

              {proposal.aiScore && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">AI Overall Score</p>
                    <div className="flex items-center space-x-4">
                      {proposal.priceScore && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Price</p>
                          <p className="font-semibold">{proposal.priceScore}/100</p>
                        </div>
                      )}
                      {proposal.complianceScore && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Compliance</p>
                          <p className="font-semibold">{proposal.complianceScore}/100</p>
                        </div>
                      )}
                      {proposal.termsScore && (
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Terms</p>
                          <p className="font-semibold">{proposal.termsScore}/100</p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-xs text-gray-500">Overall</p>
                        <p className="text-xl font-bold text-blue-600">{proposal.aiScore}/100</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {proposal.aiEvaluation && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">{proposal.aiEvaluation}</p>
                </div>
              )}

              {proposal.proposalItems.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium text-gray-700 mb-2">Items ({proposal.proposalItems.length})</p>
                  <div className="space-y-2">
                    {proposal.proposalItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                        <span>
                          {item.itemType} × {item.quantity}
                        </span>
                        <span className="font-semibold">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}