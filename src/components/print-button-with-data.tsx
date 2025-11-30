"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";
import { PrintView } from "./print-view";

interface PrintColumn {
  header: string;
  accessor: string | ((row: any) => string | number | null | undefined);
}

interface PrintButtonWithDataProps {
  title: string;
  description?: string;
  columns: PrintColumn[];
  data: any[];
}

export const PrintButtonWithData = ({
  title,
  description,
  columns,
  data
}: PrintButtonWithDataProps) => {
  const [showPrint, setShowPrint] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowPrint(true)}
        variant="primary"
        className="shrink-0 no-print"
      >
        <IconPrinter className="h-4 w-4" />
        <span>Print</span>
      </Button>

      {showPrint && (
        <PrintView
          title={title}
          description={description}
          columns={columns}
          data={data}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
};

