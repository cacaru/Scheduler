import { useState, useEffect } from 'react'
import styles from './App.module.css'
import DiaryCalendar from './components/Diary/Calendar/DiaryCalendar'
import Sidebar from './components/Sidebar/Sidebar'
import MainMapView from './components/Map/MainMapView'
import AuthModal from './components/Auth/AuthModal'
import Toast from './components/common/Toast'
import { Menu } from 'lucide-react'
import { supabase } from '@project/shared/src/utils/supabase'
import { useAuthStore } from '@project/shared/src/store/authStore'
import { useDiaryStore } from '@project/shared/src/store/diaryStore'
import { useUIStore } from '@project/shared/src/store/uiStore'

export type ViewType = 'diary' | 'map';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('diary');
  
  const { user, isLoading, setUser, setSession } = useAuthStore();
  const fetchEntries = useDiaryStore(state => state.fetchEntries);
  const fetchOris = useDiaryStore(state => state.fetchOris);
  const setModalOpen = useUIStore(state => state.setModalOpen);

  // 현재 메인 화면 변경
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentView]);

  // 사이드바 상태 변경 시 스크롤 잠금 제어
  useEffect(() => {
    if (isSidebarOpen) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [isSidebarOpen, setModalOpen]);

  // 인증 모달 (user가 없을 때) 스크롤 잠금 제어
  useEffect(() => {
    if (!user && !isLoading) {
      setModalOpen(true);
      return () => setModalOpen(false);
    }
  }, [user, isLoading, setModalOpen]);

  useEffect(() => {
    // 현재 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEntries();
        fetchOris();
      }
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchEntries();
        fetchOris();
      }
    })

    return () => subscription.unsubscribe()
  }, [setSession, setUser, fetchEntries]);

  if (isLoading) {
    return <div className="loading-screen">로딩 중...</div>
  }

  return (
    <div className={styles.appLayout}>
      {!user && <AuthModal />}
      <Toast />
      
      <div className={styles.appContainer}>
        <header className="app-header">
          <div className="header-content">
            <button className={styles.sideMenuToggleBtn} onClick={() => setIsSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <div className={styles.titleText}>
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
              <MainMapView 
                onViewChange={setCurrentView}
              />
            )}
          </section>

          <footer className={styles.appFooter}>
            <div className={styles.ticks}></div>
            <div className={styles.footerContent}>
              <p>© {new Date().getFullYear()} Scheduler Diary</p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

export default App
