"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function FullCalendarWrapper(props: any) {
  return (
    <FullCalendar
      {...props}
      plugins={[dayGridPlugin, interactionPlugin]}
    />
  );
}

