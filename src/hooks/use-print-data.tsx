"use client";

import { useState } from "react";
import { PrintView } from "@/components/print-view";

interface PrintColumn {
  header: string;
  accessor: string | ((row: any) => string | number | null | undefined);
}

interface UsePrintDataProps {
  title: string;
  description?: string;
  columns: PrintColumn[];
  data: any[];
}

export const usePrintData = ({ title, description, columns, data }: UsePrintDataProps) => {
  const [showPrint, setShowPrint] = useState(false);

  const handlePrint = () => {
    setShowPrint(true);
  };

  const PrintComponent = showPrint ? (
    <PrintView
      title={title}
      description={description}
      columns={columns}
      data={data}
      onClose={() => setShowPrint(false)}
    />
  ) : null;

  return {
    handlePrint,
    PrintComponent,
  };
};

