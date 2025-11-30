"use client";

import { Card, CardContent } from "@/components/ui/card";
import { AdminInteractiveMap } from "./admin-interactive-map";

export const Client = () => {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="w-full h-[70vh]">
          <AdminInteractiveMap />
        </div>
      </CardContent>
    </Card>
  );
};
