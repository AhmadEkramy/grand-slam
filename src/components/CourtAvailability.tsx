import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, MapPin, CalendarDays, Loader2 } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useFirestoreBookings } from "@/hooks/useFirestoreBookings";
import { useFirestoreCourts } from "@/hooks/useFirestoreCourts";
import { translations } from "@/lib/translations";
import { cn, formatHour, formatLocalDate, normalizeDateString } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  onSelectSlot: (court: 1 | 2 | 3 | 4, hour: number, date: string) => void;
}

const courtConfig = {
  1: { gradient: "gradient-accent", iconColor: "text-accent-foreground", labelKey: "court1" as const },
  2: { gradient: "gradient-accent", iconColor: "text-accent-foreground", labelKey: "court2" as const },
  3: { gradient: "bg-gradient-to-r from-emerald-500 to-green-600", iconColor: "text-white", labelKey: "court3" as const },
  4: { gradient: "bg-gradient-to-r from-amber-500 to-orange-500", iconColor: "text-white", labelKey: "court4" as const },
};

export default function CourtAvailability({ onSelectSlot }: Props) {
  const { lang } = useAppStore();
  const { bookings, loading: bookingsLoading } = useFirestoreBookings();
  const { courts, loading: courtsLoading } = useFirestoreCourts();
  const loading = bookingsLoading || courtsLoading;
  const t = translations[lang].court;
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = formatLocalDate(selectedDate);

  const getBookedHours = (court: 1 | 2 | 3 | 4) => {
    const hours = new Set<number>();
    bookings
      .filter((b) => b.court === court && normalizeDateString(b.date) === dateStr && b.status !== "rejected" && b.status !== "cancelled")
      .forEach((b) => {
        for (let h = b.startHour; h < b.endHour; h++) {
          hours.add(h);
        }
      });
    return hours;
  };

  // Hours ordered: 1 PM through 4 AM next morning
  const orderedHours = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28];

  const getCourtName = (court: 1 | 2 | 3 | 4) => {
    const courtStatus = courts.find(c => c.id === court);
    if (courtStatus?.customTitle?.[lang]) {
      return courtStatus.customTitle[lang];
    }
    // Fall back to default translations
    return t[courtConfig[court].labelKey];
  };

  const renderCourtCard = (court: 1 | 2 | 3 | 4) => {
    const booked = getBookedHours(court);
    const config = courtConfig[court];
    return (
      <div key={court} className="card-elevated overflow-hidden">
        <div className={`${config.gradient} px-6 py-4 flex items-center gap-2`}>
          <MapPin className={`h-5 w-5 ${config.iconColor}`} />
          <h3 className={`font-heading text-xl font-bold ${config.iconColor}`}>
            {getCourtName(court)}
          </h3>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            <span className="text-sm font-medium">{t.selectTime || "Select Time"}</span>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {orderedHours.map((h) => {
              const isBooked = booked.has(h);
              return (
                <button
                  key={h}
                  disabled={isBooked}
                  onClick={() => onSelectSlot(court, h, dateStr)}
                  className={cn(
                    "py-2.5 px-2 rounded-lg text-sm font-medium transition-all duration-300 border-2",
                    isBooked
                      ? "border-destructive/40 text-destructive bg-destructive/5 cursor-not-allowed opacity-80"
                      : court === 3
                        ? "border-emerald-400/40 text-foreground bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/15 cursor-pointer"
                        : court === 4
                          ? "border-amber-400/40 text-foreground bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/15 cursor-pointer"
                          : "border-accent/40 text-foreground bg-accent/5 hover:border-accent hover:bg-accent/15 hover:glow-accent cursor-pointer"
                  )}
                >
                  {formatHour(h)}
                </button>
              );
            })}
          </div>

          <div className="flex gap-6 mt-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className={cn(
                "w-3 h-3 rounded-full border",
                court === 3
                  ? "bg-emerald-400/40 border-emerald-500"
                  : court === 4
                    ? "bg-amber-400/40 border-amber-500"
                    : "bg-accent/40 border-accent"
              )} />
              {t.available}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-destructive/30 border border-destructive" />
              {t.booked}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-3xl md:text-4xl font-bold text-center mb-3">
          {t.title}
        </h2>
        <p className="text-center text-muted-foreground mb-6">
          {format(selectedDate, "EEEE, MMMM d, yyyy")}
        </p>

        {/* Date Picker */}
        <div className="flex justify-center mb-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[220px] justify-between text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                {format(selectedDate, "MM/dd/yyyy")}
                <CalendarIcon className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && setSelectedDate(d)}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <span className="ml-3 text-muted-foreground">Loading court availability...</span>
          </div>
        )}

        {/* Courts */}
        {!loading && (
          <div className="space-y-10">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-center text-foreground">
              {t.sahaCourts}
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {([1, 2] as const).filter(cId => {
                const c = courts.find(court => court.id === cId);
                return c ? c.isVisible : true;
              }).map(renderCourtCard)}
            </div>

            <h3 className="font-heading text-2xl md:text-3xl font-bold text-center text-foreground mt-12">
              {t.rasElBarCourts}
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {([3, 4] as const).filter(cId => {
                const c = courts.find(court => court.id === cId);
                return c ? c.isVisible : true;
              }).map(renderCourtCard)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
