import { RootProviders } from "@/lib/providers/rootProvider"

export default function ProvidersShell({ children }: { children: React.ReactNode }) {
  // Use this wrapper where needed to ensure providers wrap pages if root layout isn't customized.
  return <RootProviders>{children}</RootProviders>
}
