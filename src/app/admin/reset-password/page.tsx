import { requireUnauth } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ResetPasswordForm } from "@/components/forms/admin/reset-password";
import Link from "next/link";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token: string }>;
}

const Page = async ({ searchParams }: ResetPasswordPageProps) => {
  await requireUnauth();
  const { token } = await searchParams;

  if (!token) {
    return (
      <div className="h-screen bg-zinc-100 w-full overflow-hidden flex items-center justify-center">
        <div className="max-w-7xl w-full mx-auto px-5">
          <Card className="w-full">
            <CardContent className="px-5 py-10 text-center">
              <Image
                src="/warning.svg"
                alt="Error Illustration"
                width={150}
                height={150}
                className="mx-auto"
              />
              <p className="text-lg mt-5 font-semibold">
                Invalid or missing token.
              </p>
              <p className="mt-2 mb-5 text-sm text-muted-foreground">
                Please check the link you used or request a new password reset.
              </p>
              <Link
                href="/admin/forgot-password"
                className="text-primary text-sm hover:underline font-medium"
              >
                Request a new password reset &rarr;
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  return (
    <div className="h-screen bg-zinc-100 w-full overflow-hidden flex items-center justify-center">
      <div className="max-w-7xl w-full mx-auto">
        <Card className="w-full">
          <CardContent className="px-5 py-1">
            <div className="w-full h-full grid lg:grid-cols-2 gap-0">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/auth-slider/1.png"
                  alt="Slide 1"
                  fill
                  className="object-cover"
                  priority={true}
                />
              </div>

              {/* Form Section */}
              <div className="relative max-w-lg m-auto w-full flex flex-col items-center px-5 py-8">
                <p className="mt-4 text-xl font-semibold tracking-tight">
                  Reset your password
                </p>
                <p className="mt-1 mb-5 text-sm text-muted-foreground">
                  Enter your new password below to regain access to your
                  account.
                </p>

                <Image
                  src="/reset.svg"
                  alt="Reset Password Illustration"
                  className='mb-4'
                  width={200}
                  height={200}
                />

                <ResetPasswordForm token={token} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
