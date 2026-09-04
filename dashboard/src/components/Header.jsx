import { Stethoscope, Pill } from 'lucide-react'

export default function Header({ view, setView, latestData }) {
  const period = latestData ? `${latestData.MONTH} ${latestData.YEAR}` : ''

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/25 ring-1 ring-white/20 p-2.5 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            className="w-full h-full drop-shadow-sm"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="headerHospitalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              <linearGradient id="headerCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ef4444" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            </defs>
            {/* Hospital Building */}
            <path
              fill="url(#headerHospitalGrad)"
              d="M298.2 72.6C310.5 61.2 329.5 61.2 341.7 72.6L432 156.3L432 144C432 126.3 446.3 112 464 112L496 112C513.7 112 528 126.3 528 144L528 245.5L565.8 280.6C575.4 289.6 578.6 303.5 573.8 315.7C569 327.9 557.2 336 544 336L528 336L528 512C528 547.3 499.3 576 464 576L176 576C140.7 576 112 547.3 112 512L112 336L96 336C82.8 336 71 327.9 66.2 315.7C61.4 303.5 64.6 289.5 74.2 280.6L298.2 72.6z"
            />
            {/* Medical Cross */}
            <path
              fill="url(#headerCrossGrad)"
              d="M288 312L288 352L248 352C239.2 352 232 359.2 232 368L232 400C232 408.8 239.2 416 248 416L288 416L288 456C288 464.8 295.2 472 304 472L336 472C344.8 472 352 464.8 352 456L352 416L392 416C400.8 416 408 408.8 408 400L408 368C408 359.2 400.8 352 392 352L352 352L352 312C352 303.2 344.8 296 336 296L304 296C295.2 296 288 303.2 288 312z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight">
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
