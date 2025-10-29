// FlowFiWorkflowContract.cdc
// Main contract for managing DeFi automation workflows

pub contract FlowFiWorkflowContract {

    // Events
    pub event WorkflowCreated(id: UInt64, owner: Address, action: String)
    pub event WorkflowExecuted(id: UInt64, success: Bool)
    pub event WorkflowPaused(id: UInt64)
    pub event WorkflowCancelled(id: UInt64)

    // Workflow struct
    pub struct Workflow {
        pub let id: UInt64
        pub let owner: Address
        pub let action: String
        pub let token: String
        pub let amount: UFix64
        pub let schedule: String
        pub let trigger: String
        pub var isActive: Bool
        pub var lastExecution: UFix64
        pub var executionCount: UInt64

        init(id: UInt64, owner: Address, action: String, token: String, amount: UFix64, schedule: String, trigger: String) {
            self.id = id
            self.owner = owner
            self.action = action
            self.token = token
            self.amount = amount
            self.schedule = schedule
            self.trigger = trigger
            self.isActive = true
            self.lastExecution = 0.0
            self.executionCount = 0
        }

        pub fun updateExecution(timestamp: UFix64) {
            self.lastExecution = timestamp
            self.executionCount = self.executionCount + 1
        }

        pub fun pause() {
            self.isActive = false
        }

        pub fun resume() {
            self.isActive = true
        }
    }

    // Storage
    pub var workflows: {UInt64: Workflow}
    pub var nextWorkflowId: UInt64

    // Contract owner
    pub let admin: Address

    init() {
        self.workflows = {}
        self.nextWorkflowId = 1
        self.admin = self.account.address
    }

    // Create a new workflow
    pub fun createWorkflow(action: String, token: String, amount: UFix64, schedule: String, trigger: String): UInt64 {
        let workflowId = self.nextWorkflowId
        self.nextWorkflowId = self.nextWorkflowId + 1

        let workflow = Workflow(
            id: workflowId,
            owner: self.account.address,
            action: action,
            token: token,
            amount: amount,
            schedule: schedule,
            trigger: trigger
        )

        self.workflows[workflowId] = workflow

        emit WorkflowCreated(id: workflowId, owner: self.account.address, action: action)
        return workflowId
    }

    // Execute workflow (called by Forte Actions)
    pub fun executeWorkflow(id: UInt64): Bool {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
        }

        let workflow = self.workflows[id]!
        if !workflow.isActive {
            return false
        }

        // Here would be the actual execution logic
        // For now, just update execution data

        workflow.updateExecution(getCurrentBlock().timestamp)

        emit WorkflowExecuted(id: id, success: true)
        return true
    }

    // Pause workflow
    pub fun pauseWorkflow(id: UInt64) {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
            self.workflows[id]!.owner == self.account.address: "Not workflow owner"
        }

        self.workflows[id]!.pause()
        emit WorkflowPaused(id: id)
    }

    // Cancel workflow
    pub fun cancelWorkflow(id: UInt64) {
        pre {
            self.workflows.containsKey(id): "Workflow does not exist"
            self.workflows[id]!.owner == self.account.address: "Not workflow owner"
        }

        self.workflows.remove(key: id)
        emit WorkflowCancelled(id: id)
    }

    // Get workflow details
    pub fun getWorkflow(id: UInt64): Workflow? {
        return self.workflows[id]
    }

    // Get all workflows for an address
    pub fun getWorkflowsByOwner(owner: Address): [Workflow] {
        var ownerWorkflows: [Workflow] = []
        for workflow in self.workflows.values {
            if workflow.owner == owner {
                ownerWorkflows.append(workflow)
            }
        }
        return ownerWorkflows
    }
}