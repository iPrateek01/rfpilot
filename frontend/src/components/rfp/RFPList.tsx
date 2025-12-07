import { Link } from 'react-router-dom';
import { FileText, Calendar, DollarSign } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { RFP, RFPStatus } from '@/lib/types';

interface RFPListProps {
  rfps: RFP[];
}

const statusColors: Record<RFPStatus, 'default' | 'secondary' | 'success' | 'destructive' | 'outline'> = {
  DRAFT: 'secondary',
  SENT: 'default',
  RESPONSES_RECEIVED: 'success',
  EVALUATED: 'success',
  AWARDED: 'success',
  CANCELLED: 'destructive',
};

export function RFPList({ rfps }: RFPListProps) {
  if (rfps.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 text-center mb-4">No RFPs yet</p>
          <Link to="/create-rfp">
            <Button>Create Your First RFP</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rfps.map((rfp) => (
        <Card key={rfp.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{rfp.title}</CardTitle>
                <CardDescription className="line-clamp-2 mt-1">
                  {rfp.description}
                </CardDescription>
              </div>
              <Badge variant={statusColors[rfp.status]}>
                {rfp.status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {rfp.budget && (
                <div className="flex items-center text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <span>{formatCurrency(rfp.budget)}</span>
                </div>
              )}
              {rfp.deadline && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Deadline: {formatDate(rfp.deadline)}</span>
                </div>
              )}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-gray-500">
                  {rfp.items?.length || 0} items • {rfp.proposals?.length || 0} proposals
                </span>
              </div>
            </div>
            <div className="mt-4">
              <Link to={`/rfp/${rfp.id}`}>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}