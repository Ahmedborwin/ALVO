"use client";

import { useState } from "react";
import { EmailInput } from "../Input";
import { SubmitButton } from "../buttons";
import { ChainSVG, LargeMailSVG } from "../svg";
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
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.8))",
      }}
    >
      <div className="relative z-10 w-full max-w-md mx-4 p-6 md:p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            {ChainSVG}
          </div>
        </div>

        {isAwaitingEmail ? (
          <div className="text-center pt-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Check Your Email</h2>
            <p className="text-indigo-200 mb-6">
              We&apos;ve sent you a magical link to continue your journey with ALVO.
            </p>
            <div className="animate-bounce mt-8">{LargeMailSVG}</div>
          </div>
        ) : (
          <>
            <div className="text-center pt-16 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">ALVO</h1>
              <p className="text-indigo-200">Dream.Persevere.Achieve.</p>
            </div>
            <div className="space-y-6">
              <div className="relative">
                <EmailInput
                  className="w-full px-4 py-3 bg-white bg-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-white placeholder-indigo-200"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              <SubmitButton
                className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
                onClick={login}
                text="Begin Your Journey"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
