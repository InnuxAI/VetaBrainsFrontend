import React from "react";
import { useNavigate } from "react-router-dom";
import SignupForm from "../components/Auth/SignupForm";

const Signup: React.FC = () => {
  const navigate = useNavigate();

  const onSignupSuccess = () => {
    alert("Registration successful! Please log in.");
    navigate("/login");
  };

  return (
    <div
      className={[
        "min-h-screen flex items-center justify-center p-4",
        "bg-[var(--color-background)]",
      ].join(" ")}
      style={{ fontFamily: "var(--font-sans)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">
            Create your account
          </h1>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Start using your workspace in minutes
          </p>
        </div>

        <SignupForm onSignupSuccess={onSignupSuccess} />
      </div>
    </div>
  );
};

export default Signup;
