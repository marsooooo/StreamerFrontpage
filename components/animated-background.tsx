"use client"

import { useEffect, useRef } from "react"

interface Blob {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
  targetOpacity: number
  pulseSpeed: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const scrollRef = useRef(0)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    const handleScroll = () => {
      scrollRef.current = window.scrollY
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let width = window.innerWidth
    let height = window.innerHeight

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }
    window.addEventListener("resize", resize)
    resize()

    const blobs: Blob[] = []
    const colors = ["rgba(147, 51, 234, ", "rgba(59, 130, 246, ", "rgba(236, 72, 153, ", "rgba(99, 102, 241, "]

    for (let i = 0; i < 12; i++) {
      blobs.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 300 + 200,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 0,
        targetOpacity: Math.random() * 0.6 + 0.3,
        pulseSpeed: Math.random() * 0.01 + 0.005,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      ctx.fillStyle = "#09090b"
      ctx.fillRect(0, 0, width, height)

      blobs.forEach((blob) => {
        blob.x += blob.vx
        blob.y += blob.vy

        if (blob.x < -blob.size) blob.x = width + blob.size
        if (blob.x > width + blob.size) blob.x = -blob.size
        if (blob.y < -blob.size) blob.y = height + blob.size
        if (blob.y > height + blob.size) blob.y = -blob.size

        const dx = mouseRef.current.x - blob.x
        const dy = mouseRef.current.y + scrollRef.current - blob.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 500) {
          blob.x -= dx * 0.002
          blob.y -= dy * 0.002
          if (blob.opacity < 0.8) blob.opacity += 0.02
        }

        blob.opacity += (blob.targetOpacity - blob.opacity) * blob.pulseSpeed
        if (Math.abs(blob.opacity - blob.targetOpacity) < 0.01) {
          blob.targetOpacity = Math.random() * 0.4 + 0.1
        }

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.size)
        gradient.addColorStop(0, blob.color + blob.opacity + ")")
        gradient.addColorStop(1, blob.color + "0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 blur-3xl" />
}
