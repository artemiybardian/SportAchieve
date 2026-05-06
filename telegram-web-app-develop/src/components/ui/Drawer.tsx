import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {CrossIcon} from './Icons';
import {Heading} from "@/components/ui/Typography.tsx";
import {Button} from "@/components/ui/Button.tsx";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  onBack?: () => void;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, children, title, onBack }) => {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setAnimate(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setAnimate(false), 300);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!mounted || (!isOpen && !animate)) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    opacity: isOpen ? 1 : 0,
    transition: 'opacity 0.3s ease-out',
  };

  const drawerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: '40px',
    borderTopRightRadius: '40px',
    padding: '16px',
    zIndex: 1001,
    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    transition: 'transform 0.3s ease-out',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
  };

  const contentStyle: React.CSSProperties = {
    overflowY: 'auto',
    flex: 1,
  };

  const handleStyle: React.CSSProperties = {
    width: '32px',
    height: '32px',
    backgroundColor: '#E6E9ED',
    borderRadius: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: "14px 12px 15px 12px",
    position: 'relative',
    minHeight: '30px',
    flexShrink: 0,
  };

  return createPortal(
    <>
      <div style={overlayStyle} onClick={onClose} />
      <div style={drawerStyle}>
        {(title || onBack) && (
          <div style={titleContainerStyle}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {title && <Heading>{title}</Heading>}
            </div>
            <div style={handleStyle} onClick={onClose}>
              <CrossIcon width="10" height="10" />
            </div>
          </div>
        )}
        <div style={contentStyle}>
          {children}
        </div>
        {onBack && <div style={{marginTop: '16px', marginBottom: "16px", display: 'flex', justifyContent: 'center', width: '100%', flexShrink: 0}}>
          <Button variant="secondary" style={{width: '100%'}} onClick={onBack}>Назад</Button>
        </div>}
      </div>
    </>,
    document.body
  );
};
