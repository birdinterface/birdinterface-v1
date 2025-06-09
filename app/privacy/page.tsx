"use client"

import Head from "next/head"
import Image from "next/image"
import { useEffect, useState } from "react"
import "../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css"
import "../../public/css/normalize.css"
import "../../public/css/webflow.css"

const Privacy = () => {
  const [isHeroSignInVisible, setIsHeroSignInVisible] = useState(false)

  useEffect(() => {
    // Load external scripts
    const webFontScript = document.createElement("script")
    webFontScript.src =
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    webFontScript.async = true
    document.body.appendChild(webFontScript)

    const gtagScript = document.createElement("script")
    gtagScript.src = "https://www.googletagmanager.com/gtag/js?id=G-GR4PEECWG6"
    gtagScript.async = true
    document.body.appendChild(gtagScript)

    const gtagInlineScript = document.createElement("script")
    gtagInlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('set', 'developer_id.dZGVlNj', true);
      gtag('config', 'G-GR4PEECWG6');
    `
    document.body.appendChild(gtagInlineScript)

    return () => {
      document.body.removeChild(webFontScript)
      document.body.removeChild(gtagScript)
      document.body.removeChild(gtagInlineScript)
    }
  }, [])

  return (
    <>
      <Head>
        <title>Privacy | The Advancers Platform</title>
        <meta
          name="description"
          content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself."
        />
        <meta property="og:title" content="Privacy | The Advancers Platform" />
        <meta
          property="og:description"
          content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself."
        />
        <meta
          property="twitter:title"
          content="Privacy | The Advancers Platform"
        />
        <meta
          property="twitter:description"
          content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself."
        />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          rel="shortcut icon"
          href="/images/favicon.png"
          type="image/x-icon"
        />
        <link rel="apple-touch-icon" href="/images/webclip.png" />
      </Head>
      <div className="body-5">
        <div
          data-animation="default"
          data-collapse="medium"
          data-duration="400"
          data-easing="ease"
          data-easing2="ease"
          role="banner"
          className="navbar pricingg w-nav"
        >
          <div className="container navbar-container">
            <div className="navbar-holder">
              <div className="navbar-container">
                <a href="/welcome" className="brand w-nav-brand">
                  <Image
                    src="/images/file.png"
                    loading="eager"
                    alt=""
                    width={100}
                    height={24}
                    className="brand-image"
                  />
                </a>
                <nav role="navigation" className="nav-menu w-nav-menu">
                  <div
                    className="nav-menu-link-holder"
                    style={{ display: "none" }}
                  >
                    <div className="nav-menu-link-container adjustingmiddlemobilenav">
                      <div className="nav-links">
                        <a
                          href="/welcome#features"
                          className="nav-link _2 w-nav-link"
                        >
                          Features
                        </a>
                        <a
                          href="/welcome#plans"
                          className="nav-link w-nav-link"
                        >
                          Plans
                        </a>
                      </div>
                    </div>
                  </div>
                </nav>
                <div className="menu-cart-holder newlogin">
                  <div
                    data-node-type="commerce-cart-wrapper"
                    data-open-product=""
                    data-wf-cart-type="rightDropdown"
                    data-wf-cart-query=""
                    data-wf-page-link-href-prefix=""
                    data-wf-cart-duration="400"
                    className="w-commerce-commercecartwrapper"
                  >
                    <div
                      data-node-type="commerce-cart-container-wrapper"
                      style={{ display: "none" }}
                      className="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-rightDropdown"
                    >
                      <div
                        role="dialog"
                        data-node-type="commerce-cart-container"
                        className="w-commerce-commercecartcontainer cart-container"
                      >
                        <div className="w-commerce-commercecartheader cart-header">
                          <h4 className="w-commerce-commercecartheading">
                            Your Cart
                          </h4>
                          <a
                            href="#"
                            data-node-type="commerce-cart-close-link"
                            role="button"
                            aria-label="Close cart"
                            className="w-commerce-commercecartcloselink w-inline-block"
                          >
                            <Image
                              src="/images/X-Icon.svg"
                              loading="eager"
                              alt=""
                              width={20}
                              height={20}
                              className="x-icon"
                            />
                          </a>
                        </div>
                        <div className="w-commerce-commercecartformwrapper cart-form-wrapper">
                          <form
                            data-node-type="commerce-cart-form"
                            style={{ display: "none" }}
                            className="w-commerce-commercecartform"
                          >
                            <script
                              type="text/x-wf-template"
                              id="wf-template-6ec2beb4-4f69-d272-1424-83d47f66afe0"
                            ></script>
                            <div
                              className="w-commerce-commercecartlist cart-list"
                              data-wf-collection="database.commerceOrder.userItems"
                              data-wf-template-id="wf-template-6ec2beb4-4f69-d272-1424-83d47f66afe0"
                            ></div>
                            <div className="w-commerce-commercecartfooter cart-footer">
                              <div
                                aria-atomic="true"
                                aria-live="polite"
                                className="w-commerce-commercecartlineitem"
                              >
                                <div className="sub-total">Subtotal</div>
                                <div className="w-commerce-commercecartordervalue product-cart-price"></div>
                              </div>
                              <div>
                                <div data-node-type="commerce-cart-quick-checkout-actions">
                                  <a
                                    data-node-type="commerce-cart-apple-pay-button"
                                    role="button"
                                    tabIndex={0}
                                    aria-label="Apple Pay"
                                    aria-haspopup="dialog"
                                    style={{
                                      backgroundImage:
                                        "-webkit-named-image(apple-pay-logo-white)",
                                      backgroundSize: "100% 50%",
                                      backgroundPosition: "50% 50%",
                                      backgroundRepeat: "no-repeat",
                                    }}
                                    className="w-commerce-commercecartapplepaybutton"
                                  >
                                    <div></div>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </form>
                          <div className="w-commerce-commercecartemptystate empty-state">
                            <div
                              aria-live="polite"
                              aria-label="This cart is empty"
                            >
                              No items found.
                            </div>
                          </div>
                          <div
                            aria-live="assertive"
                            style={{ display: "none" }}
                            data-node-type="commerce-cart-error"
                            className="w-commerce-commercecarterrorstate error-message small"
                          >
                            <div
                              className="w-cart-error-msg"
                              data-w-cart-quantity-error="Product is not available in this quantity."
                              data-w-cart-general-error="Something went wrong when adding this item to the cart."
                              data-w-cart-checkout-error="Checkout is disabled on this site."
                              data-w-cart-cart_order_min-error="The order minimum was not met. Add more items to your cart to continue."
                              data-w-cart-subscription_error-error="Before you purchase, please use your email invite to verify your address so we can send order updates."
                            >
                              Product is not available in this quantity.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="menu-button menubuttonnav w-nav-button"
                    style={{ display: "none" }}
                  >
                    <div className="menubuttontext homepagemenu">Menu</div>
                  </div>
                  <div className="nav-menu-button-holder clerkplus">
                    <a
                      href="/login"
                      id="chameleonbutton"
                      className="button w-button"
                      style={{
                        display: isHeroSignInVisible ? "none" : "block",
                        fontWeight: 400,
                        whiteSpace: "nowrap",
                        padding: "7px 20px",
                        fontSize: "16px",
                      }}
                    >
                      <span style={{ fontWeight: 400 }}>Sign in</span>
                    </a>
                    <div
                      id="user-button"
                      className="user-button homepage"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="legal-section-heading">
          <div className="container containerterms">
            <div className="hero-section-container">
              <div className="hero-section-header-holder">
                <div>
                  <h2 className="title">Privacy</h2>
                </div>
                <div>
                  <h2 className="title">Policy</h2>
                </div>
              </div>
              <div className="hero-section-paragraph-holder termsparagraph">
                <p className="grey-text left">
                  Effective Date: 22nd October 2024
                </p>
                <p>
                  Get to know our privacy practices, how we collect and process
                  data, and how information is used.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="legal-section-text-privacy">
          <div className="legal-section">
            <div className="container">
              <div className="legal-header-holder">
                <h6>Information we may collect</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  When you visit our website, contact us with questions or for
                  product information we may collect a variety of information
                  from or about you. For example, data we collect may include
                  your name, email, network activity information such as your
                  device model, browser type, operating system, region, IP
                  address, pixel tags, cookies and similar.
                  <br />
                  <br />
                  We may also receive information about you from sources such as
                  public databases, joint marketing partners, affiliates,
                  business partners and social media platforms.
                  <br />
                  <br />
                  If you are a member we may also collect other information from
                  or about you. For example, data we collect may include billing
                  information, your interactions within Bird Interfaces, GmbH
                  such as your progress in the training program and your
                  contributions to the community.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>How we may use your information</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  We may use the information we collect to communicate with you,
                  fulfill our products and services and Improve and enhance the
                  development of our products and services.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Information we may share</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  We may share information with our service providers, business
                  partners and affiliates. Third parties as required by law. We
                  limit how, and with who, we share your personal data. Examples
                  of when we may share your information include, payment
                  processing, customer service and marketing.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Choice and Transparency</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  We want you to be in control of how your personal data is used
                  by us. Subject to local law, you may have the right to be
                  informed of, and request access to, the personal data we
                  process about you; update and correct inaccuracies in that
                  information; have the information restricted or deleted;
                  object or withdraw your consent to certain uses of data; and
                  lodge a complaint with your local data protection authority.
                  We enable you to exercise those rights through emailing us at{" "}
                  <a href="mailto:contact@advancersclub.com" className="link-3">
                    contact@advancers.ai
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div id="content-wrapper" className="section prcig">
          <div className="footer pricing">
            <div className="container">
              <div className="footer-divider">
                <div className="footerleft">
                  <div className="footer-copyright-holder">
                    <a href="/terms" className="link-2">
                      Terms{" "}
                    </a>
                  </div>
                  <div className="footer-copyright-holder">
                    <a href="/imprint" className="link-2">
                      Imprint
                    </a>
                  </div>
                  <div className="footer-copyright-holder">
                    <a
                      href="/privacy"
                      aria-current="page"
                      className="link-2 w--current"
                    >
                      Privacy
                    </a>
                  </div>
                </div>
                <div className="footermiddle"></div>
                <div className="footerright">
                  <div className="footer-copyright-holder">
                    <a href="/welcome" className="link-20 pagelink">
                      © 2024 Bird Interfaces, GmbH.
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Privacy
