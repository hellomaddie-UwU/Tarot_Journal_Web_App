import { Link } from 'react-router-dom'

function Onboarding() {
  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4 p-md-5">
              <div className="d-flex flex-column gap-3">
                <header>
                  <p className="text-uppercase text-muted fw-semibold mb-2">
                    Welcome
                  </p>
                  <h1 className="h3 mb-2">You're all set!</h1>
                  <p className="text-muted mb-0">
                    Your email has been verified. This is where onboarding will
                    take you through setting up your tarot journal.
                  </p>
                </header>

                <div className="alert alert-info mb-0" role="note">
                  <strong>Coming soon:</strong> The onboarding form will be built
                  as part of a future issue. For now, head to the journal to get
                  started.
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <Link to="/editor" className="btn btn-primary">
                    Go to journal
                  </Link>
                  <Link to="/profile" className="btn btn-outline-secondary">
                    View profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Onboarding
