export default function CreateWorkflow() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Create Workflow</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6">Select Action Type</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">Stake Tokens</h3>
              <p>Automate staking rewards</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">Recurring Payment</h3>
              <p>Schedule crypto payments</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">Swap Tokens</h3>
              <p>Automated token swaps</p>
            </button>
            <button className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
              <h3 className="font-semibold">Mint NFT</h3>
              <p>Create NFT rewards</p>
            </button>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Token</label>
            <select className="w-full p-2 border rounded">
              <option>FLOW</option>
              <option>USDC</option>
              <option>FUSD</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block mb-2">Amount</label>
            <input type="number" className="w-full p-2 border rounded" placeholder="Enter amount" />
          </div>

          <div className="mb-6">
            <label className="block mb-2">Frequency</label>
            <select className="w-full p-2 border rounded">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>One-time</option>
            </select>
          </div>

          <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
            Deploy Workflow
          </button>
        </div>
      </main>
    </div>
  );
}