"use client"

import { ArrowDown } from "lucide-react"
import { Montserrat } from "next/font/google"
import Head from "next/head"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { useCallback, useEffect, useRef, useState } from "react"

import "../../public/css/advancers-club-ef3cf37311bfc4b53cc064fc.webflow.css"
import "../../public/css/normalize.css"
import "../../public/css/stars.css"
import "../../public/css/webflow.css"

import FlashlightEffect from "../../components/custom/flashlight-effect"

const montserratFont = Montserrat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })

const Welcome = () => {
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [demoCode, setDemoCode] = useState("")
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false)
  const [demoError, setDemoError] = useState("")
  const fullText = "The intelligent personal interface"
  const emailInputRef = useRef<HTMLInputElement>(null)
  const demoInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsSubmitting(true)

      try {
        const response = await fetch("/api/waitlist", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        })

        if (!response.ok) {
          throw new Error("Failed to join Alpha")
        }

        // Show success state
        setIsSubmitted(true)
        setEmail("") // Clear email immediately when showing thank you

        // Reset thank you message after 2 seconds
        setTimeout(() => {
          setIsSubmitted(false)
        }, 2000)
      } catch (err) {
        setError("Failed to join Alpha. Please try again.")
      } finally {
        setIsSubmitting(false)
      }
    },
    [email]
  )

  const handleDemoSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setDemoError("")
      setIsDemoSubmitting(true)

      try {
        const result = await signIn("credentials", {
          demoCode: demoCode,
          redirect: false,
        })

        if (result?.error) {
          setDemoError("Invalid demo code")
        } else if (result?.ok) {
          // Successful login, wait a moment for session to establish then redirect
          setTimeout(() => {
            window.location.href = "/tasks"
          }, 500)
        }
      } catch (err) {
        setDemoError("Failed to authenticate. Please try again.")
        setIsDemoSubmitting(false)
      }
    },
    [demoCode]
  )

  // Auto-submit when valid email is entered
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (email && emailRegex.test(email) && !isSubmitting && !isSubmitted) {
      const timer = setTimeout(() => {
        handleSubmit(new Event("submit") as any)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [email, isSubmitting, isSubmitted, handleSubmit])

  // Auto-submit when demo code is entered
  useEffect(() => {
    if (demoCode && demoCode.length === 4 && !isDemoSubmitting) {
      const timer = setTimeout(() => {
        handleDemoSubmit(new Event("submit") as any)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [demoCode, isDemoSubmitting, handleDemoSubmit])

  // Prevent copy/paste keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, F12, and right-click related shortcuts
      if (
        (e.ctrlKey &&
          (e.key === "a" || e.key === "c" || e.key === "v" || e.key === "x")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && e.key === "I") ||
        (e.ctrlKey && e.shiftKey && e.key === "J") ||
        (e.ctrlKey && e.key === "u")
      ) {
        // Allow these shortcuts only when focused on the email or demo code input
        const target = e.target as HTMLElement
        if (
          target.tagName === "INPUT" &&
          (target.getAttribute("type") === "email" ||
            target.getAttribute("type") === "text" ||
            target.getAttribute("type") === "password")
        ) {
          return // Allow normal input behavior
        }
        e.preventDefault()
        e.stopPropagation()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Focus input when Enter is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        document.activeElement !== emailInputRef.current &&
        document.activeElement !== demoInputRef.current
      ) {
        e.preventDefault()
        if (emailInputRef.current) {
          emailInputRef.current.focus()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <>
      <Head>
        <title>Birdinterface</title>
        <style>{`
          body {
            background-color: white !important;
          }
          * {
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
          }
          input[type="email"], input[type="text"], input[type="password"] {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }
          ::selection {
            background: transparent;
          }
          ::-moz-selection {
            background: transparent;
          }
        `}</style>
      </Head>
      {/* Outer container now allows scrolling */}
      <div
        className="w-full bg-white min-h-screen select-none"
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
          WebkitTouchCallout: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
        onDragStart={(e: React.DragEvent) => e.preventDefault()}
      >
        {/* Hero Section - White background */}
        <div className="hero-section-for-flashlight relative flex flex-col items-center z-20 min-h-screen bg-white">
          {/* Logo positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-210px]">
            <div className="relative size-[340px] sm:size-[400px] md:size-[460px] lg:size-[520px] xl:size-[560px]">
              <Image
                src="/images/Birdinterface final-3.png"
                alt="Bird Interface Logo"
                width={1000}
                height={1000}
                className="object-contain size-full"
                priority
                draggable={false}
                quality={85}
              />
            </div>
          </div>

          {/* Paragraph positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mt-[-80px]">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <p
                className="text-sm text-center px-4"
                style={{
                  fontFamily: montserratFont.style.fontFamily,
                  fontWeight: 600,
                  color: "hsl(0 0% 45.1%)",
                }}
              >
                Your core data – unified in a high-capability environment.
                Generate, manipulate, and innovate with an interface that acts
                on your behalf, accesses the web in real-time, and adapts to
                your every need. The future of computing is coming – and
                it&apos;s limitless.
              </p>
            </div>
          </div>

          {/* Form positioned separately */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mt-[45px]">
            <div className="w-full max-w-2xl mx-auto flex flex-col items-center">
              <form
                onSubmit={handleSubmit}
                className="w-full max-w-xs mx-auto px-4"
              >
                <div className="flex flex-col gap-2 items-center">
                  <input
                    ref={emailInputRef}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      isSubmitting
                        ? "Joining..."
                        : isSubmitted
                          ? "Thank You"
                          : "Sign Up for Alpha"
                    }
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 rounded-md text-center focus:outline-none disabled:opacity-50"
                    style={{
                      fontFamily: montserratFont.style.fontFamily,
                      fontWeight: 600,
                      color: "hsl(0 0% 20%)",
                      backgroundColor: "#f1f2f4",
                    }}
                  />
                  {error && (
                    <p className="text-red-400 text-sm mt-2">{error}</p>
                  )}
                </div>
              </form>

              {/* Demo Code Form */}
              <form
                onSubmit={handleDemoSubmit}
                className="w-full max-w-xs mx-auto px-4 mt-4"
              >
                <div className="flex flex-col gap-2 items-center">
                  <input
                    ref={demoInputRef}
                    type="password"
                    value={demoCode}
                    onChange={(e) => setDemoCode(e.target.value)}
                    placeholder={
                      isDemoSubmitting ? "Authenticating..." : "Enter Demo Code"
                    }
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    disabled={isDemoSubmitting}
                    className="w-full px-4 py-2 rounded-md text-center focus:outline-none disabled:opacity-50"
                    style={{
                      fontFamily: montserratFont.style.fontFamily,
                      fontWeight: 600,
                      color: "hsl(0 0% 20%)",
                      backgroundColor: "#f1f2f4",
                    }}
                  />
                  {demoError && (
                    <p className="text-red-400 text-sm mt-2">{demoError}</p>
                  )}
                </div>
              </form>
            </div>
          </div>
          {/* Arrow pointing down with text */}
          <div className="absolute bottom-10 w-full flex items-end justify-between px-4 md:justify-center md:gap-2 md:px-0 cursor-pointer group">
            <p
              className="text-sm cursor-pointer"
              style={{
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500,
                color: "hsl(0 0% 45.1%)",
              }}
              onClick={() => {
                const missionSection =
                  document.getElementById("mission-section")
                if (missionSection) {
                  missionSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Coming at the end of summer 2025
            </p>
            <ArrowDown
              className="size-5 text-neutral-400 group-hover:text-neutral-600 transition-colors relative bottom-[10px] cursor-pointer"
              onClick={() => {
                const missionSection =
                  document.getElementById("mission-section")
                if (missionSection) {
                  missionSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
            />
          </div>
        </div>

        {/* New Section for the Mission and Masterplan */}
        <div
          id="mission-section"
          className="bg-white py-16 px-4 sm:px-6 lg:px-8"
        >
          <div
            className="max-w-3xl mx-auto normal-case font-normal"
            style={{ fontFamily: montserratFont.style.fontFamily }}
          >
            <h2 
              className="text-3xl text-black mb-1 text-center"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              Mission and Masterplan
            </h2>
            <p
              className="text-center text-xs mb-8"
              style={{ 
                color: "hsl(0 0% 45.1%)", 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Alex Gisbrecht, Founder &amp; CEO of Birdinterface • May 30, 2025
            </p>

            <h2 
              className="text-xl text-black mb-6 mt-12"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              Unifying Our Life For AI
            </h2>
            <p 
              className="text-sm"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              I founded Birdinterface to solve data fragmentation by building a
              unified and AI-integrated personal interface.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              The first essential step is unifying core data+tools into one
              elegant, ground-up interface—starting with tasks, calendar, an
              improved G-Drive-like system, a curator (to store and organize
              online content like videos, posts, websites, books, movies,
              music), agentic AI, maps, mail, messaging, financial overview, and
              browser.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              This creates 3 major unlocks:
            </p>
                          <ol
                className="list-decimal list-inside text-sm mt-4 pl-4"
                style={{ 
                  color: "hsl(0 0% 45.1%)",
                  fontFamily: montserratFont.style.fontFamily,
                  fontWeight: 500
                }}
              >
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  The user has all his important data in one place.
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Birdinterface now understands the whole life of a user.
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Birdinterface can deliver the best and most relevant knowledge,
                  insights, and tools from the internet directly to the user—at
                  the right place and time. Knowledge is Power - but only if
                  it&apos;s the right knowledge.
                </li>
              </ol>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              As soon as core data is unified (which is the essential first step
              to create a truly magical experience), we&apos;ll start training
              LLMs to emulate the interface, freeing AI to serve the user&apos;s
              needs and preferences more intelligently while maintaining UI and
              data consistency.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Currently, we&apos;re in the early stages with a prototype used
              daily by 1,000+ people. I&apos;m preparing for the Alpha launch in
              summer 2025.
            </p>

            <h2 
              className="text-xl text-black mt-12 mb-6"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              The Mission
            </h2>
            <p 
              className="text-sm"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              At Birdinterface, the mission is to empower humans in their own
              pursuits and from an early age. We want to bring more freedom,
              independence, and power to people by creating a completely new,
              adaptive, intuitive and generative computer interface that aligns
              with a user&apos;s best interests, adapts to his/her thinking,
              removes friction, and respects their time.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              As outlined in{" "}
              <a
                href="https://advancers.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline decoration-transparent underline-offset-4 transition-all duration-300 hover:text-gray-400 hover:decoration-current"
              >
                my philosophy
              </a>
              , I believe most systems in civilization, tech, and the internet
              are still misaligned with true advancement—favoring control,
              inefficiency, or profit over individual freedom and progress.
            </p>

            <h2 
              className="text-xl text-black mt-12 mb-6"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              The Data Fragmentation Problem
            </h2>
            <p 
              className="text-sm"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              The fundamental problem is the fragmentation of core data (=what
              drives one&apos;s curiosity, creativity and will to contribute).
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Today, a user&apos;s core data is fragmented across disconnected
              data silos and environments—creating friction, wasting time, and
              blocking a clear overview of life.
            </p>
            <p 
            className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Birdinterface aims to solve this problem by creating a unified,
              AI-integrated and high-capability environment, that would be
              unwise not to use.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Among other things Birdinterface continuously analyzes a
              user&apos;s data to predict and serve user needs better. Bird can
              almost instantly surface or teleport the user to a desired data
              snippet across all their data (docs, files, code, videos,
              websites, music). Bird can point out gaps or errors in a
              user&apos;s thinking and visualize real opportunities for value
              creation, that I call &quot;Potentials&quot;. Bird also enables
              users to use a lot of compute to figure out the answer for hard
              problems that humans can&apos;t solve. This is only scratching the
              surface.
            </p>

            <h2 
              className="text-xl text-black mt-12 mb-6"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              Building a Unified Data Interface
            </h2>
            <p 
              className="text-sm"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Birdinterface started as a personal research project I&apos;ve
              developed over 10+ years by continuously removing friction from my
              computer and phone experience. The current prototype uses Chrome
              bookmarks with simplified tools like Todoist, Google Calendar,
              Google Drive, Google Maps, Google Sheets, my own AI and more. My
              approach is to rebuild all components from the ground up—stripped
              to their most elegant, simple, and prioritized forms.
            </p>

            <h2 
              className="text-xl text-black mb-6 mt-12"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              What&apos;s Next
            </h2>
            <p 
              className="text-sm"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              For the Alpha launch planned in summer 2025, I aim to build the
              first five core data components—Tasks, Calendar, Database,
              Curator, and Intelligence—with core functionalities such as full
              AI context, agentic capabilities within the interface and the
              ability to generate new functioning components that can also be
              shared with other users.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Thereafter, every 1–2 months and over 6–9 months, we&apos;ll ship
              the next five—Map, Mail, People (communications hub), Finance, and
              Internet (sandboxed browser)—while starting data collection to
              train our first generative interface model.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Looking further ahead, Birdinterface plans to:
            </p>
                          <ol
                className="list-decimal list-inside text-sm mt-4 pl-4"
                style={{ 
                  color: "hsl(0 0% 45.1%)",
                  fontFamily: montserratFont.style.fontFamily,
                  fontWeight: 500
                }}
              >
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Develop adaptive displays and devices powered by generative
                  computing
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Integrate a virtual world using real-world models for social,
                  work, and play—with Bird as the HUD
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Build augmentation hardware to boost cognition and monitor
                  health
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Enhance prediction accuracy to be truly in-sync with the user
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Explore blockchain for data ownership
                </li>
              </ol>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              If rethinking the current computer experience excites you,
              let&apos;s talk. I&apos;m seeking founding engineers and partners
              with expertise in AI systems, model optimization, hardware, and
              scalable architecture.
            </p>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
              fontWeight: 500
              }}
            >
              Reach out:{" "}
              <a
                href="mailto:alex@birdinterface.com"
                className="text-blue-600 underline decoration-transparent underline-offset-4 transition-all duration-300 hover:text-gray-400 hover:decoration-current"
              >
                alex@birdinterface.com
              </a>
            </p>

            <h2 
              className="text-xl text-black mt-12 mb-6"
              style={{ 
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 600
              }}
            >
              Mission and Masterplan (Summarized)
            </h2>
            <p 
              className="text-sm mt-4"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              Empower humans—in their own pursuits and from an early age.
            </p>
                          <ul
                className="list-decimal list-inside text-sm mt-4 pl-4"
                style={{ 
                  color: "hsl(0 0% 45.1%)",
                  fontFamily: montserratFont.style.fontFamily,
                  fontWeight: 500
                }}
              >
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Unify core data, add all important AI capabilities
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Train LLMs to emulate the interface
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Build custom displays and devices
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Develop augmentation hardware
                </li>
                <li 
                  className="text-sm"
                  style={{
                    fontFamily: montserratFont.style.fontFamily,
                    fontWeight: 500
                  }}
                >
                  Predict user actions with high accuracy
                </li>
              </ul>

            <hr className="my-12 border-gray-300" />

            <p 
              className="text-center text-xs"
              style={{ 
                color: "hsl(0 0% 45.1%)",
                fontFamily: montserratFont.style.fontFamily,
                fontWeight: 500
              }}
            >
              © 2025 Bird Interfaces, GmbH. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Welcome
