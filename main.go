package main

import (
	"github.com/kdada/tinygo"
	"github.com/kdada/tinygo/web"
)

// main 启动函数
func main() {
	var app, err = web.NewWebApp("", "web.cfg", Router())
	if err != nil {
		panic(err)
	}
	tinygo.AddApp(app)
	tinygo.Run()
}
