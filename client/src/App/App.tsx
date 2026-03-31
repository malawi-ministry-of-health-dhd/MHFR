import React, { useEffect } from "react";
import { Switch } from "react-router-dom";
import { Route, BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import { Header, Footer } from "../components/organisms";
import Content from "../components/organisms/Content";
import Dashboard from "../scenes/Dashboard";
import Facilities from "../scenes/Facility";
import AddFacility from "../scenes/Facility/CreateFacility";
import ViewFacility from "../scenes/Facility/ViewFacility";
import UpdateFacility from "../scenes/Facility/UpdateFacility";
import UserLogin from "../scenes/Login";
import Users from "../scenes/Users";
import Feedback from "../scenes/Feedback";
import About from "../scenes/About";
import Help from "../scenes/Help";
import NotFound from "../scenes/Error/404";
import Preloader from "../components/atoms/Preloader";
import ErrorScreen from "../scenes/Error/500";
import ForgotPassword from "../scenes/Users/PasswordReset/ForgotPassword.container";
import ResetPassword from "../scenes/Users/PasswordReset/ResetPassword.container";
import { useDispatch, useSelector } from "react-redux";
import { fetchDependancies } from "../services/redux/actions/dependancies";
import { fetchUserDetails } from "../services/redux/actions/users";
import { fetchFacilities } from "../services/redux/actions/facilities";
import { ToastContainer, cssTransition } from "react-toastify";
import { isLoggedIn } from "../services/helpers";
import { IState } from "../services/types";

const Slide = cssTransition({
  enter: "slideIn",
  exit: "slideOut",
  collapseDuration: 750
});
const App: React.FC = () => {
  const dispatch = useDispatch();
  const { status, errors, users } = useSelector((state: IState) => state);

  useEffect(() => {
    dispatch(fetchDependancies());
    dispatch(fetchFacilities());

    if (isLoggedIn()) {
      let user: any = sessionStorage.getItem("user");
      user = user ? JSON.parse(user) : false;

      if (!user) {
        sessionStorage.clear();
      } else {
        fetchUserDetails(
          user.id as any,
          sessionStorage.getItem("token") as any
        );
      }
    }
  }, []);

  return status.fetchDependancies ? (
    <Preloader />
  ) : errors.dependancyError ? (
    <ErrorScreen />
  ) : (
    <>
      <ToastContainer
        autoClose={6000}
        closeButton={false}
        style={{
          zIndex: 1800,
          position: "fixed",
          top: "0",
          left: "0",
          width: "100vw",
          padding: "0px"
        }}
        transition={Slide}
      />
      <Router>
        <Header />
        <Content>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route exact path="/Facilities" component={Facilities} />
            <Route exact path="/login" component={UserLogin} />
            <Route exact path="/feedback" component={Feedback} />
            <Route exact path="/about" component={About} />
            <Route exact path="/help" component={Help} />
            <Route exact path="/forgotPassword" component={ForgotPassword} />
            <Route
              exact
              path="/resetPassword/:token"
              component={ResetPassword}
            />
            {users.currentUser.authenticated && (
              <Route exact path="/Facilities/add" component={AddFacility} />
            )}
            <Route exact path="/Facilities/:id" component={ViewFacility} />
            <Route
              exact
              path="/Facilities/:id/:page"
              component={ViewFacility}
            />
            {users.currentUser.authenticated && (
              <Route
                path="/Facilities/:id/:page/edit"
                component={UpdateFacility}
              />
            )}
            {users.currentUser.authenticated && (
              <Route exact path="/users" component={Users} />
            )}
            <Route path="*" component={NotFound} />
          </Switch>
        </Content>
        <Footer />
      </Router>
    </>
  );
};

export default App;
