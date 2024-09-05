import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";

const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <footer className="w-full   py-3 px-4 sm:px-6 text-white">
      <div className="container mx-auto max-w-7xl h-full flex items-center">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {nativeCurrencyPrice > 0 && (
              <div className="flex items-center gap-1 bg-black/30  rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:bg-black/50 transition-all duration-300">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>{nativeCurrencyPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="text-center my-2 sm:my-0">
            <p className=" text-sm font-medium">
              &copy; {new Date().getFullYear()} ChainHabits. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
export { Footer };
