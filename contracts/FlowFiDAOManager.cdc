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
        pub let votesFor: UInt64
        pub let votesAgainst: UInt64
        pub let executed: Bool
        pub let deadline: UFix64
        pub let requiredApprovals: UInt64
        pub var currentApprovals: UInt64
        pub let multiSigRequired: Bool
        pub var multiSigApprovals: {Address: Bool}

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
            self.votesFor = 0
            self.votesAgainst = 0
            self.executed = false
            self.deadline = deadline
            self.requiredApprovals = requiredApprovals
            self.currentApprovals = 0
            self.multiSigRequired = multiSigRequired
            self.multiSigApprovals = {}
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

        init(id: UInt64, name: String, creator: Address, multiSigThreshold: UInt64) {
            self.id = id
            self.name = name
            self.creator = creator
            self.members = {creator: true}
            self.reputation = {creator: 100}
            self.treasury = 0.0
            self.multiSigThreshold = multiSigThreshold
            self.active = true
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
    }

    // Storage
    pub var proposals: {UInt64: Proposal}
    pub var nextProposalId: UInt64
    pub var daos: {UInt64: DAO}
    pub var nextDaoId: UInt64
    pub var userReputation: {Address: UInt64}
    pub var totalProposals: UInt64
    pub var executedProposals: UInt64

    // Initialize contract
    init() {
        self.proposals = {}
        self.nextProposalId = 1
        self.daos = {}
        self.nextDaoId = 1
        self.userReputation = {}
        self.totalProposals = 0
        self.executedProposals = 0
    }

    // Add member
    pub fun addMember(member: Address) {
        self.members[member] = true
    }

    // Create proposal
    pub fun createProposal(proposer: Address, description: String): UInt64 {
        pre {
            self.members[proposer] != nil: "Not a DAO member"
        }

        let proposalId = self.nextProposalId
        self.nextProposalId = self.nextProposalId + 1

        let deadline = getCurrentBlock().timestamp + 604800.0 // 1 week

        let proposal = Proposal(
            id: proposalId,
            proposer: proposer,
            description: description,
            deadline: deadline
        )

        self.proposals[proposalId] = proposal

        emit ProposalCreated(id: proposalId, proposer: proposer, description: description)

        return proposalId
    }

    // Vote on proposal
    pub fun vote(proposalId: UInt64, voter: Address, vote: Bool) {
        pre {
            self.members[voter] != nil: "Not a DAO member"
            self.proposals[proposalId] != nil: "Proposal does not exist"
            !self.proposals[proposalId]!.executed: "Proposal already executed"
            getCurrentBlock().timestamp <= self.proposals[proposalId]!.deadline: "Voting period ended"
        }

        if vote {
            self.proposals[proposalId]!.votesFor = self.proposals[proposalId]!.votesFor + 1
        } else {
            self.proposals[proposalId]!.votesAgainst = self.proposals[proposalId]!.votesAgainst + 1
        }

        emit VoteCast(proposalId: proposalId, voter: voter, vote: vote)
    }

    // Execute proposal
    pub fun executeProposal(proposalId: UInt64) {
        pre {
            self.proposals[proposalId] != nil: "Proposal does not exist"
            !self.proposals[proposalId]!.executed: "Proposal already executed"
            getCurrentBlock().timestamp > self.proposals[proposalId]!.deadline: "Voting period not ended"
            self.proposals[proposalId]!.votesFor > self.proposals[proposalId]!.votesAgainst: "Proposal not approved"
        }

        self.proposals[proposalId]!.executed = true

        emit ProposalExecuted(proposalId: proposalId)

        // Execute logic here (e.g., call other contracts)
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