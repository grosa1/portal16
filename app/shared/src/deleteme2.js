import React from 'react'
import styled from 'styled-components'

const BorderBox = styled.div`
  border: 10px solid pink
`

class MyComponent extends React.Component {
    constructor(props) {
        super(props)

        this.state = { counter: 0 };
    }

    render() {
        return (
            <section className="horizontal-stripe article-header white-background">
                <BorderBox>
                    <div className="h4 article-header__highlights">Headline {this.props.bazZer}</div>
                    <button onClick={() => { this.setState({ counter: this.state.counter + 1 }) }}> increase counter {this.state.counter}</button>
                </BorderBox>
            </section>
        )
    }
}

export default MyComponent