import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClassRoom } from '../types';
import { storage } from '../services/storage';

interface ClassContextType {
  classes: ClassRoom[];
  currentClassId: string;
  currentClass: ClassRoom | undefined;
  setCurrentClassId: (id: string) => void;
  activeTerm: 'term1' | 'term2' | 'year';
  setActiveTerm: (term: 'term1' | 'term2' | 'year') => void;
  refreshClasses: () => void;
}

const ClassContext = createContext<ClassContextType | undefined>(undefined);

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<ClassRoom[]>(() => storage.getClasses());
  const [currentClassId, setCurrentClassIdState] = useState<string>(() => {
    const saved = localStorage.getItem('smartedu_current_class_id');
    const list = storage.getClasses();
    if (saved && list.some((c) => c.id === saved)) {
      return saved;
    }
    return list[0]?.id || 'cls_10a1';
  });
  const [activeTerm, setActiveTerm] = useState<'term1' | 'term2' | 'year'>('term1');

  const setCurrentClassId = (id: string) => {
    setCurrentClassIdState(id);
    localStorage.setItem('smartedu_current_class_id', id);
  };

  const refreshClasses = () => {
    setClasses(storage.getClasses());
  };

  const currentClass = classes.find((c) => c.id === currentClassId) || classes[0];

  return (
    <ClassContext.Provider
      value={{
        classes,
        currentClassId,
        currentClass,
        setCurrentClassId,
        activeTerm,
        setActiveTerm,
        refreshClasses,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};

export const useClass = () => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClass must be used within a ClassProvider');
  }
  return context;
};
