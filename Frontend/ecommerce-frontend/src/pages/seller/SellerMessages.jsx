import React, { useEffect, useState } from "react";

import { toast } from "react-toastify";

import {
  getSellerConversation,
  getSellerMessages,
  replyToCustomer,
  markSellerMessageRead,
} from "../../services/sellerService";

// Helpers ----------------------------------------------------------------

const formatTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

const initials = (name) => {
  if (!name) return "C";

  const parts = String(name).trim().split(/\s+/);

  return (parts[0]?.[0] || "C").toUpperCase();
};

// Component --------------------------------------------------------------

const SellerMessages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [activeThread, setActiveThread] = useState(null);
  const [loadingThread, setLoadingThread] = useState(false);

  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getSellerMessages();

      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load conversations.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const openConversation = async (conversation) => {
    try {
      setActiveConversationId(conversation.conversationId);
      setLoadingThread(true);

      const thread = await getSellerConversation(conversation.conversationId);

      setActiveThread(thread);
      setDraft("");

      // Mark each unread message in this thread as read in the background.
      if (thread?.messages?.length) {
        const unread = thread.messages.filter(
          (message) => !message.isRead && message.receiverId !== undefined,
        );

        if (unread.length > 0) {
          await Promise.all(
            unread.map((message) =>
              markSellerMessageRead(message.messageId).catch(() => null),
            ),
          );

          // Tell the seller layout to refresh its sidebar badge immediately.
          // The 30s polling fallback will pick this up too, but instant is nicer.
          window.dispatchEvent(new Event("seller-unread-changed"));
        }

        // Refresh sidebar so the unread badge updates without a manual reload.
        loadConversations();
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Unable to load this conversation.",
      );
      setActiveThread(null);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleReply = async () => {
    if (!activeThread || !draft.trim()) return;

    try {
      setSending(true);

      await replyToCustomer(
        activeThread.customerId,
        activeThread.productId ?? null,
        draft.trim(),
      );

      setDraft("");

      // Re-fetch the thread so the new message shows up server-side.
      const updated = await getSellerConversation(
        activeThread.conversationId,
      );

      setActiveThread(updated);
      loadConversations();
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to send reply.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Customer Messages</h2>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading conversations...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="row g-3">
          {/* Sidebar — list of conversations */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <strong>Inbox</strong>
                <span className="text-muted ms-2 small">
                  ({conversations.length})
                </span>
              </div>
              <div className="list-group list-group-flush">
                {conversations.length === 0 ? (
                  <div className="list-group-item text-muted">
                    No customer conversations yet.
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const isActive =
                      activeConversationId === conversation.conversationId;

                    return (
                      <button
                        key={conversation.conversationId}
                        type="button"
                        className={
                          "list-group-item list-group-item-action " +
                          (isActive ? "active" : "")
                        }
                        onClick={() =>
                          openConversation(conversation)
                        }
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="text-truncate me-2">
                            <strong>
                              {conversation.customerName ||
                                `Customer #${conversation.customerId}`}
                            </strong>
                            {conversation.productName && (
                              <div className="small text-muted">
                                Product: {conversation.productName}
                              </div>
                            )}
                            {conversation.lastMessage && (
                              <div className="small text-truncate">
                                {conversation.lastMessage}
                              </div>
                            )}
                          </div>

                          {conversation.unreadCount > 0 && (
                            <span
                              className="badge bg-danger rounded-pill"
                              title={`${conversation.unreadCount} unread`}
                            >
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <small
                          className={
                            isActive
                              ? "text-light"
                              : "text-muted"
                          }
                        >
                          {formatTime(conversation.lastMessageAt)}
                        </small>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Active conversation pane */}
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm h-100">
              <div className="card-header bg-light d-flex justify-content-between align-items-center">
                <strong>
                  {activeThread
                    ? activeThread.customerName ||
                      `Customer #${activeThread.customerId}`
                    : "Select a conversation"}
                </strong>
                {activeThread?.productName && (
                  <span className="badge bg-info text-dark">
                    Product: {activeThread.productName}
                  </span>
                )}
              </div>

              <div
                className="card-body"
                style={{ maxHeight: 480, overflowY: "auto" }}
              >
                {loadingThread ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">
                        Loading conversation...
                      </span>
                    </div>
                  </div>
                ) : !activeThread ? (
                  <div className="text-muted text-center py-5">
                    Pick a conversation from the inbox to view messages.
                  </div>
                ) : activeThread.messages?.length === 0 ? (
                  <div className="text-muted text-center py-5">
                    No messages in this conversation yet.
                  </div>
                ) : (
                  activeThread.messages.map((message) => {
                    const fromSeller =
                      message.senderId === activeThread.sellerId;

                    return (
                      <div
                        key={message.messageId}
                        className={
                          "d-flex mb-3 " +
                          (fromSeller
                            ? "justify-content-end"
                            : "justify-content-start")
                        }
                      >
                        {!fromSeller && (
                          <div
                            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2"
                            style={{
                              width: 32,
                              height: 32,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                            aria-hidden="true"
                          >
                            {initials(activeThread.customerName)}
                          </div>
                        )}

                        <div
                          className={
                            "px-3 py-2 rounded shadow-sm " +
                            (fromSeller
                              ? "bg-primary text-white"
                              : "bg-light")
                          }
                          style={{ maxWidth: "75%" }}
                        >
                          <div className="small fw-semibold mb-1">
                            {fromSeller ? "You" : activeThread.customerName}
                          </div>
                          <div>{message.message}</div>
                          <small
                            className={
                              fromSeller
                                ? "text-light opacity-75"
                                : "text-muted"
                            }
                          >
                            {formatTime(message.sentAt)}
                            {message.isRead && fromSeller ? " · read" : ""}
                          </small>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeThread && (
                <div className="card-footer bg-white">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your reply..."
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          handleReply();
                        }
                      }}
                      disabled={sending}
                    />
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleReply}
                      disabled={sending || !draft.trim()}
                    >
                      {sending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerMessages;
