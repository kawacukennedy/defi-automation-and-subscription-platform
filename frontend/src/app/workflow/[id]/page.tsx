'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WorkflowDetail() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchWorkflowDetail(params.id);
    }
  }, [params.id]);

  const fetchWorkflowDetail = async (id: string) => {
    try {
      const mockWorkflow = {
        id,
        name: 'Staking Workflow',
        action: 'stake',
        status: 'active',
        token: 'FLOW',
        amount: '10.5',
        frequency: 'daily',
        executions: [
          { id: '1', timestamp: '2024-01-15T10:00:00Z', status: 'success', txHash: '0x123...' },
        ],
        nextExecution: '2024-01-16T10:00:00Z',
        createdAt: '2024-01-10T09:00:00Z'
      };
      setWorkflow(mockWorkflow);
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workflow Not Found</h1>
          <p className="text-gray-300 mt-2">Workflow ID: {params.id}</p>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          {workflow.name}
        </h1>
        <p className="text-gray-300 mt-2">Workflow ID: {workflow.id}</p>
        <p>Status: {workflow.status}</p>
        <p>Action: {workflow.action}</p>
        <p>Token: {workflow.token}</p>
        <p>Amount: {workflow.amount}</p>
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Back to Dashboard</Link>
      </div>
    </div>
  );
}