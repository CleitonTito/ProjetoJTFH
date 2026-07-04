import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppLayout } from '@/layouts/AppLayout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={
              <div className="flex flex-1 items-center justify-center p-8">
                <h1 className="text-2xl font-semibold">Mural de Informações</h1>
              </div>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
