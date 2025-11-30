"use client";

import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";

export const PrintButton = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button onClick={handlePrint} variant="primary" className="shrink-0 no-print">
      <IconPrinter className="h-4 w-4" />
      <span>Print</span>
    </Button>
  );
};
