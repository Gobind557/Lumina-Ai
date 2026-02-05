import { useState, useCallback, useMemo } from 'react'
import type { EmailDraft } from '@/shared/types'
import { debounce, apiRequest } from '@/shared/utils'
import { API_ENDPOINTS } from '@/shared/constants'

const DEFAULT_PROSPECT_STORAGE_KEY = 'default_prospect_id'

export function useEmailDraft(initialDraft?: EmailDraft) {
  const [draft, setDraft] = useState<EmailDraft>(
    initialDraft || {
      id: '',
      subject: '',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  )

  const ensureProspectId = useCallback(async () => {
    if (draft.prospectId) return draft.prospectId
    const stored = localStorage.getItem(DEFAULT_PROSPECT_STORAGE_KEY)
    if (stored) {
      return stored
    }

    const response = await apiRequest<{
      id: string
    }>(API_ENDPOINTS.PROSPECTS, {
      method: 'POST',
      body: JSON.stringify({
        email: 'prospect@example.com',
        first_name: 'Prospect',
        last_name: 'User',
        company: 'Example Inc',
      }),
    })

    localStorage.setItem(DEFAULT_PROSPECT_STORAGE_KEY, response.id)
    return response.id
  }, [draft.prospectId])

  const saveDraftImmediate = useCallback(
    async (draftToSave: EmailDraft) => {
      const prospectId = draftToSave.prospectId || (await ensureProspectId())

      const response = await apiRequest<{ id: string; updated_at: string }>(
        API_ENDPOINTS.DRAFTS,
        {
          method: 'POST',
          body: JSON.stringify({
            id: draftToSave.id || undefined,
            prospect_id: prospectId,
            subject: draftToSave.subject,
            body_text: draftToSave.content,
            body_html: draftToSave.content,
          }),
        }
      )

      setDraft((prev) => ({
        ...prev,
        id: response.id,
        prospectId,
        updatedAt: new Date(response.updated_at),
      }))

      return response.id
    },
    [ensureProspectId]
  )

  const saveDraftDebounced = useMemo(
    () =>
      debounce(async (draftToSave: EmailDraft) => {
        await saveDraftImmediate(draftToSave)
      }, 1000),
    [saveDraftImmediate]
  )

  const updateSubject = useCallback(
    (subject: string) => {
      setDraft((prev) => {
        const next = {
          ...prev,
          subject,
          updatedAt: new Date(),
        }
        saveDraftDebounced(next)
        return next
      })
    },
    [saveDraftDebounced]
  )

  const updateContent = useCallback(
    (content: string) => {
      setDraft((prev) => {
        const next = {
          ...prev,
          content,
          updatedAt: new Date(),
        }
        saveDraftDebounced(next)
        return next
      })
    },
    [saveDraftDebounced]
  )

  return {
    draft,
    updateSubject,
    updateContent,
    saveDraft: () => saveDraftDebounced(draft),
    saveDraftNow: () => saveDraftImmediate(draft),
  }
}
