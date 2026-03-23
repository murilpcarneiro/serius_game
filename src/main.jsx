import React from 'react'
import { createRoot } from 'react-dom/client'
import IntegraGame from './IntegraGame'

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            padding: 20,
            background: '#05050f',
            color: '#f8fafc',
            fontFamily: 'monospace',
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <h1 style={{ marginTop: 0 }}>Erro de execução</h1>
            <p>O jogo encontrou um erro ao renderizar.</p>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                background: '#11122b',
                border: '1px solid #2e2e58',
                borderRadius: 8,
                padding: 12,
              }}
            >
              {String(this.state.error?.message || this.state.error)}
            </pre>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <IntegraGame />
    </RootErrorBoundary>
  </React.StrictMode>,
)
