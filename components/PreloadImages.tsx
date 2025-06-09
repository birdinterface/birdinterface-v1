import Image from "next/image"

import { criticalImages } from "@/lib/images"

export function PreloadImages() {
  return (
    <div style={{ display: "none" }}>
      {Object.values(criticalImages).map((image) => (
        <Image
          key={image.src}
          {...image}
          priority={true}
          alt=""
          loading="eager"
        />
      ))}
    </div>
  )
}
