import { Calendar, MapPin } from "lucide-react";
import { CarOfferCardContent } from "@/client/components/CarOfferCard.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Offer } from "@/lib/sixt/types";
import { PriceDisplay } from "@/client/components/ui-elements/PriceDisplay.tsx";

export function CurrentBookingUI({ booking }: { booking: Offer }) {
  return (
    <Card variant="normal">
      <CardHeader className="pb-3">
        <CardTitle className="font-bold text-[#ff5000] text-lg">Your Current Booking</CardTitle>
      </CardHeader>

      <div className="mt-[-15px]" />

      <CarOfferCardContent offer={booking} />

      <CardContent className="space-y-4 px-5 pb-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <MapPin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Pickup Location</p>
              <p className="font-semibold text-card-foreground text-sm">{booking.pickup_branch_id}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
              <MapPin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Return Location</p>
              <p className="font-semibold text-card-foreground text-sm">{booking.return_branch_id}</p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Calendar className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Rental Period</p>
            <p className="font-semibold text-card-foreground text-sm">
              {new Date(booking.pickup_datetime.value).toLocaleString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}{" "}
              -{" "}
              {new Date(booking.return_datetime.value).toLocaleString("de-DE", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
          <span className="text-muted-foreground text-sm">Total Price</span>
          <PriceDisplay price={booking.price_total} displaySuffix={false} />
        </div>
      </CardContent>
    </Card>
  );
}
