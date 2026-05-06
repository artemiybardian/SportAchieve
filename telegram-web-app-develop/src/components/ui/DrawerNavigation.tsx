import { createContext, useContext, useState, useCallback, ReactNode, FC } from 'react';
import { Drawer } from './Drawer';

export interface DrawerView {
  title?: string;
  content: ReactNode;
}

interface DrawerContextType {
  openDrawer: (view: DrawerView) => void;
  pushView: (view: DrawerView) => void;
  popView: () => void;
  closeDrawer: () => void;
}

const DrawerContext = createContext<DrawerContextType | undefined>(undefined);

export const useDrawer = () => {
  const context = useContext(DrawerContext);
  if (!context) {
    throw new Error('useDrawer must be used within a DrawerProvider');
  }
  return context;
};

export const DrawerProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stack, setStack] = useState<DrawerView[]>([]);

  const openDrawer = useCallback((view: DrawerView) => {
    setStack([view]);
    setIsOpen(true);
  }, []);

  const pushView = useCallback((view: DrawerView) => {
    setStack((prev) => [...prev, view]);
  }, []);

  const popView = useCallback(() => {
    setStack((prev) => {
      if (prev.length <= 1) return prev;
      return prev.slice(0, -1);
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // Clear stack after animation
    setTimeout(() => {
      setStack([]);
    }, 300);
  }, []);

  const currentView = stack[stack.length - 1];

  return (
    <DrawerContext.Provider value={{ openDrawer, pushView, popView, closeDrawer }}>
      {children}
      <Drawer
        isOpen={isOpen}
        onClose={closeDrawer}
        title={currentView?.title}
        onBack={stack.length > 1 ? popView : undefined}
      >
        {currentView?.content}
      </Drawer>
    </DrawerContext.Provider>
  );
};
