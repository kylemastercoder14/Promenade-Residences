"use client";

import {
  useCalendar,
  useCalendarCell,
  useCalendarGrid,
  useLocale,
} from "react-aria";
import { useCalendarState, type CalendarState } from "react-stately";
import {
  CalendarDate,
  createCalendar,
  DateDuration,
  endOfMonth,
  getLocalTimeZone,
  getWeeksInMonth,
  isSameMonth,
  isToday,
} from "@internationalized/date";
import { CalendarProps, DateValue } from "@react-types/calendar";
import { FocusableElement, DOMAttributes } from "@react-types/shared";
import { useButton, type AriaButtonProps } from "@react-aria/button";
import { useDateFormatter } from "@react-aria/i18n";
import { VisuallyHidden } from "@react-aria/visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mergeProps } from "@react-aria/utils";
import { useFocusRing } from "@react-aria/focus";
import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReservationIndicator = {
  date: string; // yyyy-MM-dd format
  reservations: Array<{
    amenity: string; // Amenity type (COURT, GAZEBO, PARKING_AREA)
    startTime: string; // Start time (e.g., "10:00")
    endTime: string; // End time (e.g., "15:00")
  }>;
};

export const CalendarCell = ({
  state,
  date,
  currentMonth,
  size,
  reservations,
}: {
  state: CalendarState;
  date: CalendarDate;
  currentMonth: CalendarDate;
  size: "dashboard" | "reservation-admin";
  reservations?: Map<string, ReservationIndicator>;
}) => {
  const ref = useRef(null);
  const { cellProps, buttonProps, isSelected, isDisabled, formattedDate } =
    useCalendarCell({ date }, state, ref);
  const { focusProps, isFocusVisible } = useFocusRing();

  const isDateToday = isToday(date, getLocalTimeZone());
  const isOutsideOfMonth = !isSameMonth(currentMonth, date);

  // Get reservations for this date
  const dateKey = `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  const dateReservations = reservations?.get(dateKey);
  const hasReservations = dateReservations && dateReservations.reservations.length > 0;

  // Format time from 24h to 12h format
  const formatTime = (time24: string) => {
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get the first reservation for display (or combine if multiple)
  const displayReservation = hasReservations
    ? dateReservations.reservations[0]
    : null;

  // Get badge color based on amenity type (matching legend colors)
  const getBadgeColor = (amenity: string) => {
    switch (amenity) {
      case "COURT":
        return isSelected ? "bg-blue-500 text-white" : "bg-blue-500 text-white";
      case "GAZEBO":
        return isSelected ? "bg-green-500 text-white" : "bg-green-500 text-white";
      case "PARKING_AREA":
        return isSelected ? "bg-purple-500 text-white" : "bg-purple-500 text-white";
      default:
        return isSelected ? "bg-gray-500 text-white" : "bg-gray-500 text-white";
    }
  };

  return (
    <td
      {...cellProps}
      className={`p-1 ${size === "dashboard" ? "p-1" : "p-3"} relative ${isFocusVisible ? "z-10" : "z-0"}`}
    >
      <div
        {...mergeProps(buttonProps, focusProps)}
        ref={ref}
        hidden={isOutsideOfMonth}
        className={`${size === "dashboard" ? "size-12" : "size-23"} outline-none group rounded-md`}
      >
        <div
          className={cn(
            "size-full rounded-sm flex items-center justify-center text-sm font-semibold relative",
            isSelected ? "bg-[#327248] text-white" : "",
            isDisabled ? "text-muted-foreground cursor-not-allowed" : "",
            !isSelected && !isDisabled ? "hover:bg-[#327248]/10" : ""
          )}
        >
          {formattedDate}
          {isDateToday && !hasReservations && (
            <div
              className={cn(
                "absolute left-1/2 transform -translate-x-1/2 size-1.5 bg-[#327248] rounded-full",
                isSelected ? "bg-white" : "",
                size === "dashboard" ? "bottom-3" : "bottom-8"
              )}
            />
          )}
          {/* Reservation badge */}
          {hasReservations && displayReservation && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute left-1/2 transform -translate-x-1/2 text-[8px] px-1 py-0 h-auto font-semibold",
                getBadgeColor(displayReservation.amenity),
                size === "dashboard" ? "bottom-1 text-[7px]" : "bottom-2",
                "max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap"
              )}
              title={`${displayReservation.amenity} (${formatTime(displayReservation.startTime)} - ${formatTime(displayReservation.endTime)})`}
            >
              {formatTime(displayReservation.startTime)} - {formatTime(displayReservation.endTime)}
            </Badge>
          )}
        </div>
      </div>
    </td>
  );
};

export const CalendarGrid = ({
  state,
  offset = {},
  size,
  reservations,
}: {
  state: CalendarState;
  offset?: DateDuration;
  size: "dashboard" | "reservation-admin";
  reservations?: Map<string, ReservationIndicator>;
}) => {
  const startDate = state.visibleRange.start.add(offset);
  const endDate = endOfMonth(startDate);
  const { locale } = useLocale();
  const { gridProps, headerProps, weekDays } = useCalendarGrid(
    {
      startDate,
      endDate,
      weekdayStyle: "short",
    },
    state
  );
  const weeksInMonth = getWeeksInMonth(startDate, locale);
  return (
    <table {...gridProps} cellPadding={0} className="flex-1">
      <thead {...headerProps} className="text-sm font-medium">
        <tr>
          {weekDays.map((day, index) => (
            <th key={index}>{day}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[...new Array(weeksInMonth).keys()].map((weekIndex) => (
          <tr key={weekIndex}>
            {state
              .getDatesInWeek(weekIndex)
              .map((date, i) =>
                date ? (
                  <CalendarCell
                    currentMonth={startDate}
                    key={i}
                    state={state}
                    date={date}
                    size={size}
                    reservations={reservations}
                  />
                ) : (
                  <td key={i} />
                )
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export const CalendarButton = (
  props: AriaButtonProps<"button"> & {
    state?: CalendarState;
    side?: "left" | "right";
  }
) => {
  const ref = useRef(null);
  const { buttonProps } = useButton(props, ref);
  const { focusProps } = useFocusRing();
  return (
    <Button
      variant="outline"
      ref={ref}
      disabled={props.isDisabled}
      size="icon"
      {...mergeProps(buttonProps, focusProps)}
    >
      {props.children}
    </Button>
  );
};

interface CalendarHeaderProps {
  state: CalendarState;
  calendarProps: DOMAttributes<FocusableElement>;
  prevButtonProps: AriaButtonProps<"button">;
  nextButtonProps: AriaButtonProps<"button">;
}

export const CalendarHeader = ({
  state,
  calendarProps,
  prevButtonProps,
  nextButtonProps,
}: CalendarHeaderProps) => {
  const monthFormatter = useDateFormatter({
    month: "short",
    year: "numeric",
    timeZone: state.timeZone,
  });

  const [monthName, _, year] = monthFormatter
    .formatToParts(state.visibleRange.start.toDate(state.timeZone))
    .map((part) => part.value);

  return (
    <div className="flex items-center pb-4">
      <VisuallyHidden>
        <h2>{calendarProps["aria-label"]}</h2>
      </VisuallyHidden>

      <h2 className="font-semibold flex-1">
        {monthName}{" "}
        <span className="text-muted-foreground text-sm font-medium">
          {year}
        </span>
      </h2>
      <div className="flex items-center gap-2">
        <CalendarButton {...prevButtonProps} side="left">
          <ChevronLeftIcon className="size-4" />
        </CalendarButton>
        <CalendarButton {...nextButtonProps} side="right">
          <ChevronRightIcon className="size-4" />
        </CalendarButton>
      </div>
    </div>
  );
};

interface CustomCalendarProps extends CalendarProps<DateValue> {
  size?: "dashboard" | "reservation-admin";
  reservations?: Map<string, ReservationIndicator>;
}

export const CustomCalendar = ({
  size = "dashboard",
  reservations,
  ...calendarProps
}: CustomCalendarProps) => {
  const { locale } = useLocale();

  const state = useCalendarState({
    ...calendarProps,
    visibleDuration: { months: 1 },
    locale,
    createCalendar,
  });

  const {
    calendarProps: cp,
    prevButtonProps,
    nextButtonProps,
  } = useCalendar(calendarProps, state);

  return (
    <div {...cp} className="inline-block">
      <CalendarHeader
        state={state}
        calendarProps={cp}
        prevButtonProps={prevButtonProps}
        nextButtonProps={nextButtonProps}
      />

      <div className="flex gap-8">
        <CalendarGrid size={size} state={state} reservations={reservations} />
      </div>
    </div>
  );
};
