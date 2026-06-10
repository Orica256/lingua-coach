import { Logo } from "@/components/brand";
import { GridGlow } from "@/components/decor";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-10">
      <GridGlow />
      <div className="mb-8">
        <Logo size="lg" />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
