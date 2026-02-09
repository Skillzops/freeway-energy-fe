import { Suspense, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Input } from "@/Components/InputComponent/Input";
import ProceedButton from "@/Components/ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "@/utils/useApiCall";
import Cookies from "js-cookie";
import LoadingSpinner from "@/Components/Loaders/LoadingSpinner";
import { useIsLoggedIn } from "@/utils/helpers";
import { toast } from "react-toastify";
import eyeclosed from "@/assets/eyeclosed.svg";
import eyeopen from "@/assets/eyeopen.svg";
import { brandAssets } from "@/config/brandConfig";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const emailOrPhoneSchema = z
  .string()
  .trim()
  .refine(
    (val) =>
      /.+@.+\..+/.test(val) ||
      /^\+?[0-9\s().-]{7,20}$/.test(val.replace(/\s+/g, "")),
    { message: "Enter a valid email or phone number" }
  );

const forgotPasswordSchema = z.object({
  email: emailOrPhoneSchema,
});

type LoginFormData = z.infer<typeof loginSchema>;

const defaultLoginFormData: LoginFormData = {
  email: "",
  password: "",
};

const AgentLoginPage = () => {
  const brandLogo = brandAssets.logoFull;
  const brandBg = brandAssets.authBackgrounds.agent;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { apiCall } = useApiCall();
  const [formData, setFormData] = useState<LoginFormData>(defaultLoginFormData);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<z.ZodIssue[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);

  useIsLoggedIn("/home");

  const redirectPath = searchParams.get("redirect");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    resetFormErrors(name);
  };

  const resetFormErrors = (name: string) => {
    setFormErrors((prev) => prev.filter((error) => error.path[0] !== name));
    setApiError(null);
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse(formData);
      const response = await apiCall({
        endpoint: "/v1/auth/login",
        method: "post",
        data: validatedData,
        successMessage: "",
      });

      const userData = {
        token: response.headers.access_token,
        ...response.data,
      };

      if(userData?.role?.role !== "AssignedAgent"){
        toast.error("Unauthorized login attempt")
        return
      }

      if(userData?.agentDetails?.category !== "SALES"){
        toast.error("Unauthorized login attempt")
        return
      }

      console.log(userData, 'response___Agent')
      Cookies.set("userData", JSON.stringify(userData), {
        expires: 7,
        path: "/",
        sameSite: "Lax",
      }); // Token expires in 7 days
      navigate(redirectPath || "/agent/dashboard");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message = error?.response?.data?.message || "Login failed";
        setApiError(`Login failed: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = forgotPasswordSchema.parse(formData);
      const contact = validatedData.email.trim();
      const isEmail = /.+@.+\..+/.test(contact);
      const payload = isEmail ? { email: contact } : { phone: contact };
      await apiCall({
        endpoint: "/v1/auth/forgot-password",
        method: "post",
        data: payload,
        successMessage: "Password reset email sent!",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        setFormErrors(error.issues);
      } else {
        const message =
          error?.response?.data?.message || "Failed to send reset email";
        setApiError(`Forgot password failed: ${message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return formErrors.find((error) => error.path[0] === fieldName)?.message;
  };

  const isFormFilled = isForgotPassword
    ? forgotPasswordSchema.safeParse(formData).success
    : loginSchema.safeParse(formData).success;

  return (
    <Suspense
      fallback={
        <LoadingSpinner parentClass="flex items-center justify-center w-full h-full" />
      }
    >
      <main className="relative flex flex-col items-center justify-center gap-[60px] px-4 py-16 w-full min-h-screen">
        <img
          src={brandBg}
          alt="background"
          className={`absolute w-full h-full object-cover object-center ${
            formData.email || formData.password ? "opacity-60" : "opacity-40"
          }`}
        />

        <img src={brandLogo} alt="Logo" className="w-[120px] z-10" />
        <>
          <div className="z-10 w-[108px] h-6 rounded-full flex items-center justify-center bg-paleGrayGradient">
            <h3
              className="w-[84px] h-[8px] text-[12px] font-bold leading-[100%] text-figmaGold font-primary flex items-center justify-center whitespace-nowrap"
              style={{ fontVariant: "caps" }} // Optional: mimics vertical trim cap height
            >
              AGENT LOGIN
            </h3>
          </div>
        </>
        <section className="flex w-full flex-col items-center justify-center gap-2 z-10 max-w-[500px]">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-[32px] text-white font-medium font-secondary">
              {isForgotPassword ? "See who forgot something" : "Welcome Back"}
            </h1>
            <em className="text-xs text-white text-center max-w-[260px]">
              {isForgotPassword
                ? "Enter your email or phone and we'll send a reset link or code."
                : "Sign In to Access your Workplace"}
            </em>
          </div>

          <form
            className="flex w-full flex-col items-center justify-center pt-[50px] gap-4 pb-[24px]"
            onSubmit={isForgotPassword ? handleForgotPassword : handleLogin}
            noValidate
          >
            <Input
              type="email"
              name="email"
              label="EMAIL OR PHONE"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email or phone number"
              required={true}
              style="max-w-[400px]"
              className="flex flex-col items-center justify-center"
              errorMessage={getFieldError("email")}
              errorClass="max-w-[400px]"
            />
            {!isForgotPassword && (
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                label="PASSWORD"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required={true}
                style="max-w-[400px]"
                className="flex flex-col items-center justify-center"
                errorMessage={getFieldError("password")}
                errorClass="max-w-[400px]"
                iconRight={
                  <img
                    src={showPassword ? eyeopen : eyeclosed}
                    className="w-[16px] cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                    alt="Toggle password visibility"
                  />
                }
              />
            )}
            {apiError && (
              <p className="text-errorTwo text-sm mt-2 text-center font-semibold w-max bg-white px-3 py-1 rounded-full">
                {apiError}
              </p>
            )}
            <div className="flex flex-col items-center justify-center gap-8 pt-8">
              <ProceedButton
                type="submit"
                loading={loading}
                variant={isFormFilled ? "gradient" : "gray"}
                disabled={!isFormFilled}
              />
              {isForgotPassword ? (
                <em
                  className={`${
                    formData.email ? "text-textDarkGrey" : "text-white"
                  } text-sm font-medium underline cursor-pointer`}
                  onClick={() => {
                    setIsForgotPassword(false);
                    setFormData(defaultLoginFormData);
                    setFormErrors([]);
                    setApiError(null);
                  }}
                >
                  Back to Login
                </em>
              ) : (
                <em
                  className={`${
                    formData.email || formData.password
                      ? "text-textDarkGrey"
                      : "text-white"
                  } text-sm font-medium underline cursor-pointer`}
                  onClick={() => {
                    setIsForgotPassword(true);
                    setFormData(defaultLoginFormData);
                    setFormErrors([]);
                    setApiError(null);
                  }}
                >
                  Forgot password?
                </em>
              )}
            </div>
          </form>
        </section>
      </main>
    </Suspense>
  );
};

export default AgentLoginPage;
