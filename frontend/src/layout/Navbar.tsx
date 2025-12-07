import { Link, useLocation } from 'react-router-dom';
import { FileText, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCheckEmails } from '@/hooks/useProposals';

export function Navbar() {
  const location = useLocation();
  const checkEmails = useCheckEmails();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: FileText },
    { path: '/vendors', label: 'Vendors', icon: Users },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">RFPilot</h1>
            </div>
            <div className="ml-6 flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive(item.path)
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => checkEmails.mutate()}
              disabled={checkEmails.isPending}
            >
              <Mail className="w-4 h-4 mr-2" />
              {checkEmails.isPending ? 'Checking...' : 'Check Emails'}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}