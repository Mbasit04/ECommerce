import React from "react";

// Tiny in-file error boundary so a runtime error in the messages page
// shows a friendly message instead of rendering a blank React tree.
export default class SellerMessagesErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Surface the failure in the browser console so it's easy to debug.
    // eslint-disable-next-line no-console
    console.error("SellerMessages crashed:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container py-4">
          <div className="alert alert-danger">
            <h5 className="alert-heading mb-2">
              Unable to load messages right now.
            </h5>
            <p className="mb-2">
              {this.state.error?.message || "Unknown error."}
            </p>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => this.setState({ error: null })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
