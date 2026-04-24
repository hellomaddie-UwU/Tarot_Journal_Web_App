import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Catalogue from './pages/Catalogue'
import Editor from './pages/Editor'
import Profile from './pages/Profile'
import DesignSystem from './pages/DesignSystem'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
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
        </Routes>
      </BrowserRouter>
    </AuthSessionProvider>
  )
}

export default App