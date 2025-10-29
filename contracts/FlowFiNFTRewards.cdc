// FlowFiNFTRewards.cdc
// Contract for minting NFT achievement badges

import NonFungibleToken from 0x1d7e57aa55817448
import MetadataViews from 0x1d7e57aa55817448

pub contract FlowFiNFTRewards: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event NFTMinted(id: UInt64, badgeType: String, recipient: Address)

    // Badge types
    pub enum BadgeType: UInt8 {
        pub case WorkflowMaster
        pub case StakingPro
        pub case PaymentWarrior
        pub case CommunityContributor
        pub case EarlyAdopter
    }

    // NFT resource
    pub resource NFT: NonFungibleToken.INFT, MetadataViews.Resolver {
        pub let id: UInt64
        pub let badgeType: BadgeType
        pub let mintedAt: UFix64
        pub let metadata: {String: String}

        init(id: UInt64, badgeType: BadgeType, metadata: {String: String}) {
            self.id = id
            self.badgeType = badgeType
            self.mintedAt = getCurrentBlock().timestamp
            self.metadata = metadata
        }

        pub fun getViews(): [Type] {
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

        pub fun resolveView(_ view: Type): AnyStruct? {
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
    pub resource Collection: NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        destroy() {
            destroy self.ownedNFTs
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("missing NFT")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @FlowFiNFTRewards.NFT
            let id: UInt64 = token.id
            let oldToken <- self.ownedNFTs[token.id] <- token
            emit Deposit(id: id, to: self.owner?.address)
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
        }

        pub fun borrowFlowFiNFT(id: UInt64): &FlowFiNFTRewards.NFT? {
            if self.ownedNFTs[self.id] != nil {
                let ref = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
                return ref as! &FlowFiNFTRewards.NFT
            }
            return nil
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
            let nft = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
            let FlowFiNFT = nft as! &FlowFiNFTRewards.NFT
            return FlowFiNFT as &AnyResource{MetadataViews.Resolver}
        }
    }

    // Storage
    pub var totalSupply: UInt64
    pub var nextNFTId: UInt64
    pub let admin: Address

    // Badge metadata templates
    pub let badgeMetadata: {BadgeType: {String: String}}

    init() {
        self.totalSupply = 0
        self.nextNFTId = 1
        self.admin = self.account.address

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
            }
        }

        // Create collection storage
        self.account.save(<- create Collection(), to: /storage/FlowFiNFTCollection)
        self.account.link<&{NonFungibleToken.CollectionPublic}>(/public/FlowFiNFTCollection, target: /storage/FlowFiNFTCollection)

        emit ContractInitialized()
    }

    // Mint NFT badge
    pub fun mintBadge(recipient: Address, badgeType: BadgeType): @NFT {
        pre {
            self.account.address == self.admin: "Only admin can mint badges"
        }

        let nftId = self.nextNFTId
        self.nextNFTId = self.nextNFTId + 1
        self.totalSupply = self.totalSupply + 1

        let metadata = self.badgeMetadata[badgeType] ?? panic("Invalid badge type")

        let nft <- create NFT(id: nftId, badgeType: badgeType, metadata: metadata)

        emit NFTMinted(id: nftId, badgeType: badgeType.rawValue.toString(), recipient: recipient)

        return <- nft
    }

    // Create empty collection
    pub fun createEmptyCollection(): @Collection {
        return <- create Collection()
    }

    // Get badge metadata
    pub fun getBadgeMetadata(badgeType: BadgeType): {String: String} {
        return self.badgeMetadata[badgeType] ?? {}
    }
}