// src/App.jsx
import { Routes, Route } from 'react-router-dom'
import './styles/globals.css'
// Import our pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CustomerDashboard from './pages/CustomerDashboard'
import CustomerDiscussion from './pages/CustomerDiscussion'
import FollowedVendors from './pages/FollowedVendors'
import VendorMapPage from './pages/VendorMapPage'
import VendorDashboard from './pages/VendorDashboard'
import VendorProfile from './pages/VendorProfile'
import VendorMenu from './pages/VendorMenu'
import VendorMenuPublic from './pages/VendorMenuPublic'
import VendorLocation from './pages/VendorLocation'
import VendorLocationMap from './pages/VendorLocationMap'
import VendorBroadcast from './pages/VendorBroadcast'
import VendorBroadcastMessages from './pages/VendorBroadcastMessages'
import VendorDiscussions from './pages/VendorDiscussions'
import VendorRatings from './pages/VendorRatings'
import UnauthorizedPage from './pages/UnauthorizedPage'
import SearchResultsPage from './pages/SearchResultsPage'
// Import the new VendorDetail page
import VendorDetail from './pages/VendorDetail'  // Add this import
import FollowedVendorsDetail from './pages/FollowedVendorsDetail'
// Import our components
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<h1>About Page</h1>} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/customer/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDashboard />
          </ProtectedRoute>
        } 
      />
      {/* Add the VendorDetail route here */}
      <Route 
        path="/customer/vendor/:vendorId" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <VendorDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/followed/vendor/:vendorId" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <FollowedVendorsDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/search" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <SearchResultsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/map" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <VendorMapPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/discussion" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerDiscussion />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/followed" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <FollowedVendors />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/vendor/:vendorId/menu" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <VendorMenuPublic />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/vendor/:vendorId/location" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <VendorLocationMap />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/customer/vendor/:vendorId/broadcasts" 
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <VendorBroadcastMessages />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/dashboard" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/discussions" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorDiscussions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/profile" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/menu" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorMenu />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/location" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorLocation />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/broadcast" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorBroadcast />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/vendor/ratings/:vendorId" 
        element={
          <ProtectedRoute allowedRoles={['vendor']}>
            <VendorRatings />
          </ProtectedRoute>
        } 
      />
    </Routes>
  )
}

export default App