import { Logo } from "@/components/brand";
import { GridGlow } from "@/components/decor";

export default function OnboardingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col px-6 py-10">
      <GridGlow />
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
