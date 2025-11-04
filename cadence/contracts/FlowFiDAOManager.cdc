// FlowFiDAOManager.cdc
// DAO Manager Contract for FlowFi

import FungibleToken from 0xee82856bf20e2aa6
import NonFungibleToken from 0xf8d6e0586b0a20c7
import FlowToken from 0x0ae53cb6e3f42a79
import FlowFiWorkflowContract from "FlowFiWorkflowContract"
import FlowFiNFTRewards from "FlowFiNFTRewards"

access(all) contract FlowFiDAOManager {

    // Events
    access(all) event ProposalCreated(id: UInt64, proposer: Address, description: String, proposalType: String)
    access(all) event VoteCast(proposalId: UInt64, voter: Address, vote: Bool, weight: UInt64)
    access(all) event ProposalExecuted(proposalId: UInt64, success: Bool)
    access(all) event MultiSigApproved(proposalId: UInt64, approver: Address)
    access(all) event RewardDistributed(user: Address, amount: UFix64, reason: String)
    access(all) event ReputationUpdated(user: Address, newReputation: UInt64)
    access(all) event WorkflowTemplateAdopted(templateId: UInt64, daoId: UInt64)
    access(all) event DAOCreated(id: UInt64, name: String, creator: Address)
    access(all) event WorkflowShared(daoId: UInt64, workflowId: UInt64, sharedBy: Address)

    // Proposal types
    access(all) enum ProposalType: UInt8 {
        access(all) case WorkflowApproval
        access(all) case TemplateAdoption
        access(all) case RewardDistribution
        access(all) case ParameterChange
        access(all) case ContractUpgrade
    }

    // Proposal struct
    access(all) struct Proposal {
        access(all) let id: UInt64
        access(all) let proposer: Address
        access(all) let description: String
        access(all) let proposalType: ProposalType
        access(all) let targetWorkflowId: UInt64?
        access(all) let targetTemplateId: UInt64?
        access(all) let rewardRecipient: Address?
        access(all) let rewardAmount: UFix64?
        access(all) let metadata: {String: String}
        access(all) let daoId: UInt64
        access(all) let votesFor: UInt64
        access(all) let votesAgainst: UInt64
        access(all) let executed: Bool
        access(all) let deadline: UFix64
        access(all) let requiredApprovals: UInt64
        access(all) var currentApprovals: UInt64
        access(all) let multiSigRequired: Bool
        access(all) var multiSigApprovals: {Address: Bool}
        access(all) var voters: {Address: Bool} // Track who voted to prevent double voting

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

        access(all) fun addMultiSigApproval(approver: Address) {
            if !self.multiSigApprovals.containsKey(approver) {
                self.multiSigApprovals[approver] = true
                self.currentApprovals = self.currentApprovals + 1
            }
        }

        access(all) fun hasMultiSigApproval(approver: Address): Bool {
            return self.multiSigApprovals[approver] ?? false
        }

        access(all) fun isMultiSigApproved(): Bool {
            return !self.multiSigRequired || self.currentApprovals >= self.requiredApprovals
        }

        access(all) fun castVote(voter: Address, vote: Bool, weight: UInt64 = 1) {
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

        access(all) fun canExecute(): Bool {
            return !self.executed &&
                   getCurrentBlock().timestamp > self.deadline &&
                   self.isMultiSigApproved()
        }

        access(all) fun isApproved(): Bool {
            return self.votesFor > self.votesAgainst
        }
    }

    // DAO struct
    access(all) struct DAO {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let creator: Address
        access(all) var members: {Address: Bool}
        access(all) var reputation: {Address: UInt64}
        access(all) var treasury: UFix64
        access(all) var multiSigThreshold: UInt64
        access(all) var active: Bool
        access(all) var sharedWorkflows: [UInt64] // IDs of shared workflows
        access(all) var adoptedTemplates: [UInt64] // IDs of adopted templates

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

        access(all) fun addMember(member: Address) {
            self.members[member] = true
            self.reputation[member] = 10 // Starting reputation
        }

        access(all) fun updateReputation(member: Address, change: Int64) {
            let current = self.reputation[member] ?? 0
            let newRep = UInt64(Int64(current) + change)
            self.reputation[member] = newRep > 0 ? newRep : 0
        }

        access(all) fun getMemberReputation(member: Address): UInt64 {
            return self.reputation[member] ?? 0
        }

        access(all) fun addSharedWorkflow(workflowId: UInt64) {
            if !self.sharedWorkflows.contains(workflowId) {
                self.sharedWorkflows.append(workflowId)
            }
        }

        access(all) fun adoptTemplate(templateId: UInt64) {
            if !self.adoptedTemplates.contains(templateId) {
                self.adoptedTemplates.append(templateId)
            }
        }

        access(all) fun distributeReward(recipient: Address, amount: UFix64, reason: String) {
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
    access(all) var proposals: {UInt64: Proposal}
    access(all) var nextProposalId: UInt64
    access(all) var daos: {UInt64: DAO}
    access(all) var nextDaoId: UInt64
    access(all) var userReputation: {Address: UInt64}
    access(all) var totalProposals: UInt64
    access(all) var executedProposals: UInt64
    access(all) var members: {Address: Bool} // Global members across all DAOs

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
    access(all) fun addMember(member: Address) {
        self.members[member] = true
    }

    // Create DAO
    access(all) fun createDAO(name: String, creator: Address, multiSigThreshold: UInt64): UInt64 {
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
    access(all) fun createProposal(
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
    access(all) fun vote(proposalId: UInt64, voter: Address, vote: Bool) {
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
    access(all) fun approveMultiSig(proposalId: UInt64, approver: Address) {
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
    access(all) fun executeProposal(proposalId: UInt64): Bool {
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
    access(all) fun getProposal(id: UInt64): Proposal? {
        return self.proposals[id]
    }

    // Get all proposals
    access(all) fun getAllProposals(): {UInt64: Proposal} {
        return self.proposals
    }
}