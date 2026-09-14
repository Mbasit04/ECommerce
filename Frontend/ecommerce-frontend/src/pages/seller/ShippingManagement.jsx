import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import {
  getSellerOrders,
  updateSellerShipping,
} from "../../services/sellerService";
import { markCodPaymentAsPaid } from "../../services/paymentService";

const STATUS_OPTIONS = ["Pending", "Processing", "Shipped", "Delivered"];

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const ShippingManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState("Processing");
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getSellerOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Seller orders error:", error);
      toast.error(error.response?.data?.message || "Unable to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const orderGroups = useMemo(() => {
    const byOrder = new Map();
    orders.forEach((item) => {
      const existing = byOrder.get(item.orderId) || {
        ...item,
        items: [],
      };
      existing.items.push(item);
      byOrder.set(item.orderId, existing);
    });
    return [...byOrder.values()];
  }, [orders]);

  const openEditor = (order) => {
    setEditingOrderId(order.orderId);
    setTrackingNumber(order.trackingNumber || "");
    setStatus(order.status === "Delivered" ? "Delivered" : order.status === "Shipped" ? "Shipped" : "Processing");
  };

  const saveShipping = async (order) => {
    if (status === "Delivered" && !order.shippedAt) {
      toast.error("Mark the order as shipped before marking it delivered.");
      return;
    }

    try {
      setSaving(true);
      const updated = await updateSellerShipping(order.orderId, {
        status,
        trackingNumber: trackingNumber.trim() || null,
      });

      setOrders((current) => current.map((item) =>
        item.orderId === updated.orderId ? { ...item, ...updated } : item,
      ));
      setEditingOrderId(null);
      toast.success(`Order #${order.orderId} updated successfully.`);
    } catch (error) {
      console.error("Update shipping error:", error);
      toast.error(error.response?.data?.message || "Unable to update shipping.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkCodPaid = async (orderId) => {
    try {
      setMarkingPaid(true);
      await markCodPaymentAsPaid(orderId);
      toast.success("COD payment marked as paid.");
      await loadOrders();
      if (selectedOrder && (selectedOrder.orderId === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder((prev) => prev ? { ...prev, paymentStatus: "Paid", paidAt: new Date().toISOString() } : null);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Failed to update COD payment."
      );
    } finally {
      setMarkingPaid(false);
    }
  };

  const generateTrackingNumber = () => {
    setTrackingNumber(`SHP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
  };

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border" role="status" /><p className="mt-2">Loading orders...</p></div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div><h2>Order & Shipping Management</h2><p className="text-muted mb-0">Ship and deliver orders containing your products and collect COD payments.</p></div>
        <button type="button" className="btn btn-outline-primary" onClick={loadOrders}>Refresh</button>
      </div>

      {orderGroups.length === 0 ? <div className="alert alert-info">You do not have any orders to manage.</div> : (
        <div className="card shadow-sm"><div className="card-body table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order</th>
                <th>Products</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Tracking number</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>{orderGroups.map((order) => {
              const paymentMethodType = order.paymentMethodType || order.paymentMethod || "COD";
              const paymentStatus = order.paymentStatus || "Pending";
              const isCodPending = paymentMethodType === "COD" && paymentStatus === "Pending";

              return (
                <tr key={order.orderId}>
                  <td><strong>#{order.orderId}</strong><div className="small text-muted">{formatDateTime(order.orderDate)}</div></td>
                  <td>{order.items.map((item) => <div key={`${item.productId}-${item.orderId}`}>{item.productName} <span className="text-muted">× {item.quantity}</span></div>)}</td>
                  <td><span className="badge bg-outline-dark text-dark border">{paymentMethodType}</span></td>
                  <td>
                    <span className={`badge ${paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                      {paymentStatus}
                    </span>
                    {order.paidAt && <div className="small text-muted">Paid At: {formatDateTime(order.paidAt)}</div>}
                  </td>
                  <td><span className={`badge ${order.status === "Delivered" ? "bg-success" : order.status === "Shipped" ? "bg-primary" : "bg-secondary"}`}>{order.status}</span></td>
                  <td>{order.trackingNumber || "—"}</td>
                  <td className="text-end">
                    <div className="d-flex gap-2 justify-content-end align-items-center">
                      {isCodPending && (
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          disabled={markingPaid}
                          onClick={() => handleMarkCodPaid(order.orderId)}
                        >
                          Mark COD as Paid
                        </button>
                      )}
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedOrder(order)}>Details</button>
                      <button type="button" className="btn btn-sm btn-primary" onClick={() => openEditor(order)}>Update shipping</button>
                    </div>
                  </td>
                </tr>
              );
            })}</tbody>
          </table>
        </div></div>
      )}

      {selectedOrder && (() => {
        const paymentMethodType = selectedOrder.paymentMethodType || selectedOrder.paymentMethod || "COD";
        const paymentStatus = selectedOrder.paymentStatus || "Pending";
        const isCodPending = paymentMethodType === "COD" && paymentStatus === "Pending";

        return (
          <div className="modal d-block" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Order #{selectedOrder.orderId} Details</h5>
                  <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)} />
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <p className="mb-1"><strong>Payment Method:</strong> {paymentMethodType}</p>
                      <p className="mb-1">
                        <strong>Payment Status:</strong>{" "}
                        <span className={`badge ${paymentStatus === "Paid" ? "bg-success" : "bg-warning text-dark"}`}>
                          {paymentStatus}
                        </span>
                      </p>
                      {paymentStatus === "Paid" && selectedOrder.paidAt && (
                        <p className="mb-1"><strong>Paid At:</strong> {formatDateTime(selectedOrder.paidAt)}</p>
                      )}
                    </div>
                    <div className="col-md-6 text-md-end">
                      {isCodPending && (
                        <button
                          className="btn btn-success mt-2"
                          disabled={markingPaid}
                          onClick={() => handleMarkCodPaid(selectedOrder.orderId)}
                        >
                          Mark COD as Paid
                        </button>
                      )}
                    </div>
                  </div>

                  <p><strong>Shipping address:</strong><br />{selectedOrder.shippingAddress || "No address supplied"}</p>
                  
                  <table className="table">
                    <thead>
                      <tr><th>Product</th><th>Quantity</th><th className="text-end">Total</th></tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={`${item.productId}-${item.orderId}`}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td className="text-end">PKR {Number(item.totalPrice ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {editingOrderId !== null && (() => {
        const order = orderGroups.find((item) => item.orderId === editingOrderId);
        if (!order) return null;
        return <div className="modal d-block" role="dialog" style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}><div className="modal-dialog"><div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Update shipping — Order #{order.orderId}</h5><button type="button" className="btn-close" disabled={saving} onClick={() => setEditingOrderId(null)} /></div>
          <div className="modal-body"><div className="mb-3"><label className="form-label" htmlFor="shippingStatus">Order status</label><select id="shippingStatus" className="form-select" value={status} onChange={(event) => setStatus(event.target.value)} disabled={saving}>{STATUS_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <div><label className="form-label" htmlFor="trackingNumber">Tracking number</label><div className="input-group"><input id="trackingNumber" className="form-control" value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} maxLength="100" disabled={saving} /><button type="button" className="btn btn-outline-secondary" onClick={generateTrackingNumber} disabled={saving}>Generate</button></div><div className="form-text">If left blank when shipping, the server generates one automatically.</div></div></div>
          <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setEditingOrderId(null)} disabled={saving}>Cancel</button><button type="button" className="btn btn-primary" onClick={() => saveShipping(order)} disabled={saving}>{saving ? "Saving..." : "Save shipping"}</button></div>
        </div></div></div>;
      })()}
    </div>
  );
};

export default ShippingManagement;
