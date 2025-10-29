import React from 'react';
import { useAuthStore } from '../store';
import Leaderboard from '../components/Leaderboard';
import ProblemList from '../components/ProblemList';

export default function UserDashboard() {
  const name = useAuthStore((s) => s.name);

  return (
    <div className="flex flex-col gap-6 md:gap-8"> {/* Consistent gap */}
      <h2 className="text-2xl font-bold text-gray-800">Welcome, {name}!</h2>
      <div className="grid lg:grid-cols-3 gap-6 md:gap-8"> {/* Use same gap */}
        <div className="lg:col-span-2">
          <ProblemList />
        </div>
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
}