"use client";

// This wrapper component uses standard imports as per FullCalendar React docs
// https://fullcalendar.io/docs/react
// @ts-expect-error - FullCalendar packages may not have type declarations
import FullCalendar from "@fullcalendar/react";
// @ts-expect-error - FullCalendar packages may not have type declarations
import dayGridPlugin from "@fullcalendar/daygrid";
// @ts-expect-error - FullCalendar packages may not have type declarations
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

