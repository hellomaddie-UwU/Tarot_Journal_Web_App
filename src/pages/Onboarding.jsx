import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboardingStorage } from '../hooks/useJournalStorage'
import { useAuthSession } from '../hooks/useAuthSession'
import {
  FIELD,
  FOCUS_AREA_OPTIONS,
  GENDER_OPTIONS,
  GOAL_OPTIONS,
  DISCOVERY_OPTIONS,
  STEPS,
  validateIdentityStep,
} from '../data/onboardingSchema'

// ─── Reusable sub-components ────────────────────────────────────────────────

function TextField({ id, label, value, onChange, error, autoComplete }) {
  return (
    <div>
      <label htmlFor={id} className="form-label-ds">
        {label}
      </label>
      <input
        id={id}
        type="text"
        autoComplete={autoComplete}
        className={`input-ds${error ? ' input-error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error ? <span className="form-error-msg">{error}</span> : null}
    </div>
  )
}

function SingleSelect({ id, label, value, options, onChange, hint }) {
  return (
    <div>
      <label htmlFor={id} className="form-label-ds">
        {label}
      </label>
      {hint ? <span className="form-hint">{hint}</span> : null}
      <select
        id={id}
        className="input-ds"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function MultiSelect({ legend, options, selected, onChange, hint }) {
  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value]
    onChange(next)
  }

  return (
    <fieldset>
      <legend className="form-label-ds">{legend}</legend>
      {hint ? <span className="form-hint">{hint}</span> : null}
      <div className="d-flex flex-wrap gap-2 mt-2">
        {options.map((opt) => {
          const checked = selected.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              className={`btn btn-sm-ds ${checked ? 'btn-accent-ds' : 'btn-secondary-ds'}`}
              onClick={() => toggle(opt.value)}
              aria-pressed={checked}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

// ─── Step screens ────────────────────────────────────────────────────────────

function IdentityStep({ form, errors, onChange }) {
  return (
    <div className="d-flex flex-column gap-3">
      <div className="row g-3">
        <div className="col-12 col-sm-6">
          <TextField
            id="firstName"
            label="First name"
            autoComplete="given-name"
            value={form[FIELD.FIRST_NAME]}
            error={errors[FIELD.FIRST_NAME]}
            onChange={(v) => onChange(FIELD.FIRST_NAME, v)}
          />
        </div>
        <div className="col-12 col-sm-6">
          <TextField
            id="lastName"
            label="Last name"
            autoComplete="family-name"
            value={form[FIELD.LAST_NAME]}
            error={errors[FIELD.LAST_NAME]}
            onChange={(v) => onChange(FIELD.LAST_NAME, v)}
          />
        </div>
      </div>
      <TextField
        id="nickname"
        label="Nickname"
        autoComplete="nickname"
        value={form[FIELD.NICKNAME]}
        error={errors[FIELD.NICKNAME]}
        onChange={(v) => onChange(FIELD.NICKNAME, v)}
      />
      <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
        Your nickname is what we'll use to greet you throughout the app.
      </p>
    </div>
  )
}

function PersonalizationStep({ form, onChange }) {
  return (
    <div className="d-flex flex-column gap-4">
      <SingleSelect
        id="gender"
        label="Gender"
        value={form[FIELD.GENDER]}
        options={GENDER_OPTIONS}
        onChange={(v) => onChange(FIELD.GENDER, v)}
        hint="Optional."
      />
      <MultiSelect
        legend="What are you hoping to get from this app?"
        options={GOAL_OPTIONS}
        selected={form[FIELD.GOALS]}
        onChange={(v) => onChange(FIELD.GOALS, v)}
        hint="Optional — select all that apply. You can adjust this later in settings."
      />
      <MultiSelect
        legend="Do you have any focus areas right now?"
        options={FOCUS_AREA_OPTIONS}
        selected={form[FIELD.FOCUS_AREAS]}
        onChange={(v) => onChange(FIELD.FOCUS_AREAS, v)}
        hint="Optional — select all that apply. You can adjust this later in settings."
      />
    </div>
  )
}

function DiscoveryStep({ form, onChange }) {
  return (
    <div className="d-flex flex-column gap-3">
      <SingleSelect
        id="discovery"
        label="How did you hear about us?"
        value={form[FIELD.DISCOVERY]}
        options={DISCOVERY_OPTIONS}
        onChange={(v) => onChange(FIELD.DISCOVERY, v)}
        hint="Optional — this helps us understand how people find the app."
      />
    </div>
  )
}

// ─── Wizard container ────────────────────────────────────────────────────────

const STEP_COUNT = STEPS.length

function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuthSession()
  const { draft, saveDraft, complete, markComplete } = useOnboardingStorage(user?.id)

  const [stepIndex, setStepIndex] = useState(0)
  const [form, setForm] = useState(draft)
  const [errors, setErrors] = useState({})

  // Already completed — redirect to catalogue after render
  useEffect(() => {
    if (complete) {
      navigate('/', { replace: true })
    }
  }, [complete, navigate])

  if (complete) return null

  const currentStep = STEPS[stepIndex]
  const isLastStep = stepIndex === STEP_COUNT - 1

  const updateField = (field, value) => {
    const next = { ...form, [field]: value }
    setForm(next)
    saveDraft(next)
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev }
        delete copy[field]
        return copy
      })
    }
  }

  const handleNext = () => {
    if (stepIndex === 0) {
      const validationErrors = validateIdentityStep(form)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }
    setErrors({})
    setStepIndex((i) => i + 1)
  }

  const handleBack = () => {
    setErrors({})
    setStepIndex((i) => i - 1)
  }

  const handleSkip = () => {
    setErrors({})
    if (isLastStep) {
      markComplete(form)
      navigate('/')
    } else {
      setStepIndex((i) => i + 1)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (stepIndex === 0) {
      const validationErrors = validateIdentityStep(form)
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors)
        return
      }
    }
    if (isLastStep) {
      markComplete(form)
      navigate('/')
    } else {
      handleNext()
    }
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card-ds">
            <div className="card-ds-body">
              <div className="d-flex flex-column gap-4">

                {/* Header */}
                <header>
                  <p className="text-overline mb-2">Account setup</p>
                  <h1 className="h3 mb-1">{currentStep.label}</h1>
                  {stepIndex === 0 ? (
                    <p className="text-caption mb-0">
                      Let's set up your profile. Only the fields on this step are required.
                    </p>
                  ) : (
                    <p className="text-caption mb-0">
                      All questions on this step are optional. Feel free to skip.
                    </p>
                  )}
                </header>

                {/* Step indicator */}
                <nav aria-label="Onboarding progress">
                  <div className="steps-ds">
                    {STEPS.map((step, i) => {
                      const isComplete = i < stepIndex
                      const isActive = i === stepIndex
                      return (
                        <div
                          key={step.id}
                          className={`step-ds${isComplete ? ' complete' : ''}${isActive ? ' active' : ''}`}
                        >
                          <div className="step-node">
                            {isComplete ? '✓' : i + 1}
                          </div>
                          <span className="step-label">{step.label}</span>
                        </div>
                      )
                    })}
                  </div>
                </nav>

                {/* Progress bar */}
                <div className="progress-ds-wrap">
                  <div className="progress-ds-track track-thin" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={STEP_COUNT}>
                    <div
                      className="progress-ds-bar"
                      style={{ width: `${((stepIndex + 1) / STEP_COUNT) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Step content */}
                <form onSubmit={handleSubmit} noValidate>
                  <div className="d-flex flex-column gap-4">
                    <section>
                      {stepIndex === 0 && (
                        <IdentityStep form={form} errors={errors} onChange={updateField} />
                      )}
                      {stepIndex === 1 && (
                        <PersonalizationStep form={form} onChange={updateField} />
                      )}
                      {stepIndex === 2 && (
                        <DiscoveryStep form={form} onChange={updateField} />
                      )}
                    </section>

                    {/* Navigation */}
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                      {stepIndex > 0 && (
                        <button
                          type="button"
                          className="btn btn-secondary-ds"
                          onClick={handleBack}
                        >
                          Back
                        </button>
                      )}

                      {isLastStep ? (
                        <button type="submit" className="btn btn-primary-ds">
                          Finish setup
                        </button>
                      ) : (
                        <button type="submit" className="btn btn-primary-ds">
                          Next
                        </button>
                      )}

                      {currentStep.skippable && (
                        <button
                          type="button"
                          className="btn btn-ghost-ds"
                          onClick={handleSkip}
                        >
                          {isLastStep ? 'Skip and finish' : 'Skip this step'}
                        </button>
                      )}
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Onboarding
