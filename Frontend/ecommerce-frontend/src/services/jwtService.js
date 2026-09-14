export const decodeToken = (token) => {
    try {
        const payload = token.split(".")[1];

        const decodedPayload = atob(
            payload.replace(/-/g, "+").replace(/_/g, "/")
        );

        return JSON.parse(decodedPayload);
    } catch (error) {
        console.error("Invalid JWT token:", error);
        return null;
    }
};

export const getUserFromToken = (token) => {
    const payload = decodeToken(token);

    if (!payload) {
        return null;
    }

    const role =
        payload.role ||
        payload[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

    const userId =
        payload.sub ||
        payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];

    const email =
        payload.email ||
        payload[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        ];

    return {
        id: userId,
        email: email,
        role: role,
    };
};