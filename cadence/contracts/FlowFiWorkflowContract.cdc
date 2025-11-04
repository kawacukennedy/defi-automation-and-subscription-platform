// FlowFiWorkflowContract.cdc
// Main contract for managing DeFi automation workflows

import FungibleToken from 0xee82856bf20e2aa6
import FlowToken from 0x0ae53cb6e3f42a79
import FlowFiNFTRewards from "FlowFiNFTRewards"

access(all) contract FlowFiWorkflowContract {

    // Events
    access(all) event WorkflowCreated(id: UInt64, owner: Address, action: String, token: String)
    access(all) event WorkflowExecuted(id: UInt64, success: Bool, gasUsed: UInt64)
    access(all) event WorkflowPaused(id: UInt64)
    access(all) event WorkflowCancelled(id: UInt64)
    access(all) event WorkflowFailed(id: UInt64, reason: String)
    access(all) event WorkflowRetried(id: UInt64, attempt: UInt64)
    access(all) event NftRewardMinted(workflowId: UInt64, nftId: UInt64, recipient: Address)
    access(all) event ContractUpgraded(newVersion: String)

    // Workflow struct
    access(all) struct Workflow {
        access(all) let id: UInt64
        access(all) let owner: Address
        access(all) let action: String
        access(all) let token: String
        access(all) let amount: UFix64
        access(all) let schedule: String
        access(all) let trigger: String
        access(all) let metadata: {String: String}
        access(all) let composableWorkflows: [UInt64] // IDs of workflows this can trigger
        access(all) var isActive: Bool
        access(all) var lastExecution: UFix64
        access(all) var executionCount: UInt64
        access(all) var successCount: UInt64
        access(all) var failureCount: UInt64
        access(all) var retryCount: UInt64
        access(all) var maxRetries: UInt64
        access(all) var gasLimit: UInt64

        init(id: UInt64, owner: Address, action: String, token: String, amount: UFix64, schedule: String, trigger: String, metadata: {String: String}, composableWorkflows: [UInt64], maxRetries: UInt64, gasLimit: UInt64) {
            self.id = id
            self.owner = owner
            self.action = action
            self.token = token
            self.amount = amount
            self.schedule = schedule
            self.trigger = trigger
            self.metadata = metadata
            self.composableWorkflows = composableWorkflows
            self.isActive = true
            self.lastExecution = 0.0
            self.executionCount = 0
            self.successCount = 0
            self.failureCount = 0
            self.retryCount = 0
            self.maxRetries = maxRetries
            self.gasLimit = gasLimit
        }

        access(all) fun updateExecution(timestamp: UFix64, success: Bool) {
            self.lastExecution = timestamp
            self.executionCount = self.executionCount + 1
            if success {
                self.successCount = self.successCount + 1
                self.retryCount = 0 // Reset retry count on success
            } else {
                self.failureCount = self.failureCount + 1
            }
        }

        access(all) fun incrementRetry() {
            self.retryCount = self.retryCount + 1
        }

        access(all) fun canRetry(): Bool {
            return self.retryCount < self.maxRetries
        }

        access(all) fun pause() {
            self.isActive = false
        }

        access(all) fun resume() {
            self.isActive = true
        }

        access(all) fun getSuccessRate(): UFix64 {
            if self.executionCount == 0 {
                return 0.0
            }
            return UFix64(self.successCount) / UFix64(self.executionCount)
        }
    }

    // Storage
    access(all) var workflows: {UInt64: Workflow}
    access(all) var nextWorkflowId: UInt64
    access(all) var totalWorkflows: UInt64
    access(all) var totalExecutions: UInt64
    access(all) var totalSuccessfulExecutions: UInt64

    // Contract owner
    access(all) let admin: Address

    // Upgradeable contract version
    access(all) var version: String

    // Testing hooks (only active in testnet)
    access(all) var testingMode: Bool

    init() {
        self.workflows = {}
        self.nextWorkflowId = 1
        self.totalWorkflows = 0
        self.totalExecutions = 0
        self.totalSuccessfulExecutions = 0
        self.admin = self.account.address
        self.version = "1.0.0"
        self.testingMode = false
    }

    // Create a new workflow
    access(all) fun createWorkflow(
        action: String,
        token: String,
        amount: UFix64,
        schedule: String,
        trigger: String,
        metadata: {String: String},
        composableWorkflows: [UInt64],
        maxRetries: UInt64,
        gasLimit: UInt64
    ): UInt64 {
        pre {
            amount > 0.0: "Amount must be greater than 0"
            maxRetries <= 10: "Max retries cannot exceed 10"
            gasLimit > 0: "Gas limit must be greater than 0"
        }

        let workflowId = self.nextWorkflowId
        self.nextWorkflowId = self.nextWorkflowId + 1
        self.totalWorkflows = self.totalWorkflows + 1

        let workflow = Workflow(
            id: workflowId,
            owner: self.account.address,
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

        self.workflows[workflowId] = workflow

        emit WorkflowCreated(id: workflowId, owner: self.account.address, action: action, token: token)

        // Mint NFT reward for workflow creation milestone
        if self.shouldMintReward(workflowId) {
            self.mintWorkflowCreationReward(workflowId)
        }

        return workflowId
    }

    // Execute workflow (called by Forte Actions)
    access(all) fun executeWorkflow(id: UInt64): Bool {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
        }

        let workflow = self.workflows[id]!
        if !workflow.isActive {
            emit WorkflowFailed(id: id, reason: "Workflow is paused")
            return false
        }

        let startTime = getCurrentBlock().timestamp
        var gasUsed: UInt64 = 0

        // Check balance before execution
        if !self.checkSufficientBalance(workflow) {
            emit WorkflowFailed(id: id, reason: "Insufficient balance")
            workflow.incrementRetry()
            if workflow.canRetry() {
                emit WorkflowRetried(id: id, attempt: workflow.retryCount)
                return false // Will retry later
            }
            workflow.updateExecution(startTime, false)
            self.totalExecutions = self.totalExecutions + 1
            return false
        }

        // Execute the main workflow action
        let success = self.executeWorkflowAction(workflow)
        gasUsed = gasUsed + 1000 // Mock gas usage

        // Execute composable workflows if main action succeeded
        if success && workflow.composableWorkflows.length > 0 {
            for composableId in workflow.composableWorkflows {
                if self.workflows.containsKey(composableId) {
                    let composableSuccess = self.executeWorkflow(composableId)
                    gasUsed = gasUsed + 500 // Additional gas for composable
                    if !composableSuccess {
                        // Log composable failure but don't fail main workflow
                    }
                }
            }
        }

        workflow.updateExecution(startTime, success)
        self.totalExecutions = self.totalExecutions + 1
        if success {
            self.totalSuccessfulExecutions = self.totalSuccessfulExecutions + 1
        }

        emit WorkflowExecuted(id: id, success: success, gasUsed: gasUsed)

        // Mint NFT reward for successful executions
        if success && self.shouldMintExecutionReward(workflow) {
            self.mintExecutionReward(id)
        }

        return success
    }

    // Pause workflow
    access(all) fun pauseWorkflow(id: UInt64) {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
            self.workflows[id]!.owner == self.account.address: "Not workflow owner"
        }

        self.workflows[id]!.pause()
        emit WorkflowPaused(id: id)
    }

    // Cancel workflow
    access(all) fun cancelWorkflow(id: UInt64) {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
            self.workflows[id]!.owner == self.account.address: "Not workflow owner"
        }

        self.workflows.remove(key: id)
        emit WorkflowCancelled(id: id)
    }

    // Get workflow details
    access(all) fun getWorkflow(id: UInt64): Workflow? {
        return self.workflows[id]
    }

    // Get all workflows for an address
    access(all) fun getWorkflowsByOwner(owner: Address): [Workflow] {
        var ownerWorkflows: [Workflow] = []
        for workflow in self.workflows.values {
            if workflow.owner == owner {
                ownerWorkflows.append(workflow)
            }
        }
        return ownerWorkflows
    }

    // Helper functions for execution
    priv fun checkSufficientBalance(_ workflow: Workflow): Bool {
        // Mock balance check - in real implementation, check user's token balance
        // For now, assume sufficient balance
        return true
    }

    priv fun executeWorkflowAction(_ workflow: Workflow): Bool {
        // Mock execution logic based on action type
        switch workflow.action {
            case "stake":
                return self.executeStakingAction(workflow)
            case "swap":
                return self.executeSwapAction(workflow)
            case "send":
                return self.executeSendAction(workflow)
            case "mint_nft":
                return self.executeMintNFTAction(workflow)
            case "dao_vote":
                return self.executeDAOVoteAction(workflow)
            default:
                return false
        }
    }

    priv fun executeStakingAction(_ workflow: Workflow): Bool {
        // Mock staking logic
        return true
    }

    priv fun executeSwapAction(_ workflow: Workflow): Bool {
        // Mock swap logic
        return true
    }

    priv fun executeSendAction(_ workflow: Workflow): Bool {
        // Mock send logic
        return true
    }

    priv fun executeMintNFTAction(_ workflow: Workflow): Bool {
        // Mock NFT minting logic
        return true
    }

    priv fun executeDAOVoteAction(_ workflow: Workflow): Bool {
        // Mock DAO voting logic
        return true
    }

    // NFT reward functions
    priv fun shouldMintReward(_ workflowId: UInt64): Bool {
        // Mint reward every 10 workflows created
        return workflowId % 10 == 0
    }

    priv fun shouldMintExecutionReward(_ workflow: Workflow): Bool {
        // Mint reward for every 100 successful executions
        return workflow.successCount > 0 && workflow.successCount % 100 == 0
    }

    priv fun mintWorkflowCreationReward(_ workflowId: UInt64) {
        // Mint NFT reward for workflow creation
        let nft <- FlowFiNFTRewards.mintBadge(recipient: self.workflows[workflowId]!.owner, badgeType: FlowFiNFTRewards.BadgeType.WorkflowMaster)
        emit NftRewardMinted(workflowId: workflowId, nftId: nft.id, recipient: self.workflows[workflowId]!.owner)
        destroy nft // In real implementation, deposit to user's collection
    }

    priv fun mintExecutionReward(_ workflowId: UInt64) {
        // Mint NFT reward for successful executions
        let nft <- FlowFiNFTRewards.mintBadge(recipient: self.workflows[workflowId]!.owner, badgeType: FlowFiNFTRewards.BadgeType.PaymentWarrior)
        emit NftRewardMinted(workflowId: workflowId, nftId: nft.id, recipient: self.workflows[workflowId]!.owner)
        destroy nft
    }

    // Upgradeable contract functions
    access(all) fun upgradeContract(newVersion: String) {
        pre {
            self.account.address == self.admin: "Only admin can upgrade"
        }
        self.version = newVersion
        emit ContractUpgraded(newVersion: newVersion)
    }

    // Testing hooks
    access(all) fun enableTestingMode() {
        pre {
            self.account.address == self.admin: "Only admin can enable testing mode"
        }
        self.testingMode = true
    }

    access(all) fun disableTestingMode() {
        pre {
            self.account.address == self.admin: "Only admin can disable testing mode"
        }
        self.testingMode = false
    }

    access(all) fun mockExecution(id: UInt64, success: Bool) {
        pre {
            self.testingMode: "Testing mode must be enabled"
            self.workflows.containsKey(id): "Workflow does not exist"
        }

        let workflow = self.workflows[id]!
        workflow.updateExecution(getCurrentBlock().timestamp, success)
        self.totalExecutions = self.totalExecutions + 1
        if success {
            self.totalSuccessfulExecutions = self.totalSuccessfulExecutions + 1
        }

        emit WorkflowExecuted(id: id, success: success, gasUsed: 0)
    }

    // Analytics functions
    access(all) fun getTotalWorkflows(): UInt64 {
        return self.totalWorkflows
    }

    access(all) fun getTotalExecutions(): UInt64 {
        return self.totalExecutions
    }

    access(all) fun getSuccessRate(): UFix64 {
        if self.totalExecutions == 0 {
            return 0.0
        }
        return UFix64(self.totalSuccessfulExecutions) / UFix64(self.totalExecutions)
    }

    access(all) fun getWorkflowStats(id: UInt64): {String: AnyStruct} {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
        }

        let workflow = self.workflows[id]!
        return {
            "executionCount": workflow.executionCount,
            "successCount": workflow.successCount,
            "failureCount": workflow.failureCount,
            "successRate": workflow.getSuccessRate(),
            "lastExecution": workflow.lastExecution,
            "isActive": workflow.isActive
        }
    }
}