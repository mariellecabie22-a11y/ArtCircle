import { API_URL } from "../config";
import { useEffect, useState } from "react";
import axios from "axios";

function ArtistRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("artcircle_token");

      if (!token) {
        setError("You need to log in to view requests.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/marketplace/artist-requests/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setRequests(response.data);
      } catch (err) {
        setError("Unable to load purchase requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const handleStatusChange = async (requestId, newStatus) => {
    const token = localStorage.getItem("artcircle_token");

    try {
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

      setRequests((currentRequests) =>
        currentRequests.map((request) =>
          request.id === requestId ? response.data : request
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to update this request."
      );
    }
  };

  if (loading) {
    return (
      <main className="container py-5">
        <p>Loading requests...</p>
      </main>
    );
  }

  if (error && requests.length === 0) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <section className="mb-5">
        <p className="eyebrow mb-2">ARTIST DASHBOARD</p>

        <h1 className="display-5 fw-bold mb-3">
          Requests & Offers
        </h1>

        <p className="lead text-secondary">
          Review purchase requests and offers from art lovers.
        </p>
      </section>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-5">
          <h2>No requests yet</h2>
          <p className="text-secondary">
            Requests for your artwork will appear here.
          </p>
        </div>
      ) : (
        <div className="row g-4">
          {requests.map((request) => (
            <div className="col-12 col-md-6" key={request.id}>
              <article className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                  <p className="small text-uppercase fw-bold mb-2">
                    {request.request_type === "buy"
                      ? "REQUEST TO BUY"
                      : "MAKE AN OFFER"}
                  </p>

                  <h2 className="h4">
                    {request.artwork_title}
                  </h2>

                  <p className="text-secondary mb-2">
                    Buyer: {request.buyer_name}
                  </p>

                  <p className="fs-5 fw-bold mb-3">
                    €{request.offered_price}
                  </p>

                  <span className="badge rounded-pill bg-light text-dark border">
                    {request.status}
                  </span>

                  {request.status === "pending" && (
                    <div className="d-flex gap-2 mt-4">
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "accepted"
                          )
                        }
                      >
                        Accept
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-dark"
                        onClick={() =>
                          handleStatusChange(
                            request.id,
                            "declined"
                          )
                        }
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {request.status === "accepted" && (
                    <div className="alert alert-success mt-4 mb-0">
                      Request accepted. Artwork marked as sold.
                    </div>
                  )}

                  {request.status === "declined" && (
                    <div className="alert alert-secondary mt-4 mb-0">
                      This request was declined.
                    </div>
                  )}
                </div>
              </article>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

export default ArtistRequests;