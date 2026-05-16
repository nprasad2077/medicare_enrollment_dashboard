import { HeartPulse, Stethoscope, Pill } from 'lucide-react'

export default function Header({ view, setView, latestData }) {
  const period = latestData ? `${latestData.MONTH} ${latestData.YEAR}` : ''

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
          <HeartPulse className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
            Medicare Enrollment Dashboard
          </h1>
          <p className="text-gray-500 text-sm">
            CMS Monthly Enrollment Data {period && `· ${period}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setView('medical')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'medical'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          Hospital/Medical
        </button>
        <button
          onClick={() => setView('drug')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            view === 'drug'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Pill className="w-4 h-4" />
          Prescription Drug
        </button>
      </div>
    </div>
  )
}
