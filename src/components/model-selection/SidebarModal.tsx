"use client";

import React, { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Model } from "./types";
import { ModelSidebar } from "./DetailedPanel";

interface SidebarModalProps {
  model: Model | null;
  isOpen: boolean;
  onClose: () => void;
  isSelected: boolean;
  onToggleSelect: () => void;
}

export const SidebarModal: React.FC<SidebarModalProps> = ({
  model,
  isOpen,
  onClose,
  isSelected,
  onToggleSelect,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!model) return null;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "fixed inset-0 bg-black/60 backdrop-blur-md z-[100]",
              "flex items-end sm:items-center justify-center p-0 sm:p-4"
            )}
            onClick={handleBackdropClick}
            aria-hidden="true"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{
                type: "spring",
                damping: 30,
                stiffness: 300,
                mass: 0.8
              }}
              className={cn(
                "w-full h-[90vh] sm:h-[85vh] sm:max-w-lg",
                "sm:rounded-2xl overflow-hidden",
                "shadow-2xl"
              )}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="sidebar-modal-title"
            >
              <Card className={cn(
                "h-full flex flex-col",
                "rounded-t-3xl sm:rounded-2xl",
                "border-t-4 border-primary/20 sm:border-t sm:border",
                "bg-background/95 backdrop-blur-xl",
                "overflow-hidden shadow-none"
              )}>
                {/* Modal Handle (Mobile) */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                  <div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 overflow-hidden">
                  <ModelSidebar
                    model={model}
                    onClose={onClose}
                    isSelected={isSelected}
                    onToggleSelect={onToggleSelect}
                  />
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarModal;