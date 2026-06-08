/**
 * ═══════════════════════════════════════════════════════════
 *  STOSHI EV — Firebase LocalStorage Mock
 *  Mirrors Firebase Auth + Firestore API exactly.
 *  Swap this file for the real Firebase config when ready:
 *
 *    import { initializeApp } from 'firebase/app';
 *    import { getAuth } from 'firebase/auth';
 *    import { getFirestore } from 'firebase/firestore';
 *    const app = initializeApp({ apiKey: '...', ... });
 *    export const auth = getAuth(app);
 *    export const db = getFirestore(app);
 * ═══════════════════════════════════════════════════════════
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────
const LS = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
  del: (key) => localStorage.removeItem(key),
};

const uid = () => Math.random().toString(36).slice(2, 18) + Math.random().toString(36).slice(2, 18);

// ─── Firestore Mock ───────────────────────────────────────────────────────────
const DB_KEY = '__stoshi_db__';

function getDB() { return LS.get(DB_KEY) || {}; }
function saveDB(db) { LS.set(DB_KEY, db); }

function getCollection(collectionName) {
  const db = getDB();
  return db[collectionName] || {};
}

function saveDocument(collectionName, docId, data) {
  const db = getDB();
  if (!db[collectionName]) db[collectionName] = {};
  db[collectionName][docId] = data;
  saveDB(db);
}

// Snapshot listeners registry
const listeners = {};
function notifyListeners(path) {
  (listeners[path] || []).forEach(cb => cb());
}

// doc() returns a reference object
export function doc(db, collectionName, docId) {
  return { _collection: collectionName, _id: docId, _type: 'doc' };
}

// collection() returns a reference object
export function collection(db, collectionName) {
  return { _collection: collectionName, _type: 'collection' };
}

// getDoc
export async function getDoc(ref) {
  const coll = getCollection(ref._collection);
  const data = coll[ref._id];
  return {
    exists: () => !!data,
    data: () => data,
    id: ref._id,
  };
}

// setDoc
export async function setDoc(ref, data, options = {}) {
  const existing = getCollection(ref._collection)[ref._id];
  if (options.merge && existing) {
    saveDocument(ref._collection, ref._id, { ...existing, ...data });
  } else {
    saveDocument(ref._collection, ref._id, data);
  }
  notifyListeners(`${ref._collection}/${ref._id}`);
  notifyListeners(ref._collection);
}

// updateDoc
export async function updateDoc(ref, data) {
  const existing = getCollection(ref._collection)[ref._id] || {};
  saveDocument(ref._collection, ref._id, { ...existing, ...data });
  notifyListeners(`${ref._collection}/${ref._id}`);
  notifyListeners(ref._collection);
}

// addDoc
export async function addDoc(collRef, data) {
  const newId = uid();
  saveDocument(collRef._collection, newId, { ...data, _id: newId });
  notifyListeners(collRef._collection);
  return { id: newId };
}

// deleteDoc
export async function deleteDoc(ref) {
  const db = getDB();
  if (db[ref._collection]) {
    delete db[ref._collection][ref._id];
    saveDB(db);
    notifyListeners(`${ref._collection}/${ref._id}`);
    notifyListeners(ref._collection);
  }
}

// query, where, orderBy — returns a query object
export function query(collRef, ...constraints) {
  return { _collection: collRef._collection, _constraints: constraints, _type: 'query' };
}

export function where(field, op, value) {
  return { _type: 'where', field, op, value };
}

export function orderBy(field, direction = 'asc') {
  return { _type: 'orderBy', field, direction };
}

// getDocs — executes a query
export async function getDocs(queryRef) {
  const coll = getCollection(queryRef._collection);
  let docs = Object.entries(coll).map(([id, data]) => ({ id, data: () => data, ...data }));

  // Apply where constraints
  (queryRef._constraints || []).forEach(constraint => {
    if (constraint._type === 'where') {
      docs = docs.filter(d => {
        const val = d.data()[constraint.field];
        if (constraint.op === '==') return val === constraint.value;
        if (constraint.op === '!=') return val !== constraint.value;
        if (constraint.op === '>') return val > constraint.value;
        if (constraint.op === '<') return val < constraint.value;
        return true;
      });
    }
    if (constraint._type === 'orderBy') {
      docs.sort((a, b) => {
        const av = a.data()[constraint.field];
        const bv = b.data()[constraint.field];
        return constraint.direction === 'desc'
          ? (bv > av ? 1 : -1)
          : (av > bv ? 1 : -1);
      });
    }
  });

  return {
    forEach: (cb) => docs.forEach(cb),
    docs,
    size: docs.length,
  };
}

// onSnapshot — real-time listener using polling + storage events
export function onSnapshot(ref, callback, onError) {
  const isDoc = ref._type === 'doc';
  const path = isDoc ? `${ref._collection}/${ref._id}` : ref._collection;

  if (!listeners[path]) listeners[path] = [];

  const fire = () => {
    try {
      if (isDoc) {
        const coll = getCollection(ref._collection);
        const data = coll[ref._id];
        callback({ exists: () => !!data, data: () => data, id: ref._id });
      } else {
        const coll = getCollection(ref._collection);
        const docs = Object.entries(coll).map(([id, d]) => ({ id, data: () => d, ...d }));
        callback({ forEach: (cb) => docs.forEach(cb), docs, size: docs.length });
      }
    } catch (e) {
      onError && onError(e);
    }
  };

  listeners[path].push(fire);
  fire(); // fire immediately

  // Also poll on storage events (cross-tab)
  const storageHandler = (e) => { if (e.key === DB_KEY) fire(); };
  window.addEventListener('storage', storageHandler);

  // Return unsubscribe function
  return () => {
    listeners[path] = (listeners[path] || []).filter(fn => fn !== fire);
    window.removeEventListener('storage', storageHandler);
  };
}

export function serverTimestamp() { return new Date().toISOString(); }

// The db export (just a namespace token — not actually used in mock)
export const db = { _mock: true };

// ─── Auth Mock ────────────────────────────────────────────────────────────────
const USERS_KEY = '__stoshi_users__';
const SESSION_KEY = '__stoshi_session__';

function getUsers() { return LS.get(USERS_KEY) || {}; }
function saveUsers(users) { LS.set(USERS_KEY, users); }
function getCurrentSession() { return LS.get(SESSION_KEY); }
function saveSession(user) { LS.set(SESSION_KEY, user); }
function clearSession() { LS.del(SESSION_KEY); }

const authListeners = [];

function notifyAuth(user) {
  authListeners.forEach(cb => cb(user));
}

export const auth = {
  currentUser: null,
};

// Keep auth.currentUser in sync
function syncAuthCurrentUser() {
  auth.currentUser = getCurrentSession();
}
syncAuthCurrentUser();

export function onAuthStateChanged(authObj, callback) {
  // Fire immediately with current session
  const session = getCurrentSession();
  callback(session);
  authListeners.push(callback);
  return () => {
    const idx = authListeners.indexOf(callback);
    if (idx > -1) authListeners.splice(idx, 1);
  };
}

export async function createUserWithEmailAndPassword(authObj, email, password) {
  const users = getUsers();
  const existingUser = Object.values(users).find(u => u.email === email);
  if (existingUser) {
    const err = new Error('Email already in use');
    err.code = 'auth/email-already-in-use';
    throw err;
  }

  const newUid = uid();
  const user = { uid: newUid, email };
  users[newUid] = { uid: newUid, email, password };
  saveUsers(users);

  saveSession(user);
  syncAuthCurrentUser();
  notifyAuth(user);

  return { user };
}

export async function signInWithEmailAndPassword(authObj, email, password) {
  const users = getUsers();
  const found = Object.values(users).find(u => u.email === email && u.password === password);
  if (!found) {
    const err = new Error('Invalid credentials');
    err.code = 'auth/invalid-credential';
    throw err;
  }

  const user = { uid: found.uid, email: found.email };
  saveSession(user);
  syncAuthCurrentUser();
  notifyAuth(user);

  return { user };
}

export async function signOut() {
  clearSession();
  auth.currentUser = null;
  notifyAuth(null);
}

// ─── Project Seeder ──────────────────────────────────────────────────────────
export async function initializeProjectData() {
  const coll = getCollection('project');
  if (!coll['sonbhadra-ev-1']) {
    saveDocument('project', 'sonbhadra-ev-1', {
      name: 'Sonbhadra EV-1',
      totalCapacity: 1500000,
      collectedAmount: 975000,
      totalMembers: 127,
      status: 'Operational',
      location: 'Sonbhadra, Uttar Pradesh',
      lastUpdated: new Date().toISOString(),
    });
    console.log('[Mock DB] Seeded project/sonbhadra-ev-1');
  }
}
