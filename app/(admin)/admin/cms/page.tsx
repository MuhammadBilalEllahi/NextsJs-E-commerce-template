import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function CMSAdminPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Connect Your CMS</CardTitle>
          <CardDescription>Choose a headless CMS and wire product and blog content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded border p-4">
              <div className="font-semibold">Sanity</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Real-time content editing and structured content schemas.
              </p>
              <div className="mt-2 flex gap-2">
                <Link href="https://www.sanity.io" target="_blank" className="text-red-600 underline">
                  Docs
                </Link>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700"
                >
                  <a href="#!">Connect</a>
                </Button>
              </div>
            </div>
            <div className="rounded border p-4">
              <div className="font-semibold">Strapi</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Self-hosted Node.js headless CMS with role-based access.
              </p>
              <div className="mt-2 flex gap-2">
                <Link href="https://strapi.io" target="_blank" className="text-red-600 underline">
                  Docs
                </Link>
                <Button
                  asChild
                  className="bg-green-600 hover:bg-green-700"
                >
                  <a href="#!">Connect</a>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded border p-4">
            <div className="font-semibold mb-2">Wiring Guide</div>
            <ol className="list-decimal pl-5 space-y-1 text-sm">
              <li>Create schemas for Product and Blog in your CMS.</li>
              <li>Expose read APIs (REST or GraphQL) and add environment variables.</li>
              <li>Replace lib/data.ts functions with fetch calls to your CMS.</li>
              <li>Revalidate listing pages on content publish.</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
