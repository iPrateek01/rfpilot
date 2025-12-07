import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useVendors } from '@/hooks/useVendors';
import { useSendRFP } from '@/hooks/useRFPs';

interface VendorSelectorProps {
  rfpId: string;
  onClose: () => void;
}

export function VendorSelector({ rfpId, onClose }: VendorSelectorProps) {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const { data: vendors, isLoading } = useVendors();
  const sendRFP = useSendRFP();

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const handleSend = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }

    try {
      await sendRFP.mutateAsync({ rfpId, vendorIds: selectedVendors });
      alert(`RFP sent to ${selectedVendors.length} vendor(s) successfully!`);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to send RFP');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Send RFP to Vendors</CardTitle>
            <CardDescription>
              Select vendors to receive this RFP via email
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : vendors && vendors.length > 0 ? (
            <>
              <div className="space-y-2 mb-6">
                {vendors.map((vendor) => (
                  <label
                    key={vendor.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedVendors.includes(vendor.id)
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={() => toggleVendor(vendor.id)}
                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{vendor.name}</p>
                          <p className="text-sm text-gray-600">{vendor.email}</p>
                        </div>
                        {vendor.specializations.length > 0 && (
                          <div className="text-xs text-gray-500">
                            {vendor.specializations.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-gray-600">
                  {selectedVendors.length} vendor(s) selected
                </p>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={onClose} disabled={sendRFP.isPending}>
                    Cancel
                  </Button>
                  <Button onClick={handleSend} disabled={sendRFP.isPending || selectedVendors.length === 0}>
                    {sendRFP.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send RFP
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No vendors available</p>
              <p className="text-sm text-gray-400">Create vendors first to send RFPs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}