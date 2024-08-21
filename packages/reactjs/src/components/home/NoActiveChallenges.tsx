import { Link } from "react-router-dom";

function NoActiveChallenges() {
  return (
    <div className="bg-gradient-to-br from-slate-900 to-purple-900">
      <div className="max-w-6xl mx-auto">
        <div className="backdrop-blur-md bg-white bg-opacity-10 rounded-2xl sm:rounded-3xl shadow-2xl border border-white border-opacity-20 overflow-hidden">
          <div className="p-4 sm:p-6 md:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">No Active Challenges</h2>
            <p className="text-lg sm:text-xl text-indigo-200 mb-4 sm:mb-8">
              You don&apos;t have any active challenges at the moment. Ready to set a new goal?
            </p>
            <p className="text-base sm:text-lg text-indigo-300 mb-6 sm:mb-10">
              Every accomplishment starts with the decision to try. Set your goal, commit to it, and watch yourself
              transform.
            </p>
            <Link to="/challenge">
              <span className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50">
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
