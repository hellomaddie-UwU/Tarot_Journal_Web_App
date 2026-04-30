import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession'
import { signOut, signUpWithEmail } from '../lib/supabaseClient'

const initialCredentials = {
  email: '',
  password: '',
}

function SignUp() {
  const { errorMessage, isConfigured, isLoading, session, user } = useAuthSession()
  const navigate = useNavigate()
  const [credentials, setCredentials] = useState(initialCredentials)
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = ({ target: { name, value } }) => {
    setCredentials((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const runAuthAction = async (action, successMessage) => {
    setIsSubmitting(true)
    setFeedback('')

    try {
      const { error } = await action()

      if (error) {
        throw error
      }

      setFeedback(successMessage)
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEmailSignUp = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback('')

    try {
      const { error } = await signUpWithEmail(credentials)

      if (error) {
        throw error
      }

      navigate('/verify-otp', { state: { email: credentials.email } })
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignOut = () => {
    runAuthAction(() => signOut(), 'Signed out.')
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column gap-3">
                <header>
                  <p className="text-uppercase text-muted fw-semibold mb-2">
                    Auth Checkpoint
                  </p>
                  <h1 className="h3 mb-2">Create account with email and password</h1>
                  <p className="text-muted mb-0">
                    Use this page to create an account with Supabase email auth.
                  </p>
                </header>

                {!isConfigured ? (
                  <div className="alert alert-warning mb-0" role="alert">
                    Supabase environment variables are missing. Add VITE_SUPABASE_URL and
                    VITE_SUPABASE_ANON_KEY to your local .env file before testing auth.
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="alert alert-danger mb-0" role="alert">
                    {errorMessage}
                  </div>
                ) : null}

                {feedback ? (
                  <div className="alert alert-info mb-0" role="status">
                    {feedback}
                  </div>
                ) : null}

                <section className="border rounded-3 p-3 bg-light-subtle">
                  <h2 className="h5 mb-3">Current session</h2>
                  {isLoading ? (
                    <p className="mb-0 text-muted">Loading session...</p>
                  ) : session ? (
                    <div className="d-flex flex-column gap-2">
                      <p className="mb-0">
                        <strong>User ID:</strong> {user?.id}
                      </p>
                      <p className="mb-0">
                        <strong>Email:</strong> {user?.email ?? 'No email returned'}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-secondary align-self-start"
                        disabled={isSubmitting}
                        onClick={handleSignOut}
                      >
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <p className="mb-0 text-muted">No active Supabase session.</p>
                  )}
                </section>

                <section className="border rounded-3 p-3">
                  <h2 className="h5 mb-2">Sign up form</h2>
                  <form className="d-flex flex-column gap-3" onSubmit={handleEmailSignUp}>
                    <div>
                      <label className="form-label" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        className="form-control"
                        value={credentials.email}
                        onChange={updateField}
                        required
                      />
                    </div>

                    <div>
                      <label className="form-label" htmlFor="password">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        className="form-control"
                        value={credentials.password}
                        onChange={updateField}
                        required
                      />
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!isConfigured || isSubmitting}
                      >
                        Create account
                      </button>
                      <Link to="/sign-in" className="btn btn-outline-primary">
                        Back to sign in
                      </Link>
                    </div>
                  </form>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default SignUp
