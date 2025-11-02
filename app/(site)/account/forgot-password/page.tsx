"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { requestPasswordReset } from "@/lib/api/auth/password";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await requestPasswordReset(email);
      setIsSuccess(true);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">📧</div>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-4">Check Your Email</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              We&apos;ve sent a password reset link to <strong>{email}</strong>.
              Please check your email and click the link to reset your password.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> The reset link will expire in 5
                minutes for security reasons.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/account/login">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Send Another Email
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Reset Password
          </CardTitle>
          <p className="text-neutral-600 dark:text-neutral-400">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/account/login"
              className="text-sm text-red-600 hover:text-red-700 flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
