import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Calendar, Shield, Lock, Edit } from 'lucide-react';
import ChangePasswordModal from '../components/ChangePasswordModal';
import UpdateProfileModal from '../components/UpdateProfileModal';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);

  const handleChangePassword = () => {
    setShowChangePassword(true);
  };

  const handleUpdateProfile = () => {
    setShowUpdateProfile(true);
  };

  const handleProfileUpdate = (updatedUser) => {
    // Update the user context with new data
    updateUser(updatedUser);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Your account information and settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Account Information</h2>
            
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{user?.name}</h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      <Shield className="h-3 w-3 mr-1" />
                      {user?.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">{user?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.role === 'admin' ? 'Administrator' : 'Standard User'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Member Since
                  </label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={handleChangePassword}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </button>
              <button 
                onClick={handleUpdateProfile}
                className="w-full btn btn-secondary flex items-center justify-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Update Profile
              </button>
            </div>
          </div>

          {user?.role === 'admin' && (
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Features</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p className="font-medium mb-2">Administrator privileges:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• View all user uploads</li>
                    <li>• Access all records</li>
                    <li>• Download system-wide data</li>
                    <li>• View user statistics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">System Information</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Application Version:</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateProfile}
        onClose={() => setShowUpdateProfile(false)}
        currentUser={user}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
