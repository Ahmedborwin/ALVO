import { MoonLoader } from "react-spinners";

function MoonSpinner() {
  return (
    <div className={`flex justify-center items-center h-screen`}>
      <MoonLoader color="#6366f1" size={60} speedMultiplier={0.75} />
    </div>
  );
}

export default MoonSpinner;
