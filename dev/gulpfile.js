//引用
var gulp = require("gulp")
var gutil = require("gulp-util")
var htmlreplace = require("gulp-html-replace")
var concat = require("gulp-concat")
var uglify = require("gulp-uglify")
var md5 = require("gulp-md5-plus")
var cleanCSS = require("gulp-clean-css")
var webpack = require("gulp-webpack")
var rename = require("gulp-rename")
var clean = require("gulp-clean")
var extractor = require("./extractor")
var Q = require("q")

var root = "./"
var dest = "../web/"

var files = {
    views: "./views/**/*.html"
}
var output = {
    views: "../web/views",
    css: "../web/css",
    js: "../web/js",
    module: "../web/js"
}
var urlPaths = {
    css: "/css/",
    js: "/js/",
    module: "/js/"
}
var exts = {
    css: ".css",
    js: ".js",
    module: ".js"
}

//html 替换配置
var replaceConfig = {
    // "buildName":"filePath"
}

//编译配置
var config = {
    // "ext":{
    //     "fileName":["filePath"]
    // }
}
//分析html
gulp.task("analyze-html", function () {
    return gulp.src(files.views)
        .pipe(extractor(function (buildName, pathArray) {
            var index = buildName.lastIndexOf("-")
            var ext = buildName.substring(index + 1)
            var filename = buildName.substring(0, index) + exts[ext]
            var base = urlPaths[ext]
            var dist = base + filename
            replaceConfig[buildName] = dist
            var obj = config[ext] || {}
            var arr = obj[filename] || []
            for (var i = 0; i < pathArray.length; i++) {
                //缺少文件去重
                arr.push(root + pathArray[i])
            }
            obj[filename] = arr
            config[ext] = obj
        }))
})

//编译html
gulp.task("build-html", ["analyze-html"], function () {
    gulp.src(files.views)
        .pipe(htmlreplace(replaceConfig))
        .pipe(gulp.dest(output.views))

})
//编译css
gulp.task("build-css", ["analyze-html"], function () {
    var src = config.css
    console.log(config.css)
    if (src) {
        var ds = []
        for (var fileName in src) {
            var d = Q.defer()
            ds.push(d.promise)
            var files = src[fileName]
            gulp.src(files)
                .pipe(concat(fileName))
                .pipe(cleanCSS())
                .pipe(gulp.dest(output.css))
                .on("end", d.resolve)
        }
        if (ds.length > 0) {
            return Q.all(ds)
        }
    }
})

//编译js
gulp.task("build-js", ["analyze-html"], function () {
    var src = config.js
    console.log(config.js)
    if (src) {
        var ds = []
        for (var fileName in src) {
            var d = Q.defer()
            ds.push(d.promise)
            var files = src[fileName]
            gulp.src(files)
                .pipe(concat(fileName))
                .pipe(uglify())
                .pipe(gulp.dest(output.js))
                .on("end", d.resolve)
        }
        if (ds.length > 0) {
            return Q.all(ds)
        }
    }
})

//编译module
gulp.task("build-module", ["analyze-html"], function () {
    var src = config.module
    console.log(config.module)
    if (src) {
        var ds = []
        for (var fileName in src) {
            var d = Q.defer()
            ds.push(d.promise)
            var files = src[fileName]
            gulp.src(files)
                .pipe(webpack({
                    resolve: {
                        extensions: ["", ".js", ".ts"]
                    },
                    module: {
                        loaders: [
                            {
                                test: /\.ts$/,
                                loaders: ["ts-loader"]
                            }
                        ]
                    },
                    externals: {
                        "@angular/http": "window.ng.http",
                        "rxjs": "window.Rx"
                    }
                }))
                .pipe(uglify())
                .pipe(rename(fileName))
                .pipe(gulp.dest(output.module))
                .on("end", d.resolve)
        }
        if (ds.length > 0) {
            return Q.all(ds)
        }
    }
})

//资源md5标记
gulp.task("md5", ["build-html", "build-css", "build-js", "build-module"], function () {
    return gulp.src([output.css + "/**/*.css", output.js + "/**/*.js"], {
        base: dest
    })
        .pipe(clean({
            force: true
        }))
        .pipe(md5(10, output.views + "/**/*.html"))
        .pipe(gulp.dest(dest))
})

//清理目标文件夹
gulp.task("clean", function () {
    return gulp.src(dest + "**")
        .pipe(clean({
            force: true
        }))
})

//默认编译任务
gulp.task("default", ["md5"])

//监听文件变化
gulp.task("watch", function () {
    gulp.watch(files.views, ["build-html"])
})