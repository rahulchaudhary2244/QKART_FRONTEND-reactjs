import { Button, CircularProgress, Stack, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Register.css";

const Register = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [registrationData, setRegistrationData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setLoading] = useState(false);
  const history = useHistory();

  /**
   * Definition for register handler
   * - Function to be called when the user clicks on the register button or submits the register form
   *
   * @param {{ username: string, password: string, confirmPassword: string }} formData
   *  Object with values of username, password and confirm password user entered to register
   *
   * API endpoint - "POST /auth/register"
   *
   * Example for successful response from backend for the API call:
   * HTTP 201
   * {
   *      "success": true,
   * }
   *
   * Example for failed response from backend for the API call:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Username is already taken"
   * }
   */
  const register = async (formData) => {
    if (!validateInput(formData)) return;
    try {
      setLoading(true);
      const API_URL = `${config.endpoint}/auth/register`;
      await axios.post(API_URL, {
        username: formData.username,
        password: formData.password,
      });
      setLoading(false);
      setRegistrationData({
        username: "",
        password: "",
        confirmPassword: "",
      });
      enqueueSnackbar("Registered successfully", {
        variant: "success",
      });
      history.push("/login", { from: "Register Component" });
    } catch (err) {
      setLoading(false);
      if (err.response && err.response.status === 400) {
        enqueueSnackbar(err.response.data.message, {
          variant: "error",autoHideDuration: 2000,
        });
      } else {
        enqueueSnackbar(
          "Something went wrong. Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error",autoHideDuration: 2000, }
        );
      }
    }
  };

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @param {{ username: string, password: string, confirmPassword: string }} data
   *  Object with values of username, password and confirm password user entered to register
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * (NOTE: The error messages to be shown for each of these cases, are given with them)
   * -    Check that username field is not an empty value - "Username is a required field"
   * -    Check that username field is not less than 6 characters in length - "Username must be at least 6 characters"
   * -    Check that password field is not an empty value - "Password is a required field"
   * -    Check that password field is not less than 6 characters in length - "Password must be at least 6 characters"
   * -    Check that confirmPassword field has the same value as password field - Passwords do not match
   */
  const validateInput = (data) => {
    const { username, password, confirmPassword } = data;
    if (username.length === 0) {
      enqueueSnackbar("Username is a required field", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return false;
    }
    if (username.length < 6) {
      enqueueSnackbar("Username must be at least 6 characters", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return false;
    }
    if (password.length === 0) {
      enqueueSnackbar("Password is a required field", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return false;
    }
    if (password.length < 6) {
      enqueueSnackbar("Password must be at least 6 characters", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return false;
    }
    if (password !== confirmPassword) {
      enqueueSnackbar("Passwords do not match", {
        variant: "warning",
        autoHideDuration: 2000,
      });
      return false;
    }
    return true;
  };

  /**
   *
   * @param {htmlEvent} e
   * onClick event is making use of this function to set registration form input fields, so it is accepting HTML event object
   *
   * @returns {undefined}
   * Returns undefined everytime
   *
   * It is making use of useState hook to set user registration form data to registrationData variable
   * This is an example of controlled components
   */
  const registerInputHandler = (e) => {
    e.stopPropagation();
    setRegistrationData({
      ...registrationData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
      minHeight="100vh"
    >
      <Header hasHiddenAuthButtons={false} />
      <Box className="content">
        <Stack spacing={2} className="form">
          <h2 className="title">Register</h2>
          <TextField
            id="username"
            label="Username"
            variant="outlined"
            title="Username"
            name="username"
            placeholder="Enter Username"
            fullWidth
            value={registrationData.username}
            onChange={registerInputHandler}
          />
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type="password"
            helperText="Password must be atleast 6 characters length"
            fullWidth
            placeholder="Enter a password with minimum 6 characters"
            value={registrationData.password}
            onChange={registerInputHandler}
          />
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            fullWidth
            value={registrationData.confirmPassword}
            onChange={registerInputHandler}
          />
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent:"center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <Button
              className="button"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                register(registrationData);
              }}
            >
              Register Now
            </Button>
          )}
           <p className="secondary-action">
             Already have an account?{" "}
            <Link className="link" to="/login">
             Login here
            </Link>
          </p>
        </Stack>
      </Box>
      <Footer />
    </Box>
  );
};

export default Register;
