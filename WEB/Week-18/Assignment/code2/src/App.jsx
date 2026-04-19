import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Card from './components/Card';
import Badge from './components/Badge';

const stats = [
  { label: 'Revenue', value: '$45,231', change: '+12.5%', positive: true },
  { label: 'Orders', value: '1,234', change: '+5.2%', positive: true },
  { label: 'Customers', value: '892', change: '-2.1%', positive: false },
  { label: 'Growth', value: '18.3%', change: '+3.4%', positive: true },
];

const orders = [
  { id: '#1024', customer: 'Alice Johnson', amount: '$129.00', status: 'Delivered' },
  { id: '#1023', customer: 'Bob Smith', amount: '$59.00', status: 'Pending' },
  { id: '#1022', customer: 'Carol White', amount: '$249.00', status: 'Delivered' },
  { id: '#1021', customer: 'Dave Brown', amount: '$89.00', status: 'Cancelled' },
];

const statusColors = {
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      <Sidebar open={sidebarOpen} />

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-6 space-y-6">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <Badge positive={stat.positive}>{stat.change}</Badge>
                </div>
              </Card>
            ))}
          </div>

          {/* Recent orders table */}
          <Card className="overflow-x-auto">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  <th className="pb-2 font-medium">Order</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                    <td className="py-3 text-gray-900 dark:text-white font-medium">{order.id}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-300">{order.customer}</td>
                    <td className="py-3 text-gray-900 dark:text-white">{order.amount}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
      </div>
    </div>
  );
}