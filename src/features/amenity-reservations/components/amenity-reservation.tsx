/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { ReservationForm } from "./form";
import { useSuspenseAmenityReservation } from '@/features/amenity-reservations/hooks/use-amenity-reservations';

export const AmenityReservation = ({ amenityReservationId }: { amenityReservationId: string }) => {
  const isCreate = amenityReservationId === "create";

  // If creating → do NOT fetch
  const amenityReservation = isCreate ? null : useSuspenseAmenityReservation(amenityReservationId).data;

  return (
	<div>
	  {isCreate ? (
		<ReservationForm initialData={null} />
	  ) : (
		<ReservationForm initialData={amenityReservation} />
	  )}
	</div>
  );
};
