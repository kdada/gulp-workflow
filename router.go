package main

import (
	"github.com/kdada/tinygo/router"
	"github.com/kdada/tinygo/web"
)

// Router 返回路由信息
func Router() router.Router {
	var root = web.NewRootRouter()
	root.AddChild(web.NewFileRouter("index.html", "./web/html/index.html"))
	return root
}
