function ObjectiveCard({ index }: { index: number }) {
  return (
    <div
      className={`rounded-lg p-6 transition-all shadow-lg flex flex-col justify-between
            ${
              index > 2
                ? "bg-gradient-to-br from-gray-400/30 to-gray-600/30 hover:from-gray-400/40 hover:to-gray-600/40"
                : index % 2 === 0
                ? "bg-gradient-to-br from-green-400/30 to-green-600/30 hover:from-green-400/40 hover:to-green-600/40"
                : "bg-gradient-to-br from-red-400/30 to-red-600/30 hover:from-red-400/40 hover:to-red-600/40"
            }`}
    >
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Week {index + 1}</h3>
          <span
            className={`text-sm px-2 py-1 rounded-full
                ${
                  index > 2
                    ? "bg-gray-500/50 text-gray-100"
                    : index % 2 === 0
                    ? "bg-green-500/50 text-green-100"
                    : "bg-red-500/50 text-red-100"
                }`}
          >
            {index > 2 ? "Pending" : index % 2 === 0 ? "Success" : "Failed"}
          </span>
        </div>
      </div>
    </div>
  );
}
export default ObjectiveCard;
