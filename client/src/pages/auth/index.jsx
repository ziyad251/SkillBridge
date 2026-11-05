import BrandLogo from "@/components/layout/brand-logo";
import DemoButton from "@/components/layout/demo-button";
import CommonForm from "@/components/common-form";
import { CertificateMock } from "@/components/landing/mocks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { DEMO_CREDENTIALS } from "@/context/auth-context";
import { ArrowLeft, Check, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const HIGHLIGHTS = [
  "Enroll with Razorpay (test mode)",
  "Progress saved lecture by lecture",
  "PDF certificate when you finish",
];

function DemoSection() {
  return (
    <div className="space-y-3">
      <DemoButton variant="outline" className="h-11 w-full rounded-lg border-[#0A0A0A]/30 font-semibold text-[#0A0A0A] hover:bg-[#0A0A0A]/5 hover:text-[#0A0A0A]">
        Try demo (no sign-up)
      </DemoButton>
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        or with email
        <span className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}

function AuthPage({
  signInFormData,
  setSignInFormData,
  signUpFormData,
  setSignUpFormData,
  handleRegisterUser,
  handleLoginUser,
}) {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("signin");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "signup") setActiveTab("signup");
  }, [searchParams]);

  function handleTabChange(value) {
    setActiveTab(value);
  }

  function checkIfSignInFormIsValid() {
    return (
      signInFormData &&
      signInFormData.userEmail !== "" &&
      signInFormData.password !== ""
    );
  }

  function checkIfSignUpFormIsValid() {
    return (
      signUpFormData &&
      signUpFormData.userName !== "" &&
      signUpFormData.userEmail !== "" &&
      signUpFormData.password !== ""
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 lg:flex-row">
      {/* Brand panel (desktop) */}
      <aside className="relative hidden w-[44%] max-w-[640px] flex-col justify-between overflow-hidden bg-[#0A0A0A] p-10 text-white lg:flex xl:p-14">
        <div aria-hidden="true" className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/[0.06]" />

        <div className="relative">
          <BrandLogo to="/" tone="light" />
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white xl:text-[2.75rem]">
            Learn job-ready skills. Track every step.
          </h1>
          <ul className="mt-8 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#0A0A0A]">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10 max-w-xs">
            <CertificateMock />
          </div>
        </div>

        <p className="relative text-sm text-white/60">Built by Mahammad Ziyad</p>
      </aside>

      {/* Form column */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between px-4 sm:px-8">
          <div className="lg:invisible">
            <BrandLogo to="/" />
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-[#0A0A0A]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
        </header>

        <main className="flex flex-1 items-start justify-center px-4 pb-12 pt-6 sm:items-center sm:px-8 sm:pt-0">
          <Tabs
            value={activeTab}
            defaultValue="signin"
            onValueChange={handleTabChange}
            className="w-full max-w-md"
          >
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-slate-200/60 p-1">
              <TabsTrigger value="signin" className="rounded-lg">Sign in</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg">Sign up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <Card className="mt-4 rounded-2xl border-slate-200/80 bg-white shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)]">
                <CardHeader className="space-y-1.5">
                  <CardTitle className="text-2xl text-[#171717]">Welcome back</CardTitle>
                  <CardDescription>Sign in to continue learning.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <DemoSection />
                  <CommonForm
                    formControls={signInFormControls}
                    buttonText={"Sign in"}
                    formData={signInFormData}
                    setFormData={setSignInFormData}
                    isButtonDisabled={!checkIfSignInFormIsValid()}
                    handleSubmit={handleLoginUser}
                  />
                  <p className="flex items-start gap-2 rounded-lg bg-[#0A0A0A]/5 px-3 py-2.5 text-xs text-slate-600">
                    <Info className="mt-px h-3.5 w-3.5 shrink-0 text-[#0A0A0A]" aria-hidden="true" />
                    <span>
                      Demo account: <span className="font-semibold text-slate-800">{DEMO_CREDENTIALS.userEmail}</span>
                    </span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup">
              <Card className="mt-4 rounded-2xl border-slate-200/80 bg-white shadow-[0_16px_40px_-20px_rgba(15,23,42,0.25)]">
                <CardHeader className="space-y-1.5">
                  <CardTitle className="text-2xl text-[#171717]">Create your account</CardTitle>
                  <CardDescription>It&apos;s free. Or skip sign-up and try the demo.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <DemoSection />
                  <CommonForm
                    formControls={signUpFormControls}
                    buttonText={"Create account"}
                    formData={signUpFormData}
                    setFormData={setSignUpFormData}
                    isButtonDisabled={!checkIfSignUpFormIsValid()}
                    handleSubmit={handleRegisterUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export default AuthPage;
