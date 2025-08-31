// "use client"

// import { useEffect, useRef, useState } from "react"

// export function PackagingPreview() {
//   const canvasRef = useRef<HTMLCanvasElement>(null)
//   const [file, setFile] = useState<File | null>(null)

//   useEffect(() => {
//     const canvas = canvasRef.current
//     if (!canvas) return
//     const ctx = canvas.getContext("2d")
//     if (!ctx) return

//     const base = new Image()
//     base.crossOrigin = "anonymous"
//     base.src = "https://www.dehlimirchmasalajaat.com/public/uploads/all/8fh5fEL5ia9Xse93GmKq2lZy0K1AW7G2bVokpoxt.jpg"
//     base.onload = () => {
//       ctx.clearRect(0, 0, canvas.width, canvas.height)
//       ctx.drawImage(base, 0, 0, canvas.width, canvas.height)

//       if (file) {
//         const reader = new FileReader()
//         reader.onload = () => {
//           const logo = new Image()
//           logo.crossOrigin = "anonymous"
//           logo.src = String(reader.result)
//           logo.onload = () => {
//             // Draw uploaded image centered on pack
//             const w = 140
//             const h = 100
//             const x = (canvas.width - w) / 2
//             const y = (canvas.height - h) / 2
//             ctx.save()
//             ctx.globalAlpha = 0.9
//             ctx.drawImage(logo, x, y, w, h)
//             ctx.restore()
//             // Add outline
//             ctx.strokeStyle = "#16a34a"
//             ctx.lineWidth = 2
//             ctx.strokeRect(x, y, w, h)
//           }
//         }
//         reader.readAsDataURL(file)
//       } else {
//         // Empty frame
//         const w = 140
//         const h = 100
//         const x = (canvas.width - w) / 2
//         const y = (canvas.height - h) / 2
//         ctx.strokeStyle = "#ef4444"
//         ctx.setLineDash([6, 4])
//         ctx.strokeRect(x, y, w, h)
//       }
//     }
//   }, [file])

//   return (
//     <div className="rounded-lg border p-4">
//       <h3 className="font-semibold mb-2">Packaging Preview</h3>
//       <canvas ref={canvasRef} width={240} height={300} className="mx-auto rounded bg-white" />
//       <input
//         type="file"
//         accept="image/*"
//         className="mt-3 block w-full text-sm"
//         onChange={(e) => setFile(e.target.files?.[0] ?? null)}
//       />
//       <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
//         Upload a logo or photo to preview on the package.
//       </p>
//     </div>
//   )
// }
