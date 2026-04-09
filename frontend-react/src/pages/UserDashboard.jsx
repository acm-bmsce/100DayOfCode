import React from 'react';
import ProblemList from '../components/ProblemList';

export default function UserDashboard() {

  return (
    <div className="flex flex-col gap-6 md:gap-8"> {/* Consistent gap */}
      <h2 className="text-2xl font-bold text-gray-800">Welcome, {name}!</h2>
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8"> {/* Use same gap */}
        <div className="lg:col-span-2">
          <ProblemList />
        </div>
        
      </div>
    </div>
  );
}