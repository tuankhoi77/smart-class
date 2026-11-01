import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../services/storage';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signOut as fbSignOut,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateFirebaseProfile,
} from '../services/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => boolean;
  loginWithEmail: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  registerWithEmail: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    schoolName?: string;
    role?: UserRole;
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updated: Partial<User>) => void;
  hasPermission: (module: string, action: 'view' | 'create' | 'edit' | 'delete') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PERMISSIONS: Record<UserRole, Record<string, string[]>> = {
  admin: {
    classes: ['view', 'create', 'edit', 'delete'],
    students: ['view', 'create', 'edit', 'delete'],
    attendance: ['view', 'create', 'edit', 'delete'],
    assignments: ['view', 'create', 'edit', 'delete'],
    quizzes: ['view', 'create', 'edit', 'delete'],
    grades: ['view', 'create', 'edit', 'delete'],
    users: ['view', 'create', 'edit', 'delete'],
    schools: ['view', 'create', 'edit', 'delete'],
    system: ['view', 'create', 'edit', 'delete'],
    reports: ['view'],
  },
  teacher: {
    classes: ['view', 'create', 'edit', 'delete'],
    students: ['view', 'create', 'edit', 'delete'],
    attendance: ['view', 'create', 'edit'],
    assignments: ['view', 'create', 'edit', 'delete'],
    quizzes: ['view', 'create', 'edit', 'delete'],
    grades: ['view', 'create', 'edit', 'delete'],
    behavior: ['view', 'create', 'edit'],
    tools: ['view', 'create'],
    reports: ['view', 'create'],
    announcements: ['view', 'create', 'edit'],
  },
  student: {
    classes: ['view'],
    attendance: ['view'],
    assignments: ['view', 'create'], // submit
    quizzes: ['view', 'create'], // take quiz
    grades: ['view'],
    resources: ['view'],
    announcements: ['view'],
  },
  parent: {
    classes: ['view'],
    attendance: ['view'],
    assignments: ['view'],
    grades: ['view'],
    behavior: ['view'],
    messages: ['view', 'create'],
    announcements: ['view'],
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smartedu_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to Teacher for rich first-time experience
    const users = storage.getUsers();
    return users.find((u) => u.role === 'teacher') || users[0];
  });

  // Track Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentFbUser) => {
      setFirebaseUser(currentFbUser);
      if (currentFbUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentFbUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as User;
            setUser(data);
          }
        } catch (e) {
          console.warn('Unable to fetch Firestore user on auth change:', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('smartedu_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('smartedu_current_user');
    }
  }, [user]);

  const loginWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      setFirebaseUser(fbUser);

      const userRef = doc(db, 'users', fbUser.uid);
      let appUser: User;

      try {
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          appUser = userSnap.data() as User;
        } else {
          appUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Giáo viên',
            email: fbUser.email || '',
            role: 'teacher',
            avatar: fbUser.photoURL || undefined,
            status: 'active',
            createdAt: new Date().toISOString(),
          };
          await setDoc(userRef, appUser);
        }
      } catch {
        appUser = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Giáo viên',
          email: fbUser.email || '',
          role: 'teacher',
          avatar: fbUser.photoURL || undefined,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
      }

      setUser(appUser);
      storage.saveUser(appUser);
      storage.addAuditLog({
        userId: appUser.id,
        userName: appUser.name,
        userRole: appUser.role,
        action: 'Đăng nhập Google',
        module: 'Firebase Auth',
        details: `Đăng nhập thành công qua Google Firebase: ${appUser.email}`,
      });
      return true;
    } catch (error) {
      console.error('Google sign-in error:', error);
      return false;
    }
  };

  const registerWithEmail = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    schoolName?: string;
    role?: UserRole;
  }): Promise<{ success: boolean; error?: string }> => {
    try {
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.trim(),
        data.password
      );
      const fbUser = userCredential.user;
      setFirebaseUser(fbUser);

      // 2. Set display name in Firebase Auth
      try {
        await updateFirebaseProfile(fbUser, {
          displayName: data.name.trim(),
        });
      } catch (pErr) {
        console.warn('Firebase updateProfile note:', pErr);
      }

      // 3. Save User document in Firestore
      const appUser: User = {
        id: fbUser.uid,
        name: data.name.trim(),
        email: data.email.trim(),
        role: data.role || 'teacher',
        phone: data.phone?.trim() || undefined,
        schoolName: data.schoolName?.trim() || undefined,
        status: 'active',
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'users', fbUser.uid), appUser);
      } catch (fsErr) {
        console.warn('Firestore setDoc user error:', fsErr);
      }

      // 4. Update local state and logs
      setUser(appUser);
      storage.saveUser(appUser);
      storage.addAuditLog({
        userId: appUser.id,
        userName: appUser.name,
        userRole: appUser.role,
        action: 'Đăng ký tài khoản',
        module: 'Firebase Auth',
        details: `Đăng ký thành công tài khoản Firebase: ${appUser.email}`,
      });

      return { success: true };
    } catch (err: any) {
      console.error('Firebase registerWithEmail error:', err);
      let errorMsg = 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin!';
      if (err.code === 'auth/operation-not-allowed') {
        errorMsg =
          'Phương thức đăng nhập Email/Password chưa được BẬT trên Firebase Console. Vui lòng vào tab "Sign-in method" trên Firebase Console và BẬT Email/Password!';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMsg = 'Email này đã được đăng ký tài khoản trước đó!';
      } else if (err.code === 'auth/weak-password') {
        errorMsg = 'Mật khẩu quá ngắn, vui lòng nhập tối thiểu 6 ký tự!';
      } else if (err.code === 'auth/invalid-email') {
        errorMsg = 'Định dạng email không hợp lệ!';
      } else if (err.message) {
        errorMsg = err.message;
      }
      return { success: false, error: errorMsg };
    }
  };

  const loginWithEmail = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (password) {
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
        const fbUser = userCredential.user;
        setFirebaseUser(fbUser);

        let appUser: User;
        try {
          const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
          if (userDoc.exists()) {
            appUser = userDoc.data() as User;
          } else {
            appUser = {
              id: fbUser.uid,
              name: fbUser.displayName || 'Giáo viên',
              email: fbUser.email || email,
              role: 'teacher',
              status: 'active',
              createdAt: new Date().toISOString(),
            };
            await setDoc(doc(db, 'users', fbUser.uid), appUser);
          }
        } catch {
          appUser = {
            id: fbUser.uid,
            name: fbUser.displayName || 'Giáo viên',
            email: fbUser.email || email,
            role: 'teacher',
            status: 'active',
            createdAt: new Date().toISOString(),
          };
        }

        setUser(appUser);
        storage.saveUser(appUser);
        return { success: true };
      } catch (err: any) {
        console.warn('Firebase signInWithEmailAndPassword note:', err);
        // Fallback for demo mock accounts
        const localLogin = login(email);
        if (localLogin) {
          return { success: true };
        }

        let errorMsg = 'Email hoặc mật khẩu không chính xác!';
        if (err.code === 'auth/operation-not-allowed') {
          errorMsg =
            'Phương thức đăng nhập Email/Password chưa được BẬT trên Firebase Console. Vui lòng vào tab "Sign-in method" trên Firebase Console để kích hoạt!';
        } else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
          errorMsg = 'Tài khoản không tồn tại hoặc sai thông tin đăng nhập!';
        } else if (err.code === 'auth/wrong-password') {
          errorMsg = 'Mật khẩu không chính xác!';
        }
        return { success: false, error: errorMsg };
      }
    }

    const ok = login(email);
    return { success: ok, error: ok ? undefined : 'Email không tồn tại trong hệ thống!' };
  };

  const login = (email: string, targetRole?: UserRole): boolean => {
    const users = storage.getUsers();
    let found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found && targetRole) {
      found = users.find((u) => u.role === targetRole);
    }
    if (found) {
      setUser(found);
      storage.addAuditLog({
        userId: found.id,
        userName: found.name,
        userRole: found.role,
        action: 'Đăng nhập',
        module: 'Xác thực',
        details: `Đăng nhập thành công với vai trò ${found.role}`,
      });
      return true;
    }
    return false;
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn('Firebase signout note:', e);
    }

    if (user) {
      storage.addAuditLog({
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action: 'Đăng xuất',
        module: 'Xác thực',
        details: 'Đăng xuất khỏi hệ thống',
      });
    }
    setUser(null);
    setFirebaseUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    const users = storage.getUsers();
    const targetUser = users.find((u) => u.role === newRole);
    if (targetUser) {
      setUser(targetUser);
      storage.addAuditLog({
        userId: targetUser.id,
        userName: targetUser.name,
        userRole: newRole,
        action: 'Chuyển vai trò',
        module: 'Xác thực',
        details: `Chuyển sang vai trò: ${newRole}`,
      });
    }
  };

  const updateProfile = (updated: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
    storage.saveUser(newUser);

    if (firebaseUser) {
      setDoc(doc(db, 'users', firebaseUser.uid), newUser, { merge: true }).catch((e) =>
        console.warn('Firestore profile update note:', e)
      );
    }
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete'): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    if (!permissions) return false;
    const moduleActions = permissions[module];
    if (!moduleActions) return false;
    return moduleActions.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        role: user?.role || 'teacher',
        isAuthenticated: !!user,
        login,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        switchRole,
        updateProfile,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
