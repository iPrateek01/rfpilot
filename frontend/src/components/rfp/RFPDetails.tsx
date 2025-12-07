import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, Package, FileText, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDeleteRFP } from '@/hooks/useRFPs';
import type { RFP } from '@/lib/types';
import { VendorSelector } from '@/components/vendor/VendorSelector';

interface RFPDetailsProps {
  rfp: RFP;
}

export function RFPDetails({ rfp }: RFPDetailsProps) {
  const [showVendorSelector, setShowVendorSelector] = useState(false);
  const navigate = useNavigate();
  const deleteRFP = useDeleteRFP();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this RFP?')) return;
    
    try {
      await deleteRFP.mutateAsync(rfp.id);
      alert('RFP deleted successfully');
      navigate('/');
    } catch (error) {
      alert('Failed to delete RFP');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{rfp.title}</h1>
          <p className="text-gray-500 mt-2">{rfp.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge>{rfp.status.replace(/_/g, ' ')}</Badge>
          {rfp.status === 'DRAFT' && (
            <Button onClick={() => setShowVendorSelector(true)}>
              <Send className="h-4 w-4 mr-2" />
              Send to Vendors
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Information */}
      <div className="grid gap-4 md:grid-cols-4">
        {rfp.budget && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{formatCurrency(rfp.budget)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {rfp.deadline && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Proposal Deadline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-lg font-semibold">{formatDate(rfp.deadline)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {rfp.deliveryDeadline && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Delivery Deadline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-lg font-semibold">{formatDate(rfp.deliveryDeadline)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Package className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-2xl font-bold">{rfp.items?.length || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rfp.items?.map((item, index) => (
              <div key={item.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">
                      {index + 1}. {item.itemType}
                    </h4>
                    {item.description && (
                      <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        <span className="font-medium">Quantity:</span> {item.quantity}
                      </p>
                      {item.specifications && (
                        <div className="text-sm">
                          <span className="font-medium">Specifications:</span>
                          <ul className="ml-4 mt-1 list-disc">
                            {Object.entries(item.specifications).map(([key, value]) => (
                              <li key={key}>
                                {key}: {String(value)}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  {item.unitBudget && (
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Unit Budget</p>
                      <p className="font-semibold text-lg">{formatCurrency(item.unitBudget)}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms */}
      {(rfp.paymentTerms || rfp.warrantyRequirements || rfp.additionalTerms) && (
        <Card>
          <CardHeader>
            <CardTitle>Terms & Conditions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rfp.paymentTerms && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Payment Terms</h4>
                <p className="text-gray-600">{rfp.paymentTerms}</p>
              </div>
            )}
            {rfp.warrantyRequirements && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Warranty Requirements</h4>
                <p className="text-gray-600">{rfp.warrantyRequirements}</p>
              </div>
            )}
            {rfp.additionalTerms && (
              <div>
                <h4 className="font-semibold text-sm text-gray-700">Additional Terms</h4>
                <p className="text-gray-600">{rfp.additionalTerms}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vendor Selector Modal */}
      {showVendorSelector && (
        <VendorSelector
          rfpId={rfp.id}
          onClose={() => setShowVendorSelector(false)}
        />
      )}
    </div>
  );
}