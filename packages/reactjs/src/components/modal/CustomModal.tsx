import { ReactNode, useState } from "react";
import { CloseButton } from "../buttons";
import { createPortal } from "react-dom";

function CustomModal({
  buttonStyle,
  buttonChild,
  children,
}: {
  buttonStyle?: string;
  buttonChild: JSX.Element | string;
  children: ReactNode;
}) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <>
      <button
        onClick={toggleModal}
        className={
          buttonStyle
            ? buttonStyle
            : "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors duration-300 w-full"
        }
      >
        {buttonChild}
      </button>

      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black bg-opacity-50 backdrop-blur-sm p-4 ">
            <div className="relative w-full max-w-4xl animate-fade-in-up my-8">
              <div className="z-10 w-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl shadow-2xl border border-white border-opacity-20">
                <CloseButton onClick={toggleModal} />
                <div>{children}</div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default CustomModal;
