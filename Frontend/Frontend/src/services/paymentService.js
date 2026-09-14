import axios from "axios";

const API_URL =
    "https://localhost:7210/api/Payment";

export const createPaymentIntent = async () => {

    const token =
        localStorage.getItem("token");

    const response =
        await axios.post(
            `${API_URL}/create-intent`,
            {},
            {
                headers: {
                    Authorization:
                        `Bearer ${token}`
                }
            }
        );

    return response.data;
};

export const markCodPaymentAsPaid = async (orderId) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
        `${API_URL}/cod/${orderId}/mark-paid`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    return response.data;
};