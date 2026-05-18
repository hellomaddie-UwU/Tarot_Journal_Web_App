import { useCallback, useEffect, useState } from 'react'
import { defaultFormState, normalizeForm } from '../data/onboardingSchema'
import { stripHtml } from '../utils/stringUtils'

function draftKey(userId) {
  return `tarot_onboarding_draft_${userId}`
}

function completeKey(userId) {
  return `tarot_onboarding_complete_${userId}`
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    // Storage unavailable — fail silently; form state is still in memory
    return false
  }
}

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

/**
 * Manages local-only persistence for the onboarding wizard, scoped to userId
 * so each account has its own completion state in this browser.
 *
 * Pass userId from useAuthSession's user.id. When userId is null/undefined
 * (unauthenticated), complete is always false and nothing is persisted.
 *
 * Returns:
 *   draft        — current form state (hydrated from localStorage on mount)
 *   saveDraft    — write updated form state to localStorage
 *   complete     — whether this user has already completed onboarding
 *   markComplete — persist completion with normalized answers and clear draft
 *   clearAll     — wipe both draft and completion (for dev / testing use)
 */
export function useOnboardingStorage(userId) {
  // Store everything in one record keyed by userId so we can swap atomically
  // when userId changes without needing setState inside an effect.
  function readForUser(uid) {
    if (!uid) return { draft: defaultFormState(), complete: false }
    return {
      draft: readJson(draftKey(uid)) ?? defaultFormState(),
      complete: Boolean(readJson(completeKey(uid))),
    }
  }

  // Store uid alongside the data so we can detect when the caller's userId
  // changes and reload from storage in the same render pass (React-documented
  // pattern for resetting state when a prop changes — avoids setState in effect).
  const [state, setState] = useState(() => ({ uid: userId, ...readForUser(userId) }))

  if (state.uid !== userId) {
    setState({ uid: userId, ...readForUser(userId) })
  }

  // Persist draft to localStorage after every change (skip when complete)
  useEffect(() => {
    if (!userId || state.complete) return
    writeJson(draftKey(userId), state.draft)
  }, [userId, state.draft, state.complete])

  const saveDraft = useCallback((updatedForm) => {
    setState((prev) => ({ ...prev, draft: updatedForm }))
  }, [])

  const markComplete = useCallback((form) => {
    if (!userId) return
    const normalized = normalizeForm(form)
    writeJson(completeKey(userId), { completedAt: new Date().toISOString(), profile: normalized })
    localStorage.removeItem(draftKey(userId))
    setState({ draft: normalized, complete: true })
  }, [userId])

  const clearAll = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(draftKey(userId))
    localStorage.removeItem(completeKey(userId))
    setState({ draft: defaultFormState(), complete: false })
  }, [userId])

  return { draft: state.draft, saveDraft, complete: state.complete, markComplete, clearAll }
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
