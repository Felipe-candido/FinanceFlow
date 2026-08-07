package main

import (
    "context"
    "log"

    "go-worker/core"
)

func main() {
    ctx := context.Background()

    cfg := core.LoadConfig()

    db, err := core.NewDB(ctx, cfg)
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    mq, err := core.NewRabbitMQ(cfg)
    if err != nil {
        log.Fatal(err)
    }
    defer mq.Close()

    log.Println("Worker started successfully")

    select {}
}