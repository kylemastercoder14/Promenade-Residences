import { requireUnauth } from "@/lib/auth-utils";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { ForgotPasswordForm } from "@/components/forms/admin/forgot-password";

const Page = async () => {
  await requireUnauth();
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
                  Forgot your password?
                </p>
                <p className="mt-1 mb-5 text-sm text-muted-foreground">
                  Enter your email address and we&apos;ll send you a link to reset your
				  password.
                </p>

                <Image
                  src="/forgot.svg"
                  alt="Forgot Password Illustration"
                  width={200}
                  height={200}
                />

                <ForgotPasswordForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
