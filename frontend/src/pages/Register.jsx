import { API_URL } from "../config";
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password2: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/register/`,
        formData
      );

      setSuccess(response.data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;

        if (errors.password) {
          setError(errors.password[0]);
        } else if (errors.email) {
          setError(errors.email[0]);
        } else if (errors.detail) {
          setError(errors.detail);
        } else {
          setError("Please check your details and try again.");
        }
      } else {
        setError("Unable to connect to the server.");
      }
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">

        <div className="auth-heading">
          <p className="eyebrow">WELCOME TO ARTCIRCLE</p>

          <h1>Create your account</h1>

          <p>
            Join ArtCircle and become part of a community built around
            creativity, connection and opportunity.
          </p>
        </div>

        {error && (
          <div className="form-message error">
            {error}
          </div>
        )}

        {success && (
          <div className="form-message success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">

          <div className="form-row">

            <div className="form-group">
              <label htmlFor="first_name">
                First name
              </label>

              <input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="last_name">
                Last name
              </label>

              <input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="form-group">
            <label htmlFor="email">
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              minLength="8"
              required
            />

            <small>
              Minimum 8 characters.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="password2">
              Confirm password
            </label>

            <input
              id="password2"
              name="password2"
              type={showPassword ? "text" : "password"}
              value={formData.password2}
              onChange={handleChange}
              minLength="8"
              required
            />

            <label className="password-toggle">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(event) => setShowPassword(event.target.checked)}
              />
              <span>Show password</span>
            </label>
          </div>

          <button
            type="submit"
            className="auth-submit"
          >
            Create Account
          </button>

        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>

      </section>
    </main>
  );
}

export default Register;