import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { startConversation } from "../../services/messageService";

const API_URL = "https://localhost:7210/api";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [quantity, setQuantity] = useState(1);

  const [sellerMessage, setSellerMessage] = useState("");

  const [sendingMessage, setSendingMessage] = useState(false);

  const [addingToCart, setAddingToCart] = useState(false);

  // ==========================================
  // GET PRODUCT DETAILS
  // ==========================================

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/Customer/products/${id}`);

        if (!response.ok) {
          throw new Error("Failed to load product.");
        }

        const data = await response.json();

        setProduct(data);
      } catch (err) {
        console.error(err);

        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ==========================================
  // ADD TO CART
  // ==========================================

  const handleAddToCart = async () => {
    try {
      setAddingToCart(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login as customer first.");

        navigate("/login");

        return;
      }

      const response = await fetch(`${API_URL}/Customer/cart/items`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          productId: product.id,

          quantity: quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add product to cart.");
      }

      alert("Product added to cart successfully!");
    } catch (err) {
      console.error(err);

      alert(err.message || "Something went wrong.");
    } finally {
      setAddingToCart(false);
    }
  };

  // ==========================================
  // CONTACT SELLER
  // ==========================================

  const handleContactSeller = async () => {
    if (!sellerMessage.trim()) {
      alert("Please enter a message.");

      return;
    }

    if (!product.sellerId) {
      alert("Seller information is not available.");

      return;
    }

    try {
      setSendingMessage(true);

      const conversation = await startConversation(
        product.sellerId,
        product.id,
        sellerMessage.trim(),
      );

      setSellerMessage("");

      navigate(`/messages/${conversation.conversationId}`);
    } catch (err) {
      console.error("Contact Seller Error:", err);

      alert(err.message || "Unable to start conversation.");
    } finally {
      setSendingMessage(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container mt-5">
        <h3>Loading product...</h3>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>

        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  // ==========================================
  // PRODUCT NOT FOUND
  // ==========================================

  if (!product) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning">Product not found.</div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="container mt-5">
      {/* ================================= */}
      {/* PRODUCT DETAILS */}
      {/* ================================= */}

      <div className="row">
        {/* PRODUCT IMAGE */}

        <div className="col-md-6">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="img-fluid rounded"
              style={{
                maxHeight: "450px",
                width: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            <div
              className="border rounded d-flex align-items-center justify-content-center"
              style={{
                height: "400px",
              }}
            >
              <h5>No Image Available</h5>
            </div>
          )}
        </div>

        {/* PRODUCT INFORMATION */}

        <div className="col-md-6">
          <h1>{product.name}</h1>

          {/* PRICE */}

          <h3 className="text-primary mt-3">
            Rs. {Number(product.price || 0).toLocaleString()}
          </h3>

          {/* DESCRIPTION */}

          <div className="mt-4">
            <h5>Description</h5>

            <p>{product.description || "No description available."}</p>
          </div>

          {/* STOCK */}

          <div className="mt-3">
            <strong>Available Stock:</strong>{" "}
            {product.stock ?? product.availableStock ?? 0}
          </div>

          {/* QUANTITY */}

          <div className="mt-4">
            <label className="form-label">Quantity</label>

            <input
              type="number"
              className="form-control"
              min="1"
              max={product.stock ?? product.availableStock ?? 1}
              value={quantity}
              onChange={(e) => {
                const value = Number(e.target.value);

                if (value >= 1) {
                  setQuantity(value);
                }
              }}
              style={{
                width: "120px",
              }}
            />
          </div>

          {/* ADD TO CART */}

          <button
            className="btn btn-success mt-4"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            {addingToCart ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>

      {/* ================================= */}
      {/* CONTACT SELLER */}
      {/* ================================= */}

      <div className="card mt-5 mb-5">
        <div className="card-body">
          <h4 className="card-title">Contact Seller</h4>

          <p className="text-muted">
            Have a question about this product? Send a message to the seller.
          </p>

          <textarea
            className="form-control"
            rows="4"
            placeholder="Ask seller about this product..."
            value={sellerMessage}
            onChange={(e) => setSellerMessage(e.target.value)}
          />

          <button
            className="btn btn-primary mt-3"
            onClick={handleContactSeller}
            disabled={sendingMessage}
          >
            {sendingMessage ? "Starting Conversation..." : "Contact Seller"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
