import { SignInAgainButton } from "../buttons";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

function StwwError() {
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
            <ExclamationTriangleIcon className="h-12 w-12 text-white" />
          </div>
        </div>

        <div className="text-center pt-16 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Oops!</h1>
          <p className="text-indigo-200">An Unexpected Error Occurred</p>
        </div>

        <div className="mb-8 text-center">
          <p className="text-indigo-100">
            We apologize for the inconvenience. Please try signing in again or contact our support team if the issue
            persists.
          </p>
        </div>
        <SignInAgainButton />
      </div>
    </div>
  );
}

export default StwwError;
