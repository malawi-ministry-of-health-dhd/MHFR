import React, { useState } from "react";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MenuIcon from "@material-ui/icons/Menu";
import { withStyles } from "@material-ui/core/styles";
import styled from "styled-components";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faAlignJustify,
  faLock,
  faBullhorn
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Home,
  AddBox,
  People,
  Shuffle,
  AccountCircle,
  InfoRounded
} from "@material-ui/icons";
import Menu from "../../molecules/Menu";
import Search from "../../molecules/Search";
import MobileMenu from "../../molecules/MobileMenu";
import SearchContainer from "./SearchContainer";
import BaselineMenu from "../../molecules/MobileBaselineMenu";
import ChangePassword from "../../../scenes/Users/ChangePassword";
import { acActions } from "../../../acl";

library.add(faAlignJustify);

const Header = (props: Props) => {
  const {
    activePage,
    auth,
    logout,
    onClickSearchItem,
    onSearchValueChange,
    searchOpen,
    toggleSearch,
    onPasswordChange
  } = props;

  const [isMenuOpen, setMenuOpen] = useState(false);
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);

  const isActivePage = (page: string) =>
    page.toLowerCase() === activePage.toLowerCase();

  const adminMenuItems = [
    {
      text: "Home",
      name: "Home",
      active: isActivePage("Home"),
      icon: <Home />,
      link: `/`
    },
    {
      text: "Facilities",
      name: "Facilities",
      active: isActivePage("Facilities"),
      icon: <AddBox />,
      link: `/facilities`
    },
    {
      text: "Users",
      name: "Users",
      active: isActivePage("Users"),
      icon: <People />,
      link: `/users`,
      aclAction: "user:view" as acActions
    },
    {
      text: "More",
      name: "More",
      active:
        isActivePage("More") ||
        isActivePage("about") ||
        isActivePage("feedback") ||
        isActivePage("help"),
      icon: <Shuffle />,
      options: [
        { text: "About", link: `/about` },
        { text: "Feedback", link: `/feedback` },
        { text: "Help", link: `/help` }
      ]
    },
    {
      text: `${auth.details.firstname || "Profile"}`,
      name: "Profile",
      active: isActivePage("Profile"),
      icon: <AccountCircle />,
      options: [
        { text: "Logout", link: `/`, onClick: logout },
        {
          text: "Change Password",
          onClick: () => setChangePasswordModalOpen(true)
        }
      ]
    }
  ];

  const publicMenuItems = [
    {
      text: "Home",
      name: "Home",
      active: isActivePage("Home"),
      icon: <Home />,
      link: `/`
    },
    {
      text: "Facilities",
      name: "Facilities",
      active: isActivePage("Facilities"),
      icon: <AddBox />,
      link: `/facilities`
    },

    {
      text: "More",
      name: "More",
      active:
        isActivePage("More") ||
        isActivePage("about") ||
        isActivePage("feedback") ||
        isActivePage("help"),
      icon: <Shuffle />,
      options: [
        { text: "About", link: `/about` },
        { text: "Feedback", link: `/feedback` },
        { text: "Help", link: `/help` }
      ]
    },
    {
      text: "Login",
      name: "Login",
      active: isActivePage("login"),
      icon: <FontAwesomeIcon icon={faLock} />,
      link: `/login`
    }
  ];

  const menuItems = auth.authenticated ? adminMenuItems : publicMenuItems;
  const mobileMenu = publicMenuItems.filter(m => m.text !== "Login");

  const baselineMenu = [
    {
      text: "Home",
      name: "Home",
      active: isActivePage("Home"),
      icon: <Home />,
      link: `/`
    },
    {
      text: "Facilities",
      name: "Facilities",
      active: isActivePage("Facilities"),
      icon: <AddBox />,
      link: `/facilities`
    },
    {
      text: "About MHFR",
      name: "About",
      active: isActivePage("about"),
      link: `/about`,
      icon: <InfoRounded />
    },
    {
      text: "Feedback",
      name: "Feedback",
      link: `/feedback`,
      active: isActivePage("feedback"),
      icon: <FontAwesomeIcon style={{ fontSize: "24px" }} icon={faBullhorn} />
    }
  ];

  return (
    <Container>
      <AppBar>
        <StyledToolbar>
          <MenuContainer>
            <ToolsContainer>
              <BrandCluster>
                <LogoFrame>
                  <Logo
                    src="/static/images/logo.png"
                    alt="Master Health Facility Registry"
                  />
                </LogoFrame>
                <BrandLockup className="hide-on-small-only">
                  <BrandEyebrow>Master</BrandEyebrow>
                  <BrandTitle>
                    <span>Health Facility</span>
                    <BrandTitleAccent>Registry</BrandTitleAccent>
                  </BrandTitle>
                </BrandLockup>
                <MobileBrandBadge className="hide-on-med-and-up">
                  <span>MHFR</span>
                </MobileBrandBadge>
              </BrandCluster>
              <Search onClick={toggleSearch} className="hide-on-med-and-down" />
            </ToolsContainer>

            <MobileMenu
              items={mobileMenu}
              open={isMenuOpen}
              onClose={() => setMenuOpen(!isMenuOpen)}
            />
            <BaselineMenu items={baselineMenu} />
            <div style={{ display: "flex" }}>
              <Search
                onClick={toggleSearch}
                className="hide-on-large-only"
                style={{ margin: "15px 0px", backgroundColor: "transparent" }}
              />
              <StyledMenuIcon
                className="hide-on-large-only waves-effect waves-light"
                color="inherit"
                aria-label="Open drawer"
                onClick={() => setMenuOpen(!isMenuOpen)}
              >
                <MenuIcon />
              </StyledMenuIcon>
            </div>
            <Menu items={menuItems} />
            <ChangePassword
              open={changePasswordModalOpen}
              setOpen={setChangePasswordModalOpen}
              onSubmit={onPasswordChange}
            />
          </MenuContainer>
        </StyledToolbar>
      </AppBar>
      {searchOpen && (
        <SearchContainer
          onClickSearchItem={onClickSearchItem}
          onChange={onSearchValueChange}
          onClose={toggleSearch}
        />
      )}
    </Container>
  );
};

