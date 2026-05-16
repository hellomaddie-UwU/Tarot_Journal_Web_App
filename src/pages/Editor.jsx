import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import writingPrompts from '../data/writingPrompts'
import { useAuthSession } from '../hooks/useAuthSession'
import { isRichTextEmpty, useJournalStorage } from '../hooks/useJournalStorage'

function randomPrompt() {
  if (writingPrompts.length === 0) return ''
  const randomIndex = Math.floor(Math.random() * writingPrompts.length)
  return writingPrompts[randomIndex]
}

function formatSavedTime(isoString) {
  if (!isoString) return ''
  try {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return ''
  }
}

function Editor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isLoading } = useAuthSession()
  const entryId = searchParams.get('entryId')
  const {
    draft,
    updateDraft,
    saveEntry,
    isSaving,
    lastSavedAt,
    storageError,
  } = useJournalStorage(user?.id, entryId)

  const [formError, setFormError] = useState('')
  const [imageError, setImageError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const quillModules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['blockquote', 'link'],
        [{ color: [] }, { align: [] }],
        ['clean'],
      ],
    }),
    [],
  )

  const quillFormats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'list',
      'bullet',
      'blockquote',
      'link',
      'color',
      'align',
    ],
    [],
  )

  if (isLoading) {
    return null
  }

  if (!user) {
    return (
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="alert-ds alert-warning">
              <div>
                <div className="alert-ds-title">Sign in required</div>
                <p className="mb-0">You need to sign in before creating a journal entry.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const autosaveLabel = storageError
    ? storageError
    : isSaving
      ? 'Saving draft...'
      : lastSavedAt
        ? `Saved at ${formatSavedTime(lastSavedAt)}`
        : 'Draft not saved yet.'

  const handleFieldChange = (field, value) => {
    updateDraft({ [field]: value })
  }

  const handlePromptInsert = () => {
    handleFieldChange('promptText', randomPrompt())
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setImageError('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      handleFieldChange('featuredImageDataUrl', result)
      setImageError('')
      event.target.value = ''
    }
    reader.onerror = () => {
      setImageError('Image upload failed. Please try another image.')
      event.target.value = ''
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (event) => {
    event.preventDefault()
    setFormError('')
    setSuccessMessage('')

    if (isRichTextEmpty(draft.bodyHtml)) {
      setFormError('Journal content is required before saving.')
      return
    }

    const result = saveEntry()
    if (!result.ok) {
      setFormError(result.message)
      return
    }

    setSuccessMessage(entryId ? 'Entry updated. Redirecting to catalogue...' : 'Entry saved. Redirecting to catalogue...')
    setTimeout(() => {
      navigate('/')
    }, 750)
  }

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-9">
          <div className="card-ds">
            <div className="card-ds-body">
              <div className="d-flex flex-column gap-4">
                <header className="d-flex flex-column gap-3">
                  <div>
                    <button type="button" className="btn btn-secondary-ds btn-sm-ds" onClick={handleBack}>
                      Back
                    </button>
                  </div>
                  <p className="text-overline mb-0">Journal Editor</p>
                  <h1 className="h3 mb-0">{entryId ? 'Edit entry' : 'Create a new entry'}</h1>
                  <p className="text-caption mb-0">
                    {entryId
                      ? 'Update your reflection. Changes stay local in this browser.'
                      : 'Write with intention. Your draft autosaves locally as you type.'}
                  </p>
                </header>

                {formError ? (
                  <div className="alert-ds alert-error" role="alert">
                    <div>
                      <div className="alert-ds-title">Cannot save yet</div>
                      <p className="mb-0">{formError}</p>
                    </div>
                  </div>
                ) : null}

                {successMessage ? (
                  <div className="alert-ds alert-success" role="status">
                    <div>
                      <div className="alert-ds-title">Saved</div>
                      <p className="mb-0">{successMessage}</p>
                    </div>
                  </div>
                ) : null}

                <form className="d-flex flex-column gap-4" onSubmit={handleSave}>
                  <section className="d-flex flex-column gap-3">
                    <div>
                      <label htmlFor="entryTitle" className="form-label-ds">Title</label>
                      <input
                        id="entryTitle"
                        className="input-ds"
                        type="text"
                        placeholder="Optional title"
                        value={draft.title}
                        onChange={(event) => handleFieldChange('title', event.target.value)}
                      />
                    </div>

                    <div>
                      <label htmlFor="entryPrompt" className="form-label-ds">Writing prompt</label>
                      <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                        <button
                          type="button"
                          className="btn btn-secondary-ds btn-sm-ds"
                          onClick={handlePromptInsert}
                        >
                          Random prompt
                        </button>
                      </div>
                      <input
                        id="entryPrompt"
                        className="input-ds"
                        type="text"
                        placeholder="Optional prompt"
                        value={draft.promptText}
                        onChange={(event) => handleFieldChange('promptText', event.target.value)}
                      />
                    </div>
                  </section>

                  <section className="d-flex flex-column gap-2">
                    <label className="form-label-ds" htmlFor="journalBody">Journal content</label>
                    <div className={`rte-ds${formError && isRichTextEmpty(draft.bodyHtml) ? ' error' : ''}`} id="journalBody">
                      <ReactQuill
                        theme="snow"
                        value={draft.bodyHtml}
                        onChange={(value) => handleFieldChange('bodyHtml', value)}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Begin your reflection..."
                      />
                    </div>
                    <span className="form-hint">Rich text is enabled. This field is required.</span>
                  </section>

                  <section className="d-flex flex-column gap-2">
                    <label htmlFor="featuredImage" className="form-label-ds">Featured image</label>
                    <input
                      id="featuredImage"
                      className="input-ds"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    {imageError ? <span className="form-error-msg">{imageError}</span> : null}

                    {draft.featuredImageDataUrl ? (
                      <div className="journal-image-panel">
                        <img
                          src={draft.featuredImageDataUrl}
                          alt="Featured preview"
                          className="journal-image-preview"
                        />
                        <div className="d-flex gap-2 mt-2">
                          <button
                            type="button"
                            className="btn btn-ghost-ds btn-sm-ds"
                            onClick={() => handleFieldChange('featuredImageDataUrl', '')}
                          >
                            Remove image
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </section>

                  <footer className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-2">
                    <span className="text-caption">{autosaveLabel}</span>
                    <div className="d-flex flex-wrap gap-2">
                      <button type="submit" className="btn btn-primary-ds">
                        {entryId ? 'Update entry' : 'Save entry'}
                      </button>
                    </div>
                  </footer>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Editor