import api from "./api";

export const startConversation = async (
    sellerId,
    productId,
    message
) => {
    const response = await api.post(
        "/Customer/conversations",
        {
            sellerId,
            productId,
            message,
        }
    );

    return response.data;
};

export const getConversations = async () => {
    const response = await api.get(
        "/Customer/conversations"
    );

    return response.data;
};

export const getConversationMessages = async (
    conversationId
) => {
    const response = await api.get(
        `/Customer/conversations/${conversationId}/messages`
    );

    return response.data;
};

export const sendMessage = async (
    conversationId,
    message
) => {
    const response = await api.post(
        `/Customer/conversations/${conversationId}/messages`,
        {
            message,
        }
    );

    return response.data;
};