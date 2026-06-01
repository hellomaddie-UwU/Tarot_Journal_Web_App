import { useCallback, useEffect, useState } from 'react'
import { defaultFormState, normalizeForm } from '../data/onboardingSchema'
import { readJson, writeJson } from '../lib/storageUtils'

function draftKey(userId) {
  return `tarot_onboarding_draft_${userId}`
}

function completeKey(userId) {
  return `tarot_onboarding_complete_${userId}`
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
    setState({ uid: userId, draft: normalized, complete: true })
  }, [userId])

  const clearAll = useCallback(() => {
    if (!userId) return
    localStorage.removeItem(draftKey(userId))
    localStorage.removeItem(completeKey(userId))
    setState({ uid: userId, draft: defaultFormState(), complete: false })
  }, [userId])

  return { draft: state.draft, saveDraft, complete: state.complete, markComplete, clearAll }
}
