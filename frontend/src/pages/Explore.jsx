import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Explore() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/api/marketplace/artworks/`
        );

        setArtworks(response.data);
      } catch (err) {
        setError("Unable to load artwork.");
      } finally {
        setLoading(false);
      }
    };

    fetchArtworks();
  }, []);

  // Filter artworks
  const filteredArtworks = artworks.filter((artwork) => {
    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      artwork.title.toLowerCase().includes(search) ||
      artwork.artist_name.toLowerCase().includes(search) ||
      artwork.description.toLowerCase().includes(search);

    const matchesCategory =
      categoryFilter === "all" ||
      artwork.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      artwork.status === statusFilter;

    const price = Number(artwork.price);

    const matchesMinPrice =
      minPrice === "" || price >= Number(minPrice);

    const matchesMaxPrice =
      maxPrice === "" || price <= Number(maxPrice);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
    setStatusFilter("all");
    setMinPrice("");
    setMaxPrice("");
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

  return (
    <main className="container py-5">

      {/* Page heading */}
      <section className="mb-5">
        <p className="eyebrow mb-2">
          THE ARTCIRCLE MARKETPLACE
        </p>

        <h1 className="display-3 fw-bold mb-3">
          Explore Art
        </h1>

        <p className="lead text-secondary mb-0">
          Discover original artwork from independent artists
          and find something that speaks to you.
        </p>
      </section>

      {error && (
        <div className="alert alert-danger">
          {error}
        </div>
      )}

      {/* Search and filters */}
      <section className="card border-0 shadow-sm mb-5">
        <div className="card-body p-4">

          <h2 className="h5 fw-semibold mb-3">
            Find Artwork
          </h2>

          <div className="row g-3">

            {/* Search */}
            <div className="col-12">
              <label
                htmlFor="search"
                className="form-label"
              >
                Search
              </label>

              <input
                id="search"
                type="text"
                className="form-control"
                placeholder="Search by artwork, artist or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="category"
                className="form-label"
              >
                Category
              </label>

              <select
                id="category"
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="painting">Painting</option>
                <option value="drawing">Drawing</option>
                <option value="digital">Digital Art</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status */}
            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="status"
                className="form-label"
              >
                Status
              </label>

              <select
                id="status"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Artwork</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="sold">Sold</option>
              </select>
            </div>

            {/* Minimum price */}
            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="minPrice"
                className="form-label"
              >
                Minimum Price (€)
              </label>

              <input
                id="minPrice"
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            {/* Maximum price */}
            <div className="col-12 col-md-6 col-lg-3">
              <label
                htmlFor="maxPrice"
                className="form-label"
              >
                Maximum Price (€)
              </label>

              <input
                id="maxPrice"
                type="number"
                className="form-control"
                min="0"
                step="0.01"
                placeholder="Any price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>

          </div>

          {/* Filter actions */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-4">

            <p className="text-muted mb-0">
              Showing{" "}
              <strong>{filteredArtworks.length}</strong>{" "}
              of{" "}
              <strong>{artworks.length}</strong>{" "}
              artworks
            </p>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        </div>
      </section>

      {/* No results */}
      {!error && filteredArtworks.length === 0 && (
        <section className="text-center py-5">
          <h2>No artwork found</h2>

          <p className="text-secondary">
            Try changing your search or filters.
          </p>

          <button
            type="button"
            className="btn btn-outline-dark"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </section>
      )}

      {/* Artwork grid */}
      <div className="row g-4">
        {filteredArtworks.map((artwork) => (
          <div
            className="col-12 col-md-6 col-lg-4"
            key={artwork.id}
          >
            <article className="card h-100 border-0 shadow-sm overflow-hidden">

              <img
                src={`${API_URL}${artwork.image}`}
                alt={artwork.title}
                className="card-img-top artwork-image"
              />

              <div className="card-body p-4 d-flex flex-column">

                <p className="small text-uppercase fw-bold mb-2">
                  {artwork.category.replace("_", " ")}
                </p>

                <h2 className="h4 mb-2">
                  {artwork.title}
                </h2>

                <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                  <p className="text-secondary mb-0">
                    by {artwork.artist_name}
                  </p>

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

                <p className="text-secondary">
                  {artwork.description}
                </p>

                <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                  <strong className="fs-5">
                    €{artwork.price}
                  </strong>

                  <span className="badge rounded-pill bg-light text-dark border">
                    {artwork.status}
                  </span>
                </div>

                <Link
                  to={`/artwork/${artwork.id}`}
                  className="btn btn-outline-dark marketplace-action-btn"
                >
                  View Artwork
                </Link>

              </div>
            </article>
          </div>
        ))}
      </div>

    </main>
  );
}

export default Explore;