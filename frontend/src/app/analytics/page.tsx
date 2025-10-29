export default function Analytics() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Analytics</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Token Balances</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>FLOW</span>
                <span>100.5</span>
              </div>
              <div className="flex justify-between">
                <span>USDC</span>
                <span>250.0</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Workflow Performance</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Success Rate</span>
                <span className="text-green-600">98%</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Executions</span>
                <span className="text-red-600">2</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Execution Trends</h2>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
            <span>Chart Placeholder</span>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
            Export CSV
          </button>
        </div>
      </main>
    </div>
  );
}