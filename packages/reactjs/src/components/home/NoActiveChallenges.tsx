import { Link } from "react-router-dom";

function NoActiveChallenges() {
  return (
    <div className="">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white bg-opacity-10  rounded-2xl sm:rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold  mb-4 sm:mb-6">No Active Challenges</h2>
            <p className="text-lg sm:text-xl  mb-4 sm:mb-8">
              You don&apos;t have any active challenges at the moment. Ready to set a new goal?
            </p>
            <p className="text-base sm:text-lg  mb-6 sm:mb-10">
              Every accomplishment starts with the decision to try. Set your goal, commit to it, and watch yourself
              transform.
            </p>
            <Link to="/challenge">
              <span className="w-full px-6 py-4 bg-gradient-to-r from-[#0b8ee5] to-[#61bdfa] text-white font-semibold rounded-lg shadow-md hover:from-[#61bdfa] hover:to-[#0b8ee5] focus:outline-none focus:ring-2 focus:ring-[#3aa7f5] focus:ring-opacity-75 transition duration-1000 ease-in-out text-sm">
                Create New Challenge
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NoActiveChallenges;
