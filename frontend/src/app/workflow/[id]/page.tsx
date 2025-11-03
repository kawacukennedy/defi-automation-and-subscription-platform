'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiCopy, FiGitBranch } from 'react-icons/fi';

interface WorkflowDetail {
  id: string;
  name: string;
  action: string;
  status: string;
  token: string;
  amount: string;
  frequency: string;
  executions: Array<{
    id: string;
    timestamp: string;
    status: 'success' | 'failed';
    txHash?: string;
  }>;
  nextExecution?: string;
  createdAt: string;
}

export default function WorkflowDetail() {
  const params = useParams();
  const router = useRouter();
  const [workflow, setWorkflow] = useState<WorkflowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState<'pause' | 'resume' | 'cancel' | null>(null);
  const [countdown, setCountdown] = useState<string>('');

  useEffect(() => {
    if (params.id) {
      fetchWorkflowDetail(params.id as string);
    }
  }, [params.id]);

  // Countdown timer effect
  useEffect(() => {
    if (!workflow?.nextExecution) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const nextExec = new Date(workflow.nextExecution!).getTime();
      const distance = nextExec - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setCountdown(days + 'd ' + hours + 'h ' + minutes + 'm ' + seconds + 's');
      } else {
        setCountdown('Executing...');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workflow?.nextExecution]);

  const fetchWorkflowDetail = async (id: string) => {
    try {
      // Mock data - in real app, fetch from API
      const mockWorkflow: WorkflowDetail = {
        id,
        name: 'Staking Workflow',
        action: 'stake',
        status: 'active',
        token: 'FLOW',
        amount: '10.5',
        frequency: 'daily',
        executions: [
          { id: '1', timestamp: '2024-01-15T10:00:00Z', status: 'success', txHash: '0x123...' },
          { id: '2', timestamp: '2024-01-14T10:00:00Z', status: 'success', txHash: '0x456...' },
          { id: '3', timestamp: '2024-01-13T10:00:00Z', status: 'failed' },
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

  const handleAction = async (actionType: 'pause' | 'resume' | 'cancel') => {
    if (!workflow) return;
    setAction(actionType);
    // Mock action - in real app, call API
    setTimeout(() => {
      setWorkflow(prev => prev ? { ...prev, status: actionType === 'cancel' ? 'cancelled' : actionType === 'pause' ? 'paused' : 'active' } : null);
      setAction(null);
    }, 1000);
  };

  const shareWorkflow = () => {
    // Mock share - in real app, generate shareable link
    navigator.clipboard.writeText(`https://flowfi.com/workflow/${workflow?.id}`);
    alert('Workflow link copied to clipboard!');
  };

  const forkWorkflow = () => {
    // Mock fork - in real app, create a copy of the workflow
    router.push('/create-workflow');
    alert('Workflow forked! Redirecting to create page...');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-4 border-green-400 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workflow Not Found</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              {workflow.name}
            </h1>
            <p className="text-gray-300 mt-2">Workflow ID: {workflow.id}</p>
          </div>
           <div className="flex gap-3">
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={shareWorkflow}
               className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
             >
               <FiCopy className="w-4 h-4" />
               Share Template
             </motion.button>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={forkWorkflow}
               className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
             >
               <FiGitBranch className="w-4 h-4" />
               Fork
             </motion.button>
             <motion.button
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => router.push(`/workflow/${workflow.id}/edit`)}
               className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors"
             >
               Edit
             </motion.button>
           </div>
        </motion.div>

        {/* Status and Controls */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl mb-8"
        >
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <span className="text-lg font-semibold">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                workflow.status === 'active' ? 'bg-green-500/20 text-green-400' :
                workflow.status === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
              </span>
            </div>
            <div className="flex gap-2">
              {workflow.status === 'active' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('pause')}
                  disabled={!!action}
                  className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {action === 'pause' ? 'Pausing...' : 'Pause'}
                </motion.button>
              )}
              {workflow.status === 'paused' && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAction('resume')}
                  disabled={!!action}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {action === 'resume' ? 'Resuming...' : 'Resume'}
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAction('cancel')}
                disabled={!!action}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {action === 'cancel' ? 'Cancelling...' : 'Cancel'}
              </motion.button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{workflow.executions.filter(e => e.status === 'success').length}</div>
              <div className="text-sm text-gray-400">Successful Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{workflow.executions.filter(e => e.status === 'failed').length}</div>
              <div className="text-sm text-gray-400">Failed Executions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{workflow.frequency}</div>
              <div className="text-sm text-gray-400">Frequency</div>
            </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-purple-400">
                 {countdown || (workflow.nextExecution ? new Date(workflow.nextExecution).toLocaleDateString() : 'N/A')}
               </div>
               <div className="text-sm text-gray-400">Next Execution</div>
             </div>
          </div>
        </motion.div>

         {/* Workflow Details */}
         <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           transition={{ duration: 0.6, delay: 0.4 }}
           className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8"
         >
          <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Configuration
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Action:</span>
                <span className="capitalize">{workflow.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span>{workflow.token}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span>{workflow.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Created:</span>
                <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

           <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
             <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
               Multi-sig Status
             </h2>
             <div className="text-center py-8">
               <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                 <span className="text-2xl">✅</span>
               </div>
               <p className="text-gray-400">Approved by 3/3 signers</p>
               <p className="text-sm text-gray-500 mt-2">All required approvals received</p>
             </div>
           </div>

           <div className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl">
             <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
               NFT Badge Status
             </h2>
             <div className="text-center py-8">
               <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                 <span className="text-2xl">🏆</span>
               </div>
               <p className="text-gray-400">Workflow Champion Badge</p>
               <p className="text-sm text-gray-500 mt-2">Earned for 10+ successful executions</p>
             </div>
           </div>
         </motion.div>
        </motion.div>

        {/* Execution Logs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-black/20 backdrop-blur-md border border-white/10 p-6 rounded-xl"
        >
          <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Execution Logs
          </h2>
          <div className="space-y-3">
            {workflow.executions.map((execution, index) => (
              <motion.div
                key={execution.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex justify-between items-center p-4 border border-white/10 rounded-lg hover:border-green-400/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${execution.status === 'success' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                    <span className="font-medium capitalize">{execution.status}</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(execution.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {execution.txHash && (
                    <a
                      href={`https://flowscan.org/transaction/${execution.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View on Flowscan
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}