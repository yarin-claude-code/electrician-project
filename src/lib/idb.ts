'use client'

import { openDB } from 'idb'

import type { DBSchema, IDBPDatabase } from 'idb'

const MAX_UPLOAD_RETRIES = 5

interface InspectionDB extends DBSchema {
  drafts: {
    key: string
    value: {
      id: string
      data: Record<string, unknown>
      updatedAt: number
    }
  }
  pendingUploads: {
    key: string
    value: {
      id: string
      inspectionId: string
      field: string
      blob: Blob
      createdAt: number
      retryCount: number
    }
  }
}

const DB_NAME = 'electrical-inspection'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<InspectionDB>> | null = null

const getDB = (): Promise<IDBPDatabase<InspectionDB>> => {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is not available on the server'))
  }
  if (!dbPromise) {
    dbPromise = openDB<InspectionDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('drafts', { keyPath: 'id' })
        db.createObjectStore('pendingUploads', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export const saveDraft = async (
  inspectionId: string,
  data: Record<string, unknown>
): Promise<void> => {
  const db = await getDB()
  await db.put('drafts', {
    id: `inspection-${inspectionId}-draft`,
    data,
    updatedAt: Date.now(),
  })
}

export const loadDraft = async (inspectionId: string): Promise<Record<string, unknown> | null> => {
  const db = await getDB()
  const result = await db.get('drafts', `inspection-${inspectionId}-draft`)
  return result?.data ?? null
}

export const deleteDraft = async (inspectionId: string): Promise<void> => {
  const db = await getDB()
  await db.delete('drafts', `inspection-${inspectionId}-draft`)
}

export const queuePhotoUpload = async (
  inspectionId: string,
  field: string,
  blob: Blob
): Promise<string> => {
  const db = await getDB()
  const id = `${inspectionId}-${field}-${Date.now()}`
  await db.put('pendingUploads', {
    id,
    inspectionId,
    field,
    blob,
    createdAt: Date.now(),
    retryCount: 0,
  })
  return id
}

export const incrementUploadRetry = async (id: string): Promise<boolean> => {
  const db = await getDB()
  const item = await db.get('pendingUploads', id)
  if (!item) return false
  if (item.retryCount >= MAX_UPLOAD_RETRIES) {
    await db.delete('pendingUploads', id)
    return false // exceeded max retries — removed
  }
  await db.put('pendingUploads', { ...item, retryCount: item.retryCount + 1 })
  return true // can retry
}

export const getPendingUploads = async (): Promise<InspectionDB['pendingUploads']['value'][]> => {
  const db = await getDB()
  return db.getAll('pendingUploads')
}

export const deletePendingUpload = async (id: string): Promise<void> => {
  const db = await getDB()
  await db.delete('pendingUploads', id)
}
