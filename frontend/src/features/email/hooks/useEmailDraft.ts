import { useState, useCallback } from 'react'
import type { EmailDraft } from '@/shared/types'
import { debounce } from '@/shared/utils'

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

  const updateSubject = useCallback((subject: string) => {
    setDraft((prev) => ({
      ...prev,
      subject,
      updatedAt: new Date(),
    }))
  }, [])

  const updateContent = useCallback((content: string) => {
    setDraft((prev) => ({
      ...prev,
      content,
      updatedAt: new Date(),
    }))
  }, [])

  // Debounced save function (to be connected to API)
  const saveDraft = useCallback(
    debounce(async (draftToSave: EmailDraft) => {
      // TODO: Implement API call to save draft
      console.log('Saving draft:', draftToSave)
    }, 1000),
    []
  )

  return {
    draft,
    updateSubject,
    updateContent,
    saveDraft: () => saveDraft(draft),
  }
}
