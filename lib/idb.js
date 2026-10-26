// ============================================
// InvictusDB - IndexedDB Wrapper for Large Files
// ============================================
const InvictusDB = {
    DB_NAME: 'invictus-storage',
    DB_VERSION: 1,
    _db: null,

    open: function() {
        if (this._db) return Promise.resolve(this._db);
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('blobs')) {
                    db.createObjectStore('blobs', { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => { this._db = e.target.result; resolve(this._db); };
            request.onerror = (e) => { console.warn('IndexedDB open failed', e); resolve(null); };
        });
    },

    put: async function(id, data) {
        const db = await this.open();
        if (!db) return false;
        return new Promise((resolve) => {
            const tx = db.transaction('blobs', 'readwrite');
            tx.objectStore('blobs').put({ id, data, ts: Date.now() });
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    },

    get: async function(id) {
        const db = await this.open();
        if (!db) return null;
        return new Promise((resolve) => {
            const tx = db.transaction('blobs', 'readonly');
            const req = tx.objectStore('blobs').get(id);
            req.onsuccess = () => resolve(req.result ? req.result.data : null);
            req.onerror = () => resolve(null);
        });
    },

    del: async function(id) {
        const db = await this.open();
        if (!db) return false;
        return new Promise((resolve) => {
            const tx = db.transaction('blobs', 'readwrite');
            tx.objectStore('blobs').delete(id);
            tx.oncomplete = () => resolve(true);
            tx.onerror = () => resolve(false);
        });
    },

    keys: async function() {
        const db = await this.open();
        if (!db) return [];
        return new Promise((resolve) => {
            const tx = db.transaction('blobs', 'readonly');
            const req = tx.objectStore('blobs').getAllKeys();
            req.onsuccess = () => resolve(req.result || []);
            req.onerror = () => resolve([]);
        });
    }
};
