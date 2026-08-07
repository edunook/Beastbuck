import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive = true) {
  const containerRef = useRef(null);
  const previousActiveElement = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    // Focus the first element
    if (firstFocusable) {
      firstFocusable.focus();
    }

    const handleTab = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        // Trigger escape event on container
        const escapeEvent = new CustomEvent('modalEscape', { bubbles: true });
        container.dispatchEvent(escapeEvent);
      }
    };

    container.addEventListener('keydown', handleTab);
    container.addEventListener('keydown', handleEscape);

    return () => {
      container.removeEventListener('keydown', handleTab);
      container.removeEventListener('keydown', handleEscape);
      
      // Restore focus to previously focused element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive]);

  return containerRef;
}
