export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">FlowFi Dashboard</h1>
          <div className="flex items-center gap-4">
            <span>Notifications</span>
            <span>Wallet: Connected</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Active Workflows</h3>
            <p className="text-3xl font-bold text-green-600">5</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Total Executions</h3>
            <p className="text-3xl font-bold text-blue-600">127</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">Success Rate</h3>
            <p className="text-3xl font-bold text-purple-600">98%</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold">NFT Badges</h3>
            <p className="text-3xl font-bold text-yellow-600">12</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <ul>
            <li className="py-2 border-b">Workflow 'Monthly Staking' executed successfully</li>
            <li className="py-2 border-b">New NFT badge earned: 'Automation Pro'</li>
            <li className="py-2">Subscription payment processed</li>
          </ul>
        </div>

        <div className="text-center">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
            Create New Workflow
          </button>
        </div>
      </main>
    </div>
  );
}