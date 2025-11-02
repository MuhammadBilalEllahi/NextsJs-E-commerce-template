import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { WhatsAppConfigCard } from "@/components/admin/whatsapp-config/whatsapp-config-card";

export default async function WhatsAppConfigPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/unauthorized");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            WhatsApp Configuration
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configure WhatsApp Business API settings for order notifications
          </p>
        </div>

        <WhatsAppConfigCard />
      </div>
    </div>
  );
}

