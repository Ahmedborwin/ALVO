import { QRCodeSVG } from "qrcode.react";
import { Address as AddressType } from "viem";
import { QrCodeIcon } from "@heroicons/react/24/outline";
import { CustomModal } from "~~/components/modal";
import { Address } from "~~/components/scaffold-eth";

const AddressQRCodeModal = ({ address }: { address: AddressType }) => {
  return (
    <li className="p-1">
      <CustomModal
        buttonStyle="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        buttonChild={
          <span className="flex items-center">
            <QrCodeIcon className="h-5 w-5 mr-2" />
            <span>View QR Code</span>
          </span>
        }
      >
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-white">QR Code</h2>
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG value={address} size={200} />
            </div>
            <span className="flex items-center justify-center w-full px-3 py-2 bg-gray-800 bg-opacity-50 rounded-lg text-white font-mono text-xs sm:text-sm break-all">
              <Address address={address} format="long" disableAddressLink />
            </span>
          </div>
        </div>
      </CustomModal>
    </li>
  );
};
export { AddressQRCodeModal };
