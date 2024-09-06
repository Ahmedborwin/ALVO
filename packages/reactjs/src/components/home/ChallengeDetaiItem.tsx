const ChallengeDetailItem = ({
  label,
  value,
  loading = false,
}: {
  label: string;
  value: string | number;
  loading?: boolean;
}) => (
  <div className="flex flex-col items-start">
    <span className=" text-sm">{label}</span>
    {loading ? (
      <div className="flex items-center mt-4">
        <div className="border-2 border-gray-800 border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
      </div>
    ) : (
      <span className="text-gray-800 font-medium text-lg mt-2">{value}</span>
    )}
  </div>
);

export default ChallengeDetailItem;
