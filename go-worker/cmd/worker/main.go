package main

import (
	"context"
	"log"

	"financeflow-worker/core"
	"financeflow-worker/insights"
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
    log.Println("Database connected successfully")
    log.Println("RabbitMQ connected successfully")

    repo := insights.NewRepository(db)
    users, err := repo.GetActiveUsers(ctx)
    if err != nil{
        log.Fatal(err)
    }

    gemini, _ := core.NewGeminiClient(cfg.GeminiAPIKey)
    service := insights.NewService(repo, gemini)

    err = service.GenerateForUser(ctx, users[0])
}