import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function EditArtwork() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);

  const token = localStorage.getItem("artcircle_token");
  const storedUser = localStorage.getItem("artcircle_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/marketplace/artworks/${id}/`
        );

        const data = response.data;

        if (
          !currentUser ||
          Number(currentUser.id) !== Number(data.artist)
        ) {
          setError("You can only edit your own artwork.");
          return;
        }

        if (data.status === "sold") {
          setError("Sold artwork cannot be edited.");
          return;
        }

        setArtwork(data);
        setTitle(data.title || "");
        setDescription(data.description || "");
        setPrice(data.price || "");
        setCategory(data.category || "");
      } catch (err) {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Unable to load this artwork.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setError("Please log in to edit your artwork.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (!price || Number(price) <= 0) {
      setError("Please enter a valid price.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);

      if (image) {
        formData.append("image", image);
      }

      const response = await axios.patch(
        `${API_URL}/api/marketplace/artworks/${id}/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setArtwork(response.data);
      setMessage("Your artwork has been updated successfully.");

      setTimeout(() => {
        navigate(`/artwork/${id}`);
      }, 1000);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.response?.data) {
        setError("Unable to update your artwork.");
      } else {
        setError("Unable to update your artwork. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

    const handleDelete = async () => {
      if (!token) {
        setError("Please log in to delete your artwork.");
        return;
      }

      const confirmed = window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      );

      if (!confirmed) {
        return;
      }

      setDeleting(true);
      setError("");
      setMessage("");

      try {
        await axios.delete(
          `${API_URL}/api/marketplace/artworks/${id}/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        if (currentUser) {
          const favouriteKey = `artcircle_favourites_${currentUser.id}`;
          const favourites = JSON.parse(
            localStorage.getItem(favouriteKey) || "[]"
          );

          const updatedFavourites = favourites.filter(
            (favouriteId) => Number(favouriteId) !== Number(id)
          );

          localStorage.setItem(
            favouriteKey,
            JSON.stringify(updatedFavourites)
          );
        }

        navigate("/explore");
      } catch (err) {
        if (err.response?.data?.error) {
          setError(err.response.data.error);
        } else {
          setError("Unable to delete your artwork. Please try again.");
        }
      } finally {
        setDeleting(false);
      }
    };

  if (loading) {
    return (
      <main className="container py-5 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </main>
    );
  }

  if (error && !artwork) {
    return (
      <main className="container py-5">
        <div className="alert alert-danger">
          {error}
        </div>

        <Link
          to={`/artwork/${id}`}
          className="btn btn-outline-secondary"
        >
          Back to Artwork
        </Link>
      </main>
    );
  }

  return (
    <main className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="mb-4">
            <p
              className="small fw-semibold text-uppercase mb-2"
              style={{ color: "var(--rose)" }}
            >
              Manage Your Listing
            </p>

            <h1 className="display-6 fw-bold">
              Edit Artwork
            </h1>

            <p className="text-muted">
              Update your artwork details while the listing is still
              available.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              {error}
            </div>
          )}

          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="card border-0 shadow-sm"
            style={{ backgroundColor: "var(--paper)" }}
          >
            <div className="card-body p-4 p-md-5">

              <div className="mb-4">
                <label
                  htmlFor="title"
                  className="form-label fw-semibold"
                >
                  Artwork Title
                </label>

                <input
                  id="title"
                  type="text"
                  className="form-control"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  maxLength="200"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="description"
                  className="form-label fw-semibold"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  className="form-control"
                  rows="6"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  maxLength="3000"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="price"
                  className="form-label fw-semibold"
                >
                  Price (€)
                </label>

                <input
                  id="price"
                  type="number"
                  className="form-control"
                  min="0.01"
                  step="0.01"
                  value={price}
                  onChange={(event) =>
                    setPrice(event.target.value)
                  }
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="category"
                  className="form-label fw-semibold"
                >
                  Category
                </label>

                <select
                  id="category"
                  className="form-select"
                  value={category}
                  onChange={(event) =>
                    setCategory(event.target.value)
                  }
                  required
                >
                  <option value="">Select a category</option>
                  <option value="painting">Painting</option>
                  <option value="drawing">Drawing</option>
                  <option value="digital_art">Digital Art</option>
                  <option value="photography">Photography</option>
                  <option value="sculpture">Sculpture</option>
                  <option value="mixed_media">Mixed Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mb-4">
                <label
                  htmlFor="image"
                  className="form-label fw-semibold"
                >
                  Replace Image
                </label>

                <input
                  id="image"
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(event) =>
                    setImage(event.target.files[0] || null)
                  }
                />

                <div className="form-text">
                  Leave this empty to keep your current image.
                </div>
              </div>

              <div className="d-flex gap-2 flex-wrap">
                <button
                  type="submit"
                  className="btn px-4"
                  disabled={submitting || deleting}
                  style={{
                    backgroundColor: "var(--sage)",
                    color: "white",
                    borderColor: "var(--sage)",
                  }}
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>

                <Link
                  to={`/artwork/${id}`}
                  className="btn btn-outline-secondary px-4"
                >
                  Cancel
                </Link>

                <button
                  type="button"
                  className="btn px-4"
                  onClick={handleDelete}
                  disabled={submitting || deleting}
                  style={{
                    backgroundColor: "var(--rose)",
                    color: "white",
                    borderColor: "var(--rose)",
                  }}
                >
                  {deleting ? "Deleting..." : "Delete Listing"}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default EditArtwork;