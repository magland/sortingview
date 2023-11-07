onmessage = (e) => {
    const n = e.data.n
    if (!n) return

    const primes = []
    let i = 2
    while (i < n) {
        let isPrime = true
        for (let p of primes) {
            if (i % p === 0) {
                isPrime = false
                break
            }
        }
        if (isPrime) primes.push(i)
        i = i + 1
    }

    postMessage({primes})
}