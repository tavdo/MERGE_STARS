"use client";
import { Component, type ReactNode } from "react";

export class MuseumSceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <div className="museum-scene-pending" role="alert"><span className="eyebrow">MERGE ⭐ STARS</span><h2>მუზეუმის გახსნა შეფერხდა</h2><p>გვერდის განახლება ხელახლა ჩატვირთავს სივრცით ხედვას.</p><button className="button outline" onClick={() => window.location.reload()}>განახლება</button></div> : this.props.children;
  }
}
