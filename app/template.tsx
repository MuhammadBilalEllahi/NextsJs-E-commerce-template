import ProvidersShell from "@/lib/providers/providers-shell"

export default function Template({ children }: { children: React.ReactNode }) {
  // Ensures client providers wrap any route in this segment
  return <ProvidersShell>{children}</ProvidersShell>
}
