import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/artcircle-logo.png";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("artcircle_token")
  );

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("artcircle_token"));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("artcircle_token");
    localStorage.removeItem("artcircle_user");

    setIsLoggedIn(false);

    navigate("/");
  };

  const closeMenu = () => {
    const menu = document.getElementById("artcircleNavbar");

    if (menu?.classList.contains("show")) {
      const collapse = window.bootstrap?.Collapse.getInstance(menu);

      collapse?.hide();
    }
  };

  const handleLinkClick = () => {
    closeMenu();
  };

  return (
    <header className="navbar navbar-expand-lg">
      <div className="container-fluid navbar-inner">

        <Link
          to="/"
          className="brand navbar-brand"
          onClick={handleLinkClick}
        >
          <img
            src={logo}
            alt="ArtCircle logo"
            className="brand-logo"
          />

          <span>ArtCircle</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#artcircleNavbar"
          aria-controls="artcircleNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse"
          id="artcircleNavbar"
        >
          <nav className="navbar-nav mx-auto mb-3 mb-lg-0">

            <Link
              to="/"
              className="nav-link"
              onClick={handleLinkClick}
            >
              Home
            </Link>

            <Link
              to="/explore"
              className="nav-link"
              onClick={handleLinkClick}
            >
              Explore Art
            </Link>


            {isLoggedIn && (
              <>
                <Link
                  to="/sell-art"
                  className="nav-link"
                  onClick={handleLinkClick}
                >
                  Sell Art
                </Link>
                
                <Link
                  to="/messages"
                  className="nav-link"
                  onClick={handleLinkClick}
                >
                  Messages
                </Link>
            

                <Link
                  to="/profile"
                  className="nav-link"
                  onClick={handleLinkClick}
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          <div className="nav-actions d-flex flex-column flex-lg-row gap-2">

            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="login-link"
                  onClick={handleLinkClick}
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  className="signup-button"
                  onClick={handleLogout}
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="login-link"
                  onClick={handleLinkClick}
                >
                  Log In
                </Link>

                <Link
                  to="/register"
                  className="signup-button"
                  onClick={handleLinkClick}
                >
                  Sign Up
                </Link>
              </>
            )}

          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;