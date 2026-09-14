import axios from "axios";

const API_URL =
    "https://localhost:7210/api/Customer";

const getAuthConfig = () => {

    const token =
        localStorage.getItem("token");

    return {
        headers: {
            Authorization:
                `Bearer ${token}`
        }
    };
};

export const getMyOrders = async () => {

    const response =
        await axios.get(
            `${API_URL}/orders`,
            getAuthConfig()
        );

    return response.data;
};

export const getOrderDetails =
    async (orderId) => {

        const response =
            await axios.get(
                `${API_URL}/orders/${orderId}`,
                getAuthConfig()
            );

        return response.data;
    };

export const cancelOrder =
    async (orderId, reason) => {

        const response =
            await axios.post(
                `${API_URL}/orders/${orderId}/cancel`,
                { reason },
                getAuthConfig()
            );

        return response.data;
    };

export const requestRefund =
    async (orderId, reason) => {

        const token =
            localStorage.getItem("token");

        const response =
            await axios.post(
                `${API_URL}/orders/${orderId}/refund`,
                {
                    reason: reason
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    };

export const addFeedback =
    async (
        orderId,
        productId,
        rating,
        comment
    ) => {

        const token =
            localStorage.getItem("token");

        const response =
            await axios.post(
                `${API_URL}/orders/${orderId}/products/${productId}/feedback`,
                {
                    rating,
                    comment
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        return response.data;
    };
