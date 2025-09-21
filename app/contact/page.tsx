import { getAllBranches } from "@/database/data-service";
import { BranchLocations } from "@/components/contact/branch-locations";
import { ContactHero } from "@/components/contact/contact-hero";
import StackedCards from "@/components/home/BranchSlidableCard";
import { HomeShopLocations } from "@/components/home/home-shops-preview";

export default async function ContactPage() {
  const branches = await getAllBranches();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Hero Section */}
      <ContactHero branches={branches} />

      <div className="container mx-auto px-4 pb-16">
        {/* All Branches Section */}
        {branches && branches.length > 3 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                All Our <span className="text-red-600">Spice</span> Locations
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Scroll through all our branches to find the one nearest to you
              </p>
            </div>
            <div className="hidden md:block">
              <HomeShopLocations shopLocation={branches} />
            </div>
            <div className="md:hidden">
              <StackedCards branches={branches} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
