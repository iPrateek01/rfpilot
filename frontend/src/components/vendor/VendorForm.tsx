import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateVendor } from '@/hooks/useVendors';

interface VendorFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export function VendorForm({ onClose, onSuccess }: VendorFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    address: '',
    specializations: '',
    notes: '',
  });

  const createVendor = useCreateVendor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert('Name and email are required');
      return;
    }

    try {
      await createVendor.mutateAsync({
        name: formData.name,
        email: formData.email,
        contactPerson: formData.contactPerson || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        specializations: formData.specializations
          ? formData.specializations.split(',').map(s => s.trim())
          : [],
        notes: formData.notes || undefined,
      });
      
      alert('Vendor created successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create vendor');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Add New Vendor</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vendor Name *
                </label>
                <Input
                  placeholder="TechSupply Co"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="contact@techsupply.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <Input
                  placeholder="John Smith"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                <Input
                  placeholder="+1-555-0101"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <Textarea
                placeholder="123 Business Ave, City, State, ZIP"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specializations (comma-separated)
              </label>
              <Input
                placeholder="Laptops, Monitors, Office Equipment"
                value={formData.specializations}
                onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <Textarea
                placeholder="Any additional notes about this vendor..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createVendor.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createVendor.isPending}>
                {createVendor.isPending ? 'Creating...' : 'Create Vendor'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}