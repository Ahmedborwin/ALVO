import { SignInAgainButton } from "../buttons";

function StwwError() {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-500 to-purple-700">
      <div className="max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800">Oops!</h1>
          <p className="text-gray-600 font-bold">Something went wrong.</p>
        </div>
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            We&apos;re sorry, but an unexpected error occurred. Please try again later or contact our support team if
            the issue persists.
          </p>
        </div>
        <div className="text-center">
          <SignInAgainButton />
        </div>
      </div>
    </div>
  );
}

export default StwwError;
