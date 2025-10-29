import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Automate Your DeFi Life with FlowFi
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Schedule recurring crypto payments, automate staking, swaps, and NFT rewards on Flow blockchain using Forte Actions and Workflows.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/dashboard" className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
            Get Started
          </Link>
          <button className="border border-gray-300 px-8 py-3 rounded-lg hover:bg-gray-50 transition">
            Watch Demo
          </button>
        </div>
      </section>

      {/* Features Overview */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Automated Recurring Payments</h3>
            <p>Schedule FLOW, USDC, or partner token payments with retries and notifications.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">DeFi Workflow Automation</h3>
            <p>Create reusable workflows for staking, swapping, lending, and DAO governance.</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">NFT Achievements & Gamification</h3>
            <p>Earn badges for milestones, compete on leaderboards, and share templates.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-green-600 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Automate?</h2>
        <p className="mb-8">Connect your wallet and start building workflows today.</p>
        <button className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
          Connect Wallet
        </button>
      </section>
    </div>
  );
}
