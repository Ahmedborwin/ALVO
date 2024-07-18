import { CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useGlobalState } from "~~/services/store/store";

export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);

  return (
    <footer className="w-full bg-gradient-to-r from-[#5e40a0] to-[#6b429a] backdrop-blur-md border-t border-white/10 py-3 px-4 sm:px-6">
      <div className="container mx-auto max-w-7xl h-full flex items-center">
        <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-6">
          <div className="flex flex-wrap justify-center sm:justify-start gap-3">
            {nativeCurrencyPrice > 0 && (
              <div className="flex items-center gap-1 bg-white/10 text-indigo-100 rounded-full px-4 py-2 text-sm font-medium shadow-lg hover:bg-white/20 transition-all duration-300">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>{nativeCurrencyPrice.toFixed(2)}</span>
              </div>
            )}
          </div>
          <div className="text-center my-2 sm:my-0">
            <p className="text-indigo-100 text-sm font-medium">
              &copy; {new Date().getFullYear()} ChainHabits. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
