import React from 'react'
import PublishDay from '../components/PublishDay'
import ManualTrigger from '../components/ManualTrigger'

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-orange-400">Admin Control Panel</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <PublishDay />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <ManualTrigger />
        </div>
      </div>
    </div>
  )
}