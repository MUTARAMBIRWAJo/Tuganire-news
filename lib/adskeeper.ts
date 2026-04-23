type AdsKeeperWindow = Window & {
  _mgq?: Array<["_mgc.load"]>
  __adsKeeperPendingLoads?: number
  __adsKeeperLoadTimer?: number
}

const RETRY_MS = 250
const MAX_RETRIES = 16

export function enqueueAdsKeeperLoad() {
  if (typeof window === "undefined") return

  const w = window as AdsKeeperWindow
  w.__adsKeeperPendingLoads = (w.__adsKeeperPendingLoads ?? 0) + 1

  if (w.__adsKeeperLoadTimer) return

  let retries = 0

  w.__adsKeeperLoadTimer = window.setInterval(() => {
    const queue = w._mgq

    if (!queue) {
      retries += 1
      if (retries >= MAX_RETRIES) {
        if (w.__adsKeeperLoadTimer) {
          window.clearInterval(w.__adsKeeperLoadTimer)
          w.__adsKeeperLoadTimer = undefined
        }
        w.__adsKeeperPendingLoads = 0
      }
      return
    }

    retries = 0
    const pending = w.__adsKeeperPendingLoads ?? 0

    if (pending <= 0) {
      if (w.__adsKeeperLoadTimer) {
        window.clearInterval(w.__adsKeeperLoadTimer)
        w.__adsKeeperLoadTimer = undefined
      }
      return
    }

    queue.push(["_mgc.load"])
    w.__adsKeeperPendingLoads = pending - 1

    if ((w.__adsKeeperPendingLoads ?? 0) <= 0 && w.__adsKeeperLoadTimer) {
      window.clearInterval(w.__adsKeeperLoadTimer)
      w.__adsKeeperLoadTimer = undefined
    }
  }, RETRY_MS)
}
