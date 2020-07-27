let argv = nw.App.fullArgv
let url = "app/main.html"

if (argv.length > 0) {
    for (let k in argv) {
        let testExtension = argv[k].split('.').pop().toLowerCase()
        if (testExtension == 'txt') {
            let testFilePath = decodeURIComponent(argv[k].replace("file://", ""))
            url = url + "?" + testFilePath
            break
        }
    }
}
nw.Window.open(url, {
    width : 750,
    height: 550,
    position: "center"
})

nw.App.on('open', function (params) {
    let testFilePath = decodeURIComponent(params.replace("file://", ""))
    nw.Window.open("app/main.html" + "?" + testFilePath, {
        width : 750,
        height: 550,
        position: "center"
    })
})