import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import ReactQuill, { Quill } from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import QuillResize from 'quill-resize-module'
import 'quill-resize-module/dist/resize.css'
import writingPrompts from '../data/writingPrompts'
import { useAuthSession } from '../hooks/useAuthSession'
import { isRichTextEmpty, useJournalStorage } from '../hooks/useJournalStorage'

const MAX_INLINE_IMAGE_BYTES = 750_000
const MAX_FEATURED_IMAGE_BYTES = 1_500_000

Quill.register('modules/resize', QuillResize)

function imageLimitText(maxBytes) {
  const mb = maxBytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

function isImageWithinSize(file, maxBytes) {
  if (!file) return false
  return file.size <= maxBytes
}

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

function isImageFile(file) {
  return Boolean(file?.type && file.type.startsWith('image/'))
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      resolve(result)
    }
    reader.onerror = () => reject(new Error('Image upload failed. Please try another image.'))
    reader.readAsDataURL(file)
  })
}

function cleanImageFileName(file) {
  return String(file?.name ?? '').trim() || 'Uploaded image'
}

function Editor() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quillRef = useRef(null)
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
  const [featuredImageError, setFeaturedImageError] = useState('')
  const [inlineImageError, setInlineImageError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const insertInlineImage = useCallback(async (file) => {
    if (!isImageFile(file)) {
      setInlineImageError('Please upload a valid image file.')
      return
    }

    if (!isImageWithinSize(file, MAX_INLINE_IMAGE_BYTES)) {
      setInlineImageError(`Inline images must be ${imageLimitText(MAX_INLINE_IMAGE_BYTES)} or smaller.`)
      return
    }

    try {
      const dataUrl = await readFileAsDataUrl(file)

      if (!dataUrl) {
        setInlineImageError('Image upload failed. Please try another image.')
        return
      }

      const quillEditor = quillRef.current?.getEditor()
      if (!quillEditor) {
        setInlineImageError('Editor is not ready yet. Please try again.')
        return
      }

      const range = quillEditor.getSelection(true)
      const insertIndex = range?.index ?? quillEditor.getLength()
      const imageFileName = cleanImageFileName(file)

      quillEditor.insertEmbed(insertIndex, 'image', dataUrl, 'user')
      const [leaf] = quillEditor.getLeaf(insertIndex)
      if (leaf?.domNode instanceof HTMLImageElement) {
        leaf.domNode.setAttribute('alt', imageFileName)
      }
      quillEditor.setSelection(insertIndex + 1, 0, 'silent')
      setInlineImageError('')
    } catch {
      setInlineImageError('Image upload failed. Please try another image.')
    }
  }, [])

  const handleInlineImageUpload = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.addEventListener('change', () => {
      const file = input.files?.[0]
      if (!file) return
      void insertInlineImage(file)
    })
  }, [insertInlineImage])

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'link', 'image'],
          [{ color: [] }, { align: [] }],
          ['clean'],
        ],
        handlers: {
          image: handleInlineImageUpload,
        },
      },
      resize: {
        modules: ['Resize', 'DisplaySize'],
        parchment: {
          image: {
            attribute: ['width'],
            limit: {
              minWidth: 80,
              maxWidth: 1200,
            },
          },
        },
      },
    }),
    [handleInlineImageUpload],
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
      'image',
      'color',
      'align',
      'width',
    ],
    [],
  )

  useEffect(() => {
    const quillEditor = quillRef.current?.getEditor()
    if (!quillEditor) return undefined

    const editorRoot = quillEditor.root

    const handleDragOver = (event) => {
      if (event.dataTransfer?.types?.includes('Files')) {
        event.preventDefault()
      }
    }

    const handleDrop = (event) => {
      const droppedFiles = Array.from(event.dataTransfer?.files ?? [])
      if (droppedFiles.length === 0) return

      const file = droppedFiles.find(isImageFile)
      if (!file) {
        event.preventDefault()
        setInlineImageError('Please upload a valid image file.')
        return
      }

      event.preventDefault()
      quillEditor.focus()
      void insertInlineImage(file)
    }

    const handlePaste = (event) => {
      const items = Array.from(event.clipboardData?.items ?? [])
      const hasFileItem = items.some((item) => item.kind === 'file')
      const imageItem = items.find((item) => item.kind === 'file' && item.type.startsWith('image/'))
      const file = imageItem?.getAsFile()
      if (!file) {
        if (hasFileItem) {
          event.preventDefault()
          setInlineImageError('Please upload a valid image file.')
        }
        return
      }

      event.preventDefault()
      void insertInlineImage(file)
    }

    editorRoot.addEventListener('dragover', handleDragOver)
    editorRoot.addEventListener('drop', handleDrop)
    editorRoot.addEventListener('paste', handlePaste)

    return () => {
      editorRoot.removeEventListener('dragover', handleDragOver)
      editorRoot.removeEventListener('drop', handleDrop)
      editorRoot.removeEventListener('paste', handlePaste)
    }
  }, [insertInlineImage])

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

    if (!isImageFile(file)) {
      setFeaturedImageError('Please upload a valid image file.')
      event.target.value = ''
      return
    }

    if (!isImageWithinSize(file, MAX_FEATURED_IMAGE_BYTES)) {
      setFeaturedImageError(`Featured images must be ${imageLimitText(MAX_FEATURED_IMAGE_BYTES)} or smaller.`)
      event.target.value = ''
      return
    }

    readFileAsDataUrl(file)
      .then((result) => {
        handleFieldChange('featuredImageDataUrl', result)
        setFeaturedImageError('')
        event.target.value = ''
      })
      .catch(() => {
        setFeaturedImageError('Image upload failed. Please try another image.')
        event.target.value = ''
      })
  }

  const clearFeaturedImage = () => {
    handleFieldChange('featuredImageDataUrl', '')
    setFeaturedImageError('')
  }

  const clearInlineImageError = () => {
    setInlineImageError('')
  }

  const handleEditorChange = (value) => {
    if (inlineImageError) {
      clearInlineImageError()
    }
    handleFieldChange('bodyHtml', value)
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
                        ref={quillRef}
                        theme="snow"
                        value={draft.bodyHtml}
                        onChange={handleEditorChange}
                        modules={quillModules}
                        formats={quillFormats}
                        placeholder="Begin your reflection..."
                      />
                    </div>
                    <span className="form-hint">
                      Rich text is enabled. This field is required. Inline images must be {imageLimitText(MAX_INLINE_IMAGE_BYTES)} or smaller.
                    </span>
                    {inlineImageError ? <span className="form-error-msg">{inlineImageError}</span> : null}
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
                    <span className="form-hint">Featured images must be {imageLimitText(MAX_FEATURED_IMAGE_BYTES)} or smaller.</span>
                    {featuredImageError ? <span className="form-error-msg">{featuredImageError}</span> : null}

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
                            onClick={clearFeaturedImage}
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