// FlowFiSubscriptionManager.cdc
// Contract for managing recurring payments and subscriptions

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868
import FlowFiWorkflowContract from 0xFlowFiWorkflowContract

pub contract FlowFiSubscriptionManager {

    // Events
    pub event SubscriptionCreated(id: UInt64, subscriber: Address, recipient: Address, token: String, amount: UFix64, interval: UInt64, fee: UFix64)
    pub event PaymentExecuted(id: UInt64, amount: UFix64, fee: UFix64, success: Bool, gasUsed: UInt64)
    pub event SubscriptionCancelled(id: UInt64)
    pub event PaymentFailed(id: UInt64, reason: String)
    pub event PaymentRetried(id: UInt64, attempt: UInt64)
    pub event PaymentRolledBack(id: UInt64, amount: UFix64)

    // Subscription struct
    pub struct Subscription {
        pub let id: UInt64
        pub let subscriber: Address
        pub let recipient: Address
        pub let token: String
        pub let amount: UFix64
        pub let fee: UFix64
        pub let interval: UInt64 // seconds
        pub let metadata: {String: String}
        pub let composableWorkflows: [UInt64] // Workflows to trigger after payment
        pub var nextPayment: UFix64
        pub var isActive: Bool
        pub var paymentCount: UInt64
        pub var successfulPayments: UInt64
        pub var failedPayments: UInt64
        pub var retryCount: UInt64
        pub var maxRetries: UInt64
        pub var lastPaymentAmount: UFix64
        pub var totalPaid: UFix64
        pub var gasLimit: UInt64

        init(id: UInt64, subscriber: Address, recipient: Address, token: String, amount: UFix64, fee: UFix64, interval: UInt64, metadata: {String: String}, composableWorkflows: [UInt64], maxRetries: UInt64, gasLimit: UInt64) {
            self.id = id
            self.subscriber = subscriber
            self.recipient = recipient
            self.token = token
            self.amount = amount
            self.fee = fee
            self.interval = interval
            self.metadata = metadata
            self.composableWorkflows = composableWorkflows
            self.nextPayment = getCurrentBlock().timestamp + UFix64(interval)
            self.isActive = true
            self.paymentCount = 0
            self.successfulPayments = 0
            self.failedPayments = 0
            self.retryCount = 0
            self.maxRetries = maxRetries
            self.lastPaymentAmount = 0.0
            self.totalPaid = 0.0
            self.gasLimit = gasLimit
        }

        pub fun executePayment(): Bool {
            if getCurrentBlock().timestamp < self.nextPayment {
                return false
            }

            let totalAmount = self.amount + self.fee

            // Check balance
            if !FlowFiSubscriptionManager.checkBalance(self.subscriber, self.token, totalAmount) {
                emit PaymentFailed(id: self.id, reason: "Insufficient balance")
                self.retryCount = self.retryCount + 1
                if self.retryCount <= self.maxRetries {
                    emit PaymentRetried(id: self.id, attempt: self.retryCount)
                    return false
                }
                self.failedPayments = self.failedPayments + 1
                return false
            }

            // Execute payment
            let success = FlowFiSubscriptionManager.transferTokens(self.subscriber, self.recipient, self.token, self.amount, self.fee)

            if success {
                self.nextPayment = self.nextPayment + UFix64(self.interval)
                self.paymentCount = self.paymentCount + 1
                self.successfulPayments = self.successfulPayments + 1
                self.lastPaymentAmount = self.amount
                self.totalPaid = self.totalPaid + self.amount
                self.retryCount = 0 // Reset retry count

                // Trigger composable workflows
                for workflowId in self.composableWorkflows {
                    FlowFiWorkflowContract.executeWorkflow(id: workflowId)
                }
            } else {
                self.failedPayments = self.failedPayments + 1
                self.retryCount = self.retryCount + 1
                if self.retryCount <= self.maxRetries {
                    emit PaymentRetried(id: self.id, attempt: self.retryCount)
                } else {
                    // Rollback logic
                    self.rollbackPayment()
                }
            }

            return success
        }

        pub fun rollbackPayment() {
            // Rollback last payment if possible
            if self.lastPaymentAmount > 0.0 {
                // Attempt to refund
                let refundSuccess = FlowFiSubscriptionManager.transferTokens(self.recipient, self.subscriber, self.token, self.lastPaymentAmount, 0.0)
                if refundSuccess {
                    emit PaymentRolledBack(id: self.id, amount: self.lastPaymentAmount)
                    self.totalPaid = self.totalPaid - self.lastPaymentAmount
                    self.lastPaymentAmount = 0.0
                }
            }
        }

        pub fun cancel() {
            self.isActive = false
        }

        pub fun getSuccessRate(): UFix64 {
            if self.paymentCount == 0 {
                return 0.0
            }
            return UFix64(self.successfulPayments) / UFix64(self.paymentCount)
        }
    }

    // Storage
    pub var subscriptions: {UInt64: Subscription}
    pub var nextSubscriptionId: UInt64
    pub var totalSubscriptions: UInt64
    pub var totalPayments: UInt64
    pub var totalSuccessfulPayments: UInt64
    pub var platformFees: UFix64

    // Contract admin
    pub let admin: Address

    init() {
        self.subscriptions = {}
        self.nextSubscriptionId = 1
        self.totalSubscriptions = 0
        self.totalPayments = 0
        self.totalSuccessfulPayments = 0
        self.platformFees = 0.0
        self.admin = self.account.address
    }

    // Create subscription
    pub fun createSubscription(
        recipient: Address,
        token: String,
        amount: UFix64,
        fee: UFix64,
        interval: UInt64,
        metadata: {String: String},
        composableWorkflows: [UInt64],
        maxRetries: UInt64,
        gasLimit: UInt64
    ): UInt64 {
        pre {
            amount > 0.0: "Amount must be greater than 0"
            interval >= 3600: "Interval must be at least 1 hour"
            maxRetries <= 5: "Max retries cannot exceed 5"
        }

        let subscriptionId = self.nextSubscriptionId
        self.nextSubscriptionId = self.nextSubscriptionId + 1
        self.totalSubscriptions = self.totalSubscriptions + 1

        let subscription = Subscription(
            id: subscriptionId,
            subscriber: self.account.address,
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

        self.subscriptions[subscriptionId] = subscription

        emit SubscriptionCreated(
            id: subscriptionId,
            subscriber: self.account.address,
            recipient: recipient,
            token: token,
            amount: amount,
            interval: interval,
            fee: fee
        )

        return subscriptionId
    }

    // Execute payment (called by Forte Actions)
    pub fun executePayment(id: UInt64): Bool {
        pre {
            self.subscriptions.containsKey(id): "Subscription does not exist"
        }

        let subscription = self.subscriptions[id]!
        if !subscription.isActive {
            emit PaymentFailed(id: id, reason: "Subscription is inactive")
            return false
        }

        let startGas = getCurrentBlock().gasLimit - getCurrentBlock().gasUsed // Mock gas tracking
        let success = subscription.executePayment()
        let gasUsed = startGas - (getCurrentBlock().gasLimit - getCurrentBlock().gasUsed)

        self.totalPayments = self.totalPayments + 1
        if success {
            self.totalSuccessfulPayments = self.totalSuccessfulPayments + 1
            self.platformFees = self.platformFees + subscription.fee
        }

        emit PaymentExecuted(id: id, amount: subscription.amount, fee: subscription.fee, success: success, gasUsed: gasUsed)
        return success
    }

    // Cancel subscription
    pub fun cancelSubscription(id: UInt64) {
        pre {
            self.subscriptions.containsKey(id): "Subscription does not exist"
            self.subscriptions[id]!.subscriber == self.account.address: "Not subscription owner"
        }

        self.subscriptions[id]!.cancel()
        emit SubscriptionCancelled(id: id)
    }

    // Get subscription
    pub fun getSubscription(id: UInt64): Subscription? {
        return self.subscriptions[id]
    }

    // Get subscriptions by subscriber
    pub fun getSubscriptionsBySubscriber(subscriber: Address): [Subscription] {
        var subscriberSubscriptions: [Subscription] = []
        for subscription in self.subscriptions.values {
            if subscription.subscriber == subscriber {
                subscriberSubscriptions.append(subscription)
            }
        }
        return subscriberSubscriptions
    }

    // Helper functions
    pub fun checkBalance(address: Address, token: String, amount: UFix64): Bool {
        // Mock balance checking - in real implementation, check user's vault
        // For FlowToken specifically
        if token == "FLOW" {
            let vaultRef = getAccount(address).getCapability(/public/flowTokenBalance)
                .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
            if vaultRef != nil {
                return vaultRef!.balance >= amount
            }
        }
        // For other tokens, similar logic would be implemented
        return true // Mock: assume sufficient balance
    }

    pub fun transferTokens(from: Address, to: Address, token: String, amount: UFix64, fee: UFix64): Bool {
        // Mock token transfer - in real implementation, borrow vaults and transfer
        // For FlowToken
        if token == "FLOW" {
            // This would be the actual transfer logic
            // let fromVault = getAccount(from).getCapability(/public/flowTokenReceiver)
            //     .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            // let toVault = getAccount(to).getCapability(/public/flowTokenReceiver)
            //     .borrow<&FlowToken.Vault{FungibleToken.Receiver}>()
            // fromVault.withdraw(amount: amount)
            // toVault.deposit(from: <-fromVault.withdraw(amount: amount))
            return true // Mock success
        }
        return true // Mock success for other tokens
    }

    // Analytics functions
    pub fun getTotalSubscriptions(): UInt64 {
        return self.totalSubscriptions
    }

    pub fun getTotalPayments(): UInt64 {
        return self.totalPayments
    }

    pub fun getPaymentSuccessRate(): UFix64 {
        if self.totalPayments == 0 {
            return 0.0
        }
        return UFix64(self.totalSuccessfulPayments) / UFix64(self.totalPayments)
    }

    pub fun getPlatformFees(): UFix64 {
        return self.platformFees
    }

    pub fun getSubscriptionStats(id: UInt64): {String: AnyStruct} {
        pre {
            self.subscriptions.containsKey(id): "Subscription does not exist"
        }

        let subscription = self.subscriptions[id]!
        return {
            "paymentCount": subscription.paymentCount,
            "successfulPayments": subscription.successfulPayments,
            "failedPayments": subscription.failedPayments,
            "successRate": subscription.getSuccessRate(),
            "totalPaid": subscription.totalPaid,
            "nextPayment": subscription.nextPayment,
            "isActive": subscription.isActive
        }
    }
}