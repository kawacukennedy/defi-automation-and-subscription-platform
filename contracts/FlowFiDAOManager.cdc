// FlowFiDAOManager.cdc
// DAO Manager Contract for FlowFi

import FungibleToken from 0x9a0766d93b6608b7
import NonFungibleToken from 0x631e88ae7f1d7c20
import FlowToken from 0x7e60df042a9c0868

pub contract FlowFiDAOManager {

    // Events
    pub event ProposalCreated(id: UInt64, proposer: Address, description: String)
    pub event VoteCast(proposalId: UInt64, voter: Address, vote: Bool)
    pub event ProposalExecuted(proposalId: UInt64)

    // Proposal struct
    pub struct Proposal {
        pub let id: UInt64
        pub let proposer: Address
        pub let description: String
        pub let votesFor: UInt64
        pub let votesAgainst: UInt64
        pub let executed: Bool
        pub let deadline: UFix64

        init(id: UInt64, proposer: Address, description: String, deadline: UFix64) {
            self.id = id
            self.proposer = proposer
            self.description = description
            self.votesFor = 0
            self.votesAgainst = 0
            self.executed = false
            self.deadline = deadline
        }
    }

    // Storage
    pub var proposals: {UInt64: Proposal}
    pub var nextProposalId: UInt64
    pub var members: {Address: Bool}

    // Initialize contract
    init() {
        self.proposals = {}
        self.nextProposalId = 1
        self.members = {}
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