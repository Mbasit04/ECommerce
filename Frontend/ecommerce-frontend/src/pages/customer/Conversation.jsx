import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getConversationMessages,
  markCustomerMessageRead,
  sendMessage,
} from "../../services/messageService";

const Conversation = () => {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadConversation();
  }, [id]);

  const loadConversation = async () => {
    try {
      const data = await getConversationMessages(id);
      setConversation(data);

      // Mark every unread message that wasn't sent by the customer as
      // read, then ask the customer layout to refresh its badge so it
      // drops from "1" → "0" instantly instead of waiting for the
      // 30s polling tick.
      const incoming = (data?.messages || []).filter(
        (entry) =>
          !entry.isRead &&
          // Only messages where the customer is the receiver.
          entry.receiverId !== undefined &&
          entry.senderId !== undefined,
      );

      if (incoming.length > 0) {
        await Promise.all(
          incoming.map((entry) =>
            markCustomerMessageRead(entry.messageId).catch(() => null),
          ),
        );

        window.dispatchEvent(new Event("customer-unread-changed"));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(id, message);
      setMessage("");
      await loadConversation();
    } catch (error) {
      console.error(error);
    }
  };

  if (!conversation) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mt-4">
      <h2>Chat with {conversation.sellerName}</h2>
      {conversation.productName && <p>Product: {conversation.productName}</p>}

      <div className="border rounded p-3 mb-3">
        {conversation.messages?.map((item) => (
          <div key={item.messageId} className="mb-3">
            <strong>
              {item.senderId === conversation.sellerId
                ? conversation.sellerName
                : "You"}
            </strong>
            <p className="mb-1">{item.message}</p>
            <small>{new Date(item.sentAt).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Conversation;
