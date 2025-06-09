import { RefObject, useEffect, useRef } from "react"

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T>,
  RefObject<T>,
] {
  const containerRef = useRef<T>(null)
  const endRef = useRef<T>(null)
  const userScrolledRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    const end = endRef.current

    if (container && end) {
      // Handle user scroll
      const handleScroll = () => {
        if (container) {
          const { scrollTop, scrollHeight, clientHeight } = container
          const isAtBottom = scrollHeight - scrollTop - clientHeight < 50
          userScrolledRef.current = !isAtBottom
        }
      }

      // Scroll observer
      const observer = new MutationObserver(() => {
        if (!userScrolledRef.current) {
          end.scrollIntoView({ block: "end" })
        }
      })

      container.addEventListener("scroll", handleScroll)

      observer.observe(container, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true,
      })

      return () => {
        container.removeEventListener("scroll", handleScroll)
        observer.disconnect()
      }
    }
  }, [])

  return [containerRef, endRef]
}
