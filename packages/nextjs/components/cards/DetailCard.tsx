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
    <div className="bg-white bg-opacity-20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-purple-300 mb-2">{title}</h3>
      <p className="text-white">{loading ? <span className="loading loading-dots loading-sm"></span> : value}</p>
    </div>
  );
}

export default DetailCard;
