import React from 'react'

class MyComponent extends React.Component {
  render() {
    return (
        <section className="horizontal-stripe article-header white-background">
            <div className="container--desktop">
                <div className="row">
                    <header className="col-xs-12 text-center">
                        <nav className="article-header__category article-header__category--deep">
                            <span className="article-header__category__upper"><a href="/occurrence/search">occurrence</a></span>
                        </nav> 
                        <div className="h4 article-header__highlights">Headline {this.props.bazZer}</div> 
                    </header>
                </div>
            </div>
        </section>
    )
  }
}

export default MyComponent