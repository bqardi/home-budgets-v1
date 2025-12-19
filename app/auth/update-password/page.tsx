import { UpdatePasswordForm } from "@/components/update-password-form";
import { MainHeader } from "@/components/header";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      <MainHeader />
      <div className="flex flex-1 w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <UpdatePasswordForm />
        </div>
      </div>
      <Footer />
    </div>
  );
}
