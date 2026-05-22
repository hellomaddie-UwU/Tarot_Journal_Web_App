import { useCallback, useState } from 'react'
import { readJson, writeJson } from '../lib/storageUtils'
import { stripHtml } from '../utils/stringUtils'

function journalDraftKey(userId) {
  return `tarot_journal_draft_${userId}`
}

function journalEntriesKey(userId) {
  return `tarot_journal_entries_${userId}`
}

export function readJournalEntries(userId) {
  if (!userId) return []

  const entries = readJson(journalEntriesKey(userId))
  return Array.isArray(entries) ? entries : []
}

export function readJournalEntry(userId, entryId) {
  if (!userId || !entryId) return null
  return readJournalEntries(userId).find((entry) => entry?.id === entryId) ?? null
}

export function deleteJournalEntry(userId, entryId) {
  if (!userId || !entryId) {
    return { ok: false, message: 'Entry could not be deleted.' }
  }

  const nextEntries = readJournalEntries(userId).filter((entry) => entry?.id !== entryId)
  const persisted = writeJson(journalEntriesKey(userId), nextEntries)

  if (!persisted) {
    return { ok: false, message: 'Delete failed in this browser session. Please try again.' }
  }

  return { ok: true, entries: nextEntries }
}

function createEntryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `entry_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

function emptyJournalDraft(userId) {
  const now = new Date().toISOString()
  return {
    id: createEntryId(),
    userId: userId ?? null,
    title: '',
    promptText: '',
    bodyHtml: '',
    featuredImageDataUrl: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function isRichTextEmpty(html) {
  return stripHtml(html).length === 0
}

export function useJournalStorage(userId, entryId = null) {
  function readDraftForUser(uid, entryId) {
    if (!uid) return emptyJournalDraft(uid)
    if (entryId) {
      return readJournalEntry(uid, entryId) ?? emptyJournalDraft(uid)
    }

    return emptyJournalDraft(uid)
  }

  const targetKey = `${userId ?? 'anon'}:${entryId ?? 'draft'}`

  const [state, setState] = useState(() => ({
    key: targetKey,
    uid: userId,
    draft: readDraftForUser(userId, entryId),
    isSaving: false,
    lastSavedAt: null,
    storageError: '',
  }))

  if (state.key !== targetKey) {
    setState({
      key: targetKey,
      uid: userId,
      draft: readDraftForUser(userId, entryId),
      isSaving: false,
      lastSavedAt: null,
      storageError: '',
    })
  }

  const updateDraft = useCallback((updates) => {
    setState((prev) => {
      const nextDraft = typeof updates === 'function'
        ? updates(prev.draft)
        : { ...prev.draft, ...updates }

      const nextTimestamp = new Date().toISOString()
      const nextStateDraft = {
        ...nextDraft,
        userId: prev.uid ?? null,
        updatedAt: nextTimestamp,
      }

      const persisted = prev.uid
        ? writeJson(journalDraftKey(prev.uid), nextStateDraft)
        : false

      return {
        ...prev,
        isSaving: false,
        draft: nextStateDraft,
        lastSavedAt: persisted ? nextTimestamp : prev.lastSavedAt,
        storageError: prev.uid && !persisted
          ? 'Autosave failed in this browser session. Keep this tab open until saved.'
          : '',
      }
    })
  }, [])

  const resetDraft = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(journalDraftKey(userId))
    setState((prev) => ({
      ...prev,
      draft: emptyJournalDraft(userId),
      isSaving: false,
      lastSavedAt: new Date().toISOString(),
      storageError: '',
    }))
  }, [userId])

  const saveEntry = useCallback(() => {
    if (!userId) {
      return { ok: false, message: 'You must be signed in to save entries.' }
    }

    if (isRichTextEmpty(state.draft.bodyHtml)) {
      return { ok: false, message: 'Journal content is required before saving.' }
    }

    const entries = readJournalEntries(userId)
    const now = new Date().toISOString()
    const completedEntry = {
      ...state.draft,
      updatedAt: now,
      savedAt: now,
    }

    const existingIndex = entries.findIndex((entry) => entry?.id === completedEntry.id)
    const nextEntries = existingIndex >= 0
      ? entries.map((entry, index) => (index === existingIndex ? completedEntry : entry))
      : [completedEntry, ...entries]

    const persistedEntries = writeJson(journalEntriesKey(userId), nextEntries)

    if (!persistedEntries) {
      setState((prev) => ({
        ...prev,
        storageError: 'Save failed in this browser session. Please try again.',
      }))
      return { ok: false, message: 'Save failed in this browser session. Please try again.' }
    }

    localStorage.removeItem(journalDraftKey(userId))
    setState((prev) => ({
      ...prev,
      draft: emptyJournalDraft(userId),
      isSaving: false,
      lastSavedAt: now,
      storageError: '',
    }))

    return { ok: true }
  }, [state.draft, userId])

  return {
    draft: state.draft,
    updateDraft,
    resetDraft,
    saveEntry,
    isSaving: state.isSaving,
    lastSavedAt: state.lastSavedAt,
    storageError: state.storageError,
  }
}
