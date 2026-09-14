import CustomerMessages
  from "./pages/customer/CustomerMessages";

import Conversation
  from "./pages/customer/Conversation";
  <>
    <Route
      path="/messages"
      element={<CustomerMessages />}
    />

    <Route
      path="/messages/:id"
      element={<Conversation />}
    />
  </>