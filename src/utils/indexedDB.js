import { openDB } from 'idb';

const DB_NAME = 'enrollmate';
const DB_VERSION = 3;

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      // Delete old broken stores on upgrade
      if (oldVersion < 2) {
        if (db.objectStoreNames.contains('grades')) db.deleteObjectStore('grades');
        if (db.objectStoreNames.contains('syncQueue')) db.deleteObjectStore('syncQueue');
      }

      // FIX: Use compositeKey (student_id__subject_code) as the keyPath
      // db.put() with this key will UPSERT (update if exists, insert if not)
      if (!db.objectStoreNames.contains('grades')) {
        const gradesStore = db.createObjectStore('grades', { keyPath: 'compositeKey' });
        gradesStore.createIndex('by_subject', 'subject_code', { unique: false });
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'compositeKey' });
      }
    },
  });
};

// Helper: build a stable composite key
const makeKey = (studentId, subjectCode) => `${studentId}__${subjectCode}`;

// --- GRADE OPERATIONS ---

export const saveGradeLocally = async (gradeRecord) => {
  const db = await initDB();
  const key = makeKey(gradeRecord.student_id, gradeRecord.subject_code);
  // Stamp with high-precision epoch-ms for last-write-wins conflict resolution
  await db.put('grades', {
    ...gradeRecord,
    compositeKey: key,
    client_updated_at: Date.now(),
  });
};

export const getLocalGrades = async (subjectCode) => {
  const db = await initDB();
  return db.getAllFromIndex('grades', 'by_subject', subjectCode);
};
// --- SYNC QUEUE OPERATIONS ---

export const addToSyncQueue = async (updatePayload) => {
  const db = await initDB();
  const key = makeKey(updatePayload.student_id, updatePayload.subject_code);

  await db.put('syncQueue', {
    ...updatePayload,
    compositeKey: key,
    client_updated_at: Date.now(),
  });
  console.log('⚠️ Offline: Sync queue updated', key);
};

export const getSyncQueue = async () => {
  const db = await initDB();
  return await db.getAll('syncQueue');
};

export const clearSyncQueue = async () => {
  const db = await initDB();
  await db.clear('syncQueue');
};


export const removeFromSyncQueue = async (compositeKey) => {
  const db = await initDB();
  try {
    await db.delete('syncQueue', compositeKey);
  } catch {
    // Key may not exist — safe to ignore
  }
};

/**
 * After a sync response, remove only successfully synced items.
 * Skipped (stale) keys remain in the queue for user review or re-edit.
 * @param {string[]} skippedKeys - composite keys that the server skipped
 */
export const clearSyncedExceptSkipped = async (skippedKeys = []) => {
  const db = await initDB();
  const allQueued = await db.getAll('syncQueue');
  const skippedSet = new Set(skippedKeys);

  const tx = db.transaction('syncQueue', 'readwrite');
  for (const entry of allQueued) {
    if (!skippedSet.has(entry.compositeKey)) {
      await tx.store.delete(entry.compositeKey);
    }
  }
  await tx.done;
};