import React from "react";

// Generic per-page error boundary. Drop around any route element so a
// rendering crash surfaces a friendly message instead of a blank React
// tree. The previous SellerMessagesErrorBoundary is now an alias of
// this for backwards compatibility.
export default class PageErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error("Page crashed:", this.props.label || "page", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container py-4">
          <div className="alert alert-danger">
            <h5 className="alert-heading mb-2">
              {this.props.label
                ? `Unable to render ${this.props.label}.`
                : "Unable to render this page."}
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
