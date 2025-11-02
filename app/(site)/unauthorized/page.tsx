import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowLeft } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <div className="mb-6">
          <Shield className="mx-auto h-16 w-16 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact an administrator if you believe this is an error.
        </p>
        <div className="space-y-3">
          <Link href="/">
            <Button className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/account/login">
            <Button variant="outline" className="w-full">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}













