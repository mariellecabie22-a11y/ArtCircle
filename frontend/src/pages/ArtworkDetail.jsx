import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

function ArtworkDetail() {
  const { id } = useParams();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request to buy
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Make an offer
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [offerSubmitting, setOfferSubmitting] = useState(false);

  // Request custom art
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customBudget, setCustomBudget] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [customSubmitting, setCustomSubmitting] = useState(false);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/marketplace/artworks/${id}/`
        );

        setArtwork(response.data);
      } catch (err) {
        setError("Unable to load this artwork.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleFavourite = () => {
    const token = localStorage.getItem("artcircle_token");

    if (!token) {
      alert("Please log in to add favourites.");
      return;
    }

    const favourites = JSON.parse(
      localStorage.getItem("artcircle_favourites") || "[]"
    );

    if (isFavourite) {
      const updatedFavourites = favourites.filter(
        (favouriteId) => favouriteId !== artwork.id
      );

      localStorage.setItem(
        "artcircle_favourites",
        JSON.stringify(updatedFavourites)
      );

      setIsFavourite(false);
    } else {
      const updatedFavourites = [...favourites, artwork.id];

      localStorage.setItem(
        "artcircle_favourites",
        JSON.stringify(updatedFavourites)
      );

      setIsFavourite(true);
    }
  };

  const handleRequestToBuy = async () => {
    const token = localStorage.getItem("artcircle_token");

    if (!token) {
      setRequestMessage("Please log in to request this artwork.");
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/marketplace/purchase-requests/",
        {
          artwork: artwork.id,
          request_type: "buy",
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setRequestMessage(
        `Request sent successfully for €${response.data.offered_price}.`
      );
    } catch (err) {
      if (err.response?.data?.error) {
        setRequestMessage(err.response.data.error);
      } else {
        setRequestMessage(
          "Unable to send your request. Please try again."
        );
      }
    } finally {
      setRequestSubmitting(false);
    }
  };

  const handleMakeOffer = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("artcircle_token");

    if (!token) {
      setOfferMessage("Please log in to make an offer.");
      return;
    }

    if (!offerPrice || Number(offerPrice) <= 0) {
      setOfferMessage("Please enter a valid offer amount.");
      return;
    }

    setOfferSubmitting(true);
    setOfferMessage("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/marketplace/purchase-requests/",
        {
          artwork: artwork.id,
          request_type: "offer",
          offered_price: offerPrice,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setOfferMessage(
        `Offer submitted successfully for €${response.data.offered_price}.`
      );

      setOfferPrice("");
    } catch (err) {
      if (err.response?.data?.error) {
        setOfferMessage(err.response.data.error);
      } else {
        setOfferMessage(
          "Unable to submit your offer. Please try again."
        );
      }
    } finally {
      setOfferSubmitting(false);
    }
  };

  const handleCustomRequest = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("artcircle_token");

    if (!token) {
      setCustomMessage(
        "Please log in to request custom artwork."
      );
      return;
    }

    if (!customDescription.trim()) {
      setCustomMessage(
        "Please describe what you would like."
      );
      return;
    }

    setCustomSubmitting(true);
    setCustomMessage("");

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/marketplace/custom-requests/",
        {
          artwork: artwork.id,
          description: customDescription,
          budget: customBudget || null,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setCustomMessage(
        "Your custom artwork request has been sent to the artist."
      );

      setCustomDescription("");
      setCustomBudget("");
    } catch (err) {
      if (err.response?.data?.error) {
        setCustomMessage(err.response.data.error);
      } else {
        setCustomMessage(
          "Unable to send your custom request. Please try again."
        );
      }
    } finally {
      setCustomSubmitting(false);
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

  if (error || !artwork) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error || "Artwork not found."}
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

  return (
    <main className="container py-5">
      <div className="row g-5 align-items-start">

        {/* Artwork image */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm overflow-hidden">
            <img
              src={`http://127.0.0.1:8000${artwork.image}`}
              alt={artwork.title}
              className="w-100 artwork-detail-image"
            />
          </div>
        </div>

        {/* Artwork information */}
        <div className="col-12 col-lg-5">

          <p className="eyebrow mb-2">
            {artwork.category.replace("_", " ")}
          </p>

          <h1 className="display-5 fw-bold mb-3">
            {artwork.title}
          </h1>

          <p className="fs-3 fw-bold mb-4">
            €{artwork.price}
          </p>

          {/* Artist information */}
          <div className="mb-3">

            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span>
                by{" "}
                <Link
                  to={`/public-profile/${artwork.artist}`}
                  className="text-muted text-decoration-none fw-semibold"
                >
                  {artwork.artist_name}
                </Link>
              </span>

              {artwork.artist_verified && (
                <span
                  className="badge rounded-pill"
                  style={{
                    backgroundColor: "var(--sage)",
                  }}
                >
                  ✓ Verified Artist
                </span>
              )}
            </div>

            <div className="mt-2">
              {artwork.artist_review_count > 0 ? (
                <span>
                  <span
                    style={{
                      color: "var(--gold)",
                    }}
                  >
                    ★
                  </span>{" "}
                  <strong>
                    {artwork.artist_rating}
                  </strong>

                  <span className="text-muted">
                    {" "}
                    · {artwork.artist_review_count}{" "}
                    {artwork.artist_review_count === 1
                      ? "review"
                      : "reviews"}
                  </span>
                </span>
              ) : (
                <span className="text-muted small">
                  No reviews yet
                </span>
              )}
            </div>
          </div>

          {/* Available / Sold */}
          {artwork.status === "available" ? (
            <div className="d-grid gap-2">

              {/* Request to Buy */}
              <button
                type="button"
                className="btn btn-dark btn-lg"
                onClick={handleRequestToBuy}
                disabled={requestSubmitting}
              >
                {requestSubmitting
                  ? "Sending..."
                  : "Request to Buy"}
              </button>

              {requestMessage && (
                <div className="alert alert-info mt-2 mb-0">
                  {requestMessage}
                </div>
              )}

              {/* Make an Offer */}
              <button
                type="button"
                className="btn btn-outline-dark btn-lg"
                onClick={() => {
                  setShowOfferForm(!showOfferForm);
                  setOfferMessage("");
                }}
              >
                {showOfferForm
                  ? "Cancel Offer"
                  : "Make an Offer"}
              </button>

              {showOfferForm && (
                <form
                  onSubmit={handleMakeOffer}
                  className="border rounded-3 p-3 mt-2 bg-light"
                >
                  <label
                    htmlFor="offerPrice"
                    className="form-label fw-semibold"
                  >
                    Your offer
                  </label>

                  <div className="input-group">
                    <span className="input-group-text">
                      €
                    </span>

                    <input
                      id="offerPrice"
                      type="number"
                      className="form-control"
                      min="0.01"
                      step="0.01"
                      value={offerPrice}
                      onChange={(event) =>
                        setOfferPrice(event.target.value)
                      }
                      placeholder="Enter your offer"
                      required
                    />

                    <button
                      type="submit"
                      className="btn btn-dark"
                      disabled={offerSubmitting}
                    >
                      {offerSubmitting
                        ? "Submitting..."
                        : "Submit Offer"}
                    </button>
                  </div>

                  {offerMessage && (
                    <div className="alert alert-info mt-3 mb-0">
                      {offerMessage}
                    </div>
                  )}
                </form>
              )}

            </div>
          ) : (
            <div className="alert alert-secondary">
              This artwork is no longer available.
            </div>
          )}

          {/* Request Custom Art */}
          <div className="d-grid gap-2 mt-3">

            <button
              type="button"
              className="btn btn-outline-dark btn-lg"
              onClick={() => {
                setShowCustomForm(!showCustomForm);
                setCustomMessage("");
              }}
            >
              {showCustomForm
                ? "Cancel Custom Request"
                : "Request Custom Art"}
            </button>

            {showCustomForm && (
              <form
                onSubmit={handleCustomRequest}
                className="border rounded-3 p-3 bg-light"
              >
                <h5 className="mb-3">
                  Request Custom Art
                </h5>

                <p className="small text-secondary">
                  Love this artist's style? Tell them what
                  you'd like them to create for you.
                </p>

                <div className="mb-3">
                  <label
                    htmlFor="customDescription"
                    className="form-label fw-semibold"
                  >
                    What would you like?
                  </label>

                  <textarea
                    id="customDescription"
                    className="form-control"
                    rows="5"
                    maxLength="2000"
                    value={customDescription}
                    onChange={(event) =>
                      setCustomDescription(event.target.value)
                    }
                    placeholder="Describe the artwork you'd like the artist to create..."
                    required
                  />
                </div>

                <div className="mb-3">
                  <label
                    htmlFor="customBudget"
                    className="form-label fw-semibold"
                  >
                    Optional Budget (€)
                  </label>

                  <input
                    id="customBudget"
                    type="number"
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    value={customBudget}
                    onChange={(event) =>
                      setCustomBudget(event.target.value)
                    }
                    placeholder="e.g. 200"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-dark w-100"
                  disabled={customSubmitting}
                >
                  {customSubmitting
                    ? "Sending..."
                    : "Send Custom Request"}
                </button>

                {customMessage && (
                  <div className="alert alert-info mt-3 mb-0">
                    {customMessage}
                  </div>
                )}
              </form>
            )}

            {/* Favourites */}
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleFavourite}
            >
              {isFavourite ? "♥ Remove from Favourites" : "♡ Add to Favourites"}
            </button>

          </div>

          <Link
            to="/explore"
            className="btn btn-link px-0 mt-4"
          >
            ← Back to Explore Art
          </Link>

        </div>
      </div>
    </main>
  );
}

export default ArtworkDetail;