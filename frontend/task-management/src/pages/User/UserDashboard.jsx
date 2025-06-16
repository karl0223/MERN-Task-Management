import { useUserAuth } from "../../hooks/useUserAuth";

function UserDashboard() {
  useUserAuth();
  return <div></div>;
}

export default UserDashboard;
