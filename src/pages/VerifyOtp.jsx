import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession'
import { resendConfirmationEmail, verifyEmailOtp } from '../lib/supabaseClient'

const OTP_MIN_LENGTH = 6
const OTP_MAX_LENGTH = 8

function VerifyOtp() {
  const { isConfigured } = useAuthSession()
  const location = useLocation()
  const navigate = useNavigate()

  // Email is passed via navigation state from SignUp
  const email = location.state?.email ?? ''

  const [otp, setOtp] = useState('')
  const [feedback, setFeedback] = useState('')
  const [feedbackType, setFeedbackType] = useState('info') // 'info' | 'danger' | 'success'
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const isComplete = otp.length >= OTP_MIN_LENGTH

  const setAlert = (message, type = 'info') => {
    setFeedback(message)
    setFeedbackType(type)
  }

  const verifyOtpToken = async (token) => {
    if (token.length < OTP_MIN_LENGTH) {
      setAlert('Please enter your full verification code (6 to 8 digits).', 'danger')
      return
    }

    setIsSubmitting(true)
    setFeedback('')

    try {
      const { error } = await verifyEmailOtp({ email, token })

      if (error) {
        throw error
      }

      setAlert('Email verified! Taking you to your account setup…', 'success')

      // Short pause so the user can read the success message
      setTimeout(() => {
        navigate('/onboarding')
      }, 1000)
    } catch (error) {
      setAlert(error.message ?? 'Verification failed. Please try again.', 'danger')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpChange = ({ target: { value } }) => {
    const cleaned = value.replace(/\D/g, '').slice(0, OTP_MAX_LENGTH)
    setOtp(cleaned)

    if (
      cleaned.length === OTP_MAX_LENGTH &&
      isConfigured &&
      email &&
      !isSubmitting
    ) {
      void verifyOtpToken(cleaned)
    }
  }

  const handleVerify = async (event) => {
    event.preventDefault()
    await verifyOtpToken(otp)
  }

  const handleResend = async () => {
    if (!email) return

    setIsResending(true)
    setFeedback('')

    try {
      const { error } = await resendConfirmationEmail({ email })

      if (error) {
        throw error
      }

      setAlert('A new code has been sent to your inbox.', 'info')
    } catch (error) {
      setAlert(error.message ?? 'Could not resend the code. Please try again.', 'danger')
    } finally {
      setIsResending(false)
    }
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
                    Email verification
                  </p>
                  <h1 className="h3 mb-2">Check your inbox</h1>
                  {email ? (
                    <p className="text-muted mb-0">
                      We sent a verification code to <strong>{email}</strong>. Enter it
                      below to confirm your account.
                    </p>
                  ) : (
                    <p className="text-muted mb-0">
                      Enter the verification code we sent to your email address.
                    </p>
                  )}
                </header>

                {!isConfigured ? (
                  <div className="alert alert-warning mb-0" role="alert">
                    Supabase environment variables are missing. Add VITE_SUPABASE_URL and
                    VITE_SUPABASE_ANON_KEY to your local .env file before testing auth.
                  </div>
                ) : null}

                {!email ? (
                  <div className="alert alert-warning mb-0" role="alert">
                    No email address found.{' '}
                    <Link to="/sign-up" className="alert-link">
                      Go back to sign up
                    </Link>{' '}
                    and try again.
                  </div>
                ) : null}

                {feedback ? (
                  <div className={`alert alert-${feedbackType} mb-0`} role="status">
                    {feedback}
                  </div>
                ) : null}

                <section>
                  <form onSubmit={handleVerify}>
                    <div className="d-flex flex-column gap-3">
                      <fieldset>
                        <legend className="form-label">Verification code</legend>
                        <input
                          id="otp-code"
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={OTP_MAX_LENGTH}
                          className="form-control fw-semibold"
                          style={{ maxWidth: '16rem', fontSize: '1.25rem' }}
                          value={otp}
                          onChange={handleOtpChange}
                          disabled={isSubmitting || !email}
                          aria-describedby="otp-help"
                        />
                        <p id="otp-help" className="text-muted mb-0 mt-2" style={{ fontSize: '0.875rem' }}>
                          Enter the {OTP_MIN_LENGTH} to {OTP_MAX_LENGTH} digit code from your email.
                        </p>
                        <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.875rem' }}>
                          The form auto-verifies when {OTP_MAX_LENGTH} digits are entered.
                        </p>
                      </fieldset>

                      <div className="d-flex flex-wrap gap-2 align-items-center">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={!isConfigured || !email || !isComplete || isSubmitting}
                        >
                          {isSubmitting ? 'Verifying…' : 'Verify email'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          disabled={!isConfigured || !email || isResending || isSubmitting}
                          onClick={handleResend}
                        >
                          {isResending ? 'Sending…' : 'Resend code'}
                        </button>
                      </div>

                      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                        Wrong email?{' '}
                        <Link to="/sign-up">Go back to sign up</Link>.
                      </p>
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

export default VerifyOtp
