import React, { useEffect, useState } from "react";
import { getConversations } from "../../services/messageService";
import { useNavigate } from "react-router-dom";

const CustomerMessages = () => {
  const [conversations, setConversations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>My Messages</h2>

      {conversations.length === 0 ? (
        <p>No conversations found.</p>
      ) : (
        conversations.map((conversation) => (
          <div
            key={conversation.conversationId}
            className="card mb-3"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/messages/${conversation.conversationId}`)}
          >
            <div className="card-body">
              <h5>Seller: {conversation.sellerName}</h5>
              {conversation.productName && (
                <p>Product: {conversation.productName}</p>
              )}
              <p>{conversation.lastMessage}</p>
              <small>
                {conversation.lastMessageAt
                  ? new Date(conversation.lastMessageAt).toLocaleString()
                  : ""}
              </small>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CustomerMessages;
