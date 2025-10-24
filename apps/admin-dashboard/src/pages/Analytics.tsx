import React from 'react';
import { 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  UserGroupIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const Analytics: React.FC = () => {
  const metrics = [
    {
      name: 'Total Revenue',
      value: '$45,678',
      change: '+12.5%',
      changeType: 'increase',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      changeType: 'increase',
      icon: UserGroupIcon,
    },
    {
      name: 'Page Views',
      value: '45,892',
      change: '-2.1%',
      changeType: 'decrease',
      icon: EyeIcon,
    },
    {
      name: 'Conversion Rate',
      value: '3.2%',
      change: '+0.5%',
      changeType: 'increase',
      icon: ChartBarIcon,
    },
  ];

  const topPages = [
    { page: '/dashboard', views: 1250, unique: 890, bounce: '45%' },
    { page: '/campaigns', views: 980, unique: 756, bounce: '52%' },
    { page: '/agents', views: 756, unique: 634, bounce: '38%' },
    { page: '/contacts', views: 634, unique: 512, bounce: '41%' },
    { page: '/settings', views: 512, unique: 456, bounce: '28%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Platform performance and usage metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-4 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {metric.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {metric.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold">
                        {metric.changeType === 'increase' ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`ml-1 ${metric.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
                          {metric.change}
                        </span>
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue Chart</p>
              <p className="text-sm text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">User Growth</h3>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">User Growth Chart</p>
              <p className="text-sm text-gray-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Top Pages</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unique Visitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bounce Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {topPages.map((page, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.page}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.views.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.unique.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {page.bounce}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;