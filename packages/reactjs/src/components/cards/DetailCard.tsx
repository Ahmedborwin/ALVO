function DetailCard({
  title,
  value,
  loading = false,
}: {
  title: string;
  value: string | number | undefined;
  loading?: boolean;
}) {
  return (
    <div className="bg-white bg-opacity-30 rounded-lg p-4 shadow-md">
    <h3 className="text-lg font-semibold  mb-2">{title}</h3>
    <p className="text-gray-800">
      {loading ? (
        <div className="flex items-center mt-5">
          <div className="border-2 border-gray-800 border-t-transparent rounded-full w-4 h-4 animate-spin"></div>
        </div>
      ) : (
        value
      )}
    </p>
  </div>
  );
}

export default DetailCard;
