"use client"

import Head from "next/head"
import Image from "next/image"
import { useEffect, useState } from "react"

import "../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css"
import "../../public/css/normalize.css"
import "../../public/css/webflow.css"

import { PreloadImages } from "@/components/PreloadImages"
import { criticalImages } from "@/lib/images"

const Imprint = () => {
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
      <PreloadImages />
      <Head>
        <title>Imprint | The Advancers Platform</title>
        <meta
          name="description"
          content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself."
        />
        <meta property="og:title" content="Imprint | The Advancers Platform" />
        <meta
          property="og:description"
          content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself."
        />
        <meta
          property="twitter:title"
          content="Imprint | The Advancers Platform"
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
      <div className="body-6">
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
                    {...criticalImages.logo}
                    alt="Brand logo"
                    priority={true}
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
                              alt="Close cart"
                              width={24}
                              height={24}
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
                                  <a
                                    data-node-type="commerce-cart-quick-checkout-button"
                                    role="button"
                                    tabIndex={0}
                                    aria-haspopup="dialog"
                                    style={{ display: "none" }}
                                    className="w-commerce-commercecartquickcheckoutbutton"
                                  >
                                    <svg
                                      className="w-commerce-commercequickcheckoutgoogleicon"
                                      xmlns="http://www.w3.org/2000/svg"
                                      xmlnsXlink="http://www.w3.org/1999/xlink"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                    >
                                      <defs>
                                        <polygon
                                          id="google-mark-a"
                                          points="0 .329 3.494 .329 3.494 7.649 0 7.649"
                                        ></polygon>
                                        <polygon
                                          id="google-mark-c"
                                          points=".894 0 13.169 0 13.169 6.443 .894 6.443"
                                        ></polygon>
                                      </defs>
                                      <g fill="none" fillRule="evenodd">
                                        <path
                                          fill="#4285F4"
                                          d="M10.5967,12.0469 L10.5967,14.0649 L13.1167,14.0649 C14.6047,12.6759 15.4577,10.6209 15.4577,8.1779 C15.4577,7.6339 15.4137,7.0889 15.3257,6.5559 L7.8887,6.5559 L7.8887,9.6329 L12.1507,9.6329 C11.9767,10.6119 11.4147,11.4899 10.5967,12.0469"
                                        ></path>
                                        <path
                                          fill="#34A853"
                                          d="M7.8887,16 C10.0137,16 11.8107,15.289 13.1147,14.067 C13.1147,14.066 13.1157,14.065 13.1167,14.064 L10.5967,12.047 C10.5877,12.053 10.5807,12.061 10.5727,12.067 C9.8607,12.556 8.9507,12.833 7.8887,12.833 C5.8577,12.833 4.1387,11.457 3.4937,9.605 L0.8747,9.605 L0.8747,11.648 C2.2197,14.319 4.9287,16 7.8887,16"
                                        ></path>
                                        <g transform="translate(0 4)">
                                          <mask id="google-mark-b" fill="#fff">
                                            <use xlinkHref="#google-mark-a"></use>
                                          </mask>
                                          <path
                                            fill="#FBBC04"
                                            d="M3.4639,5.5337 C3.1369,4.5477 3.1359,3.4727 3.4609,2.4757 L3.4639,2.4777 C3.4679,2.4657 3.4749,2.4547 3.4789,2.4427 L3.4939,0.3287 L0.8939,0.3287 C0.8799,0.3577 0.8599,0.3827 0.8459,0.4117 C-0.2821,2.6667 -0.2821,5.3337 0.8459,7.5887 L0.8459,7.5997 C0.8549,7.6167 0.8659,7.6317 0.8749,7.6487 L3.4939,5.6057 C3.4849,5.5807 3.4729,5.5587 3.4639,5.5337"
                                            mask="url(#google-mark-b)"
                                          ></path>
                                        </g>
                                        <mask id="google-mark-d" fill="#fff">
                                          <use xlinkHref="#google-mark-c"></use>
                                        </mask>
                                        <path
                                          fill="#EA4335"
                                          d="M0.894,4.3291 L3.478,6.4431 C4.113,4.5611 5.843,3.1671 7.889,3.1671 C9.018,3.1451 10.102,3.5781 10.912,4.3671 L13.169,2.0781 C11.733,0.7231 9.85,-0.0219 7.889,0.0001 C4.941,0.0001 2.245,1.6791 0.894,4.3291"
                                          mask="url(#google-mark-d)"
                                        ></path>
                                      </g>
                                    </svg>
                                    <svg
                                      className="w-commerce-commercequickcheckoutmicrosofticon"
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="16"
                                      height="16"
                                      viewBox="0 0 16 16"
                                    >
                                      <g fill="none" fillRule="evenodd">
                                        <polygon
                                          fill="#F05022"
                                          points="7 7 1 7 1 1 7 1"
                                        ></polygon>
                                        <polygon
                                          fill="#7DB902"
                                          points="15 7 9 7 9 1 15 1"
                                        ></polygon>
                                        <polygon
                                          fill="#00A4EE"
                                          points="7 15 1 15 1 9 7 9"
                                        ></polygon>
                                        <polygon
                                          fill="#FFB700"
                                          points="15 15 9 15 9 9 15 9"
                                        ></polygon>
                                      </g>
                                    </svg>
                                    <div>Pay with browser.</div>
                                  </a>
                                </div>
                                <a
                                  href="/checkout"
                                  data-node-type="cart-checkout-button"
                                  className="w-commerce-commercecartcheckoutbutton button add-to-cart"
                                  data-loading-text="Hang Tight..."
                                >
                                  Checkout
                                </a>
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
                  <h2 className="title">Imprint</h2>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="legal-section-text-imprint">
          <div className="legal-section">
            <div className="container">
              <div className="legal-header-holder">
                <h6>Information according to § 5 TMG</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  Bird Interfaces, GmbH
                  <br />
                  Thomas-Esser-Str. 86
                  <br />
                  53879 Euskirchen
                  <br />
                  Germany
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Represented by</h6>
              </div>
              <div className="legal-text-holder">
                <p>Alexander Gisbrecht</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Contact Information</h6>
              </div>
              <div className="legal-text-holder">
                <a
                  href="mailto:contact@advancersclub.com"
                  className="link-3 imprintlink"
                >
                  contact@advancers.ai
                </a>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>VAT-ID</h6>
              </div>
              <div className="legal-text-holder">
                <p>DE360131830</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Dispute resolution</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  The European Commission provides a platform for online dispute
                  resolution (OS):{" "}
                  <a
                    href="https://ec.europa.eu/consumers/odr"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://ec.europa.eu/consumers/odr
                  </a>
                  . You can find our e-mail address in the legal notice above.
                  We are not willing or obliged to participate in dispute
                  resolution proceedings before a consumer arbitration board.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Liability for content</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  As a service provider, we are responsible for our own content
                  on these pages in accordance with Section 7 (1) TMG (German
                  Telemedia Act) and general legislation. According to §§ 8 to
                  10 TMG, however, we as a service provider are not obliged to
                  monitor transmitted or stored third-party information or to
                  investigate circumstances that indicate illegal activity.
                  <br />
                  <br />
                  Obligations to remove or block the use of information in
                  accordance with general legislation remain unaffected by this.
                  However, liability in this respect is only possible from the
                  time of knowledge of a specific infringement. As soon as we
                  become aware of such infringements, we will remove this
                  content immediately.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Liability for links</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  Our website contains links to external third-party websites
                  over whose content we have no influence. Therefore, we cannot
                  accept any liability for this third-party content. The
                  respective provider or operator of the pages is always
                  responsible for the content of the linked pages. The linked
                  pages were checked for possible legal violations at the time
                  of linking. Illegal content was not recognizable at the time
                  of linking.
                  <br />
                  <br />
                  However, permanent monitoring of the content of the linked
                  pages is not reasonable without concrete evidence of an
                  infringement. If we become aware of any legal infringements,
                  we will remove such links immediately.
                </p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Copyright</h6>
              </div>
              <div className="legal-text-holder">
                <p>
                  The content and works created by the site operators on these
                  pages are subject to German copyright law. Duplication,
                  processing, distribution and any form of commercialization of
                  such material beyond the scope of the copyright law shall
                  require the prior written consent of its respective author or
                  creator. Downloads and copies of this site are only permitted
                  for private, non-commercial use.
                  <br />
                  <br />
                  Insofar as the content on this site was not created by the
                  operator, the copyrights of third parties are respected. In
                  particular, third-party content is identified as such. Should
                  you nevertheless become aware of a copyright infringement,
                  please inform us accordingly. If we become aware of any
                  infringements, we will remove such content immediately.
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
                    <a
                      href="/imprint"
                      aria-current="page"
                      className="link-2 w--current"
                    >
                      Imprint
                    </a>
                  </div>
                  <div className="footer-copyright-holder">
                    <a href="/privacy" className="link-2">
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

export default Imprint
