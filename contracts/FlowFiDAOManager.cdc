// FlowFiDAOManager.cdc
// DAO Manager Contract for FlowFi

import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868
import FlowFiWorkflowContract from 0xFlowFiWorkflowContract
import FlowFiNFTRewards from 0xFlowFiNFTRewards

pub contract FlowFiDAOManager {

    // Events
    pub event ProposalCreated(id: UInt64, proposer: Address, description: String, proposalType: String)
    pub event VoteCast(proposalId: UInt64, voter: Address, vote: Bool, weight: UInt64)
    pub event ProposalExecuted(proposalId: UInt64, success: Bool)
    pub event MultiSigApproved(proposalId: UInt64, approver: Address)
    pub event RewardDistributed(user: Address, amount: UFix64, reason: String)
    pub event ReputationUpdated(user: Address, newReputation: UInt64)
    pub event WorkflowTemplateAdopted(templateId: UInt64, daoId: UInt64)
    pub event DAOCreated(id: UInt64, name: String, creator: Address)
    pub event WorkflowShared(daoId: UInt64, workflowId: UInt64, sharedBy: Address)

    // Proposal types
    pub enum ProposalType: UInt8 {
        pub case WorkflowApproval
        pub case TemplateAdoption
        pub case RewardDistribution
        pub case ParameterChange
        pub case ContractUpgrade
    }

    // Proposal struct
    pub struct Proposal {
        pub let id: UInt64
        pub let proposer: Address
        pub let description: String
        pub let proposalType: ProposalType
        pub let targetWorkflowId: UInt64?
        pub let targetTemplateId: UInt64?
        pub let rewardRecipient: Address?
        pub let rewardAmount: UFix64?
        pub let metadata: {String: String}
        pub let daoId: UInt64
        pub let votesFor: UInt64
        pub let votesAgainst: UInt64
        pub let executed: Bool
        pub let deadline: UFix64
        pub let requiredApprovals: UInt64
        pub var currentApprovals: UInt64
        pub let multiSigRequired: Bool
        pub var multiSigApprovals: {Address: Bool}
        pub var voters: {Address: Bool} // Track who voted to prevent double voting

        init(
            id: UInt64,
            proposer: Address,
            description: String,
            proposalType: ProposalType,
            targetWorkflowId: UInt64?,
            targetTemplateId: UInt64?,
            rewardRecipient: Address?,
            rewardAmount: UFix64?,
            metadata: {String: String},
            daoId: UInt64,
            deadline: UFix64,
            requiredApprovals: UInt64,
            multiSigRequired: Bool
        ) {
            self.id = id
            self.proposer = proposer
            self.description = description
            self.proposalType = proposalType
            self.targetWorkflowId = targetWorkflowId
            self.targetTemplateId = targetTemplateId
            self.rewardRecipient = rewardRecipient
            self.rewardAmount = rewardAmount
            self.metadata = metadata
            self.daoId = daoId
            self.votesFor = 0
            self.votesAgainst = 0
            self.executed = false
            self.deadline = deadline
            self.requiredApprovals = requiredApprovals
            self.currentApprovals = 0
            self.multiSigRequired = multiSigRequired
            self.multiSigApprovals = {}
            self.voters = {}
        }

        pub fun addMultiSigApproval(approver: Address) {
            if !self.multiSigApprovals.containsKey(approver) {
                self.multiSigApprovals[approver] = true
                self.currentApprovals = self.currentApprovals + 1
            }
        }

        pub fun hasMultiSigApproval(approver: Address): Bool {
            return self.multiSigApprovals[approver] ?? false
        }

        pub fun isMultiSigApproved(): Bool {
            return !self.multiSigRequired || self.currentApprovals >= self.requiredApprovals
        }

        pub fun castVote(voter: Address, vote: Bool, weight: UInt64 = 1) {
            pre {
                !self.voters.containsKey(voter): "Already voted"
                getCurrentBlock().timestamp <= self.deadline: "Voting period ended"
            }

            self.voters[voter] = true

            if vote {
                self.votesFor = self.votesFor + weight
            } else {
                self.votesAgainst = self.votesAgainst + weight
            }
        }

        pub fun canExecute(): Bool {
            return !self.executed &&
                   getCurrentBlock().timestamp > self.deadline &&
                   self.isMultiSigApproved()
        }

        pub fun isApproved(): Bool {
            return self.votesFor > self.votesAgainst
        }
    }

    // DAO struct
    pub struct DAO {
        pub let id: UInt64
        pub let name: String
        pub let creator: Address
        pub var members: {Address: Bool}
        pub var reputation: {Address: UInt64}
        pub var treasury: UFix64
        pub var multiSigThreshold: UInt64
        pub var active: Bool
        pub var sharedWorkflows: [UInt64] // IDs of shared workflows
        pub var adoptedTemplates: [UInt64] // IDs of adopted templates

        init(id: UInt64, name: String, creator: Address, multiSigThreshold: UInt64) {
            self.id = id
            self.name = name
            self.creator = creator
            self.members = {creator: true}
            self.reputation = {creator: 100}
            self.treasury = 0.0
            self.multiSigThreshold = multiSigThreshold
            self.active = true
            self.sharedWorkflows = []
            self.adoptedTemplates = []
        }

        pub fun addMember(member: Address) {
            self.members[member] = true
            self.reputation[member] = 10 // Starting reputation
        }

        pub fun updateReputation(member: Address, change: Int64) {
            let current = self.reputation[member] ?? 0
            let newRep = UInt64(Int64(current) + change)
            self.reputation[member] = newRep > 0 ? newRep : 0
        }

        pub fun getMemberReputation(member: Address): UInt64 {
            return self.reputation[member] ?? 0
        }

        pub fun addSharedWorkflow(workflowId: UInt64) {
            if !self.sharedWorkflows.contains(workflowId) {
                self.sharedWorkflows.append(workflowId)
            }
        }

        pub fun adoptTemplate(templateId: UInt64) {
            if !self.adoptedTemplates.contains(templateId) {
                self.adoptedTemplates.append(templateId)
            }
        }

        pub fun distributeReward(recipient: Address, amount: UFix64, reason: String) {
            pre {
                self.treasury >= amount: "Insufficient treasury funds"
                self.members[recipient] != nil: "Recipient not a member"
            }

            self.treasury = self.treasury - amount
            // In real implementation, transfer tokens to recipient
            emit RewardDistributed(user: recipient, amount: amount, reason: reason)
        }
    }

    // Storage
    pub var proposals: {UInt64: Proposal}
    pub var nextProposalId: UInt64
    pub var daos: {UInt64: DAO}
    pub var nextDaoId: UInt64
    pub var userReputation: {Address: UInt64}
    pub var totalProposals: UInt64
    pub var executedProposals: UInt64
    pub var members: {Address: Bool} // Global members across all DAOs

    // Initialize contract
    init() {
        self.proposals = {}
        self.nextProposalId = 1
        self.daos = {}
        self.nextDaoId = 1
        self.userReputation = {}
        self.totalProposals = 0
        self.executedProposals = 0
        self.members = {}
    }

    // Add member
    pub fun addMember(member: Address) {
        self.members[member] = true
    }

    // Create DAO
    pub fun createDAO(name: String, creator: Address, multiSigThreshold: UInt64): UInt64 {
        let daoId = self.nextDaoId
        self.nextDaoId = self.nextDaoId + 1

        let dao = DAO(id: daoId, name: name, creator: creator, multiSigThreshold: multiSigThreshold)
        self.daos[daoId] = dao

        // Add creator to global members
        self.members[creator] = true

        emit DAOCreated(id: daoId, name: name, creator: creator)
        return daoId
    }

    // Create proposal
    pub fun createProposal(
        daoId: UInt64,
        proposer: Address,
        description: String,
        proposalType: ProposalType,
        targetWorkflowId: UInt64?,
        targetTemplateId: UInt64?,
        rewardRecipient: Address?,
        rewardAmount: UFix64?,
        metadata: {String: String},
        deadline: UFix64,
        requiredApprovals: UInt64,
        multiSigRequired: Bool
    ): UInt64 {
        pre {
            self.daos[daoId] != nil: "DAO does not exist"
            self.daos[daoId]!.members[proposer] != nil: "Not a DAO member"
        }

        let proposalId = self.nextProposalId
        self.nextProposalId = self.nextProposalId + 1
        self.totalProposals = self.totalProposals + 1

        let proposal = Proposal(
            id: proposalId,
            proposer: proposer,
            description: description,
            proposalType: proposalType,
            targetWorkflowId: targetWorkflowId,
            targetTemplateId: targetTemplateId,
            rewardRecipient: rewardRecipient,
            rewardAmount: rewardAmount,
            metadata: metadata,
            daoId: daoId,
            deadline: deadline,
            requiredApprovals: requiredApprovals,
            multiSigRequired: multiSigRequired
        )

        self.proposals[proposalId] = proposal

        emit ProposalCreated(id: proposalId, proposer: proposer, description: description, proposalType: proposalType.rawValue.toString())

        return proposalId
    }

    // Vote on proposal
    pub fun vote(proposalId: UInt64, voter: Address, vote: Bool) {
        pre {
            self.proposals[proposalId] != nil: "Proposal does not exist"
            self.daos[self.proposals[proposalId]!.daoId] != nil: "DAO does not exist"
            self.daos[self.proposals[proposalId]!.daoId]!.members[voter] != nil: "Not a DAO member"
            !self.proposals[proposalId]!.executed: "Proposal already executed"
        }

        let dao = self.daos[self.proposals[proposalId]!.daoId]!
        let reputation = dao.getMemberReputation(voter)

        self.proposals[proposalId]!.castVote(voter: voter, vote: vote, weight: reputation)

        emit VoteCast(proposalId: proposalId, voter: voter, vote: vote, weight: reputation)
    }

    // Multi-sig approval
    pub fun approveMultiSig(proposalId: UInt64, approver: Address) {
        pre {
            self.proposals[proposalId] != nil: "Proposal does not exist"
            self.daos[self.proposals[proposalId]!.daoId] != nil: "DAO does not exist"
            self.daos[self.proposals[proposalId]!.daoId]!.members[approver] != nil: "Not a DAO member"
            self.proposals[proposalId]!.multiSigRequired: "Multi-sig not required"
        }

        self.proposals[proposalId]!.addMultiSigApproval(approver: approver)
        emit MultiSigApproved(proposalId: proposalId, approver: approver)
    }

    // Execute proposal
    pub fun executeProposal(proposalId: UInt64): Bool {
        pre {
            self.proposals[proposalId] != nil: "Proposal does not exist"
            !self.proposals[proposalId]!.executed: "Proposal already executed"
        }

        let proposal = self.proposals[proposalId]!

        if !proposal.canExecute() || !proposal.isApproved() {
            return false
        }

        proposal.executed = true
        self.executedProposals = self.executedProposals + 1

        // Execute based on proposal type
        var success = true
        switch proposal.proposalType {
            case ProposalType.WorkflowApproval:
                success = self.executeWorkflowApproval(proposal)
            case ProposalType.TemplateAdoption:
                success = self.executeTemplateAdoption(proposal)
            case ProposalType.RewardDistribution:
                success = self.executeRewardDistribution(proposal)
            case ProposalType.ParameterChange:
                success = self.executeParameterChange(proposal)
            case ProposalType.ContractUpgrade:
                success = self.executeContractUpgrade(proposal)
        }

        emit ProposalExecuted(proposalId: proposalId, success: success)
        return success
    }

    // Execute workflow approval
    priv fun executeWorkflowApproval(_ proposal: Proposal): Bool {
        if let workflowId = proposal.targetWorkflowId {
            // In real implementation, this would enable the workflow for the DAO
            let dao = self.daos[proposal.daoId]!
            dao.addSharedWorkflow(workflowId: workflowId)
            emit WorkflowShared(daoId: proposal.daoId, workflowId: workflowId, sharedBy: proposal.proposer)
            return true
        }
        return false
    }

    // Execute template adoption
    priv fun executeTemplateAdoption(_ proposal: Proposal): Bool {
        if let templateId = proposal.targetTemplateId {
            let dao = self.daos[proposal.daoId]!
            dao.adoptTemplate(templateId: templateId)
            emit WorkflowTemplateAdopted(templateId: templateId, daoId: proposal.daoId)
            return true
        }
        return false
    }

    // Execute reward distribution
    priv fun executeRewardDistribution(_ proposal: Proposal): Bool {
        if let recipient = proposal.rewardRecipient, let amount = proposal.rewardAmount {
            let dao = self.daos[proposal.daoId]!
            dao.distributeReward(recipient: recipient, amount: amount, reason: proposal.description)
            return true
        }
        return false
    }

    // Execute parameter change
    priv fun executeParameterChange(_ proposal: Proposal): Bool {
        // Implementation for parameter changes
        return true
    }

    // Execute contract upgrade
    priv fun executeContractUpgrade(_ proposal: Proposal): Bool {
        // Implementation for contract upgrades
        return true
    }

    // Get proposal
    pub fun getProposal(id: UInt64): Proposal? {
        return self.proposals[id]
    }

    // Get all proposals
    pub fun getAllProposals(): {UInt64: Proposal} {
        return self.proposals
    }
}