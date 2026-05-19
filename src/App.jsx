import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './hooks/useAuth'
import { LangProvider } from './hooks/useLang'
import Navbar from './components/common/Navbar'
import SGPage from './pages/SGPage'
import AdminPage from './components/admin/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LangProvider>
          <div className="min-h-screen bg-ink-50 font-body">
            <Navbar />
            <Routes>
              <Route path="/" element={<Navigate to="/sg" replace />} />
              <Route path="/sg" element={<SGPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </LangProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
