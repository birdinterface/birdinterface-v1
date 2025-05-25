"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import '../../public/css/normalize.css';
import '../../public/css/webflow.css';
import '../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css';

const Terms = () => {
  const [isHeroSignInVisible, setIsHeroSignInVisible] = useState(false);

  useEffect(() => {
    // Load external scripts
    const webFontScript = document.createElement('script');
    webFontScript.src = 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js';
    webFontScript.async = true;
    document.body.appendChild(webFontScript);

    const gtagScript = document.createElement('script');
    gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-GR4PEECWG6';
    gtagScript.async = true;
    document.body.appendChild(gtagScript);

    const gtagInlineScript = document.createElement('script');
    gtagInlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('set', 'developer_id.dZGVlNj', true);
      gtag('config', 'G-GR4PEECWG6');
    `;
    document.body.appendChild(gtagInlineScript);

    return () => {
      document.body.removeChild(webFontScript);
      document.body.removeChild(gtagScript);
      document.body.removeChild(gtagInlineScript);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Terms | The Advancers Platform</title>
        <meta name="description" content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself." />
        <meta property="og:title" content="Terms | The Advancers Platform" />
        <meta property="og:description" content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself." />
        <meta property="twitter:title" content="Terms | The Advancers Platform" />
        <meta property="twitter:description" content="Learn how to be useful. Fundamental knowledge on creating new value and improving yourself." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/images/favicon.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/images/webclip.png" />
      </Head>
      <div className="body-4">
        <div data-animation="default" data-collapse="medium" data-duration="400" data-easing="ease" data-easing2="ease" role="banner" className="navbar pricingg w-nav">
          <div className="container navbar-container">
            <div className="navbar-holder">
              <div className="navbar-container">
                <a href="/welcome" className="brand w-nav-brand"><img src="/images/file.png" loading="eager" alt="" className="brand-image" /></a>
                <nav role="navigation" className="nav-menu w-nav-menu">
                  <div className="nav-menu-link-holder" style={{ display: 'none' }}>
                    <div className="nav-menu-link-container adjustingmiddlemobilenav">
                      <div className="nav-links">
                        <a href="/welcome#features" className="nav-link _2 w-nav-link">Features</a>
                        <a href="/welcome#plans" className="nav-link w-nav-link">Plans</a>
                      </div>
                    </div>
                  </div>
                </nav>
                <div className="menu-cart-holder newlogin">
                  <div data-node-type="commerce-cart-wrapper" data-open-product="" data-wf-cart-type="rightDropdown" data-wf-cart-query="" data-wf-page-link-href-prefix="" data-wf-cart-duration="400" className="w-commerce-commercecartwrapper">
                    <div data-node-type="commerce-cart-container-wrapper" style={{ display: 'none' }} className="w-commerce-commercecartcontainerwrapper w-commerce-commercecartcontainerwrapper--cartType-rightDropdown">
                      <div role="dialog" data-node-type="commerce-cart-container" className="w-commerce-commercecartcontainer cart-container">
                        <div className="w-commerce-commercecartheader cart-header">
                          <h4 className="w-commerce-commercecartheading">Your Cart</h4>
                          <a href="#" data-node-type="commerce-cart-close-link" role="button" aria-label="Close cart" className="w-commerce-commercecartcloselink w-inline-block"><img src="/images/X-Icon.svg" loading="eager" alt="" className="x-icon" /></a>
                        </div>
                        <div className="w-commerce-commercecartformwrapper cart-form-wrapper">
                          <form data-node-type="commerce-cart-form" style={{ display: 'none' }} className="w-commerce-commercecartform">
                            <script type="text/x-wf-template" id="wf-template-6ec2beb4-4f69-d272-1424-83d47f66afe0"></script>
                            <div className="w-commerce-commercecartlist cart-list" data-wf-collection="database.commerceOrder.userItems" data-wf-template-id="wf-template-6ec2beb4-4f69-d272-1424-83d47f66afe0"></div>
                            <div className="w-commerce-commercecartfooter cart-footer">
                              <div aria-atomic="true" aria-live="polite" className="w-commerce-commercecartlineitem">
                                <div className="sub-total">Subtotal</div>
                                <div className="w-commerce-commercecartordervalue product-cart-price"></div>
                              </div>
                              <div>
                                <div data-node-type="commerce-cart-quick-checkout-actions">
                                  <a data-node-type="commerce-cart-apple-pay-button" role="button" tabIndex={0} aria-label="Apple Pay" aria-haspopup="dialog" style={{ backgroundImage: '-webkit-named-image(apple-pay-logo-white)', backgroundSize: '100% 50%', backgroundPosition: '50% 50%', backgroundRepeat: 'no-repeat' }} className="w-commerce-commercecartapplepaybutton">
                                    <div></div>
                                  </a>
                                  <a data-node-type="commerce-cart-quick-checkout-button" role="button" tabIndex={0} aria-haspopup="dialog" style={{ display: 'none' }} className="w-commerce-commercecartquickcheckoutbutton">
                                    <svg className="w-commerce-commercequickcheckoutgoogleicon" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
                                      <defs>
                                        <polygon id="google-mark-a" points="0 .329 3.494 .329 3.494 7.649 0 7.649"></polygon>
                                        <polygon id="google-mark-c" points=".894 0 13.169 0 13.169 6.443 .894 6.443"></polygon>
                                      </defs>
                                      <g fill="none" fillRule="evenodd">
                                        <path fill="#4285F4" d="M10.5967,12.0469 L10.5967,14.0649 L13.1167,14.0649 C14.6047,12.6759 15.4577,10.6209 15.4577,8.1779 C15.4577,7.6339 15.4137,7.0889 15.3257,6.5559 L7.8887,6.5559 L7.8887,9.6329 L12.1507,9.6329 C11.9767,10.6119 11.4147,11.4899 10.5967,12.0469"></path>
                                        <path fill="#34A853" d="M7.8887,16 C10.0137,16 11.8107,15.289 13.1147,14.067 C13.1147,14.066 13.1157,14.065 13.1167,14.064 L10.5967,12.047 C10.5877,12.053 10.5807,12.061 10.5727,12.067 C9.8607,12.556 8.9507,12.833 7.8887,12.833 C5.8577,12.833 4.1387,11.457 3.4937,9.605 L0.8747,9.605 L0.8747,11.648 C2.2197,14.319 4.9287,16 7.8887,16"></path>
                                        <g transform="translate(0 4)">
                                          <mask id="google-mark-b" fill="#fff">
                                            <use xlinkHref="#google-mark-a"></use>
                                          </mask>
                                          <path fill="#FBBC04" d="M3.4639,5.5337 C3.1369,4.5477 3.1359,3.4727 3.4609,2.4757 L3.4639,2.4777 C3.4679,2.4657 3.4749,2.4547 3.4789,2.4427 L3.4939,0.3287 L0.8939,0.3287 C0.8799,0.3577 0.8599,0.3827 0.8459,0.4117 C-0.2821,2.6667 -0.2821,5.3337 0.8459,7.5887 L0.8459,7.5997 C0.8549,7.6167 0.8659,7.6317 0.8749,7.6487 L3.4939,5.6057 C3.4849,5.5807 3.4729,5.5587 3.4639,5.5337" mask="url(#google-mark-b)"></path>
                                        </g>
                                        <mask id="google-mark-d" fill="#fff">
                                          <use xlinkHref="#google-mark-c"></use>
                                        </mask>
                                        <path fill="#EA4335" d="M0.894,4.3291 L3.478,6.4431 C4.113,4.5611 5.843,3.1671 7.889,3.1671 C9.018,3.1451 10.102,3.5781 10.912,4.3671 L13.169,2.0781 C11.733,0.7231 9.85,-0.0219 7.889,0.0001 C4.941,0.0001 2.245,1.6791 0.894,4.3291" mask="url(#google-mark-d)"></path>
                                      </g>
                                    </svg>
                                    <svg className="w-commerce-commercequickcheckoutmicrosofticon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16">
                                      <g fill="none" fillRule="evenodd">
                                        <polygon fill="#F05022" points="7 7 1 7 1 1 7 1"></polygon>
                                        <polygon fill="#7DB902" points="15 7 9 7 9 1 15 1"></polygon>
                                        <polygon fill="#00A4EE" points="7 15 1 15 1 9 7 9"></polygon>
                                        <polygon fill="#FFB700" points="15 15 9 15 9 9 15 9"></polygon>
                                      </g>
                                    </svg>
                                    <div>Pay with browser.</div>
                                  </a>
                                </div>
                                <a
                                  href="checkout.html"
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
                            <div aria-live="polite" aria-label="This cart is empty">No items found.</div>
                          </div>
                          <div aria-live="assertive" style={{ display: 'none' }} data-node-type="commerce-cart-error" className="w-commerce-commercecarterrorstate error-message small">
                            <div className="w-cart-error-msg" data-w-cart-quantity-error="Product is not available in this quantity." data-w-cart-general-error="Something went wrong when adding this item to the cart." data-w-cart-checkout-error="Checkout is disabled on this site." data-w-cart-cart_order_min-error="The order minimum was not met. Add more items to your cart to continue." data-w-cart-subscription_error-error="Before you purchase, please use your email invite to verify your address so we can send order updates.">Product is not available in this quantity.</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="nav-menu-button-holder clerkplus">
                    <a 
                      href="/login" 
                      id="chameleonbutton" 
                      className="button w-button"
                      style={{ 
                        display: isHeroSignInVisible ? 'none' : 'block',
                        fontWeight: 400,
                        whiteSpace: 'nowrap',
                        padding: '7px 20px',
                        fontSize: '16px'
                      }}
                    >
                      <span style={{ fontWeight: 400 }}>Sign in</span>
                    </a>
                    <div id="user-button" className="user-button homepage"></div>
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
                  <h2 className="title">Terms</h2>
                </div>
                <div>
                  <h2 className="title">of</h2>
                </div>
                <div>
                  <h2 className="title">Service</h2>
                </div>
              </div>
              <div className="hero-section-paragraph-holder termsparagraph">
                <p className="grey-text left">Effective Date: 22nd October 2024</p>
                <p>Welcome to Bird Interfaces, GmbH. Learn the rules and restrictions that govern your use of our products and services. If you have any questions please contact us at: <a href="mailto:contact@advancersclub.com" className="link-3">contact@advancers.ai</a></p>
              </div>
            </div>
          </div>
        </div>
        <div className="legal-section-text">
          <div className="legal-section">
            <div className="container">
              <div className="legal-header-holder">
                <h6>Acceptance</h6>
              </div>
              <div className="legal-text-holder">
                <p>By signing up, you agree to be bound by the Terms. If you do not understand the Terms, or do not accept any part of them, then you may not use or access advancers.ai.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Advancers.ai Description</h6>
              </div>
              <div className="legal-text-holder">
                <p>Advancers.ai provides an AI that is designed to help users be most useful.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Payment Terms</h6>
              </div>
              <div className="legal-text-holder">
                <p>For the processing of payments Bird Interfaces, GmbH uses the payment processor stripe.com. The price of a subscription is set by Bird Interfaces, GmbH. If you purchase a subscription, you do so by paying a subscription fee in advance on a recurring basis. When you subscribe to advancers.ai you expressly agree that you are authorizing recurring payments, and that payments will be made by the payment method you have selected until the advancers.ai subscription is canceled by you or by Bird Interfaces, GmbH.<br /><br />Your payment information will be automatically processed at the start of each subscription period. If your payment information is declined, you must provide new payment information for your subscription or your subscription will be canceled. If you provide new payment information and your payment account is successfully charged, your new subscription period will be based on the original renewal date and not the date the successful charge took place.<br /><br />All payments for subscriptions are final and not refundable or exchangeable, except as required by law. We make no guarantee as to the nature, quality, or value of a membership or the availability or supply thereof. There are no refunds or credits for any partial subscription periods, including in a situation where certain features, benefits and/or services are modified or discontinued.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Restrictions and obligations</h6>
              </div>
              <div className="legal-text-holder">
                <p>Each purchase applies to a single user and is not transferable, meaning that your purchase will apply solely to you and will not apply to someone else. Each person that wants to join has purchase access individually. You may not allow others to use your account to access any service that such person did not order.<br /><br />We reserve the right to cancel or discontinue the accessibility or use of the service in our sole discretion.<br /><br />You represent that you will use the service only for lawful purposes and only in accordance with the Terms.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Responsibility, Risk and Reliance</h6>
              </div>
              <div className="legal-text-holder">
                <p>You acknowledge and agree that you are solely responsible for your use of the service, as well as any content, goods, services, art, or creations you contribute to the world. This includes compliance with all applicable laws, rules, and regulations. You should only provide content that you are comfortable sharing with others.<br /><br />Any use or reliance on content or materials posted on advancers.ai, or obtained through advancers.ai, is at your own risk. Bird Interfaces, GmbH does not endorse, support, represent, or guarantee the completeness, truthfulness, accuracy, or reliability of any content or communications within advancers.ai.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Taxes and fees</h6>
              </div>
              <div className="legal-text-holder">
                <p>You are responsible for and agree to pay any applicable taxes, duties, tariffs, and fees related to the purchase of a membership, including those required to be paid to either Bird Interfaces, GmbH or a third-party payment processor. These taxes may include, but are not limited to, VAT, GST, sales tax, withholding tax, and any other applicable taxes. Depending on your location, Bird Interfaces, GmbH may be responsible for collecting and reporting information related to transaction taxes arising from your purchase. You grant Bird Interfaces, GmbH permission to provide your account and personal information to relevant tax authorities to fulfill our tax collection and reporting obligations.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Changes to Terms</h6>
              </div>
              <div className="legal-text-holder">
                <p>Bird Interfaces, GmbH may revise these Terms of Service from time to time. The changes will not be retroactive, and the most current version of the Terms, available at advancers.ai/terms will govern your use of advancers.ai and any corresponding transactions. If we modify or revise these Terms after you have agreed to them (for example, if these terms are modified after you have purchased access, we will notify you in advance of material revisions to these terms. Such notification may be provided electronically, including (and without limitation to) via a service notification or an email to the email address associated with your account. By continuing to access or use advancers.ai after those revisions become effective, you agree to be bound by the revised Terms. If you do not agree to abide by these or any future Terms, do not use or access (or continue to use or access) advancers.ai.</p>
              </div>
            </div>
            <div className="container">
              <div className="legal-header-holder">
                <h6>Governing Law</h6>
              </div>
              <div className="legal-text-holder">
                <p>These Terms will be governed by the laws of the State of Northrhein-Westfalia in Germany.</p>
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
                    <a href="/terms" aria-current="page" className="link-2 w--current">Terms </a>
                  </div>
                  <div className="footer-copyright-holder">
                    <a href="/imprint" className="link-2">Imprint</a>
                  </div>
                  <div className="footer-copyright-holder">
                    <a href="/privacy" className="link-2">Privacy</a>
                  </div>
                </div>
                <div className="footermiddle"></div>
                <div className="footerright">
                  <div className="footer-copyright-holder">
                    <a href="/welcome" className="link-20 pagelink">© 2024 Bird Interfaces, GmbH.</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Terms; 