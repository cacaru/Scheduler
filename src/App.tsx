import { useState } from 'react'
import './App.css'
import DiaryCalendar from './components/Diary/Calendar/DiaryCalendar'
import Sidebar from './components/Sidebar/Sidebar'
import MainMapView from './components/Map/MainMapView'
import { Menu } from 'lucide-react'

export type ViewType = 'diary' | 'map';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('diary')

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <button className="side-menu-toggle-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="title-text">
            <h1>다이어리</h1>
            <p> 나의 하루를 작성해보아요.</p>
          </div>
        </div>
      </header>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <main className="main-content">
        <section className="view-section">
          {currentView === 'diary' ? (
            <DiaryCalendar />
          ) : (
            <MainMapView />
          )}
        </section>

        <footer className="app-footer">
          <div className="ticks"></div>
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Scheduler Diary</p>
          </div>
        </footer>
      </main>
    </div>
  )
}

export default App
