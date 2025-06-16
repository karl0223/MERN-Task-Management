import { Outlet } from "react-router-dom";

function PrivateRoute({ allowedRoles }) {
  return <Outlet />;
}

export default PrivateRoute;
