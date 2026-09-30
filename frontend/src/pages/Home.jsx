import { Link } from "react-router-dom";

function Home() {
  const isLoggedIn = !!localStorage.getItem("artcircle_token");
  
  return (
    <main className="home-page">

      {/* HERO */}
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">
            ART • COMMUNITY • OPPORTUNITY
          </p>

          <h1>
            Discover.
            <br />
            Support.
            <br />
            <span>Inspire.</span>
          </h1>

          <p className="hero-text">
            ArtCircle is a marketplace where independent artists can
            showcase their work, connect with art lovers and create new
            opportunities through their creativity.
          </p>

          <div className="hero-buttons">
            {!isLoggedIn && (
              <Link to="/register" className="secondary-button">
                Join the Community
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* STORY BEHIND ARTCIRCLE */}
      <section className="story-section">
        <div className="story-content">
          <p className="section-label">
            THE STORY BEHIND ARTCIRCLE
          </p>

          <h2>
            It began with
            <br />
            one artist.
          </h2>

          <p>
            ArtCircle was inspired by my father, who I have always
            looked up to as a very talented artist.
          </p>

          <p>
            Although he had a passion and talent for art, he never
            really had the opportunity or platform to showcase and
            sell his work. Because of this, he had to focus on more
            traditional work instead of having the opportunity to
            develop his artistic talent further.
          </p>

          <p>
            Seeing this made me realise that talent alone does not
            always create opportunity. Sometimes people simply need
            a place where their work can be seen.
          </p>
        </div>
      </section>

      {/* BIG IDEA */}
      <section className="testimonial-section">
        <div className="testimonial-card">
          <p className="quote-mark">“</p>

          <blockquote>
            ArtCircle began with one artist's story,
            but it was created for many more.
          </blockquote>

          <p className="testimonial-author">
            A platform for independent artists to be seen,
            discovered and supported.
          </p>
        </div>
      </section>

      {/* THE BIGGER IDEA */}
      <section className="story-section">
        <div className="story-content">
          <p className="section-label">
            THE BIGGER IDEA
          </p>

          <h2>
            A community
            <br />
            of creativity.
          </h2>

          <p>
            My father's experience made me think about how many
            other talented people may be in a similar situation.
          </p>

          <p>
            There are artists with creativity, passion and talent
            who may simply need an opportunity to be discovered.
          </p>

          <p>
            ArtCircle aims to create that opportunity by giving
            independent artists a place to showcase their work,
            connect with art lovers, sell their creations and
            receive requests for personalised artwork.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="values-section">
        <p className="section-label">
          WHAT ARTCIRCLE STANDS FOR
        </p>

        <h2>
          More than a marketplace.
        </h2>

        <div className="values-grid">

          <div className="value-card">
            <div className="value-icon">♡</div>

            <h3>
              Support Independent Artists
            </h3>

            <p>
              Help artists gain visibility and create opportunities
              through their work.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">✦</div>

            <h3>
              Authentic & Original
            </h3>

            <p>
              Discover artwork created by real people with their own
              unique stories and styles.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">◎</div>

            <h3>
              Community First
            </h3>

            <p>
              Connect artists and art lovers in a welcoming community.
            </p>
          </div>

          <div className="value-card">
            <div className="value-icon">✧</div>

            <h3>
              Made With Passion
            </h3>

            <p>
              Celebrate creativity, individuality and the stories
              behind every piece.
            </p>
          </div>

        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <p className="section-label">
          FIND SOMETHING SPECIAL
        </p>

        <h2>
          Discover your next favourite artwork.
        </h2>

        <Link
          to="/explore"
          className="primary-button"
        >
          Explore the Marketplace
        </Link>
      </section>

    </main>
  );
}

export default Home;