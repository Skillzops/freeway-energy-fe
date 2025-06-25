import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import loginbg from "../assets/loginbg.png";
import logo from "../assets/logo.svg";
import eyeclosed from "../assets/eyeclosed.svg";
import eyeopen from "../assets/eyeopen.svg";
import { Input } from "../Components/InputComponent/Input";
import ProceedButton from "../Components/ProceedButtonComponent/ProceedButtonComponent";
import { useApiCall } from "../utils/useApiCall";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { apiCall } = useApiCall();
  const { id: userId, token: remember_token } = useParams();
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isResetPasswordRoute = location.pathname.startsWith("/reset-password");

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const resetPayload = {
      userid: userId,
      resetToken: remember_token,
      newPassword,
      confirmNewPassword: confirmPassword,
    };

    const createPayload = {
      password: newPassword,
      confirmPassword,
    };

    try {
      await apiCall({
        endpoint: isResetPasswordRoute
          ? "/v1/auth/reset-password"
          : `/v1/auth/create-user-password/${userId}/${remember_token}`,
        method: "post",
        data: isResetPasswordRoute ? resetPayload : createPayload,
        headers: {},
        successMessage: isResetPasswordRoute
          ? "Password successfully updated!"
          : "Password succesfully created!",
      });
      navigate("/");
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId || remember_token) {
      console.log("User ID or token changed");
    }
  }, [userId, remember_token]);

  return (
    <main className="relative flex flex-col items-center justify-center gap-[60px] px-4 py-16 min-h-screen">
      <img
        src={loginbg}
        alt="background"
        className={`absolute w-full h-full object-cover object-center ${
          newPassword || confirmPassword ? "opacity-60" : "opacity-40"
        }`}
      />
      <img src={logo} alt="Logo" className="w-[120px] z-10" />
      <section className="flex w-full flex-col items-center justify-center gap-2 z-10 max-w-[500px]">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-[32px] text-primary font-medium font-secondary">
            Welcome
          </h1>
          <em className="text-xs text-textDarkGrey text-center max-w-[220px]">
            {isResetPasswordRoute
              ? "Hopefully you don't forgot this password."
              : "Since this is your first time here, create your password below."}
          </em>
        </div>
        <form
          className="flex w-full flex-col items-center justify-center pt-[50px] pb-[24px]"
          onSubmit={handleCreatePassword}
        >
          <Input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            label="NEW PASSWORD"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            required={true}
            errorMessage=""
            style={`mb-4 ${
              newPassword || confirmPassword
                ? "border-strokeCream"
                : "border-strokeGrey"
            }`}
            iconRight={
              <img
                src={showPassword ? eyeopen : eyeclosed}
                className="w-[16px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            }
          />
          <Input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            label="CONFIRM PASSWORD"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            required={true}
            errorMessage=""
            style={`${
              newPassword || confirmPassword
                ? "border-strokeCream"
                : "border-strokeGrey"
            }`}
            iconRight={
              <img
                src={showPassword ? eyeopen : eyeclosed}
                className="w-[16px] cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            }
          />
          <div className="flex flex-col items-center justify-center gap-8 pt-8">
            <ProceedButton
              type="submit"
              loading={loading}
              variant={newPassword || confirmPassword ? "gradient" : "gray"}
              disabled={false}
            />
          </div>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
