import React from 'react';
import { useQuery } from 'react-query';
import { statsAPI, uploadAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Database, 
  Upload, 
  Users, 
  FileText,
  Calendar,
} from 'lucide-react';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  
  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery(
    'stats',
    statsAPI.getStats,
    {
      refetchInterval: 30000, // Refetch every 30 seconds
      retry: 2
    }
  );

  // Also fetch uploads directly for accurate file count
  const { data: uploadsData, isLoading: uploadsLoading } = useQuery(
    'uploads',
    () => uploadAPI.getUploads(1, 100), // Get up to 100 uploads
    {
      refetchInterval: 30000,
      retry: 2
    }
  );

  const stats = statsData?.data?.statistics || {};
  const recentUploads = statsData?.data?.recent_uploads || [];
  const allUploads = uploadsData?.data?.uploads || [];

  // Calculate file counts - use allUploads for more accurate count
  const totalFileCount = allUploads.length || recentUploads.length;
  const completedFileCount = allUploads.filter(upload => upload.status === 'completed').length || 
                            recentUploads.filter(upload => upload.status === 'completed').length;
  const processingFileCount = allUploads.filter(upload => upload.status === 'processing').length || 
                             recentUploads.filter(upload => upload.status === 'processing').length;

  // Use stats if available, otherwise use calculated counts
  const displayStats = {
    total_uploads: stats.total_uploads || totalFileCount,
    completed_uploads: stats.completed_uploads || completedFileCount,
    processing_uploads: processingFileCount,
    total_users: stats.total_users || 0
  };

  // Debug logging
  console.log('Dashboard Debug:', {
    statsData,
    stats,
    recentUploads,
    allUploads,
    displayStats,
    totalFileCount,
    completedFileCount
  });

  const StatCard = ({ title, value, icon: Icon, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-500',
      green: 'bg-green-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
    };

    return (
      <div className="card p-6">
        <div className="flex items-center">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-semibold text-gray-900">
              {statsLoading || uploadsLoading ? (
                <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
              ) : statsError ? (
                <span className="text-red-500">Error</span>
              ) : (
                value || 0
              )}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Overview of your CSV uploads and data processing activity.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          title="Total Files"
          value={displayStats.total_uploads}
          icon={Upload}
          color="primary"
        />
        <StatCard
          title="Completed Files"
          value={displayStats.completed_uploads}
          icon={Database}
          color="green"
        />
        {displayStats.processing_uploads > 0 ? (
          <StatCard
            title="Processing Files"
            value={displayStats.processing_uploads}
            icon={Upload}
            color="blue"
          />
        ) : isAdmin() ? (
          <StatCard
            title="Total Users"
            value={displayStats.total_users}
            icon={Users}
            color="purple"
          />
        ) : null}
      </div>

      {/* Additional Stats */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Average Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : statsError ? (
                  <span className="text-red-500">Error</span>
                ) : (
                  `$${parseFloat(stats?.avg_amount || 0).toFixed(2)}`
                )}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Min Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : statsError ? (
                  <span className="text-red-500">Error</span>
                ) : (
                  `$${parseFloat(stats?.min_amount || 0).toFixed(2)}`
                )}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Max Amount</p>
              <p className="text-2xl font-semibold text-gray-900">
                {statsLoading ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
                ) : statsError ? (
                  <span className="text-red-500">Error</span>
                ) : (
                  `$${parseFloat(stats?.max_amount || 0).toFixed(2)}`
                )}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div> */}

      {/* Recent Uploads */}
      <div className="card">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-medium text-gray-900">Recent Uploads</h2>
        </div>
        <div className="overflow-hidden">
          {statsLoading || uploadsLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            </div>
          ) : (recentUploads.length > 0 || allUploads.length > 0) ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Records
                    </th>
                    {isAdmin() && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(recentUploads.length > 0 ? recentUploads : allUploads.slice(0, 5)).map((upload) => (
                    <tr key={upload.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div className="text-sm font-medium text-gray-900">
                            {upload.original_filename}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          upload.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : upload.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {upload.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {upload.record_count || 0}
                      </td>
                      {isAdmin() && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {upload.user_name}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(upload.upload_date).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
              
              {/* Mobile Card View */}
              <div className="sm:hidden">
                <div className="space-y-3 p-4">
                  {(recentUploads.length > 0 ? recentUploads : allUploads.slice(0, 5)).map((upload) => (
                    <div key={upload.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-48">
                              {upload.original_filename}
                            </p>
                            <p className="text-xs text-gray-500">{upload.record_count || 0} records</p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {upload.status === 'completed' ? (
                            <div className="flex items-center text-green-600">
                              <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                              <span className="text-xs font-medium">Completed</span>
                            </div>
                          ) : upload.status === 'failed' ? (
                            <div className="flex items-center text-red-600">
                              <div className="h-2 w-2 bg-red-500 rounded-full mr-2"></div>
                              <span className="text-xs font-medium">Failed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-yellow-600">
                              <div className="h-2 w-2 bg-yellow-500 rounded-full mr-2"></div>
                              <span className="text-xs font-medium">Processing</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(upload.upload_date).toLocaleDateString()}</span>
                        <span>{new Date(upload.upload_date).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No uploads yet. Upload your first CSV file to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
