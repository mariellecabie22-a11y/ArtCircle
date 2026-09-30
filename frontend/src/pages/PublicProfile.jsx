import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("artcircle_token");

  const [profile, setProfile] = useState(null);
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState("");

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const profileResponse = await axios.get(
          `${API_URL}/api/accounts/public-profile/${id}/`
        );

        setProfile(profileResponse.data);

        const artworkResponse = await axios.get(
          `${API_URL}/api/marketplace/artworks/`
        );

        const userArtworks = artworkResponse.data.filter(
          (artwork) =>
            artwork.artist === Number(id) ||
            artwork.artist_id === Number(id)
        );

        setArtworks(userArtworks);
      } catch (err) {
        setError("Unable to load this profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [id]);

  const handleMessage = async () => {
    if (!token) {
      setMessageError("Please log in to message this user.");
      return;
    }

    setMessageLoading(true);
    setMessageError("");

    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/conversations/`,
        {
          participant_id: Number(id),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // Open the Messages tab and tell it which
      // conversation should be selected.
      navigate("/messages", {
        state: {
          conversationId: response.data.id,
        },
      });
    } catch (err) {
      setMessageError(
        err.response?.data?.error ||
          "Unable to start a conversation. Please try again."
      );
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">
            Loading...
          </span>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || "Profile not found."}
        </div>

        <Link
          to="/explore"
          className="btn btn-outline-secondary"
        >
          Back to Explore
        </Link>
      </main>
    );
  }

  const profileImage = profile.profile_photo
    ? profile.profile_photo.startsWith("http")
      ? profile.profile_photo
      : `${API_URL}${profile.profile_photo}`
    : null;

  return (
    <main className="container py-4 py-lg-5">

      {/* Back */}
      <div className="mb-4">
        <Link
          to="/explore"
          className="btn btn-outline-secondary btn-sm"
        >
          ← Back
        </Link>
      </div>

      {/* Profile header */}
      <div className="card border-0 shadow-sm overflow-hidden mb-4">
        <div className="card-body p-4 p-md-5 text-center">

          {profileImage ? (
            <img
              src={profileImage}
              alt={`${profile.first_name}'s profile`}
              className="rounded-circle mb-3 border"
              style={{
                width: "150px",
                height: "150px",
                objectFit: "cover",
                borderColor: "var(--gold)",
              }}
            />
          ) : (
            <div
              className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center"
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

          <h1 className="h2 fw-semibold mb-2">
            {profile.first_name} {profile.last_name}
          </h1>

          {profile.verification_status === "approved" && (
            <span
              className="badge rounded-pill mb-3"
              style={{
                backgroundColor: "var(--sage)",
              }}
            >
              ✓ Verified Account
            </span>
          )}

          <p
            className="text-secondary mb-4 mx-auto"
            style={{ maxWidth: "700px" }}
          >
            {profile.bio || "This user has not added a bio yet."}
          </p>

          {/* Message button */}
          {messageError && (
            <div
              className="alert alert-danger mx-auto mb-3"
              style={{ maxWidth: "500px" }}
            >
              {messageError}
            </div>
          )}

          <button
            type="button"
            className="btn px-4"
            onClick={handleMessage}
            disabled={messageLoading}
            style={{
              backgroundColor: "var(--plum)",
              color: "var(--white)",
              border: "none",
            }}
          >
            {messageLoading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                />
                Opening Messages...
              </>
            ) : (
              <>
                💬 Message {profile.first_name}
              </>
            )}
          </button>

        </div>
      </div>

      {/* Artwork */}
      <section>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4 p-md-5">

            <h2 className="h4 mb-4">
              Artwork
            </h2>

            {artworks.length > 0 ? (
              <div className="row g-4">
                {artworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="col-12 col-md-6 col-lg-4"
                  >
                    <div className="card h-100 border-0 shadow-sm overflow-hidden">

                      <img
                        src={`${API_URL}${artwork.image}`}
                        alt={artwork.title}
                        className="card-img-top artwork-image"
                      />

                      <div className="card-body">
                        <h3 className="h5">
                          {artwork.title}
                        </h3>

                        <p className="text-muted mb-2">
                          €{artwork.price}
                        </p>

                        <Link
                          to={`/artwork/${artwork.id}`}
                          className="btn btn-outline-dark btn-sm w-100"
                        >
                          View Artwork
                        </Link>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">
                No artwork listed yet.
              </p>
            )}

          </div>
        </div>
      </section>

    </main>
  );
}

export default PublicProfile;