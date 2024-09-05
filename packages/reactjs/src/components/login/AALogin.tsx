import { useState } from "react";
import { EmailInput } from "../Input";
import { SubmitButton } from "../buttons";
import { LargeMailSVG } from "../svg";
import { useAuthenticate } from "@alchemy/aa-alchemy/react";
import { notification } from "~~/utils/scaffold-eth";
import { EmailRegEx } from "~~/utils/common";

const LogInCard = ({ isAwaitingEmail }: { isAwaitingEmail: boolean }) => {
  const [email, setEmail] = useState<string>("");
  const { authenticate } = useAuthenticate();

  const handleEmailChange = (value: string) => {
    setEmail(value);
  };

  const login = () => {

    if (!email) {
      notification.info('Please enter your email')
      return
    }

    if (!EmailRegEx.test(email)) {
      notification.info('Please enter a valid email')
      return
    }

    authenticate({ type: "email", email });
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-cover bg-center relative overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl shadow-2xl">
        <div className="flex justify-center">
          <img
            src="/alvo-Square-icon-one.png"
            alt="ALVO Logo"
            className="w-32 h-32 sm:w-40 sm:h-40 object-cover"
          />
        </div>

        <div className="px-4 sm:px-6 pb-6">
          {isAwaitingEmail ? (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
              <p className="text-sm text-gray-600 mb-4">
                We've sent you a magical link to continue your journey with ALVO.
              </p>
              <div className="animate-bounce mt-4">
                {LargeMailSVG}
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-4  ">
                <p className="text-xl sm:text-2xl text-gray-800 mb-2 font-semibold m-0">Dream. Persevere. Achieve.</p>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 m-0">
                  Streamlined motivation website, create new challenges, work
                  towards them, and accomplish them.
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <EmailInput
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#61bdfa] text-gray-800 placeholder-gray-500 text-sm"
                    value={email}
                    onChange={handleEmailChange}
                  />
                </div>
                <SubmitButton
                  className="w-full px-3 py-2 bg-gradient-to-r from-[#0b8ee5] to-[#61bdfa] text-white font-semibold rounded-lg shadow-md hover:from-[#61bdfa] hover:to-[#0b8ee5] focus:outline-none focus:ring-2 focus:ring-[#3aa7f5] focus:ring-opacity-75 transition duration-1000 ease-in-out text-sm" onClick={login}
                  text="Begin Your Journey"
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export { LogInCard };
