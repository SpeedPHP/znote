const fs = nw.require('fs')

let isAlwaysOnTop = false

let countDownStatus = "ready"
let wordCount = 0
let targetSum = 0
let targetWord = 0

let isSaveToFile = false
let saveFilePath = ""
let tmpData = ""
let fileTitle = "未命名.txt"

let params = window.location.search
if(params != ""){
    params = decodeURIComponent(params.replace(/^\?/, ""))
    if (fs.existsSync(params)) {
        tmpData = fs.readFileSync(params)
        saveFilePath = params
        isSaveToFile = true
        fileTitle = params.split('/').pop().toLowerCase()
    }
}

$(document).ready(function () {
    $(document).attr("title", fileTitle)
    if(tmpData.length > 0) {
        $("#writer").val(tmpData)
        delete tmpData
    }
    wordCount = $("#writer").val().replace(/[\r\n]/g,'').length
    $("#counter b").text(wordCount.toLocaleString())

    $("#writer").css("height", window.innerHeight - 45)
    $("#writer").css("width", window.innerWidth - 22)
    $(window).resize(function () {
        $("#writer").css("height", window.innerHeight - 45)
        $("#writer").css("width", window.innerWidth - 22)
    })

    $("#settop a").click(function () {
        if(isAlwaysOnTop){
            nw.Window.get().setAlwaysOnTop(false)
            isAlwaysOnTop = false
            $(this).text("△")
        }else{
            nw.Window.get().setAlwaysOnTop(true)
            isAlwaysOnTop = true
            $(this).text("▲")
        }
    })
    $("#writer").keyup(function () {
        wordCount = saveFileAndCount()
        $("#counter b").text(wordCount.toLocaleString())
        if(wordCount % 1000 == 0 && wordCount != 0) {
            $("#opration a").hide()
            $("body").animate({backgroundColor:'#368924'}, 1500)
            $("body").animate({backgroundColor:'#1a1a1a'}, 1500, function () {
                $("#opration a").show()
            })
        }
        if($("#leftCount") && countDownStatus == "writing"){
            let leftCount = parseInt(targetSum) - wordCount
            if(leftCount > 0){
                $("#leftCount").text(leftCount.toLocaleString())
            }else{
                $("body").animate({backgroundColor:'#CD7F32'}, 2500)
                $("#opration span").html("<b>🎉</b>，恭喜完成了这次 " + targetWord + " 字的目标！")
                countDownStatus = "finished"
            }
        }
    })
    $("#opration a").click(function () {
        if(countDownStatus == "ready"){
            targetWord = $("#targetWord").val().trim()
            if(targetWord > 0) {
                targetSum = parseInt(targetWord) + wordCount
                $("#opration span").html("距离目标还有：<b id='leftCount'>"+ targetWord.toLocaleString() +"</b> 字。")
                $(this).text("✕")
                countDownStatus = "writing"
            }
        }else if(countDownStatus == "writing" || countDownStatus == "finished"){
            if (countDownStatus == "finished" || window.confirm("是否放弃这次目标？")) {
                $("#opration span").html('<span>设定要写的目标字数&nbsp;&nbsp;<input type="text" id="targetWord" pattern="\d*" maxlength="5" />')
                $(this).text("✓")
                countDownStatus = "ready"
                $("body").css("backgroundColor", "#1a1a1a")
            }
        }
    })
})
let ctrl = require("os").platform() == "darwin" ? "cmd" : "ctrl"
let submenu = new nw.Menu()
submenu.append(new nw.MenuItem({
    label: '新建', key: "n", modifiers: ctrl, click: function () {
        nw.Window.open("app/main.html", {
            width : 750,
            height: 550,
            position: "center"
        })
    }
}))

submenu.append(new nw.MenuItem({
    label: '保存', key: "s", modifiers: ctrl, click: function () {
        if(isSaveToFile == false){
            $("#saveFileDialog").attr("nwsaveas", fileTitle)
            $("#saveFileDialog").trigger("click")
        }else{
            saveFileAndCount()
        }
    },
}))
$("#saveFileDialog").change(function () {
    let tmpFilePath = $(this).val()
    if (tmpFilePath != "") {
        let fileExtension = tmpFilePath.split('.').pop().toLowerCase()
        if (fileExtension != 'txt') tmpFilePath += '.txt'
        if(saveFilePath != "" && false == isSaveToFile){
            fs.unlink(saveFilePath, function () {})
        }
        saveFilePath = tmpFilePath
        isSaveToFile = true
        saveFileAndCount()
        fileTitle = saveFilePath.split('/').pop().toLowerCase()
        $(document).attr("title", fileTitle)
    }
})
submenu.append(new nw.MenuItem({type: 'separator'}))
submenu.append(new nw.MenuItem({
    label: '退出', key: "q", modifiers: ctrl, click: function () {
        nw.Window.get().close()
    }
}))
let topmenu = new nw.Menu({type: 'menubar'})
topmenu.createMacBuiltin("ZNote", {hideWindow: true})
topmenu.append(new nw.MenuItem({label: "文件", submenu: submenu}))
nw.Window.get().menu = topmenu

nw.Window.get().on('close', function () {
    saveFileAndCount()
    nw.Window.get().close(true)
})

function saveFileAndCount() {
    let currentTxt = $("#writer").val()
    wordCount = currentTxt.replace(/[\r\n]/g,'').length
    if(wordCount > 0){
        if(saveFilePath == ""){
            const homedir = nw.require('os').homedir()
            const path = nw.require("path")
            let tmpSavePath = path.join( homedir, ".znote", "tmpSaveFile")
            fs.mkdirSync(tmpSavePath, { recursive: true })
            let d = new Date()
            let randomFileName = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate() + "d" + d.getHours() + "s" + d.getMinutes() + "s" + d.getSeconds()
            saveFilePath = tmpSavePath + path.sep + randomFileName + ".txt"
        }

        fs.writeFile(saveFilePath, currentTxt, function(err) {
            if (err) throw err
        })
        delete currentTxt
    }
    return wordCount
}

var shortcut = new nw.Shortcut({
    key : "Command+1",
    active : function() {
        nw.Window.open("app/main.html", {
            width : 750,
            height: 550,
            position: "center"
        })
    },
    failed : function(msg) {
        console.log(msg)
    }
})
nw.App.registerGlobalHotKey(shortcut)