export default function Header({ title, view, setView }) {
  return (
    <div className="header">
      <h1>{title}</h1>
      <div className="view-toggle">
        <button className={view === 'medical' ? 'active' : ''} onClick={() => setView('medical')}>
          🏥 Hospital/Medical
        </button>
        <button className={view === 'drug' ? 'active' : ''} onClick={() => setView('drug')}>
          💊 Prescription Drug
        </button>
      </div>
    </div>
  )
}
