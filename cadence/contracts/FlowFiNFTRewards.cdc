// FlowFiNFTRewards.cdc
// Contract for minting NFT achievement badges

import NonFungibleToken from 0xf8d6e0586b0a20c7
import MetadataViews from 0xf8d6e0586b0a20c7

access(all) contract FlowFiNFTRewards: NonFungibleToken {

    // Events
    access(all) event ContractInitialized()
    access(all) event Withdraw(id: UInt64, from: Address?)
    access(all) event Deposit(id: UInt64, to: Address?)
    access(all) event NFTMinted(id: UInt64, badgeType: String, recipient: Address, thirdwebId: String?, crossmintId: String?)
    access(all) event BadgeTemplateForked(originalId: UInt64, newId: UInt64, forker: Address)
    access(all) event LeaderboardUpdated(user: Address, score: UInt64, rank: UInt64)

    // Badge types
    access(all) enum BadgeType: UInt8 {
        access(all) case WorkflowMaster
        access(all) case StakingPro
        access(all) case PaymentWarrior
        access(all) case CommunityContributor
        access(all) case EarlyAdopter
        access(all) case MonthlyStreak
        access(all) case DAOChampion
        access(all) case TemplateForker
        access(all) case HighValueWorkflow
        access(all) case BetaTester
    }

    // NFT resource
    access(all) resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        access(all) let id: UInt64
        access(all) let badgeType: BadgeType
        access(all) let mintedAt: UFix64
        access(all) let metadata: {String: String}
        access(all) let thirdwebId: String?
        access(all) let crossmintId: String?
        access(all) let forkable: Bool
        access(all) let originalTemplateId: UInt64?

        init(id: UInt64, badgeType: BadgeType, metadata: {String: String}, thirdwebId: String?, crossmintId: String?, forkable: Bool, originalTemplateId: UInt64?) {
            self.id = id
            self.badgeType = badgeType
            self.mintedAt = getCurrentBlock().timestamp
            self.metadata = metadata
            self.thirdwebId = thirdwebId
            self.crossmintId = crossmintId
            self.forkable = forkable
            self.originalTemplateId = originalTemplateId
        }

        access(all) fun getViews(): [Type] {
            return [
                Type<MetadataViews.Display>(),
                Type<MetadataViews.Royalties>(),
                Type<MetadataViews.Editions>(),
                Type<MetadataViews.ExternalURL>(),
                Type<MetadataViews.NFTCollectionData>(),
                Type<MetadataViews.NFTCollectionDisplay>(),
                Type<MetadataViews.Serial>(),
                Type<MetadataViews.Traits>()
            ]
        }

        access(all) fun resolveView(_ view: Type): AnyStruct? {
            switch view {
                case Type<MetadataViews.Display>():
                    return MetadataViews.Display(
                        name: self.metadata["name"] ?? "FlowFi Badge",
                        description: self.metadata["description"] ?? "Achievement badge from FlowFi",
                        thumbnail: MetadataViews.HTTPFile(url: self.metadata["thumbnail"] ?? "")
                    )
                case Type<MetadataViews.Traits>():
                    return MetadataViews.Traits([
                        MetadataViews.Trait(name: "Badge Type", value: self.badgeType.rawValue, displayType: "Number", rarity: nil),
                        MetadataViews.Trait(name: "Minted At", value: self.mintedAt, displayType: "Date", rarity: nil)
                    ])
            }
            return nil
        }
    }

    // Collection resource
    access(all) resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        access(all) var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        destroy() {
            destroy self.ownedNFTs
        }

        access(all) fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        access(all) fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @FlowFiNFTRewards.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[token.id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        access(all) fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        access(all) fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        access(all) fun borrowFlowFiNFT(id: UInt64): &FlowFiNFTRewards.NFT? {
            if self.ownedNFTs[self.id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &FlowFiNFTRewards.NFT
            }
            return nil
        }

        access(all) fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let FlowFiNFT = nft as! &FlowFiNFTRewards.NFT
            return FlowFiNFT as &AnyResource{MetadataViews.Resolver}
        }
    }

    // Storage
    access(all) var totalSupply: UInt64
    access(all) var nextNFTId: UInt64
    access(all) let admin: Address

    // Badge metadata templates
    access(all) let badgeMetadata: {BadgeType: {String: String}}

    // Leaderboard
    access(all) var leaderboard: {Address: UInt64} // Address -> Score
    access(all) var userBadges: {Address: [UInt64]} // Address -> Badge IDs

    // Forkable templates
    access(all) var badgeTemplates: {UInt64: {String: String}}
    access(all) var nextTemplateId: UInt64

    init() {
        self.totalSupply = 0
        self.nextNFTId = 1
        self.admin = self.account.address
        self.leaderboard = {}
        self.userBadges = {}
        self.badgeTemplates = {}
        self.nextTemplateId = 1

        self.badgeMetadata = {
            BadgeType.WorkflowMaster: {
                "name": "Workflow Master",
                "description": "Created 100+ successful workflows",
                "thumbnail": "https://flowfi.com/badges/workflow-master.png"
            },
            BadgeType.StakingPro: {
                "name": "Staking Pro",
                "description": "Automated staking for 1+ years",
                "thumbnail": "https://flowfi.com/badges/staking-pro.png"
            },
            BadgeType.PaymentWarrior: {
                "name": "Payment Warrior",
                "description": "Processed 1000+ automated payments",
                "thumbnail": "https://flowfi.com/badges/payment-warrior.png"
            },
            BadgeType.CommunityContributor: {
                "name": "Community Contributor",
                "description": "Shared 50+ workflow templates",
                "thumbnail": "https://flowfi.com/badges/community-contributor.png"
            },
            BadgeType.EarlyAdopter: {
                "name": "Early Adopter",
                "description": "Joined FlowFi during beta",
                "thumbnail": "https://flowfi.com/badges/early-adopter.png"
            },
            BadgeType.MonthlyStreak: {
                "name": "Monthly Streak",
                "description": "Maintained active workflows for a month",
                "thumbnail": "https://flowfi.com/badges/monthly-streak.png"
            },
            BadgeType.DAOChampion: {
                "name": "DAO Champion",
                "description": "Led successful DAO proposals",
                "thumbnail": "https://flowfi.com/badges/dao-champion.png"
            },
            BadgeType.TemplateForker: {
                "name": "Template Forker",
                "description": "Forked and improved community templates",
                "thumbnail": "https://flowfi.com/badges/template-forker.png"
            },
            BadgeType.HighValueWorkflow: {
                "name": "High Value Workflow",
                "description": "Created workflows processing $10k+ in volume",
                "thumbnail": "https://flowfi.com/badges/high-value-workflow.png"
            },
            BadgeType.BetaTester: {
                "name": "Beta Tester",
                "description": "Helped test FlowFi during development",
                "thumbnail": "https://flowfi.com/badges/beta-tester.png"
            }
        }

        // Create collection storage
        self.account.save(<- create Collection(), to: /storage/FlowFiNFTCollection)
        self.account.link<&{NonFungibleToken.CollectionPublic}>(/public/FlowFiNFTCollection, target: /storage/FlowFiNFTCollection)

        emit ContractInitialized()
    }

    // Mint NFT badge
    access(all) fun mintBadge(recipient: Address, badgeType: BadgeType): @NFT {
        pre {
            self.account.address == self.admin: "Only admin can mint badges"
        }

        let nftId = self.nextNFTId
        self.nextNFTId = self.nextNFTId + 1
        self.totalSupply = self.totalSupply + 1

        let metadata = self.badgeMetadata[badgeType] ?? panic("Invalid badge type")

        // Generate Thirdweb/Crossmint IDs (mock)
        let thirdwebId = "tw_".concat(nftId.toString())
        let crossmintId = "cm_".concat(nftId.toString())

        let nft <- create NFT(
            id: nftId,
            badgeType: badgeType,
            metadata: metadata,
            thirdwebId: thirdwebId,
            crossmintId: crossmintId,
            forkable: true,
            originalTemplateId: nil
        )

        // Update leaderboard
        self.updateLeaderboard(recipient, self.getBadgeScore(badgeType))

        // Track user badges
        if self.userBadges[recipient] == nil {
            self.userBadges[recipient] = []
        }
        self.userBadges[recipient]!.append(nftId)

        emit NFTMinted(id: nftId, badgeType: badgeType.rawValue.toString(), recipient: recipient, thirdwebId: thirdwebId, crossmintId: crossmintId)

        return <- nft
    }

    // Create empty collection
    access(all) fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // Get badge metadata
    access(all) fun getBadgeMetadata(badgeType: BadgeType): {String: String} {
        return self.badgeMetadata[badgeType] ?? {}
    }

    // Leaderboard functions
    priv fun updateLeaderboard(user: Address, scoreIncrease: UInt64) {
        let currentScore = self.leaderboard[user] ?? 0
        self.leaderboard[user] = currentScore + scoreIncrease

        // Update rank (simplified - in real implementation, sort all users)
        let newRank = self.calculateRank(user)
        emit LeaderboardUpdated(user: user, score: self.leaderboard[user]!, rank: newRank)
    }

    priv fun getBadgeScore(_ badgeType: BadgeType): UInt64 {
        switch badgeType {
            case BadgeType.WorkflowMaster: return 100
            case BadgeType.StakingPro: return 75
            case BadgeType.PaymentWarrior: return 50
            case BadgeType.CommunityContributor: return 40
            case BadgeType.EarlyAdopter: return 30
            case BadgeType.MonthlyStreak: return 25
            case BadgeType.DAOChampion: return 60
            case BadgeType.TemplateForker: return 35
            case BadgeType.HighValueWorkflow: return 80
            case BadgeType.BetaTester: return 20
            default: return 10
        }
    }

    priv fun calculateRank(user: Address): UInt64 {
        let userScore = self.leaderboard[user] ?? 0
        var rank: UInt64 = 1
        for score in self.leaderboard.values {
            if score > userScore {
                rank = rank + 1
            }
        }
        return rank
    }

    access(all) fun getLeaderboard(): {Address: UInt64} {
        return self.leaderboard
    }

    access(all) fun getUserRank(user: Address): UInt64 {
        return self.calculateRank(user)
    }

    access(all) fun getUserScore(user: Address): UInt64 {
        return self.leaderboard[user] ?? 0
    }

    // Template functions
    access(all) fun createBadgeTemplate(metadata: {String: String}): UInt64 {
        let templateId = self.nextTemplateId
        self.nextTemplateId = self.nextTemplateId + 1

        self.badgeTemplates[templateId] = metadata
        return templateId
    }

    access(all) fun forkBadgeTemplate(originalTemplateId: UInt64, newMetadata: {String: String}, forker: Address): UInt64 {
        pre {
            self.badgeTemplates.containsKey(originalTemplateId): "Template does not exist"
        }

        let newTemplateId = self.createBadgeTemplate(metadata: newMetadata)

        // Mint fork achievement NFT
        let nft <- self.mintBadge(recipient: forker, badgeType: BadgeType.TemplateForker)
        destroy nft

        emit BadgeTemplateForked(originalId: originalTemplateId, newId: newTemplateId, forker: forker)
        return newTemplateId
    }

    access(all) fun getBadgeTemplate(templateId: UInt64): {String: String}? {
        return self.badgeTemplates[templateId]
    }

    access(all) fun getUserBadges(user: Address): [UInt64] {
        return self.userBadges[user] ?? []
    }

    // Gamification functions
    access(all) fun checkAndMintAchievements(user: Address, workflowCount: UInt64) {
        // Check workflow count
        if workflowCount >= 100 && !self.hasBadgeType(user, BadgeType.WorkflowMaster) {
            let nft <- self.mintBadge(recipient: user, badgeType: BadgeType.WorkflowMaster)
            destroy nft
        }

        // Check monthly streak (simplified check)
        if workflowCount > 0 && !self.hasBadgeType(user, BadgeType.MonthlyStreak) {
            let nft <- self.mintBadge(recipient: user, badgeType: BadgeType.MonthlyStreak)
            destroy nft
        }
    }

    priv fun hasBadgeType(user: Address, badgeType: BadgeType): Bool {
        let userBadgeIds = self.userBadges[user] ?? []
        for badgeId in userBadgeIds {
            // In real implementation, check the NFT's badgeType
            // For now, assume no duplicate types
        }
        return false
    }
}