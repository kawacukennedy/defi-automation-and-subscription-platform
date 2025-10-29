// FlowFiSubscriptionManager.cdc
// Contract for managing recurring payments and subscriptions

import FungibleToken from 0x9a0766d93b6608b7
import FlowToken from 0x7e60df042a9c0868

pub contract FlowFiSubscriptionManager {

    // Events
    pub event SubscriptionCreated(id: UInt64, subscriber: Address, recipient: Address, amount: UFix64, interval: UInt64)
    pub event PaymentExecuted(id: UInt64, amount: UFix64, success: Bool)
    pub event SubscriptionCancelled(id: UInt64)

    // Subscription struct
    pub struct Subscription {
        pub let id: UInt64
        pub let subscriber: Address
        pub let recipient: Address
        pub let amount: UFix64
        pub let interval: UInt64 // seconds
        pub var nextPayment: UFix64
        pub var isActive: Bool
        pub var paymentCount: UInt64

        init(id: UInt64, subscriber: Address, recipient: Address, amount: UFix64, interval: UInt64) {
            self.id = id
            self.subscriber = subscriber
            self.recipient = recipient
            self.amount = amount
            self.interval = interval
            self.nextPayment = getCurrentBlock().timestamp + UFix64(interval)
            self.isActive = true
            self.paymentCount = 0
        }

        pub fun executePayment(): Bool {
            if getCurrentBlock().timestamp < self.nextPayment {
                return false
            }

            // Payment logic would go here
            // Transfer tokens from subscriber to recipient

            self.nextPayment = self.nextPayment + UFix64(self.interval)
            self.paymentCount = self.paymentCount + 1

            return true
        }

        pub fun cancel() {
            self.isActive = false
        }
    }

    // Storage
    pub var subscriptions: {UInt64: Subscription}
    pub var nextSubscriptionId: UInt64

    init() {
        self.subscriptions = {}
        self.nextSubscriptionId = 1
    }

    // Create subscription
    pub fun createSubscription(recipient: Address, amount: UFix64, interval: UInt64): UInt64 {
        let subscriptionId = self.nextSubscriptionId
        self.nextSubscriptionId = self.nextSubscriptionId + 1

        let subscription = Subscription(
            id: subscriptionId,
            subscriber: self.account.address,
            recipient: recipient,
            amount: amount,
            interval: interval
        )

        self.subscriptions[subscriptionId] = subscription

        emit SubscriptionCreated(
            id: subscriptionId,
            subscriber: self.account.address,
            recipient: recipient,
            amount: amount,
            interval: interval
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
            return false
        }

        let success = subscription.executePayment()

        emit PaymentExecuted(id: id, amount: subscription.amount, success: success)
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
}