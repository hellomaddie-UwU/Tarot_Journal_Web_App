import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthSession } from '../hooks/useAuthSession'
import { deleteJournalEntry, readJournalEntries } from '../hooks/useJournalStorage'
import { stripHtml } from '../utils/stringUtils'

function readEntries(userId) {
  if (!userId) return { entries: [], warning: '' }

  try {
    return { entries: readJournalEntries(userId), warning: '' }
  } catch {
    return {
      entries: [],
      warning: 'Saved entries could not be read from this browser storage right now.',
    }
  }
}

function readCatalogueState(userId) {
  return {
    uid: userId,
    ...readEntries(userId),
  }
}

function formatSavedDate(isoString) {
  if (!isoString) return 'Recently saved'

  try {
    return new Date(isoString).toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return 'Recently saved'
  }
}

function titleFromEntry(entry) {
  const cleaned = String(entry?.title ?? '').trim()
  return cleaned || 'Untitled reflection'
}

function previewFromEntry(entry, maxLength = 220) {
  const text = stripHtml(entry?.bodyHtml)
  if (!text) return 'No reflection text saved yet.'
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

function Catalogue() {
  const { user, isLoading } = useAuthSession()
  const [deleteMessage, setDeleteMessage] = useState('')
  const [catalogueState, setCatalogueState] = useState(() => readCatalogueState(user?.id))

  if (catalogueState.uid !== user?.id) {
    setCatalogueState(readCatalogueState(user?.id))
  }

  const entries = useMemo(() => {
    return [...catalogueState.entries].sort((a, b) => {
      const aDate = new Date(a?.savedAt ?? a?.updatedAt ?? a?.createdAt ?? 0).getTime()
      const bDate = new Date(b?.savedAt ?? b?.updatedAt ?? b?.createdAt ?? 0).getTime()
      return bDate - aDate
    })
  }, [catalogueState.entries])

  const warning = catalogueState.warning

  const hasEntries = entries.length > 0

  const handleDelete = (entryId) => {
    setDeleteMessage('')

    if (!window.confirm('Delete this journal entry from local storage?')) {
      return
    }

    const result = deleteJournalEntry(user?.id, entryId)
    if (!result.ok) {
      setDeleteMessage(result.message)
      return
    }

    setDeleteMessage('Entry deleted.')
    setCatalogueState((prev) => ({ ...prev, entries: result.entries }))
  }

  if (isLoading) return null

  if (!user) {
    return (
      <main className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-8">
            <div className="alert-ds alert-warning">
              <div>
                <div className="alert-ds-title">Sign in required</div>
                <p className="mb-0">Please sign in to view your journal catalogue.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-xl-10">
          <div className="d-flex flex-column gap-4">
            <header className="d-flex flex-wrap align-items-end justify-content-between gap-3">
              <div>
                <p className="text-overline mb-2">Journal Catalogue</p>
                <h1 className="h3 mb-1">Saved entries</h1>
                <p className="text-caption mb-0">
                  Your local entries are listed below, newest first.
                </p>
              </div>
              <Link to="/editor" className="btn btn-primary-ds">
                Create new entry
              </Link>
            </header>

            {warning ? (
              <div className="alert-ds alert-warning" role="alert">
                <div>
                  <div className="alert-ds-title">Storage notice</div>
                  <p className="mb-0">{warning}</p>
                </div>
              </div>
            ) : null}

            {deleteMessage ? (
              <div className="alert-ds alert-success" role="status">
                <div>
                  <div className="alert-ds-title">Updated</div>
                  <p className="mb-0">{deleteMessage}</p>
                </div>
              </div>
            ) : null}

            {!hasEntries ? (
              <div className="card-ds">
                <div className="card-ds-body d-flex flex-column gap-3">
                  <h2 className="h5 mb-0">No entries yet</h2>
                  <p className="text-caption mb-0">
                    Start your first reflection and it will appear here after you save.
                  </p>
                  <div>
                    <Link to="/editor" className="btn btn-accent-ds">
                      Write your first entry
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="catalogue-list">
                {entries.map((entry) => {
                  const prompt = String(entry?.promptText ?? '').trim()

                  return (
                    <article key={`${entry?.id ?? 'entry'}_${entry?.savedAt ?? entry?.updatedAt ?? ''}`} className="card-ds catalogue-entry">
                      <div className="card-ds-body">
                        <div className="row g-3 align-items-start">
                          <div className="col-12 col-md-9">
                            <div className="d-flex flex-column gap-2">
                              <div className="d-flex flex-wrap align-items-center gap-2">
                                <h2 className="h5 mb-0">{titleFromEntry(entry)}</h2>
                                <span className="badge-ds badge-default">{formatSavedDate(entry?.savedAt ?? entry?.updatedAt ?? entry?.createdAt)}</span>
                              </div>

                              {prompt ? (
                                <p className="catalogue-prompt mb-0">
                                  Prompt: {prompt}
                                </p>
                              ) : null}

                              <p className="catalogue-preview mb-0">
                                {previewFromEntry(entry)}
                              </p>

                              <div className="d-flex flex-wrap gap-2 pt-2">
                                <Link to={`/editor?entryId=${encodeURIComponent(entry?.id ?? '')}`} className="btn btn-secondary-ds btn-sm-ds">
                                  Edit
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-ghost-ds btn-sm-ds"
                                  onClick={() => handleDelete(entry?.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>

                          {entry?.featuredImageDataUrl ? (
                            <div className="col-12 col-md-3">
                              <img
                                src={entry.featuredImageDataUrl}
                                alt="Entry featured"
                                className="catalogue-thumb"
                              />
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default Catalogue