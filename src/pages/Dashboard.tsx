import React, { useEffect, useState } from 'react';
import { fetchDomains, type Domain } from '../api/domain';
import DomainGrid from '../components/Dashboard/DomainGrid';

const Dashboard: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDomains()
      .then(setDomains)
      .catch(() => setError('Failed to fetch domains'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading domains...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div >
      <DomainGrid domains={domains} />
    </div>
  );
};

export default Dashboard;
