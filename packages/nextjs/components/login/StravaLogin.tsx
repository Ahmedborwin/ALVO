"use client";

import { useEffect } from "react";
import { SubmitButton } from "../buttons";
import { STRAVA_AUTH_URL } from "~~/constants";
import { useStrava } from "~~/hooks/strava";

export const StravaLogin = () => {
  const { requestToken } = useStrava();

  const connectToStrava = () => {
    window.location.href = STRAVA_AUTH_URL;
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams ? urlParams.get("code") : null;
    if (authorizationCode) requestToken(authorizationCode);
  }, [requestToken]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 lg:p-8 w-full max-w-md">
        <div className="text-center mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">Connect to strava account</h1>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          <SubmitButton onClick={connectToStrava} />
        </div>
      </div>
    </div>
  );
};
