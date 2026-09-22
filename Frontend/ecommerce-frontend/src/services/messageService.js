import api from "./api";

// ============================================================
// EXISTING CUSTOMER MESSAGE ENDPOINTS
// ============================================================

// POST /api/Customer/conversations — open (or reuse) a thread and
// send the first message. Used by the "Contact Seller" button.
export const startConversation = async (sellerId, productId, message) => {
    const response = await api.post("/Customer/conversations", {
        sellerId,
        productId,
        message,
    });
    return response.data;
};

// GET /api/Customer/conversations — list of conversations (sidebar).
export const getConversations = async () => {
    const response = await api.get("/Customer/conversations");
    return response.data;
};

// GET /api/Customer/conversations/{id}/messages — full thread.
export const getConversationMessages = async (conversationId) => {
    const response = await api.get(
        `/Customer/conversations/${conversationId}/messages`
    );
    return response.data;
};

// POST /api/Customer/conversations/{id}/messages — reply inside a thread.
export const sendMessage = async (conversationId, message) => {
    const response = await api.post(
        `/Customer/conversations/${conversationId}/messages`,
        { message }
    );
    return response.data;
};


// ============================================================
// PHASE 24 — READ / UNREAD MESSAGE SYSTEM (customer-side)
// ============================================================

// PUT /api/Customer/messages/{messageId}/read
export const markCustomerMessageRead = async (messageId) => {
    const response = await api.put(
        `/Customer/messages/${messageId}/read`
    );
    return response.data;
};

// GET /api/Customer/messages/unread-count — used by navbar badge.
export const getCustomerUnreadCount = async () => {
    const response = await api.get(
        "/Customer/messages/unread-count"
    );
    return response.data;
};
