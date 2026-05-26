"use client"

import React from 'react'
import SectionFallback from './SectionFallback'

type Props = { children: React.ReactNode; label?: string }

export default class ErrorBoundary extends React.Component<Props, { hasError: boolean; resetKey: number }> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, resetKey: 0 }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError() {
    return { hasError: true, resetKey: 0 }
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught', error, info)
  }

  handleRetry() {
    this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }))
  }

  render() {
    if (this.state.hasError) {
      return (
        <SectionFallback
          title={this.props.label || 'Something went wrong'}
          message="An unexpected error occurred in this section. You can retry or continue browsing the site."
          onRetry={this.handleRetry}
        />
      )
    }

    // Key forces remount after retry
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>
  }
}
