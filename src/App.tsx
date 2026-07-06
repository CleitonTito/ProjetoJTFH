import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { PublicationDetailPage } from '@/pages/PublicationDetailPage'
import { CategoriesPage } from '@/pages/admin/CategoriesPage'
import { PublicationsPage } from '@/pages/admin/PublicationsPage'
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
          <Route path="/" element={<HomePage />} />
          <Route path="/publicacoes/:id" element={<PublicationDetailPage />} />
          <Route
            path="/admin/categorias"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/publicacoes"
            element={
              <ProtectedRoute allowedRoles={['admin', 'editor']}>
                <PublicationsPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