export default Header;

type Props = {
  activePage: string;
  auth: any;
  logout: Function;
  onClickSearchItem: Function;
  onSearchValueChange: Function;
  toggleSearch: Function;
  searchOpen: boolean;
  onPasswordChange: Function;
};
const Container = styled.div`
  flex-grow: 1;
  height: 80px;
`;

const ToolsContainer = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
`;

const BrandCluster = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`;

const LogoFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  margin-right: 16px;
  border-radius: 20px;
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.24),
    rgba(255, 255, 255, 0.08)
  );
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow: 0 16px 28px rgba(3, 19, 50, 0.24);
  flex-shrink: 0;

  @media (max-width: 620px) {
    width: 48px;
    height: 48px;
    margin-right: 10px;
    border-radius: 16px;
  }
`;

const Logo = styled.img`
  width: 50px;
  @media (max-width: 620px) {
    width: 36px;
  }
`;

const BrandLockup = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

const BrandEyebrow = styled.span`
  width: fit-content;
  padding: 5px 10px 4px;
  margin-bottom: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.92);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.28em;
  line-height: 1;
  text-transform: uppercase;
`;

const BrandTitle = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: #ffffff;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;

  @media (max-width: 1280px) {
    font-size: 19px;
    gap: 8px;
  }
`;

const BrandTitleAccent = styled.span`
  color: #ffd98b;
`;

const MobileBrandBadge = styled.div`
  padding: 9px 12px 8px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.2em;
  line-height: 1;
  text-transform: uppercase;
  box-shadow: 0 12px 24px rgba(3, 19, 50, 0.22);
`;

const MenuContainer = styled.div`
  display: flex;
  width: 100%;
  padding: 0px 5%;
  height: 80px;
  justify-content: space-between;
  @media (max-width: 992px) {
    padding: 0px 0px;
  }
`;
const StyledToolbar = withStyles({
  root: {
    background: "linear-gradient(118deg, #062b61 0%, #0d47a1 56%, #2676d8 100%)",
    flexGrow: 1,
    height: "80px",
    fontSize: "18px",
    boxShadow: "0 10px 28px rgba(4, 24, 61, 0.24)"
  }
})(Toolbar);

const StyledMenuIcon = withStyles({
  root: {
    cursor: "pointer",
    "&:focus": {
      background: "rgba(0,0,0,0.5)"
    }
  }
})(Toolbar);
