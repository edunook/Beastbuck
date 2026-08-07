import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@shared/lib/utils';

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true,
  className 
}) {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;
      
      // Focus the modal
      if (modalRef.current) {
        modalRef.current.focus();
      }

      // Trap focus within the modal
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) || [];
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement?.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement?.focus();
            e.preventDefault();
          }
        }
      };

      document.addEventListener('keydown', handleTab);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleTab);
        document.body.style.overflow = '';
        
        // Restore focus to the previously focused element
        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen]);

  const handleEscape = (e) => {
    if (e.key === 'Escape' && onClose) {
      onClose();
    }
  };

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal-backdrop">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-glass-sm transition-opacity duration-slow"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          "relative z-modal flex items-center justify-center min-h-screen p-4",
          "animate-in fade-in zoom-in-95 duration-slow"
        )}
        tabIndex={-1}
        onKeyDown={handleEscape}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          className={cn(
            "bg-surface backdrop-blur-glass-lg border border-border rounded-2xl shadow-depth-4 w-full",
            "animate-in slide-in-from-bottom-4 duration-slow",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between p-6 border-b border-border">
              {title && (
                <h2 id="modal-title" className="font-heading text-xl font-bold text-text">
                  {title}
                </h2>
              )}
              {showClose && onClose && (
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({ children, className }) {
  return (
    <div className={cn("flex items-center justify-between p-6 border-b border-border", className)}>
      {children}
    </div>
  );
}

export function ModalBody({ children, className }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
}

export function ModalFooter({ children, className }) {
  return (
    <div className={cn("flex items-center justify-end gap-3 p-6 border-t border-border", className)}>
      {children}
    </div>
  );
}
