import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from '../firebase';
import {
  doc,
  setDoc,
  onSnapshot,
  updateDoc
} from '../firebase';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData]       = useState(null);
  const [loading, setLoading]         = useState(true);

  // ── Sign Up ──────────────────────────────────────────────────────────────
  async function signUpFn(email, password, name, phone, chosenPlan) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const role = email.toLowerCase().startsWith('admin@') ? 'admin' : 'user';

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      phone,
      role,
      membershipType:   chosenPlan || null,
      membershipStatus: role === 'admin' ? 'Active' : 'Pending',
      paymentStatus:    role === 'admin' ? 'Paid'   : 'Unpaid',
      joinDate: new Date().toISOString(),
    });

    return user;
  }

  // ── Sign In ──────────────────────────────────────────────────────────────
  function signInFn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // ── Sign Out ─────────────────────────────────────────────────────────────
  async function signOutFn() {
    setUserData(null);
    return signOut();
  }

  // ── Profile Update ───────────────────────────────────────────────────────
  function updateProfileData(name, phone) {
    if (!currentUser) return Promise.reject('No authenticated user');
    return updateDoc(doc(db, 'users', currentUser.uid), { name, phone });
  }

  // ── Membership Plan Update ───────────────────────────────────────────────
  function updateMembershipPlan(planName) {
    if (!currentUser) return Promise.reject('No authenticated user');
    return updateDoc(doc(db, 'users', currentUser.uid), { membershipType: planName });
  }

  // ── Auth State Listener ──────────────────────────────────────────────────
  useEffect(() => {
    let unsubFirestore = () => {};

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);

      if (user) {
        unsubFirestore = onSnapshot(
          doc(db, 'users', user.uid),
          (snap) => {
            setUserData(snap.exists() ? snap.data() : null);
            setLoading(false);
          },
          (err) => {
            console.error('Firestore listener error:', err);
            setLoading(false);
          }
        );
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      unsubFirestore();
    };
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    signUp: signUpFn,
    signIn: signInFn,
    signOut: signOutFn,
    updateProfileData,
    updateMembershipPlan,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
