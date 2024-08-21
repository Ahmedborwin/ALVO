import { Profile } from "../profile";
import { ProfileSVG } from "../svg";
import CustomModal from "./CustomModal";

function ProfileModal() {
  return (
    <span>
      <CustomModal
        buttonStyle="fixed top-32 right-0 z-50 px-3 py-2 bg-gradient-to-r to-purple-500 from-indigo-600 text-white rounded-s-lg shadow-md hover:from-purple-600 hover:to-indigo-700 hover:px-4 transition duration-300 ease-in-out"
        buttonChild={ProfileSVG}
      >
        <Profile />
      </CustomModal>
    </span>
  );
}

export default ProfileModal;
