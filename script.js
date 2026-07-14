window.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById("toggle-menu")
    const interestsBtn = document.getElementById("interests-btn")
    const themeToggle = document.getElementById("theme-toggle")
    const cardAnim = document.getElementById("card-anim")
    const interestsAnim = document.getElementById("interests-anim")
    const cardEl = document.querySelector(".card")

    const statusEl = document.getElementById("status")
    const songEl = document.getElementById("song")

    const sound = document.getElementById("celebration-sound")
    let celebrationDone = false

    let lastPlayingTime = Date.now()
    let changed = false

    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "light") {
        document.body.classList.add("light")
    }

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.body.classList.toggle("light")
            localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark")
        })
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            cardAnim.classList.toggle("collapsed")

            if (cardAnim.classList.contains("collapsed")) {
                interestsAnim.classList.add("collapsed")
                if (cardEl) cardEl.classList.add("scan-hidden")
            } else {
                if (cardEl) cardEl.classList.remove("scan-hidden")
            }
        })
    }

    if (interestsBtn) {
        interestsBtn.addEventListener("click", () => {
            interestsAnim.classList.toggle("collapsed")
        })
    }

    async function updateAllData() {
        try {
            const lanyardRes = await fetch(`https://api.lanyard.rest/v1/users/729369718695133274`)
            const lanyardData = await lanyardRes.json()
            if (lanyardData.success && statusEl) {
                const s = lanyardData.data.discord_status
                statusEl.textContent = s !== "offline" ? "Online" : "Offline"
                statusEl.style.color = s !== "offline" ? "#2ecc71" : "#888"
            }

            const lastfmUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=nayu481&api_key=edf1e7f723ab433cbbd1f6cc126d22fe&format=json&limit=1`
            const lastfmRes = await fetch(lastfmUrl)
            const lastfmData = await lastfmRes.json()

            if (lastfmData.recenttracks && lastfmData.recenttracks.track.length > 0 && songEl) {
                const track = lastfmData.recenttracks.track[0]
                const isPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'

                if (isPlaying) {
                    lastPlayingTime = Date.now()
                    changed = false
                } else {
                    const diff = Date.now() - lastPlayingTime
                    if (diff >= 600000) {
                        changed = true
                    }
                }

                const label = (!isPlaying && changed)
                    ? "Última vez escuchado:"
                    : "Listening from Spotify:"

                songEl.innerHTML = `${label}<br>${isPlaying ? "🎵 " : ""}${track.name}<br>- ${track.artist['#text']}`
            }

        } catch (e) {}
    }

    const targetDate = new Date(2027, 1, 8, 0, 0, 0)

    function updateCountdown() {
        const now = new Date()
        let diff = targetDate - now
        const countdownEl = document.getElementById("countdown")
        if (!countdownEl) return

        if (diff <= 0) {
            countdownEl.innerHTML = "0d 0h 0m"

            if (!celebrationDone) {
                celebrationDone = true
                if (sound) {
                    sound.muted = false
                    sound.volume = 1
                    sound.currentTime = 0
                    sound.play()
                }
                lanzarConfeti()
            }

            return
        }

        const totalMinutes = Math.floor(diff / 60000)
        const days = Math.floor(totalMinutes / 1440)
        const hours = Math.floor((totalMinutes % 1440) / 60)
        const minutes = totalMinutes % 60

        countdownEl.innerHTML = `${days}d ${hours}h ${minutes}m`
    }

    function lanzarConfeti() {
        const end = Date.now() + 2500

        const frame = () => {
            confetti({ particleCount: 4, spread: 70, angle: 60, origin: { x: 0 } })
            confetti({ particleCount: 4, spread: 70, angle: 120, origin: { x: 1 } })

            if (Date.now() < end) requestAnimationFrame(frame)
        }

        frame()
    }

    updateCountdown()
    setInterval(updateCountdown, 60000)

    updateAllData()
    setInterval(updateAllData, 5000)


    const galleryPool = [
        "img/saku.jpg", "img/k.jpg", "img/k1.jpg",
        "img/k2.jpg", "img/k3.jpg", "img/sh.jpg"
    ]

    const galleryImgs = [...document.querySelectorAll(".gallery img")]
    const tileCount = galleryImgs.length
    let offset = 0

    function tileRotate() {
        if (tileCount === 0 || galleryPool.length < tileCount) return

        offset = (offset + 1) % galleryPool.length

        galleryImgs.forEach((img, i) => {
            const nextSrc = galleryPool[(offset + i) % galleryPool.length]
            setTimeout(() => {
                img.classList.add("tile-out")
                setTimeout(() => {
                    img.src = nextSrc
                    img.classList.remove("tile-out")
                    img.classList.add("tile-in")
                    setTimeout(() => img.classList.remove("tile-in"), 220)
                }, 180)
            }, i * 40)
        })
    }

    function tileShuffle() {
        const gallery = document.getElementById("gallery")
        if (!gallery || gallery.children.length < 2) return

        const before = [...gallery.children].map(el => el.getBoundingClientRect())

        const a = Math.floor(Math.random() * gallery.children.length)
        let b = Math.floor(Math.random() * gallery.children.length)
        while (b === a) b = Math.floor(Math.random() * gallery.children.length)

        const nodeA = gallery.children[a]
        const nodeB = gallery.children[b]
        const placeholder = document.createElement("div")
        gallery.insertBefore(placeholder, nodeA)
        gallery.insertBefore(nodeA, nodeB)
        gallery.insertBefore(nodeB, placeholder)
        gallery.removeChild(placeholder)

        const after = [...gallery.children].map(el => el.getBoundingClientRect())

        ;[...gallery.children].forEach((el, i) => {
            const dx = before[i].left - after[i].left
            const dy = before[i].top - after[i].top
            if (dx || dy) {
                el.style.transition = "none"
                el.style.transform = `translate(${dx}px, ${dy}px)`
                requestAnimationFrame(() => {
                    el.style.transition = "transform 0.28s cubic-bezier(.2,.9,.2,1)"
                    el.style.transform = ""
                })
            }
        })
    }

    if (tileCount > 0) {
        setInterval(tileRotate, 3000)
        setInterval(tileShuffle, 4500)
    }
})
