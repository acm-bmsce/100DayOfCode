import React from 'react'
import PublishDay from '../components/PublishDay'
import ManualTrigger from '../components/ManualTrigger'

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-3xl font-bold text-red-500">ADMIN_CONTROL_PANEL</h2>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="border border-red-700 p-6">
          <PublishDay />
        </div>
        <div className="border border-red-700 p-6">
          <ManualTrigger />
        </div>
      </div>
    </div>
  )
}