import { Phone, Mail, Clock } from "lucide-react";
import { ContactForm } from "./contact-form";

import { Branch } from "@/types";

interface ContactHeroProps {
  branches: Branch[];
}

export function ContactHero({ branches }: ContactHeroProps) {
  // Get the first branch for contact info, or use fallback
  const primaryBranch = branches[0];

  // Get business hours from the first branch or use default
  const getBusinessHours = () => {
    if (!primaryBranch?.openingHours) {
      return "Mon-Sat: 9AM-9PM\nSunday: 10AM-8PM";
    }

    const hours = primaryBranch.openingHours;
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
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/10 to-primary/10"></div>
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left side - Hero content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/90 text-primary dark:text-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
              Get in Touch with Dehli Mirch
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Spice</span> Up Your{" "}
              <span className="text-foreground">Conversation</span>
            </h1>

            <p className="text-xl text-foreground dark:text-foreground/40 mb-8 max-w-2xl mx-auto lg:mx-0">
              Have questions about our authentic spices, need help with your
              order, or want to share your culinary adventures? We're here to
              help you bring the heat to your kitchen!
            </p>

            {/* Quick Contact Info */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-primary/10 dark:border-primary/90">
                <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-foreground dark:text-foreground/40">
                  {primaryBranch?.phoneNumber || "+92 321 4375872"}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-primary/10 dark:border-primary/90">
                <Mail className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-sm text-foreground dark:text-foreground/40">
                  {primaryBranch?.email || "info@dehlimirchmasalajaat.com"}
                </p>
              </div>

              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-lg border border-primary/10 dark:border-primary/90">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Business Hours</h3>
                <p className="text-sm text-foreground dark:text-foreground/40 whitespace-pre-line">
                  {getBusinessHours()}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Contact Form */}
          <div className="lg:sticky lg:top-8">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
