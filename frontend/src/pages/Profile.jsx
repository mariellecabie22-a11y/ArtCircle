import { API_URL } from "../config";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Profile() {
  const token = localStorage.getItem("artcircle_token");

  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmationName, setConfirmationName] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = () => {
    setConfirmationName("");
    setError("");
    setMessage("");
    setShowDeleteModal(true);
  };

  const confirmDeleteAccount = async () => {
    if (!token) {
      setError("Please log in to delete your account.");
      return;
    }

    const storedUser = localStorage.getItem("artcircle_user");
    const currentUserId = storedUser
      ? JSON.parse(storedUser)?.id
      : null;

    const fullName = `${firstName} ${lastName}`.trim();

    if (
      confirmationName.trim().toLowerCase() !==
      fullName.toLowerCase()
    ) {
      setError("The name you entered does not match your account name.");
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await axios.delete(
        `${API_URL}/api/accounts/delete-account/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      if (currentUserId) {
        localStorage.removeItem(
          `artcircle_favourites_${currentUserId}`
        );
      }

      localStorage.removeItem("artcircle_token");
      localStorage.removeItem("artcircle_user");

      window.location.href = "/";
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to delete your account. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/accounts/profile/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setProfile(response.data);
        setBio(response.data.bio || "");
        setFirstName(response.data.first_name || "");
        setLastName(response.data.last_name || "");
        setEmail(response.data.email || "");
      } catch (err) {
        setError("Could not load your profile.");
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token]);

  const handlePhotoChange = (event) => {
    setProfilePhoto(event.target.files[0]);
  };

  const handleVerificationRequest = async () => {
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/profile/verification-request/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setProfile((currentProfile) => ({
        ...currentProfile,
        verification_status: response.data.verification_status,
      }));

      setMessage("Your verification request has been submitted.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not submit your verification request."
      );
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("bio", bio);

      if (profilePhoto) {
        formData.append("profile_photo", profilePhoto);
      }

      const response = await axios.patch(
        `${API_URL}/api/accounts/profile/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);
      setBio(response.data.bio || "");
      setProfilePhoto(null);

      const fileInput = document.getElementById("profilePhoto");

      if (fileInput) {
        fileInput.value = "";
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong while updating your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!token) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const profileImage = profile.profile_photo
    ? profile.profile_photo.startsWith("http")
      ? profile.profile_photo
      : `${API_URL}${profile.profile_photo}`
    : null;

  const roleLabel = profile.role
    ? profile.role.replace("_", " ")
    : "Art Lover";

  return (
    <div className="container py-4 py-lg-5">

      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/dashboard"
          className="btn btn-outline-secondary btn-sm"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {/* Profile card */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">

          <div className="row g-0">

            {/* LEFT SIDE */}
            <div
              className="col-lg-4 p-4 p-md-5 text-center border-end"
              style={{
                backgroundColor: "var(--paper)",
              }}
            >
              {/* Profile image */}
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={`${profile.first_name}'s profile`}
                  className="rounded-circle mb-4 border"
                  style={{
                    width: "150px",
                    height: "150px",
                    objectFit: "cover",
                    borderColor: "var(--gold)",
                  }}
                />
              ) : (
                <div
                  className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
                  style={{
                    width: "150px",
                    height: "150px",
                    backgroundColor: "var(--cream)",
                    border: "2px solid var(--gold)",
                    fontSize: "4rem",
                  }}
                >
                  👤
                </div>
              )}

              <h2 className="h4 fw-semibold mb-2">
                {profile.first_name} {profile.last_name}
              </h2>

              <p className="text-muted mb-3">
                {profile.email}
              </p>

              <div className="mb-3">
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "var(--plum)",
                  }}
                >
                  {roleLabel}
                </span>

                {profile.verification_status === "approved" && (
                  <span
                    className="badge rounded-pill ms-2"
                    style={{
                      backgroundColor: "var(--sage)",
                    }}
                  >
                    ✓ Verified
                  </span>
                )}
              </div>

              {/* Verification */}
              <div className="mt-4">
                {profile.verification_status === "not_requested" && (
                  <>
                    <p className="small text-muted mb-2">
                      Want to become a verified artist?
                    </p>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleVerificationRequest}
                    >
                      Request Verification
                    </button>
                  </>
                )}

                {profile.verification_status === "pending" && (
                  <div className="alert alert-warning py-2 mb-0">
                    <strong>Verification Pending</strong>
                    <div className="small mt-1">
                      Your request is waiting for admin review.
                    </div>
                  </div>
                )}

                {profile.verification_status === "approved" && (
                  <div className="alert alert-success py-2 mb-0">
                    <strong>✓ Verified Artist</strong>
                    <div className="small mt-1">
                      Your profile has been verified by an administrator.
                    </div>
                  </div>
                )}

                {profile.verification_status === "rejected" && (
                  <>
                    <div className="alert alert-danger py-2 mb-2">
                      <strong>Verification Not Approved</strong>
                      <div className="small mt-1">
                        You can submit another request for review.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={handleVerificationRequest}
                    >
                      Request Verification Again
                    </button>
                  </>
                )}
              </div>

              <hr />

              <p className="small text-muted mb-0">
                Your ArtCircle profile helps other members discover your
                work and connect with you.
              </p>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-lg-8 p-4 p-md-5">

              <div className="mb-4">
                <h1 className="h3 fw-semibold mb-1">
                  Edit Profile
                </h1>

                <p className="text-muted mb-0">
                  Update your profile information.
                </p>
              </div>

              {message && (
                <div className="alert alert-success">
                  {message}
                </div>
              )}

              {error && !showDeleteModal && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSave}>

                {/* Name */}
                <div className="mb-4">
                  <h2 className="h6 fw-semibold mb-3">
                    Account Information
                  </h2>

                  <div className="row g-3">

                    <div className="col-md-6">
                      <label
                        htmlFor="firstName"
                        className="form-label"
                      >
                        First Name
                      </label>

                      <input
                        type="text"
                        id="firstName"
                        className="form-control"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="lastName"
                        className="form-label"
                      >
                        Last Name
                      </label>

                      <input
                        type="text"
                        id="lastName"
                        className="form-control"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label
                        htmlFor="email"
                        className="form-label"
                      >
                        Email Address
                      </label>

                      <input
                        type="email"
                        id="email"
                        className="form-control"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                  </div>
                </div>

                {/* Bio */}
                <div className="mb-4">
                  <label
                    htmlFor="bio"
                    className="form-label fw-semibold"
                  >
                    Bio
                  </label>

                  <textarea
                    id="bio"
                    className="form-control"
                    rows="5"
                    maxLength="500"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell the ArtCircle community about yourself..."
                  />

                  <div className="form-text text-end">
                    {bio.length}/500
                  </div>
                </div>

                {/* Profile picture */}
                <div className="mb-4">
                  <label
                    htmlFor="profilePhoto"
                    className="form-label fw-semibold"
                  >
                    Profile Picture
                  </label>

                  <input
                    type="file"
                    id="profilePhoto"
                    className="form-control"
                    accept="image/*"
                    onChange={handlePhotoChange}
                  />

                  <div className="form-text">
                    Upload a new profile picture.
                  </div>
                </div>

                {/* Buttons */}
                <div className="d-flex justify-content-end gap-2 pt-2">
                  <Link
                    to="/dashboard"
                    className="btn btn-outline-secondary px-4"
                  >
                    Cancel
                  </Link>

                  <button
                    type="submit"
                    className="btn px-4"
                    style={{
                      backgroundColor: "var(--plum)",
                      color: "white",
                      borderColor: "var(--plum)",
                    }}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>

                {/* Delete Account */}
                <div
                  className="mt-5 pt-4"
                  style={{
                    borderTop: "1px solid var(--border)",
                  }}
                >
                  <h2 className="h6 fw-semibold mb-2">
                    Delete Account
                  </h2>

                  <p className="small text-muted mb-3">
                    Permanently delete your ArtCircle account, profile,
                    artwork listings and associated activity.
                  </p>

                  <button
                    type="button"
                    className="btn px-4"
                    style={{
                      backgroundColor: "var(--rose)",
                      color: "white",
                      borderColor: "var(--rose)",
                    }}
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(40, 39, 43, 0.55)",
            zIndex: 1050,
            padding: "20px",
          }}
        >
          <div
            className="card border-0 shadow-lg"
            style={{
              maxWidth: "500px",
              width: "100%",
              backgroundColor: "var(--cream)",
            }}
          >
            <div className="card-body p-4 p-md-5">

              <h2 className="h4 fw-semibold mb-3">
                Are you sure you want to delete your account?
              </h2>

              <p className="text-muted mb-2">
                This will permanently delete your ArtCircle account,
                profile, artwork listings and associated activity.
              </p>

              <p className="fw-semibold mb-4">
                This action cannot be undone.
              </p>

              <label
                htmlFor="confirmationName"
                className="form-label fw-semibold"
              >
                Type your full name to confirm
              </label>

              <input
                type="text"
                id="confirmationName"
                className="form-control mb-2"
                value={confirmationName}
                onChange={(e) => {
                  setConfirmationName(e.target.value);
                  setError("");
                }}
                placeholder={`${firstName} ${lastName}`}
                autoFocus
              />

              <div className="form-text mb-3">
                Type <strong>{firstName} {lastName}</strong> exactly as
                shown on your account.
              </div>

              {error && (
                <div className="alert alert-danger py-2">
                  {error}
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setConfirmationName("");
                    setError("");
                  }}
                  disabled={deleting}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="btn px-4"
                  style={{
                    backgroundColor: "var(--rose)",
                    color: "white",
                    borderColor: "var(--rose)",
                  }}
                  onClick={confirmDeleteAccount}
                  disabled={deleting || !confirmationName.trim()}
                >
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Profile;