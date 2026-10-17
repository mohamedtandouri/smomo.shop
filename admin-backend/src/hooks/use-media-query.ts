import * as React from "react"

export function useMediaQuery(query: string) {
  const [value, setValue] = React.useState(false)

  React.useEffect(() => {
    function onChange(event: MediaQueryListEvent) {
      setValue(event.matches)
    }

    const result = matchMedia(query)
    result.addEventListener("change", onChange)
    
    // Avoid synchronous state set within effect
    setTimeout(() => {
      setValue(result.matches)
    }, 0)

    return () => result.removeEventListener("change", onChange)
  }, [query])

  return value
}
