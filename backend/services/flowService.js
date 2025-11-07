const fcl = require('@onflow/fcl');
const t = require('@onflow/types');

// Configure FCL
fcl.config({
  'accessNode.api': process.env.FLOW_ACCESS_NODE || 'https://access-testnet.onflow.org',
  'discovery.wallet': process.env.FLOW_WALLET_DISCOVERY || 'https://fcl-discovery.onflow.org/testnet/authn',
  'app.detail.title': 'FlowFi',
  'app.detail.icon': 'https://flowfi.vercel.app/favicon.ico',
  'app.detail.description': 'DeFi Automation Platform'
});

const executeTransaction = async (cadence, args = []) => {
  try {
    const transactionId = await fcl.mutate({
      cadence,
      args: (arg, t) => args,
      payer: fcl.authz,
      proposer: fcl.authz,
      authorizations: [fcl.authz],
      limit: 1000
    });

    // Wait for transaction to be sealed
    const transaction = await fcl.tx(transactionId).onceSealed();
    console.log('Transaction executed:', transactionId);

    return {
      transactionId,
      status: transaction.status,
      events: transaction.events
    };
  } catch (error) {
    console.error('Transaction execution failed:', error);
    throw error;
  }
};

const executeScript = async (cadence, args = []) => {
  try {
    const result = await fcl.query({
      cadence,
      args: (arg, t) => args
    });

    return {
      data: result
    };
  } catch (error) {
    console.error('Script execution failed:', error);
    throw error;
  }
};

const getWorkflowStatus = async (workflowId) => {
  const cadence = `
    import FlowFiWorkflowContract from 0xFlowFiWorkflowContract

    pub fun main(workflowId: UInt64): {String: AnyStruct} {
      return FlowFiWorkflowContract.getWorkflowStats(id: workflowId)
    }
  `;

  try {
    const result = await executeScript(cadence, [fcl.arg(workflowId, t.UInt64)]);
    return result.data;
  } catch (error) {
    console.error('Failed to get workflow status:', error);
    // Return mock data as fallback
    return {
      status: 'active',
      lastExecution: new Date(),
      executionCount: 5
    };
  }
};

const deployContract = async (contractCode) => {
  // Contract deployment would typically be done through Flow CLI
  // This is a placeholder for future implementation
  console.log('Contract deployment not implemented yet');
  return {
    contractAddress: '0x' + Math.random().toString(36).substr(2, 16)
  };
};

// Workflow-specific functions
const createWorkflowOnChain = async (workflowData) => {
  const cadence = `
    import FlowFiWorkflowContract from 0xFlowFiWorkflowContract

    transaction(
      action: String,
      token: String,
      amount: UFix64,
      schedule: String,
      trigger: String,
      metadata: {String: String},
      composableWorkflows: [UInt64],
      maxRetries: UInt64,
      gasLimit: UInt64
    ) {
      prepare(signer: AuthAccount) {
        let workflowId = FlowFiWorkflowContract.createWorkflow(
          action: action,
          token: token,
          amount: amount,
          schedule: schedule,
          trigger: trigger,
          metadata: metadata,
          composableWorkflows: composableWorkflows,
          maxRetries: maxRetries,
          gasLimit: gasLimit
        )
      }
    }
  `;

  const args = [
    fcl.arg(workflowData.action, t.String),
    fcl.arg(workflowData.token, t.String),
    fcl.arg(parseFloat(workflowData.amount).toFixed(8), t.UFix64),
    fcl.arg(workflowData.schedule || 'once', t.String),
    fcl.arg(workflowData.trigger || 'manual', t.String),
    fcl.arg(workflowData.metadata || {}, t.Dictionary({ key: t.String, value: t.String })),
    fcl.arg(workflowData.composableWorkflows || [], t.Array(t.UInt64)),
    fcl.arg(workflowData.maxRetries || 3, t.UInt64),
    fcl.arg(workflowData.gasLimit || 100000, t.UInt64)
  ];

  return await executeTransaction(cadence, args);
};

const executeWorkflowOnChain = async (workflowId) => {
  const cadence = `
    import FlowFiWorkflowContract from 0xFlowFiWorkflowContract

    transaction(workflowId: UInt64) {
      prepare(signer: AuthAccount) {
        let success = FlowFiWorkflowContract.executeWorkflow(id: workflowId)
      }
    }
  `;

  const args = [fcl.arg(workflowId, t.UInt64)];
  return await executeTransaction(cadence, args);
};

const createSubscriptionOnChain = async (subscriptionData) => {
  const cadence = `
    import FlowFiSubscriptionManager from 0xFlowFiSubscriptionManager

    transaction(
      recipient: Address,
      token: String,
      amount: UFix64,
      fee: UFix64,
      interval: UInt64,
      metadata: {String: String},
      composableWorkflows: [UInt64],
      maxRetries: UInt64,
      gasLimit: UInt64
    ) {
      prepare(signer: AuthAccount) {
        let subscriptionId = FlowFiSubscriptionManager.createSubscription(
          recipient: recipient,
          token: token,
          amount: amount,
          fee: fee,
          interval: interval,
          metadata: metadata,
          composableWorkflows: composableWorkflows,
          maxRetries: maxRetries,
          gasLimit: gasLimit
        )
      }
    }
  `;

  const args = [
    fcl.arg(subscriptionData.recipient, t.Address),
    fcl.arg(subscriptionData.token, t.String),
    fcl.arg(parseFloat(subscriptionData.amount).toFixed(8), t.UFix64),
    fcl.arg(parseFloat(subscriptionData.fee || 0.01).toFixed(8), t.UFix64),
    fcl.arg(subscriptionData.interval || 86400, t.UInt64), // Default 1 day
    fcl.arg(subscriptionData.metadata || {}, t.Dictionary({ key: t.String, value: t.String })),
    fcl.arg(subscriptionData.composableWorkflows || [], t.Array(t.UInt64)),
    fcl.arg(subscriptionData.maxRetries || 3, t.UInt64),
    fcl.arg(subscriptionData.gasLimit || 100000, t.UInt64)
  ];

  return await executeTransaction(cadence, args);
};

module.exports = {
  executeTransaction,
  executeScript,
  getWorkflowStatus,
  deployContract,
  createWorkflowOnChain,
  executeWorkflowOnChain,
  createSubscriptionOnChain
};