import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContext";
import { useNavigate } from "react-router-dom";
import { SIDE_MENU_DATA, SIDE_MENU_USER_DATA } from "../../utils/data";
import Modal from "../Modal";
import Input from "../Inputs/Input";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

function SideMenu({ activeMenu }) {
  const { user, clearUser } = useContext(UserContext);
  const [sideMenuData, setSideMenuData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("join");
  const [inviteCode, setInviteCodeOrgName] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === "logout") {
      handleLogout();
      return;
    }

    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    navigate("/login");
  };

  const handleCreateOrg = async () => {
    try {
      if (!inviteCode) {
        setError("Organization name is required");
        return;
      }

      await axiosInstance.post(API_PATHS.ORG.CREATE_ORG, {
        name: inviteCode,
      });

      setIsModalOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Error joining Org", error);
      setError("Invalid invite code");
    }
  };

  const handleJoinOrg = async () => {
    try {
      if (!inviteCode) {
        setError("Invite Code Required");
        return;
      }

      const response = await axiosInstance.post(API_PATHS.ORG.JOIN_ORG, {
        inviteCode,
      });

      if (!response.data.message === "success") {
        setError("Invalid invite code");
        return;
      }

      setIsModalOpen(false);

      navigate("/");
    } catch (error) {
      console.error("Error joining Org", error);
      setError("Invalid invite code");
    }
  };

  const isSuperAdmin = user?.role === "superadmin";
  const isOrgAdmin = user?.role === "user" && user?.orgRole === "admin";

  useEffect(() => {
    if (user) {
      setSideMenuData(
        isSuperAdmin || isOrgAdmin ? SIDE_MENU_DATA : SIDE_MENU_USER_DATA
      );
    }

    return () => {};
  }, [user]);
  return (
    <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
      <div className="flex flex-col items-center justify-center mb-7 pt-5">
        <div className="relative">
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className="w-20 h-20 bg-slate-400 rounded-full"
          />
        </div>

        {user?.role === "superadmin" && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Super Admin
          </div>
        )}

        {user?.orgRole === "admin" && (
          <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
            Org Admin
          </div>
        )}

        <h5 className="text-gray-950 font-medium leading-6 mt-3">
          {user?.name || ""}
        </h5>
        <p className="text-[12px] text-gray-500">{user?.email || ""}</p>

        {!user?.orgId && (
          <div>
            <button
              className="text-[10px] font-medium text-white bg-gray-700 px-3 py-0.5 rounded mt-1 cursor-pointer"
              onClick={() => {
                setModalMode("join");
                setIsModalOpen(true);
              }}
            >
              join org
            </button>

            <button
              className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 ml-0.5 rounded mt-1 cursor-pointer"
              onClick={() => {
                setModalMode("create");
                setIsModalOpen(true);
              }}
            >
              create org
            </button>
          </div>
        )}

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={
            modalMode === "join" ? "Join Organization" : "Create Organization"
          }
        >
          <div className="space-y-4 h-[60vh] overflow-auto">
            <Input
              value={inviteCode}
              onChange={({ target }) => setInviteCodeOrgName(target.value)}
              label={modalMode === "join" ? "Invite Code" : "Organization Name"}
              placeholder={
                modalMode === "join" ? "Enter invite code" : "Enter org name"
              }
              type="text"
            />
            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button className="card-btn" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </button>
            <button
              className="card-btn-fill"
              onClick={modalMode === "join" ? handleJoinOrg : handleCreateOrg}
            >
              DONE
            </button>
          </div>
        </Modal>

        {user?.orgId && (
          <div>
            <p className="text-[13px] text-gray-950 font-medium leading-6 mt-3">
              {user?.orgId.name || ""}
            </p>
            <p className="text-[12px] text-gray-500">
              {user?.orgId.inviteCode || ""}
            </p>
          </div>
        )}
      </div>

      {sideMenuData.map((item, index) => (
        <button
          key={`menu_${index}`}
          className={`w-full flex items-center gap-4 text-[15px] ${
            activeMenu == item.label
              ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
              : ""
          } py-3 px-6 mb-3 cursor-pointer`}
          onClick={() => handleClick(item.path)}
        >
          <item.icon className="text-xl" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export default SideMenu;
