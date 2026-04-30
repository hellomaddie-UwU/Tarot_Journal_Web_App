import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Catalogue from './pages/Catalogue'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import DesignSystem from './pages/DesignSystem'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import VerifyOtp from './pages/VerifyOtp'
import Onboarding from './pages/Onboarding'
import { AuthSessionProvider } from './hooks/useAuthSession.jsx'

function App() {
  return (
    <AuthSessionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Catalogue />} />
          <Route path="/editor" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
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