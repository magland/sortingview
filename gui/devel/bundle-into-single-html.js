const fs = require('fs')

function loadCss() {
    const dirname = './build/static/css'
    const a = fs.readdirSync(dirname)
    const fname = a.filter(f => ((f.startsWith('main.')) && f.endsWith('.css')))[0]
    return fs.readFileSync(`${dirname}/${fname}`)
}

function loadJs() {
    const dirname = './build/static/js'
    const a = fs.readdirSync(dirname)
    const fname = a.filter(f => ((f.startsWith('main.')) && f.endsWith('.js')))[0]
    return fs.readFileSync(`${dirname}/${fname}`)
}

function main() {
    const css = loadCss()
    const js = loadJs()
    const html = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <title>Test bundle</title>
        <style>
            ${css}
        </style>
    </head>
    <body>
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <div id="root"></div>
        <script>
            ${js}
        </script>
    </body>
</html>
`
    fs.writeFileSync('devel/index.html', html)
}
main()