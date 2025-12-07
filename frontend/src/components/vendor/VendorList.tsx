import { Mail, Phone, MapPin, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDeleteVendor } from '@/hooks/useVendors';
import type { Vendor } from '@/lib/types';

interface VendorListProps {
  vendors: Vendor[];
}

export function VendorList({ vendors }: VendorListProps) {
  const deleteVendor = useDeleteVendor();

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteVendor.mutateAsync(id);
      alert('Vendor deleted successfully');
    } catch (error) {
      alert('Failed to delete vendor');
    }
  };

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-center">No vendors found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {vendors.map((vendor) => (
        <Card key={vendor.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{vendor.name}</CardTitle>
                {vendor.contactPerson && (
                  <p className="text-sm text-gray-500 mt-1">{vendor.contactPerson}</p>
                )}
              </div>
              {vendor.rating && (
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm font-semibold">{vendor.rating}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2 text-sm">
              <div className="flex items-center text-gray-600">
                <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">{vendor.email}</span>
              </div>
              
              {vendor.phone && (
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{vendor.phone}</span>
                </div>
              )}
              
              {vendor.address && (
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{vendor.address}</span>
                </div>
              )}
            </div>

            {vendor.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {vendor.specializations.slice(0, 3).map((spec) => (
                  <Badge key={spec} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {vendor.specializations.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{vendor.specializations.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {vendor.notes && (
              <p className="text-xs text-gray-500 line-clamp-2">{vendor.notes}</p>
            )}

            <div className="pt-2">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => handleDelete(vendor.id, vendor.name)}
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}