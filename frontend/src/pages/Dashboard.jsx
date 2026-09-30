import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const storedUser = localStorage.getItem("artcircle_user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const firstName = user?.first_name || "there";
  const token = localStorage.getItem("artcircle_token");

const [favouriteArtworks, setFavouriteArtworks] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [incomingLoading, setIncomingLoading] = useState(false);
  const [incomingError, setIncomingError] = useState("");
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

useEffect(() => {
  const fetchDashboardActivity = async () => {
    try {
      setActivityLoading(true);
      setActivityError("");

      const artworkResponse = await axios.get(
        `${API_URL}/api/marketplace/artworks/`
      );

      const favouriteKey = user
        ? `artcircle_favourites_${user.id}`
        : null;

      const savedFavouriteIds = favouriteKey
        ? JSON.parse(localStorage.getItem(favouriteKey) || "[]")
        : [];

      const favouriteIds = savedFavouriteIds.map((id) => Number(id));

      const favouriteMatches = artworkResponse.data.filter((artwork) =>
        favouriteIds.includes(Number(artwork.id))
      );

      setFavouriteArtworks(favouriteMatches);

      // Get this user's purchase requests/offers as a buyer
      // AND incoming requests/offers for artwork owned by this user.
      if (token) {
        setIncomingLoading(true);
        setIncomingError("");

        const headers = {
          Authorization: `Token ${token}`,
        };

        const [requestResponse, incomingResponse] = await Promise.all([
          axios.get(
            `${API_URL}/api/marketplace/purchase-requests/`,
            { headers }
          ),
          axios.get(
            `${API_URL}/api/marketplace/artist-requests/`,
            { headers }
          ),
        ]);

        setPurchaseRequests(requestResponse.data);
        setIncomingRequests(incomingResponse.data);
      }
    } catch (err) {
      console.error("Dashboard activity error:", err);
      setActivityError("Unable to load your activity.");
      setIncomingError("Unable to load incoming requests.");
    } finally {
      setActivityLoading(false);
      setIncomingLoading(false);
    }
  };

  fetchDashboardActivity();
}, [token]);

  const handleIncomingRequestStatus = async (requestId, newStatus) => {
    try {
      setUpdatingRequestId(requestId);
      setIncomingError("");

      const response = await axios.patch(
        `${API_URL}/api/marketplace/artist-requests/${requestId}/`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setIncomingRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? response.data : request
        )
      );
    } catch (err) {
      console.error("Incoming request update error:", err);
      setIncomingError(
        err.response?.data?.error ||
          `Unable to ${newStatus} this request.`
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  return (
    <main className="container py-4 py-lg-5">

      {/* Dashboard Header */}
      <section
        className="card border-0 shadow-sm mb-4"
        style={{ backgroundColor: "var(--paper)" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="row align-items-center g-4">

            <div className="col-lg-8">
              <p
                className="small fw-semibold text-uppercase mb-2"
                style={{ color: "var(--rose)" }}
              >
                Your ArtCircle Space
              </p>

              <h1 className="display-6 fw-bold mb-3">
                Welcome back, {firstName}.
              </h1>

              <p className="text-muted mb-0">
                Your ArtCircle dashboard is your space to manage your
                activity, discover opportunities and stay connected with
                the community.
              </p>
            </div>

            <div className="col-lg-4 text-lg-end">
              <Link
                to="/sell-art"
                className="btn px-4 py-2 me-2 mb-2"
                style={{
                  backgroundColor: "var(--plum)",
                  color: "white",
                  borderColor: "var(--plum)",
                }}
              >
                Sell Art
              </Link>

              <Link
                to="/explore"
                className="btn btn-outline-secondary px-4 py-2 mb-2"
              >
                Explore Art
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="mb-5">

        <div className="mb-4">
          <p
            className="small fw-semibold text-uppercase mb-1"
            style={{ color: "var(--rose)" }}
          >
            Quick Actions
          </p>

          <h2 className="h3 fw-semibold mb-0">
            Your ArtCircle
          </h2>
        </div>

        <div className="row g-4">

          {/* Explore */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{ backgroundColor: "var(--sage)" }}
                >
                  DISCOVER
                </span>

                <h3 className="h4 fw-semibold">
                  Explore Art
                </h3>

                <p className="text-muted flex-grow-1">
                  Discover artwork from independent artists and browse
                  available pieces across ArtCircle.
                </p>

                <Link
                  to="/explore"
                  className="btn btn-outline-secondary mt-3"
                >
                  Browse Artwork
                </Link>

              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "var(--ink)",
                  }}
                >
                  ACTIVITY
                </span>

                <h3 className="h4 fw-semibold">
                  Your Activity
                </h3>

                <p className="text-muted flex-grow-1">
                  See your saved artworks.
                </p>

                <a
                  href="#your-activity"
                  className="btn btn-outline-secondary mt-3"
                >
                  View Activity
                </a>

              </div>
            </div>
          </div>

          {/* Requests */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{ backgroundColor: "var(--rose)" }}
                >
                  REQUESTS
                </span>

                <h3 className="h4 fw-semibold">
                  Offers & Requests
                </h3>

                <p className="text-muted flex-grow-1">
                  Review/update purchase requests and offers submitted for
                  artworks.
                </p>

                <a
                  href="#incoming-requests"
                  className="btn btn-outline-secondary mt-3"
                >
                  View Offers & Requests
                </a>

              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{ backgroundColor: "var(--plum)" }}
                >
                  COMMUNITY
                </span>

                <h3 className="h4 fw-semibold">
                  Messages
                </h3>

                <p className="text-muted flex-grow-1">
                  Stay connected with artists and art lovers through
                  your ArtCircle conversations.
                </p>

                <Link
                  to="/messages"
                  className="btn btn-outline-secondary mt-3"
                >
                  Open Messages
                </Link>

              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{ backgroundColor: "var(--sage)" }}
                >
                  PROFILE
                </span>

                <h3 className="h4 fw-semibold">
                  Your Profile
                </h3>

                <p className="text-muted flex-grow-1">
                  Update your profile photo, biography and ArtCircle
                  information.
                </p>

                <Link
                  to="/profile"
                  className="btn btn-outline-secondary mt-3"
                >
                  View Profile
                </Link>

              </div>
            </div>
          </div>

          {/* Home */}
          <div className="col-12 col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-body p-4 d-flex flex-column">

                <span
                  className="badge rounded-pill align-self-start mb-3"
                  style={{
                    backgroundColor: "var(--gold)",
                    color: "var(--ink)",
                  }}
                >
                  ARTCIRCLE
                </span>

                <h3 className="h4 fw-semibold">
                  Back to Home
                </h3>

                <p className="text-muted flex-grow-1">
                  Return to the ArtCircle homepage and discover the
                  story behind the platform.
                </p>

                <Link
                  to="/"
                  className="btn btn-outline-secondary mt-3"
                >
                  Go Home
                </Link>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Your Activity */}
      <section
        id="your-activity"
        className="mb-5"
      >

        <div className="mb-4">
          <p
            className="small fw-semibold text-uppercase mb-1"
            style={{ color: "var(--rose)" }}
          >
            Your Activity
          </p>

          <h2 className="h3 fw-semibold mb-0">
            Saved Arts & Requests
          </h2>
        </div>

        {activityError && (
          <div className="alert alert-danger">
            {activityError}
          </div>
        )}

        {activityLoading ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <>

            {/* Favourites */}
            <div
              className="card border-0 shadow-sm mb-4"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.82)" }}
            >
              <div className="card-body p-4 p-md-5">

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <p
                      className="small fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--rose)" }}
                    >
                      Favourites
                    </p>

                    <h3 className="h4 fw-semibold mb-0">
                      Your Saved Artworks
                    </h3>
                  </div>

                  <span className="badge rounded-pill bg-light text-dark">
                    {favouriteArtworks.length}
                  </span>
                </div>

                {favouriteArtworks.length === 0 ? (
                  <p className="text-muted mb-0">
                    You haven't added any artwork to your favourites yet.
                  </p>
                ) : (
                  <div className="row g-4">

                    {favouriteArtworks.map((artwork) => (
                      <div
                        key={artwork.id}
                        className="col-12 col-md-6 col-lg-4"
                      >
                        <div className="card h-100 border-0 shadow-sm overflow-hidden">

                          <img
                            src={`${API_URL}${artwork.image}`}
                            alt={artwork.title}
                            className="w-100"
                            style={{
                              height: "220px",
                              objectFit: "cover",
                            }}
                          />

                          <div className="card-body d-flex flex-column">

                            <h4 className="h5 fw-semibold mb-2">
                              {artwork.title}
                            </h4>

                            <p className="text-muted mb-2">
                              by {artwork.artist_name}
                            </p>

                            <p className="fw-bold fs-5 mb-3">
                              €{artwork.price}
                            </p>

                            <Link
                              to={`/artwork/${artwork.id}`}
                              className="btn btn-outline-secondary mt-auto"
                            >
                              View Artwork
                            </Link>

                          </div>
                        </div>
                      </div>
                    ))}

                  </div>
                )}

              </div>
            </div>

      {/* Incoming Requests & Offers — artwork owned by this user */}
      <section id="incoming-requests" className="mb-5">
        <div className="mb-4">
          <p
            className="small fw-semibold text-uppercase mb-1"
            style={{ color: "var(--rose)" }}
          >
            Seller Activity
          </p>

          <h2 className="h3 fw-semibold mb-0">
            Incoming Requests & Offers
          </h2>

          <p className="text-muted mt-2 mb-0">
            Requests and offers from buyers and for artworks you have listed.
          </p>
        </div>

        {incomingError && (
          <div className="alert alert-danger">
            {incomingError}
          </div>
        )}

        {incomingLoading ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 text-center">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">
                  Loading...
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="card border-0 shadow-sm"
            style={{ backgroundColor: "rgba(255, 255, 255, 0.82)" }}
          >
            <div className="card-body p-4 p-md-5">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <p
                    className="small fw-semibold text-uppercase mb-1"
                    style={{ color: "var(--rose)" }}
                  >
                    My Artworks
                  </p>

                  <h3 className="h4 fw-semibold mb-0">
                    Manage Listings
                  </h3>
                </div>

                <span className="badge rounded-pill bg-light text-dark">
                  {incomingRequests.length}
                </span>
              </div>

              {incomingRequests.length === 0 ? (
                <p className="text-muted mb-0">
                  You don't have any incoming purchase requests or offers
                  yet.
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Artwork</th>
                        <th>From</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th className="text-md-end">Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {incomingRequests.map((request) => {
                        const buyerId =
                          typeof request.buyer === "object" && request.buyer !== null
                            ? request.buyer.id
                            : request.buyer;

                        const buyerName =
                          request.buyer_name ||
                          request.buyer_display_name ||
                          (typeof request.buyer === "object" && request.buyer !== null
                            ? [request.buyer.first_name, request.buyer.last_name]
                                .filter(Boolean)
                                .join(" ")
                            : typeof request.buyer === "string"
                            ? request.buyer
                            : "Buyer");

                        const isPending = request.status === "pending";
                        const isUpdating =
                          updatingRequestId === request.id;

                        return (
                          <tr key={request.id}>
                            <td>
                              <span className="small">
                                {request.request_type === "offer"
                                  ? "Make an Offer"
                                  : "Request to Buy"}
                              </span>
                            </td>

                            <td>
                              <Link
                                to={`/artwork/${request.artwork}`}
                                className="fw-semibold text-decoration-none"
                              >
                                {request.artwork_title}
                              </Link>
                            </td>

                            <td>
                              {buyerId ? (
                                <Link
                                  to={`/public-profile/${buyerId}`}
                                  className="small fw-semibold text-decoration-none"
                                >
                                  {buyerName}
                                </Link>
                              ) : (
                                <span className="small">
                                  {buyerName}
                                </span>
                              )}
                            </td>

                            <td>
                              <span className="fw-semibold">
                                €{request.offered_price}
                              </span>
                            </td>

                            <td>
                              <span
                              className={
                                request.status === "accepted"
                                  ? "badge"
                                  : request.status === "declined"
                                  ? "badge"
                                  : request.status === "cancelled"
                                  ? "badge bg-secondary"
                                  : "badge"
                              }
                              style={{
                                backgroundColor:
                                  request.status === "accepted"
                                    ? "var(--sage)"
                                    : request.status === "declined"
                                    ? "var(--rose)"
                                    : request.status === "pending"
                                    ? "var(--gold)"
                                    : undefined,
                                color:
                                  request.status === "pending"
                                    ? "var(--ink)"
                                    : "white",
                              }}
                            >
                              {request.status}
                            </span>
                            </td>

                            <td className="text-md-end">
                              {isPending ? (
                                <div className="d-flex flex-column flex-md-row gap-2 justify-content-md-end">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-success"
                                    style={{
                                      backgroundColor: "var(--sage)",
                                      borderColor: "var(--sage)",
                                      color: "white",
                                    }}
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleIncomingRequestStatus(
                                        request.id,
                                        "accepted"
                                      )
                                    }
                                  >
                                    {isUpdating ? "Updating..." : "Accept"}
                                  </button>

                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    style={{
                                      color: "var(--rose)",
                                      borderColor: "var(--rose)",
                                      backgroundColor: "transparent",
                                    }}
                                    disabled={isUpdating}
                                    onClick={() =>
                                      handleIncomingRequestStatus(
                                        request.id,
                                        "declined"
                                      )
                                    }
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <span className="text-muted small">
                                  —
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

            {/* Requests & Offers */}
            <div
              id="purchase-activity"
              className="card border-0 shadow-sm"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.82)" }}
            >
              <div className="card-body p-4 p-md-5">

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <p
                      className="small fw-semibold text-uppercase mb-1"
                      style={{ color: "var(--rose)" }}
                    >
                      Requests & Offers
                    </p>

                    <h3 className="h4 fw-semibold mb-0">
                      Your Purchase Activity
                    </h3>
                  </div>

                  <span className="badge rounded-pill bg-light text-dark">
                    {purchaseRequests.length}
                  </span>
                </div>

                {purchaseRequests.length === 0 ? (
                  <p className="text-muted mb-0">
                    You haven't made any purchase requests or offers yet.
                  </p>
                ) : (
                  <div className="row g-3">

                    {purchaseRequests.map((request) => (
                      <div
                        key={request.id}
                        className="col-12"
                      >
                        <div className="border rounded-3 p-3">

                          <div className="row align-items-center g-3">

                            <div className="col-md-5">
                              <div className="fw-semibold">
                                {request.artwork_title}
                              </div>

                              <div className="small text-muted">
                                {request.request_type === "offer"
                                  ? "Make an Offer"
                                  : "Request to Buy"}
                              </div>
                            </div>

                            <div className="col-md-3">
                              <span className="fw-semibold">
                                €{request.offered_price}
                              </span>
                            </div>

                            <div className="col-md-2">
                              <span
                                className={
                                  request.status === "accepted"
                                    ? "badge"
                                    : request.status === "declined"
                                    ? "badge"
                                    : request.status === "cancelled"
                                    ? "badge bg-secondary"
                                    : "badge"
                                }
                                style={{
                                  backgroundColor:
                                    request.status === "accepted"
                                      ? "var(--sage)"
                                      : request.status === "declined"
                                      ? "var(--rose)"
                                      : request.status === "pending"
                                      ? "var(--gold)"
                                      : undefined,
                                  color:
                                    request.status === "pending"
                                      ? "var(--ink)"
                                      : "white",
                                }}
                              >
                                {request.status}
                              </span>
                            </div>

                            <div className="col-md-2 text-md-end">
                              <div className="d-flex flex-column gap-2 align-items-md-end">

                                <Link
                                  to={`/artwork/${request.artwork}`}
                                  className="btn btn-sm btn-outline-secondary"
                                >
                                  View
                                </Link>

                                {request.status === "pending" && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={async () => {
                                      const confirmed = window.confirm(
                                        "Are you sure you want to cancel this request?"
                                      );

                                      if (!confirmed) {
                                        return;
                                      }

                                      try {
                                        await axios.patch(
                                          `${API_URL}/api/marketplace/purchase-requests/${request.id}/cancel/`,
                                          {},
                                          {
                                            headers: {
                                              Authorization: `Token ${token}`,
                                            },
                                          }
                                        );

                                        setPurchaseRequests((currentRequests) =>
                                          currentRequests.map((currentRequest) =>
                                            currentRequest.id === request.id
                                              ? {
                                                  ...currentRequest,
                                                  status: "cancelled",
                                                }
                                              : currentRequest
                                          )
                                        );
                                      } catch (err) {
                                        alert(
                                          err.response?.data?.error ||
                                            "Unable to cancel this request."
                                        );
                                      }
                                    }}
                                  >
                                    Cancel
                                  </button>
                                )}

                              </div>
                            </div>

                          </div>

                        </div>
                      </div>
                    ))}

                  </div>
                )}

              </div>
            </div>

          </>
        )}

      </section>

    </main>
  );
}

export default Dashboard;