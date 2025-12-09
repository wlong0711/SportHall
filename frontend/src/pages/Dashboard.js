import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import './Dashboard.css';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1>Welcome to Your Dashboard</h1>
        <div className="dashboard-card">
          <h2>User Information</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role || 'user'}</p>
          </div>
        </div>
        <div className="dashboard-card">
          <h2>Quick Actions</h2>
          <p>Your dashboard content will go here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

