import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface Branch {
  _id: string;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  logo?: string;
  branchNumber: string;
  location: string;
  city: string;
  state: string;
  openingHours: {
    monday: { open: string; close: string; isOpen: boolean };
    tuesday: { open: string; close: string; isOpen: boolean };
    wednesday: { open: string; close: string; isOpen: boolean };
    thursday: { open: string; close: string; isOpen: boolean };
    friday: { open: string; close: string; isOpen: boolean };
    saturday: { open: string; close: string; isOpen: boolean };
    sunday: { open: string; close: string; isOpen: boolean };
  };
}

interface BranchLocationsProps {
  branches: Branch[];
}

export function BranchLocations({ branches }: BranchLocationsProps) {
  const formatBusinessHours = (branch: Branch) => {
    if (!branch.openingHours) return "Contact for hours";

    const hours = branch.openingHours;
    const weekdays = [
      hours.monday,
      hours.tuesday,
      hours.wednesday,
      hours.thursday,
      hours.friday,
    ];
    const weekend = [hours.saturday, hours.sunday];

    // Check if all weekdays have the same hours
    const weekdayHours = weekdays[0];
    const isWeekdayUniform = weekdays.every(
      (day) =>
        day.isOpen === weekdayHours.isOpen &&
        day.open === weekdayHours.open &&
        day.close === weekdayHours.close
    );

    // Check if weekend has the same hours
    const weekendHours = weekend[0];
    const isWeekendUniform = weekend.every(
      (day) =>
        day.isOpen === weekendHours.isOpen &&
        day.open === weekendHours.open &&
        day.close === weekendHours.close
    );

    if (
      isWeekdayUniform &&
      isWeekendUniform &&
      weekdayHours.isOpen &&
      weekendHours.isOpen
    ) {
      return `Mon-Fri: ${weekdayHours.open}-${weekdayHours.close}\nSat-Sun: ${weekendHours.open}-${weekendHours.close}`;
    }

    // If hours are different, show a simplified version
    return "Mon-Sat: 9AM-9PM\nSunday: 10AM-8PM";
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">
          Visit Our <span className="text-red-600">Spice</span> Locations
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          Experience the authentic flavors at our physical stores
        </p>
      </div>

      {branches && branches.length > 0 ? (
        <div className="space-y-6">
          {branches.slice(0, 3).map((branch: Branch) => (
            <Card
              key={branch._id}
              className="shadow-lg border border-red-100 dark:border-red-900/30 hover:shadow-xl transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={branch.logo || "/placeholder.svg"}
                      alt={branch.name}
                      className="w-16 h-16 object-contain rounded-lg ring-1 ring-red-200 dark:ring-red-800"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-lg">{branch.name}</h3>
                      <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold px-2 py-1 rounded-full">
                        Branch {branch.branchNumber}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-red-600" />
                        <span>
                          {branch.address}, {branch.city}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-red-600" />
                        <a
                          href={`tel:${branch.phoneNumber}`}
                          className="hover:text-red-600 transition-colors"
                        >
                          {branch.phoneNumber}
                        </a>
                      </div>

                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-red-600" />
                        <a
                          href={`mailto:${branch.email}`}
                          className="hover:text-red-600 transition-colors"
                        >
                          {branch.email}
                        </a>
                      </div>

                      <div className="flex items-start gap-2">
                        <Clock className="h-4 w-4 text-red-600 mt-0.5" />
                        <span className="whitespace-pre-line">
                          {formatBusinessHours(branch)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Link
                        href={branch.location}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                      >
                        <MapPin className="h-4 w-4" />
                        Get Directions
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="shadow-lg border border-red-100 dark:border-red-900/30">
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Main Location</h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              17-B-1, Shop No. 4, Chowdry Chowk, College Road, Township, Lahore,
              Pakistan
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Phone:</strong> +92 321 4375872
              </p>
              <p>
                <strong>Email:</strong> info@dehlimirchmasalajaat.com
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
