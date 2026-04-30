// Canonical question IDs — keep these stable; settings/checklist and future
// Supabase persistence will reference these same keys.
export const FIELD = {
  FIRST_NAME: 'firstName',
  LAST_NAME: 'lastName',
  NICKNAME: 'nickname',
  GENDER: 'gender',
  GOALS: 'goals',
  FOCUS_AREAS: 'focusAreas',
  DISCOVERY: 'discovery',
}

// Three wizard steps. Only IDENTITY has required fields.
export const STEPS = [
  {
    id: 'identity',
    label: 'About you',
    fields: [FIELD.FIRST_NAME, FIELD.LAST_NAME, FIELD.NICKNAME],
    skippable: false,
  },
  {
    id: 'personalization',
    label: 'Your journey',
    fields: [FIELD.GENDER, FIELD.GOALS, FIELD.FOCUS_AREAS],
    skippable: true,
  },
  {
    id: 'discovery',
    label: 'How you found us',
    fields: [FIELD.DISCOVERY],
    skippable: true,
  },
]

export const GENDER_OPTIONS = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'nonbinary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const GOAL_OPTIONS = [
  { value: 'self_reflection', label: 'Self-reflection' },
  { value: 'spiritual_growth', label: 'Spiritual growth' },
  { value: 'decision_clarity', label: 'Decision clarity' },
  { value: 'creativity', label: 'Creativity' },
  { value: 'emotional_processing', label: 'Emotional processing' },
  { value: 'other', label: 'Other' },
]

export const FOCUS_AREA_OPTIONS = [
  { value: 'love', label: 'Love & relationships' },
  { value: 'career', label: 'Career & purpose' },
  { value: 'healing', label: 'Healing & recovery' },
  { value: 'confidence', label: 'Confidence & identity' },
  { value: 'finances', label: 'Finances & stability' },
  { value: 'spirituality', label: 'Spirituality & growth' },
]

export const DISCOVERY_OPTIONS = [
  { value: 'social_media', label: 'Social media' },
  { value: 'friend', label: 'A friend' },
  { value: 'search', label: 'Search engine' },
  { value: 'ai_chatbot', label: 'AI / chatbot' },
  { value: 'creator_influencer', label: 'Creator or influencer' },
  { value: 'other', label: 'Other' },
]

export const REQUIRED_FIELDS = new Set([
  FIELD.FIRST_NAME,
  FIELD.LAST_NAME,
  FIELD.NICKNAME,
])

export function defaultFormState() {
  return {
    [FIELD.FIRST_NAME]: '',
    [FIELD.LAST_NAME]: '',
    [FIELD.NICKNAME]: '',
    [FIELD.GENDER]: '',
    [FIELD.GOALS]: [],
    [FIELD.FOCUS_AREAS]: [],
    [FIELD.DISCOVERY]: '',
  }
}

export function validateIdentityStep(form) {
  const errors = {}

  if (!form[FIELD.FIRST_NAME].trim()) {
    errors[FIELD.FIRST_NAME] = 'First name is required.'
  }

  if (!form[FIELD.LAST_NAME].trim()) {
    errors[FIELD.LAST_NAME] = 'Last name is required.'
  }

  if (!form[FIELD.NICKNAME].trim()) {
    errors[FIELD.NICKNAME] = 'Nickname is required.'
  }

  return errors
}

export function normalizeForm(form) {
  return {
    ...form,
    [FIELD.FIRST_NAME]: form[FIELD.FIRST_NAME].trim(),
    [FIELD.LAST_NAME]: form[FIELD.LAST_NAME].trim(),
    [FIELD.NICKNAME]: form[FIELD.NICKNAME].trim(),
  }
}
