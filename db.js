/**
 * db.js - Gestion du stockage local IndexedDB pour le Journal Mémoire
 * 100% privé, sécurisé et hors-ligne sur l'appareil.
 */

const DB_NAME = 'JournalMemoireDB';
const DB_VERSION = 1;
const STORE_MEMORIES = 'memories';
const STORE_SETTINGS = 'settings';

let dbInstance = null;

function openDB() {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      return resolve(dbInstance);
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_MEMORIES)) {
        const memStore = db.createObjectStore(STORE_MEMORIES, { keyPath: 'id' });
        memStore.createIndex('date', 'date', { unique: false });
        memStore.createIndex('timestamp', 'timestamp', { unique: false });
        memStore.createIndex('mood', 'mood', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('Erreur IndexedDB:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Ajouter ou modifier un souvenir
async function saveMemory(memory) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEMORIES], 'readwrite');
    const store = tx.objectStore(STORE_MEMORIES);
    if (!memory.id) {
      memory.id = 'mem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    if (!memory.createdAt) {
      memory.createdAt = new Date().toISOString();
    }
    memory.updatedAt = new Date().toISOString();

    const req = store.put(memory);
    req.onsuccess = () => resolve(memory);
    req.onerror = (e) => reject(e.target.error);
  });
}

// Récupérer un souvenir par son ID
async function getMemory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEMORIES], 'readonly');
    const store = tx.objectStore(STORE_MEMORIES);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = (e) => reject(e.target.error);
  });
}

// Récupérer tous les souvenirs (triés du plus récent au plus ancien)
async function getAllMemories() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEMORIES], 'readonly');
    const store = tx.objectStore(STORE_MEMORIES);
    const req = store.getAll();
    req.onsuccess = () => {
      const items = req.result || [];
      items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      resolve(items);
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

// Supprimer un souvenir
async function deleteMemory(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_MEMORIES], 'readwrite');
    const store = tx.objectStore(STORE_MEMORIES);
    const req = store.delete(id);
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

// Basculer l'état favori
async function toggleFavorite(id) {
  const mem = await getMemory(id);
  if (!mem) return null;
  mem.favorite = !mem.favorite;
  return await saveMemory(mem);
}

// Paramètres de l'application
async function getSetting(key, defaultValue = null) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SETTINGS], 'readonly');
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.get(key);
    req.onsuccess = () => {
      if (req.result && req.result.value !== undefined) {
        resolve(req.result.value);
      } else {
        resolve(defaultValue);
      }
    };
    req.onerror = (e) => reject(e.target.error);
  });
}

async function setSetting(key, value) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_SETTINGS], 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    const req = store.put({ key, value });
    req.onsuccess = () => resolve(true);
    req.onerror = (e) => reject(e.target.error);
  });
}

// Sauvegarde complète en fichier JSON
async function exportFullBackup() {
  const memories = await getAllMemories();
  const theme = await getSetting('theme', 'dark');
  const voiceLang = await getSetting('voiceLang', 'fr-FR');
  const backupData = {
    appName: 'JournalMemoire',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: { theme, voiceLang },
    memories: memories
  };
  return JSON.stringify(backupData, null, 2);
}

// Restauration d'une sauvegarde
async function importFullBackup(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.memories || !Array.isArray(data.memories)) {
      throw new Error('Format de fichier de sauvegarde invalide.');
    }
    const db = await openDB();
    const tx = db.transaction([STORE_MEMORIES], 'readwrite');
    const store = tx.objectStore(STORE_MEMORIES);
    
    for (const mem of data.memories) {
      if (mem && mem.id) {
        store.put(mem);
      }
    }

    if (data.settings) {
      if (data.settings.theme) await setSetting('theme', data.settings.theme);
      if (data.settings.voiceLang) await setSetting('voiceLang', data.settings.voiceLang);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(data.memories.length);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    throw err;
  }
}

window.JournalDB = {
  openDB,
  saveMemory,
  getMemory,
  getAllMemories,
  deleteMemory,
  toggleFavorite,
  getSetting,
  setSetting,
  exportFullBackup,
  importFullBackup
};
