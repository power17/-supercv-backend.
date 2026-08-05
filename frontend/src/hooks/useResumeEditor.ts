import { useCallback, useEffect, useRef, useState } from 'react'
import { updateResume } from '../api/resume'
import type { AuthToken, Resume } from '../types'

const AUTO_SAVE_DELAY = 1200
const HISTORY_GROUP_DELAY = 500
const MAX_HISTORY = 50

function clone<T>(value: T): T {
  return structuredClone(value)
}

export function useResumeEditor(auth: AuthToken | null, initialResume: Resume | null) {
  const [resume, setResume] = useState<Resume | null>(initialResume)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [saveError, setSaveError] = useState('')
  const [historyVersion, setHistoryVersion] = useState(0)
  const resumeRef = useRef<Resume | null>(initialResume)
  const revisionRef = useRef(0)
  const savingRef = useRef(false)
  const undoStackRef = useRef<Resume[]>([])
  const redoStackRef = useRef<Resume[]>([])
  const lastHistoryAtRef = useRef(0)

  useEffect(() => {
    if (!initialResume) return
    const next = clone(initialResume)
    resumeRef.current = next
    setResume(next)
    revisionRef.current = 0
    undoStackRef.current = []
    redoStackRef.current = []
    lastHistoryAtRef.current = 0
    setSaved(true)
    setSaveError('')
    setHistoryVersion((value) => value + 1)
  }, [initialResume])

  const save = useCallback(async () => {
    const snapshot = resumeRef.current
    if (!auth || !snapshot || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    setSaveError('')
    const revision = revisionRef.current
    try {
      await updateResume(auth, clone(snapshot))
      if (revisionRef.current === revision) setSaved(true)
    } catch {
      setSaveError('保存失败，请检查网络连接')
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }, [auth])

  useEffect(() => {
    if (saved || !resume || saving) return
    const timer = window.setTimeout(save, AUTO_SAVE_DELAY)
    return () => window.clearTimeout(timer)
  }, [resume, save, saved, saving])

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (saved) return
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [saved])

  const mutate = useCallback((updater: (draft: Resume) => void, recordHistory = true) => {
    const current = resumeRef.current
    if (!current) return
    const now = Date.now()
    if (recordHistory && now - lastHistoryAtRef.current > HISTORY_GROUP_DELAY) {
      undoStackRef.current = [...undoStackRef.current.slice(-MAX_HISTORY + 1), clone(current)]
      redoStackRef.current = []
      lastHistoryAtRef.current = now
      setHistoryVersion((value) => value + 1)
    }
    const draft = clone(current)
    updater(draft)
    resumeRef.current = draft
    revisionRef.current += 1
    setResume(draft)
    setSaved(false)
    setSaveError('')
  }, [])

  const undo = useCallback(() => {
    const current = resumeRef.current
    const previous = undoStackRef.current.pop()
    if (!current || !previous) return
    redoStackRef.current.push(clone(current))
    resumeRef.current = previous
    revisionRef.current += 1
    lastHistoryAtRef.current = 0
    setResume(previous)
    setSaved(false)
    setHistoryVersion((value) => value + 1)
  }, [])

  const redo = useCallback(() => {
    const current = resumeRef.current
    const next = redoStackRef.current.pop()
    if (!current || !next) return
    undoStackRef.current.push(clone(current))
    resumeRef.current = next
    revisionRef.current += 1
    lastHistoryAtRef.current = 0
    setResume(next)
    setSaved(false)
    setHistoryVersion((value) => value + 1)
  }, [])

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        save()
      } else if (key === 'z' && event.shiftKey) {
        event.preventDefault()
        redo()
      } else if (key === 'z') {
        event.preventDefault()
        undo()
      } else if (key === 'y') {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [redo, save, undo])

  return {
    resume,
    mutate,
    save,
    saving,
    saved,
    saveError,
    undo,
    redo,
    canUndo: undoStackRef.current.length > 0,
    canRedo: redoStackRef.current.length > 0,
    historyVersion,
  }
}
