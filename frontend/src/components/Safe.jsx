import { Component } from 'react';

// Keeps one failing part (a lost WebGL context, a bad asset) from taking the
// whole page down: that part quietly drops out and everything else carries on.
export default class Safe extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.warn(`[ELVARA] ${this.props.name || 'section'} skipped:`, error);
  }

  render() {
    if (this.state.failed) return this.props.fallback ?? null;
    return this.props.children;
  }
}
