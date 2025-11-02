import React from 'react';
import PublishDay from '../components/PublishDay';
import AdminProblemList from '../components/AdminProblemList';
import AddProblem from '../components/AddProblem';
import AddSolution from '../components/AddSolution';
import PublishSolution from '../components/PublishSolution';

export default function AdminDashboard() {
  return (
    // Main container uses vertical flow
    <div className="flex flex-col gap-6 md:gap-8">
      <h2 className="text-2xl font-bold text-gray-800">Admin Control Panel</h2>

      {/* 1. Master Problem List (takes full width) */}
      <div> {/* Added a div wrapper for spacing if needed */}
        <AdminProblemList />
      </div>

      {/* 2. Grid container for Admin Control Panels */}
      {/* - 1 column on small screens (default) */}
      {/* - 2 columns on medium screens (md) */}
      {/* - 3 columns on large screens (lg) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Each control panel is a grid item */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <AddProblem />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <AddSolution />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <PublishDay />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <PublishSolution />
        </div>
        
        {/* Add an empty div if you have 5 items and want the last row (on lg) to align left */}
        {/* <div className="hidden lg:block"></div>  */}

      </div> {/* End of admin controls grid */}
      
    </div> // End of main container
  );
}