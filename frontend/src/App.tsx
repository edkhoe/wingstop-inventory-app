import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'

// Auth Components
import { AuthProvider } from './contexts/AuthContext'

// Layout Components
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { 
  PublicRoute, 
  AuthenticatedRoute, 
  AdminRoute, 
  ManagerRoute, 
  InventoryRoute, 
  CountRoute, 
  ReportRoute, 
  SettingsRoute 
} from './components/auth/guards'

// Page Components
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Counts from './pages/Counts'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import ResponsiveDemo from './pages/ResponsiveDemo'
import FormDemo from './pages/FormDemo'
import ApiDemo from './pages/ApiDemo'
import TypesDemo from './pages/TypesDemo'
import AuthDemo from './pages/AuthDemo'
import RouteGuardDemo from './pages/RouteGuardDemo'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (replaces cacheTime in v5)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
              
              {/* Protected Routes */}
              <Route path="/" element={
                <AuthenticatedRoute>
                  <Layout />
                </AuthenticatedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="inventory" element={<InventoryRoute><Inventory /></InventoryRoute>} />
                <Route path="counts" element={<CountRoute><Counts /></CountRoute>} />
                <Route path="reports" element={<ReportRoute><Reports /></ReportRoute>} />
                <Route path="settings" element={<SettingsRoute><Settings /></SettingsRoute>} />
                <Route path="responsive-demo" element={<ResponsiveDemo />} />
                <Route path="form-demo" element={<FormDemo />} />
                <Route path="api-demo" element={<ApiDemo />} />
                <Route path="types-demo" element={<TypesDemo />} />
                <Route path="auth-demo" element={<AuthDemo />} />
                <Route path="route-guard-demo" element={<RouteGuardDemo />} />
              </Route>
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      
      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App 