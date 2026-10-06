import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const ADMIN_USERNAME = 'ادمین 5';
export const ADMIN_PASSWORD = 'ادمین 5';

export function normalizeAuthString(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))) // Persian digits to English digits
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))) // Arabic digits to English digits
    .replace(/\s+/g, ' '); // normalize whitespace
}

export function isValidAdminCredentials(user: string, pass: string): boolean {
  const normUser = normalizeAuthString(user);
  const normPass = normalizeAuthString(pass);

  const allowedUserVariants = [
    'ادمین 5',
    'ادمین5',
    'admin 5',
    'admin5'
  ];

  const allowedPassVariants = [
    'ادمین 5',
    'ادمین5',
    'admin 5',
    'admin5'
  ];

  return allowedUserVariants.includes(normUser) && allowedPassVariants.includes(normPass);
}

interface AdminAuthContextType {
  isAdmin: boolean;
  adminUser: string | null;
  login: (user: string, pass: string) => { success: boolean; error?: string };
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mamadketab_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [adminUser, setAdminUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mamadketab_admin_user') || null;
    } catch {
      return null;
    }
  });

  const [adminPass, setAdminPass] = useState<string | null>(() => {
    try {
      return localStorage.getItem('mamadketab_admin_pass') || null;
    } catch {
      return null;
    }
  });

  const login = (user: string, pass: string) => {
    if (isValidAdminCredentials(user, pass)) {
      setIsAdmin(true);
      setAdminUser('ادمین 5');
      setAdminPass('ادمین 5');
      try {
        localStorage.setItem('mamadketab_admin_auth', 'true');
        localStorage.setItem('mamadketab_admin_user', 'ادمین 5');
        localStorage.setItem('mamadketab_admin_pass', 'ادمین 5');
      } catch (e) {
        console.error('Failed to save admin auth to localStorage', e);
      }
      return { success: true };
    }
    return {
      success: false,
      error: 'نام کاربری یا رمز عبور اشتباه است. فقط ادمین (نام کاربری و پسورد: ادمین 5) مجاز است.'
    };
  };

  const logout = () => {
    setIsAdmin(false);
    setAdminUser(null);
    setAdminPass(null);
    try {
      localStorage.removeItem('mamadketab_admin_auth');
      localStorage.removeItem('mamadketab_admin_user');
      localStorage.removeItem('mamadketab_admin_pass');
    } catch (e) {
      console.error('Failed to clear admin auth from localStorage', e);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    if (!isAdmin) return {};
    return {
      'x-admin-username': encodeURIComponent(adminUser || 'ادمین 5'),
      'x-admin-password': encodeURIComponent(adminPass || 'ادمین 5')
    };
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, adminUser, login, logout, getAuthHeaders }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
