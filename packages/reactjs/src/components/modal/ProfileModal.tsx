import { Profile } from "../profile";
import { ProfileSVG } from "../svg";
import CustomModal from "./CustomModal";

function ProfileModal() {
  return (
    <span>
      <CustomModal
        buttonStyle="fixed top-32 right-0 z-50 px-3 py-2 bg-gradient-to-r from-[#61bdfa] to-[#0b8ee5] text-white rounded-s-lg shadow-md hover:from-[#0b8ee5] hover:to-[#61bdfa] hover:px-4 transition duration-300 ease-in-out"
        buttonChild={ProfileSVG}
      >
        <Profile />
      </CustomModal>
    </span>
  );
}

export default ProfileModal;
