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
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg",
          "bg-[#327248] text-white hover:bg-[#28603c]",
          "transition-all duration-300 hover:scale-110",
          "flex items-center justify-center"
        )}
        aria-label="Open feedback form"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Feedback Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl! max-h-[83vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            <DialogTitle className="text-2xl font-semibold text-[#1d402a]">
              Share Your Feedback
            </DialogTitle>
            <DialogDescription className="text-sm text-[#4c5b51]">
              We value your input. Help us improve the Promenade experience by sharing your thoughts, concerns, or suggestions.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 px-6">
            <div className="pr-4 pb-6">
              <ResidentFeedbackForm onSuccess={() => setIsOpen(false)} variant="modal" />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

