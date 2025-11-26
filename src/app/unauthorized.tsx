import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from 'next/image';

export default function Forbidden() {
  return (
    <main className="flex grow min-h-screen items-center justify-center px-4 text-center">
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <Image src="/warning.svg" alt='Warning' width={150} height={150} />
          <h1 className="text-2xl font-semibold mt-5">403 Forbidden</h1>
          <p className="text-muted-foreground">
            You don&apos;t have permission to access this page.
          </p>
        </div>
        <div>
          <Button asChild variant="primary">
            <Link href="/">Go back home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
