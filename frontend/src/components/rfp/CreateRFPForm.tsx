import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreateRFP } from '@/hooks/useRFPs';

export function CreateRFPForm() {
  const [requirements, setRequirements] = useState('');
  const navigate = useNavigate();
  const createRFP = useCreateRFP();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requirements.trim()) {
      alert('Please enter your requirements');
      return;
    }

    try {
      const response = await createRFP.mutateAsync(requirements);
      alert('RFP created successfully!');
      navigate(`/rfp/${response.data.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Failed to create RFP');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New RFP</CardTitle>
        <CardDescription>
          Describe your procurement needs in natural language. Our AI will structure it for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Requirements
            </label>
            <Textarea
              id="requirements"
              placeholder="Example: I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={8}
              disabled={createRFP.isPending}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/')}
              disabled={createRFP.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRFP.isPending}>
              {createRFP.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {createRFP.isPending ? 'Creating...' : 'Create RFP'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}