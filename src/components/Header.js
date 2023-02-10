import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Avatar, Button, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Header.css";

const Header = ({ children, hasHiddenAuthButtons }) => {
  const history = useHistory();
  const isLoggedIn = localStorage.getItem("token") ? true : false;

  const handleClick = (e) => {
    e.stopPropagation();
    history.push("/", { from: "Header Component" });
  }

    return (
      <Box className="header">
        <Box className="header-title">
          <img src="logo_light.svg" alt="QKart-icon"></img>
        </Box>
        {children}
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          spacing={1}
        >
          {hasHiddenAuthButtons ? (
            <>
              {isLoggedIn ? (
                <>
                  <Avatar
                    src="../../public/avatar.png"
                    alt={localStorage.getItem("username")}
                  />
                  <Typography variant="h5" component="div">
                    {localStorage.getItem("username")}
                  </Typography>
                  <Button
                    className="explore-button"
                    variant="text"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                  >
                    LOGOUT
                  </Button>
                </>
              ) : (
                <>
                  {" "}
                  <Button
                    className="explore-button"
                    variant="text"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push("/login", { from: "Header Component" });
                    }}
                  >
                    LOGIN
                  </Button>
                  <Button
                    className="button"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push("/register", { from: "Header Component" });
                    }}
                  >
                    REGISTER
                  </Button>
                </>
              )}
            </>
          ) : (
            <Button
              className="explore-button"
              startIcon={<ArrowBackIcon />}
              variant="text"
              onClick={handleClick}
            >
              Back to explore
            </Button>
          )}
        </Stack>
      </Box>
    );
};

export default Header;
