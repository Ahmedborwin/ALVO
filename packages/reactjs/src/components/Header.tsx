import { useCallback, useRef, useState } from "react";
import { LogoutButton, SignInAgainButton } from "./buttons";
import { AlchemySignerStatus } from "@alchemy/aa-alchemy";
import { useSignerStatus, useAccount as userOperationAccount } from "@alchemy/aa-alchemy/react";
import { Link, useLocation } from "react-router-dom";
import { useAccount } from "wagmi";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { FaucetButton, RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { accountType } from "~~/config/AlchemyConfig";
import { useOutsideClick } from "~~/hooks/scaffold-eth";
import { useStravaState } from "~~/services/store/store";

type HeaderMenuLink = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const menuLinks: HeaderMenuLink[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Challenge",
    href: "/challenge",
  },
];

const WalletUI = () => {
  const { isConnected, status } = useSignerStatus();
  const { address } = useAccount();

  if (!isConnected && status === AlchemySignerStatus.DISCONNECTED)
    return (
      <div className="navbar-end flex-grow mr-4">
        <RainbowKitCustomConnectButton />
        <FaucetButton />
      </div>
    );

  if (address && isConnected && status === AlchemySignerStatus.CONNECTED) return <SignInAgainButton />;

  if (isConnected && status === AlchemySignerStatus.CONNECTED)
    return (
      <div className="navbar-end flex-grow mr-4">
        <LogoutButton />
      </div>
    );
};

const HeaderMenuLinks = ({ isDrawerOpen }: { isDrawerOpen?: boolean }) => {
  const { pathname } = useLocation();
  const { address: accountAddress } = userOperationAccount({ type: accountType });
  const { address } = useAccount();
  const stravaData = useStravaState(state => state.getStravaTokens());

  if ((!accountAddress && !address) || (!stravaData.access_token && !stravaData.refresh_token))
    return isDrawerOpen ? (
      <div className="flex items-center">
        <WalletUI />
      </div>
    ) : (
      ""
    );

  return (
    <>
      {menuLinks.map(({ label, href, icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            to={href}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
              ${isActive ? "bg-white/20 text-white shadow-md" : "text-indigo-100 hover:bg-white/10 hover:text-white"}
              transition-all duration-200
            `}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
      {isDrawerOpen ? (
        <div className="flex items-center">
          <WalletUI />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null);
  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <header className="sticky top-0 z-20 w-full backdrop-blur-md bg-gradient-to-r from-[#5e40a0]/95 to-[#6b429a]/95 border-b border-white/10 shadow-lg">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <div className="relative w-10 h-10">
                <img alt="ALVO logo" className="w-full h-full object-contain cursor-pointer" src="/logo.svg" />{" "}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-lg leading-tight">ALVO</span>
                <span className="text-indigo-200 text-xs">Dream.Persevere.Achieve.</span>
              </div>
            </Link>
          </div>

          <nav className="hidden lg:flex items-center space-x-4">
            <HeaderMenuLinks />
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex">
              <WalletUI />
            </div>
            <div className="lg:hidden">
              <button
                className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors duration-200"
                onClick={() => setIsDrawerOpen(prev => !prev)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDrawerOpen && (
        <div className="lg:hidden">
          <nav className="px-4 pt-2 pb-4 space-y-2">
            <HeaderMenuLinks isDrawerOpen={isDrawerOpen} />
          </nav>
        </div>
      )}
    </header>
  );
};

export { Header, HeaderMenuLinks };
