import { Calendar, Car, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CarOffer } from "@/lib/offers";

export function CurrentBookingUI({ booking }: { booking: CarOffer }) {
  // Mock booking data - can be replaced with real data from agent state later

  return (
    <div className="bg-background px-5 py-4">
      <div className="mx-auto max-w-md">
        <Card variant="normal">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="font-bold text-lg">Your Current Booking</CardTitle>
              <Badge variant="secondary" className="border-none bg-green-500/20 text-green-400">
                {booking.offer_availability_status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 px-5 pb-5">
            {/* Vehicle Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Car className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-card-foreground text-sm">{booking.car_info.title}</p>
                <p className="text-muted-foreground text-xs">{booking.car_info.subline}</p>
              </div>
            </div>

            {/* Pickup Location */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Pickup Location</p>
                <p className="font-semibold text-card-foreground text-sm">{booking.pickup_branch_id}</p>
              </div>
            </div>

            {/* Return Location */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <MapPin className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Return Location</p>
                <p className="font-semibold text-card-foreground text-sm">{booking.return_branch_id}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
                <Calendar className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Rental Period</p>
                <p className="font-semibold text-card-foreground text-sm">
                  {booking.pickup_datetime.value} - {booking.return_datetime.value}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mt-4 flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
              <span className="text-muted-foreground text-sm">Total Price</span>
              <span className="font-bold text-card-foreground text-lg">{booking.price_total.display_amount.value}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
