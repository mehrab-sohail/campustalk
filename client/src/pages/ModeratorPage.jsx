import { useState } from 'react'
import ReportsPanel from '../components/ReportsPanel.jsx'
import CategoriesPanel from '../components/CategoriesPanel.jsx'
import AnnouncementsPanel from '../components/AnnouncementsPanel.jsx'

const TABS = [
  { id: 'reports', label: 'Reports' },
  { id: 'categories', label: 'Categories' },
  { id: 'announcements', label: 'Announcements' },
]

function ModeratorPage() {
  const [tab, setTab] = useState('reports')

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h2 className="mb-3">Moderator</h2>

        <ul className="nav nav-pills mb-4">
          {TABS.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                type="button"
                className={`nav-link${tab === item.id ? ' active' : ''}`}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {tab === 'reports' && <ReportsPanel />}
        {tab === 'categories' && <CategoriesPanel />}
        {tab === 'announcements' && <AnnouncementsPanel />}
      </div>
    </div>
  )
}

export default ModeratorPage