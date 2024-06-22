"use client";

import { useState } from "react";
import { EmailInput } from "../Input";
import { SubmitButton } from "../buttons";
import { useAuthenticate } from "@alchemy/aa-alchemy/react";

export const LogInCard = ({ isAwaitingEmail }: { isAwaitingEmail: boolean }) => {
  const [email, setEmail] = useState<string>("");
  const { authenticate } = useAuthenticate();

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const login = () => {
    authenticate({ type: "email", email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700">
      {isAwaitingEmail ? (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-8 max-w-md w-full">
          <div className="text-center">
            <p className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-800">Check your email!</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8 w-full max-w-md">
          <div className="text-center mb-4 md:mb-6 lg:mb-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Sign In with Embedded</h1>
          </div>
          <div className="flex flex-col gap-4 md:gap-6">
            <EmailInput onChange={handleEmailChange} value={email} />
            <SubmitButton onClick={login} />
          </div>
        </div>
      )}
    </div>
  );
};
