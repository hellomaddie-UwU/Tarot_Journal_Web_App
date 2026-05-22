import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import Catalogue from './pages/Catalogue'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import DesignSystem from './pages/DesignSystem'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import VerifyOtp from './pages/VerifyOtp'
import Onboarding from './pages/Onboarding'
import { AuthSessionProvider } from './hooks/useAuthSession.jsx'
import { useAuthSession } from './hooks/useAuthSession.js'
import { useOnboardingStorage } from './hooks/useOnboardingStorage.js'

// Redirects authenticated users who haven't completed onboarding to /onboarding.
function OnboardingGate({ children }) {
  const { user, isLoading } = useAuthSession()
  const { complete } = useOnboardingStorage(user?.id)

  if (isLoading) return null

  if (user && !complete) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}

function App() {
  return (
    <AuthSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<OnboardingGate><Catalogue /></OnboardingGate>} />
          <Route path="/editor" element={<OnboardingGate><Editor /></OnboardingGate>} />
          <Route path="/profile" element={<OnboardingGate><Profile /></OnboardingGate>} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify-otp" element={<VerifyOtp />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </BrowserRouter>
    </AuthSessionProvider>
  )
}

export default App