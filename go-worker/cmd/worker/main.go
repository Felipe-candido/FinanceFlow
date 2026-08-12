package main

import (
	"context"
	"log"
	"time"

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
    if err != nil {
        log.Fatal(err)
    }

    log.Printf("Active users: %d\n", len(users))

    for _, id := range users {
        log.Println(id)
    }

    if len(users) > 0 {
        now := time.Now()
        weekStart := time.Date(
            now.Year(),
            now.Month(),
            now.Day(),
            0, 0, 0, 0,
            time.UTC,
        )
        weekEnd := weekStart.AddDate(0, 0, 7)
        txs, err := repo.GetLastWeekTransactions(ctx, users[0], weekStart, weekEnd)
        if err != nil {
            log.Fatal(err)
        }

        log.Printf("Transactions found: %d\n", len(txs))
    }

    gemini, err := core.NewGeminiClient(cfg.GeminiAPIKey)
    if err != nil{
        log.Fatal(err)
    }

    text, err := gemini.Test(ctx)
    if err != nil{
        log.Fatal(err)
    }

    log.Println("Gemini response:", text)

}