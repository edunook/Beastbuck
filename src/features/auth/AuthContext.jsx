import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebase/config';
import { PresenceService } from '../../services/realtime/presence';

const AuthContext = createContext({
  user: null,
  roleData: null,
  isAuthInitialized: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [roleData, setRoleData] = useState(null);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);

  useEffect(() => {
    let unsubFirestore = null;
    let unsubPresence = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cleanup previous listeners
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (firebaseUser) {
        // Setup Firestore Role Listener
        unsubFirestore = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setRoleData(data);
            
            // Initialize rich presence once we have the user's profile
            // Only initialize if not already initialized to avoid permission errors
            if (!unsubPresence) {
              unsubPresence = PresenceService.initializePresence(firebaseUser.uid, {
                username: data.username,
                displayName: data.displayName || data.name,
                avatar: data.photoURL || '',
              });
            }
          } else {
            setRoleData(null);
          }
          setIsAuthInitialized(true);
        }, (error) => {
          console.error('User profile listener failed:', error);
          setRoleData(null);
          setIsAuthInitialized(true);
        });

      } else {
        setRoleData(null);
        setIsAuthInitialized(true);
        if (unsubPresence) {
          unsubPresence();
          unsubPresence = null;
        }
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubFirestore) unsubFirestore();
      if (unsubPresence) unsubPresence();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, roleData, isAuthInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
