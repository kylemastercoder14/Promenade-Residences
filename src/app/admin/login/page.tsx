import { requireUnauth } from "@/lib/auth-utils";
import { LoginForm } from "@/components/forms/admin/login-form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

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
                  Welcome back!
                </p>

                <Image
                  src="/login.svg"
                  alt="Login Illustration"
                  width={150}
                  height={150}
                />

                <LoginForm />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Page;
