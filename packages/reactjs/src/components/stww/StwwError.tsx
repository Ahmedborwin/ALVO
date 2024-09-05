import { SignInAgainButton } from "../buttons";

function StwwError() {
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center relative overflow-hidden "
    >
      <div className="relative z-10 w-full max-w-md mx-4 p-6 md:p-8 backdrop-blur-md text-white bg-white bg-opacity-15 rounded-2xl shadow-2xl border border-white border-opacity-20">
        <div className="text-center pt-16 mb-8 ">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Oops!</h1>
          <p >An Unexpected Error Occurred</p>
        </div>

        <div className="mb-8 text-center ">
          <p>
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
