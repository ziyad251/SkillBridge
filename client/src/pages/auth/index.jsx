import BrandLogo from "@/components/layout/brand-logo";
import CommonForm from "@/components/common-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signInFormControls, signUpFormControls } from "@/config";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

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
    <div className="lms-page-shell lms-gradient-hero flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl lg:px-6">
        <div className="mx-auto flex h-14 max-w-7xl items-center">
          <BrandLogo to="/" />
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <Tabs
          value={activeTab}
          defaultValue="signin"
          onValueChange={handleTabChange}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <Card className="mt-4 border-border/60 bg-card/80 shadow-xl shadow-indigo-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Sign in to your account</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={"Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!checkIfSignInFormIsValid()}
                  handleSubmit={handleLoginUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="mt-4 border-border/60 bg-card/80 shadow-xl shadow-indigo-500/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle>Create a new account</CardTitle>
                <CardDescription>
                  Enter your details to get started
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={"Sign Up"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!checkIfSignUpFormIsValid()}
                  handleSubmit={handleRegisterUser}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AuthPage;
