"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResidentFeedbackForm } from "@/features/feedback/components/resident-feedback-form";
import { cn } from "@/lib/utils";

export function FeedbackModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed z-50 rounded-full shadow-lg",
          "bg-[#327248] text-white hover:bg-[#28603c]",
          "transition-all duration-300 hover:scale-110",
          "flex items-center justify-center",
          // Mobile: smaller button, bottom-right with safe spacing
          "bottom-4 right-4 h-12 w-12 sm:bottom-6 sm:right-6 sm:h-14 sm:w-14"
        )}
        aria-label="Open feedback form"
      >
        <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
      </Button>

      {/* Feedback Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={cn(
          "max-w-3xl!",
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              "text-xl sm:text-2xl font-semibold text-[#1d402a]",
              "leading-tight"
            )}>
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className={cn(
              "text-xs sm:text-sm text-[#4c5b51]",
              "mt-1.5 sm:mt-2"
            )}>
              We value your input. Help us improve the Promenade experience by sharing your thoughts, concerns, or suggestions.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className={cn(
            "flex-1",
            "overflow-y-auto"
          )}>
            <div>
              <ResidentFeedbackForm onSuccess={() => setIsOpen(false)} variant="modal" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

