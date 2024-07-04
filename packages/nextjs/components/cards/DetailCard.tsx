function DetailCard({ title, value }: { title: string; value: string | number | undefined }) {
  return (
    <div className="bg-white bg-opacity-20 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-purple-300 mb-2">{title}</h3>
      <p className="text-white">{value}</p>
    </div>
  );
}

export default DetailCard;
