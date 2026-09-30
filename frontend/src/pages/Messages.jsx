import { API_URL } from "../config";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";

function Messages() {
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("artcircle_token");
  const storedUser = localStorage.getItem("artcircle_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchConversations = async () => {
      if (!token) {
        setError("You need to log in to view your messages.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/accounts/conversations/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setConversations(response.data);

        const requestedConversationId =
          location.state?.conversationId;

        const requestedConversation = response.data.find(
          (conversation) =>
            Number(conversation.id) ===
            Number(requestedConversationId)
        );

        if (requestedConversation) {
          setSelectedConversation(requestedConversation);
        } else if (response.data.length > 0) {
          setSelectedConversation(response.data[0]);
        } else {
          setSelectedConversation(null);
        }
      } catch (err) {
        setError("Unable to load your conversations.");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [token, location.state?.conversationId]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversation || !token) {
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/api/accounts/conversations/${selectedConversation.id}/messages/`,
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );

        setMessages(response.data);
        setError("");
      } catch (err) {
        setError("Unable to load messages.");
      }
    };

    fetchMessages();
  }, [selectedConversation, token]);

  const getOtherParticipant = (conversation) => {
    return conversation.participants.find(
      (participant) => participant.id !== currentUser?.id
    );
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!newMessage.trim() || !selectedConversation || !token) {
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/api/accounts/conversations/${selectedConversation.id}/messages/`,
        {
          body: newMessage.trim(),
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        response.data,
      ]);

      setNewMessage("");
      setError("");
    } catch (err) {
      setError("Unable to send your message.");
    }
  };

  if (loading) {
    return (
      <main className="container py-5">
        <div className="text-center py-5">
          <div
            className="spinner-border"
            role="status"
            aria-label="Loading"
          >
            <span className="visually-hidden">Loading...</span>
          </div>

          <p className="mt-3 text-secondary">
            Loading your messages...
          </p>
        </div>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="container py-5">
        <div className="alert alert-warning">
          You need to log in to view your messages.
        </div>
      </main>
    );
  }

  return (
    <main className="container py-5">
      {/* Page heading */}
      <section className="mb-5">
        <p className="eyebrow mb-2">
          YOUR ARTCIRCLE INBOX
        </p>

        <h1 className="display-5 fw-bold mb-3">
          Messages
        </h1>

        <p className="lead text-secondary mb-0">
          Stay connected with artists and art lovers about
          artwork, offers and creative requests.
        </p>
      </section>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      {/* No conversations */}
      {conversations.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <h2 className="h4 mb-3">
              No conversations yet
            </h2>

            <p className="text-secondary mb-0">
              Your conversations with artists and art lovers
              will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm overflow-hidden">
          <div className="row g-0">

            {/* Conversation list */}
            <div className="col-12 col-md-4 border-end">
              <div className="p-4 border-bottom">
                <h2 className="h5 mb-0">
                  Conversations
                </h2>
              </div>

              <div className="list-group list-group-flush">
                {conversations.map((conversation) => {
                  const otherParticipant =
                    getOtherParticipant(conversation);

                  const isSelected =
                    selectedConversation?.id === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() =>
                        setSelectedConversation(conversation)
                      }
                      className="list-group-item list-group-item-action p-3"
                      style={{
                        backgroundColor: isSelected ? "#E8D8CC" : "transparent",
                        borderColor: isSelected ? "#E8D8CC" : "",
                        cursor: "pointer",
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">

                        <div
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${
                            isSelected
                              ? "bg-white text-dark"
                              : "bg-light text-dark"
                          }`}
                          style={{
                            width: "46px",
                            height: "46px",
                          }}
                        >
                          {otherParticipant?.first_name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="text-start min-w-0">
                          <Link
                            to={`/public-profile/${otherParticipant?.id}`}
                            className="fw-semibold text-decoration-none"
                            style={{ color: "var(--ink)" }}
                          >
                            {otherParticipant?.first_name}{" "}
                            {otherParticipant?.last_name}
                          </Link>

                          <small className="text-secondary d-block">
                            {conversation.last_message?.body ||
                              "No messages yet."}
                          </small>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Message panel */}
            <div className="col-12 col-md-8">

              {selectedConversation && (
                <div className="d-flex flex-column h-100">

                  {/* Chat header */}
                  <div className="p-4 border-bottom">
                    <div className="d-flex align-items-center gap-3">

                      <div
                        className="rounded-circle bg-light d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{
                          width: "46px",
                          height: "46px",
                        }}
                      >
                        {getOtherParticipant(
                          selectedConversation
                        )
                          ?.first_name?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h2 className="h5 mb-1">
                          <Link
                            to={`/public-profile/${getOtherParticipant(selectedConversation)?.id}`}
                            className="text-decoration-none"
                            style={{ color: "var(--ink)" }}
                          >
                            {getOtherParticipant(selectedConversation)?.first_name}{" "}
                            {getOtherParticipant(selectedConversation)?.last_name}
                          </Link>
                        </h2>

                        <small className="text-secondary text-capitalize">
                          {
                            getOtherParticipant(
                              selectedConversation
                            )?.role
                          }
                        </small>
                      </div>

                    </div>
                  </div>

                  {/* Messages */}
                  <div
                    className="p-4 bg-light-subtle overflow-auto"
                    style={{
                      minHeight: "420px",
                      maxHeight: "520px",
                    }}
                  >
                    {messages.length === 0 ? (
                      <div className="text-center text-secondary py-5">
                        <p className="mb-0">
                          No messages yet. Start the conversation.
                        </p>
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {messages.map((message) => {
                          const isOwnMessage =
                            message.sender.id === currentUser?.id;

                          return (
                            <div
                              key={message.id}
                              className={`d-flex ${
                                isOwnMessage
                                  ? "justify-content-end"
                                  : "justify-content-start"
                              }`}
                            >
                              <div
                                className="px-3 py-2 rounded-4"
                                style={{
                                  maxWidth: "75%",
                                  backgroundColor: isOwnMessage ? "#F3E8DF" : "#FFFFFF",
                                  color: "var(--ink)",
                                  border: isOwnMessage
                                    ? "1px solid #E8D8CC"
                                    : "1px solid var(--border)",
                                }}
                              >
                                <p className="mb-1">
                                  {message.body}
                                </p>

                                <small
                                  className="text-secondary"
                                >
                                  {new Date(
                                    message.created_at
                                  ).toLocaleString()}
                                </small>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Message input */}
                  <form
                    onSubmit={handleSendMessage}
                    className="p-3 border-top bg-white"
                  >
                    <div className="input-group">

                      <input
                        type="text"
                        className="form-control"
                        value={newMessage}
                        onChange={(event) =>
                          setNewMessage(event.target.value)
                        }
                        placeholder="Write a message..."
                        aria-label="Message"
                      />

                      <button
                        type="submit"
                        className="btn"
                        style={{
                          backgroundColor: "var(--plum)",
                          borderColor: "var(--plum)",
                          color: "white",
                        }}
                        disabled={!newMessage.trim()}
                      >
                        Send
                      </button>

                    </div>
                  </form>

                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Messages;