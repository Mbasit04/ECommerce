import api from "./api";

export const loginUser = async (email, password) => {
  const response = await api.post("/Auth/login", {
    email,
    password,
  });

  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post("/Auth/register", data);

  return response.data;
};

// POST /api/Auth/forgot-password — anonymous.
// Always returns success-style message; on success also returns a
// dev-only token so the demo frontend can complete the reset flow
// without an email server.
export const forgotPassword = async (email) => {
  const response = await api.post("/Auth/forgot-password", { email });
  return response.data;
};

// POST /api/Auth/reset-password — anonymous.
export const resetPassword = async ({
  email,
  token,
  newPassword,
  confirmNewPassword,
}) => {
  const response = await api.post("/Auth/reset-password", {
    email,
    token,
    newPassword,
    confirmNewPassword,
  });
  return response.data;
};