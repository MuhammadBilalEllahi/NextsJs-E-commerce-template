import { getAllBranches } from "@/database/data-service";
import { BranchLocations } from "@/components/branches/branch-locations";
import { BranchMap } from "@/components/branches/branch-map";
import { BranchInfo } from "@/components/branches/branch-info";

export default async function BranchesPage() {
  const branches = await getAllBranches();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/10 to-green-600/10"></div>
        <div className="container mx-auto px-4 py-8 lg:py-16 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-3 lg:px-4 py-2 rounded-full text-xs lg:text-sm font-medium mb-4 lg:mb-6">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Visit Our Branches
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-4 lg:mb-6">
              <span className="text-red-600">Find</span> Our{" "}
              <span className="text-green-600">Spice</span> Locations
            </h1>

            <p className="text-base lg:text-xl text-neutral-600 dark:text-neutral-300 mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
              Discover our branches across Lahore where you can experience the
              authentic taste of premium spices, pickles, and traditional
              flavors. Visit us for the freshest products and expert advice.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 lg:gap-4 text-xs lg:text-sm text-neutral-600 dark:text-neutral-400 px-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>4 Branches in Lahore</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Fresh Products Daily</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Expert Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 lg:pb-16">
        {/* Interactive Map Section */}
        <div className="mb-8 lg:mb-16">
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">
              Our <span className="text-red-600">Branch</span> Locations
            </h2>
            <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400 px-4">
              Click on any branch to see details and get directions
            </p>
          </div>
          <BranchMap branches={branches} />
        </div>

        {/* Branch Information Grid */}
        <div className="mb-8 lg:mb-16">
          <div className="text-center mb-6 lg:mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold mb-3 lg:mb-4">
              Branch <span className="text-green-600">Information</span>
            </h2>
            <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400 px-4">
              Detailed information about each of our branches
            </p>
          </div>
          <BranchInfo branches={branches} />
        </div>

        {/* Branch Locations Component */}
        {/* <div className="mb-8 lg:mb-16">
          <BranchLocations branches={branches} />
        </div> */}
      </div>
    </div>
  );
}
