"use client";

import { useEffect } from "react";
import { SubmitButton } from "../buttons";
import { LightningSVG } from "../svg";
import { STRAVA_AUTH_URL } from "~~/constants";
import { useStrava } from "~~/hooks/strava";
import { notification } from "~~/utils/scaffold-eth";

export const StravaLogin = () => {
  const { requestToken } = useStrava();

  const connectToStrava = () => {
    window.location.href = STRAVA_AUTH_URL;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams ? urlParams.get("code") : null;
    const rejected = urlParams ? urlParams.get("error") : null;
    if (authorizationCode && rejected === null) requestToken(authorizationCode);
    if (rejected === "access_denied" && authorizationCode === null)
      notification.info("Can't go further without strava access");
  }, [requestToken]);

  return (
    <div
      className="flex items-center justify-center min-h-screen w-full bg-cover bg-center relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(88, 28, 135, 0.8))",
      }}
    >
      <div className="relative z-10 w-full max-w-md p-6 md:p-8 backdrop-blur-md bg-white bg-opacity-10 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-400 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
            {LightningSVG}
          </div>
        </div>

        <div className="text-center pt-12 sm:pt-16 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">Connect to Strava</h1>
          <p className="text-sm sm:text-base text-indigo-200">Link your account to track your progress</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <SubmitButton
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm sm:text-base font-semibold rounded-lg shadow-md hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 transition duration-300 ease-in-out"
            onClick={connectToStrava}
            text="Connect with Strava"
          />
        </div>
      </div>
    </div>
  );
};
