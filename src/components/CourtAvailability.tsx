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
  const { courts, locations, loading: courtsLoading } = useFirestoreCourts();
  const loading = bookingsLoading || courtsLoading;
  const t = translations[lang].court;

  const sahaLoc = locations?.find(l => l.id === "saha");
  const dorayLoc = locations?.find(l => l.id === "doray_bay");
  
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
    <section id="courts" className="py-20 relative overflow-hidden bg-background">
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-accent/10 text-accent tracking-wider uppercase">
              {t.title || "Court Availability"}
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-black mt-3 tracking-tight dark:text-white">
              {lang === "en" ? "Book Padel Courts" : "حجز ملاعب البادل"}
            </h2>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal h-12 px-4 rounded-xl border-border bg-card hover:bg-muted/50 transition-colors shadow-sm min-w-[240px]",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
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
          <div className="space-y-12">
            <div className="flex flex-col items-center text-center space-y-3 pb-2">
              <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-indigo-950 via-primary to-accent dark:from-indigo-200 dark:via-sky-400 dark:to-teal-300 bg-clip-text text-transparent py-1">
                {sahaLoc?.title[lang] || t.sahaCourts}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent dark:from-sky-500 dark:to-teal-400 rounded-full shadow-[0_0_12px_rgba(25,186,134,0.4)] animate-pulse" />
            </div>

            {/* Saha Courts Location Banner */}
            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative shadow-lg group border border-border/50 bg-muted/10">
              <img 
                src={sahaLoc?.image || "/saha_court.png"} 
                alt={sahaLoc?.title[lang] || t.sahaCourts} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-white font-heading text-xs md:text-sm font-bold bg-accent text-accent-foreground px-4 py-1.5 rounded-full w-fit shadow-md border border-accent/20">
                  📍 {sahaLoc?.title[lang] || t.sahaLocation || "Saha Arena"}
                </span>
                <p className="text-white/80 text-xs md:text-sm mt-2 font-body max-w-xl">
                  {sahaLoc?.description[lang] || t.sahaDescription || "Modern indoor facilities with world-class padel courts."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {([1, 2] as const).filter(cId => {
                const c = courts.find(court => court.id === cId);
                return c ? c.isVisible : true;
              }).map(renderCourtCard)}
            </div>

            <div className="flex flex-col items-center text-center space-y-3 pt-4 pb-2">
              <h3 className="font-heading text-3xl md:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-400 bg-clip-text text-transparent py-1">
                {dorayLoc?.title[lang] || t.rasElBarCourts}
              </h3>
              <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-amber-500 dark:from-emerald-400 dark:to-amber-400 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse" />
            </div>

            {/* Doray Bay Ras Elbar Courts Location Banner */}
            <div className="w-full h-48 md:h-64 rounded-2xl overflow-hidden relative shadow-lg group border border-border/50 bg-muted/10">
              <img 
                src={dorayLoc?.image || "/doray_bay_court.png"} 
                alt={dorayLoc?.title[lang] || t.rasElBarCourts} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                <span className="text-white font-heading text-xs md:text-sm font-bold bg-amber-500 text-white px-4 py-1.5 rounded-full w-fit shadow-md border border-amber-400/20">
                  📍 {dorayLoc?.title[lang] || t.rasLocation || "Doray Bay"}
                </span>
                <p className="text-white/80 text-xs md:text-sm mt-2 font-body max-w-xl">
                  {dorayLoc?.description[lang] || t.rasDescription || "Premium outdoor courts with refreshing sea breeze."}
                </p>
              </div>
            </div>

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
