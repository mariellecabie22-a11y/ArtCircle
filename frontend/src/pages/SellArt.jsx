import { API_URL } from "../config";
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function SellArt() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("painting");
  const [image, setImage] = useState(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("artcircle_token");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("Please log in to sell artwork.");
      setSaving(false);
      return;
    }

    if (!image) {
      setError("Please select an image of your artwork.");
      setSaving(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("image", image);

      await axios.post(
        `${API_URL}/api/marketplace/artworks/`,
        formData,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Your artwork has been listed successfully.");

      setTitle("");
      setDescription("");
      setPrice("");
      setCategory("painting");
      setImage(null);

      const fileInput = document.getElementById("artworkImage");
      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Something went wrong while listing your artwork."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="text-center mb-4">
            <h1 className="display-6 fw-semibold">Sell Your Art</h1>
            <p className="text-muted">
              Share your artwork with the ArtCircle community.
            </p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">

              {message && (
                <div className="alert alert-success">
                  {message}
                </div>
              )}

              {error && (
                <div className="alert alert-danger">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">
                    Artwork Title
                  </label>

                  <input
                    type="text"
                    id="title"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sunset Study"
                    maxLength="150"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>

                  <textarea
                    id="description"
                    className="form-control"
                    rows="5"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell buyers about your artwork..."
                    maxLength="2000"
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label htmlFor="price" className="form-label">
                      Price (€)
                    </label>

                    <input
                      type="number"
                      id="price"
                      className="form-control"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="120.00"
                      min="0.01"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>

                    <select
                      id="category"
                      className="form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="painting">Painting</option>
                      <option value="drawing">Drawing</option>
                      <option value="digital">Digital Art</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="artworkImage" className="form-label">
                    Artwork Image
                  </label>

                  <input
                    type="file"
                    id="artworkImage"
                    className="form-control"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                    required
                  />

                  <div className="form-text">
                    Upload a clear image of your artwork.
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/explore")}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn gold-button"
                    disabled={saving}
                  >
                    {saving ? "Listing..." : "List Artwork"}
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SellArt;