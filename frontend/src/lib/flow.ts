import * as fcl from "@onflow/fcl";

// Configure FCL
fcl.config({
  "app.detail.title": "FlowFi",
  "app.detail.icon": "https://flowfi.com/icon.png",
  "accessNode.api": "https://access-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xFlowToken": "0x7e60df042a9c0868",
  "0xFungibleToken": "0x9a0766d93b6608b7",
  "0xNonFungibleToken": "0x1d7e57aa55817448"
});

// Wallet connection functions
export const connectWallet = async () => {
  try {
    const user = await fcl.authenticate();
    return user;
  } catch (error) {
    console.error("Wallet connection failed:", error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    await fcl.unauthenticate();
  } catch (error) {
    console.error("Wallet disconnection failed:", error);
  }
};

export const getCurrentUser = () => {
  return fcl.currentUser();
};

// Transaction functions
export const executeTransaction = async (cadence: string, args: any[] = []) => {
  try {
    const transactionId = await fcl.mutate({
      cadence,
      args: (arg, t) => args,
      payer: fcl.authz as any,
      proposer: fcl.authz as any,
      authorizations: [fcl.authz as any],
      limit: 999
    });

    const transaction = await fcl.tx(transactionId).onceSealed();
    return transaction;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

// Query functions
export const executeScript = async (cadence: string, args: any[] = []) => {
  try {
    const result = await fcl.query({
      cadence,
      args: (arg, t) => args
    });
    return result;
  } catch (error) {
    console.error("Script execution failed:", error);
    throw error;
  }
};

export default fcl;