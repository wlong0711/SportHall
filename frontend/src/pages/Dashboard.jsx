import React, { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl text-slate-300 bg-slate-900">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-60px)] p-8 bg-slate-900">
      <div className="max-w-6xl mx-auto">
        <h1 className="mb-8 text-white text-3xl font-bold">Welcome to Your Dashboard</h1>
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700 mb-8">
          <h2 className="mb-4 text-blue-400 border-b-2 border-blue-500 pb-2 text-xl font-semibold">User Information</h2>
          <div className="flex flex-col gap-4">
            <p className="m-0 text-lg text-slate-200"><strong className="text-white mr-2">Name:</strong> {user?.name}</p>
            <p className="m-0 text-lg text-slate-200"><strong className="text-white mr-2">Email:</strong> {user?.email}</p>
            <p className="m-0 text-lg text-slate-200"><strong className="text-white mr-2">Role:</strong> {user?.role || 'user'}</p>
          </div>
        </div>
        <div className="bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
          <h2 className="mb-4 text-blue-400 border-b-2 border-blue-500 pb-2 text-xl font-semibold">Quick Actions</h2>
          <p className="text-slate-300">Your dashboard content will go here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

