package core

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
    DatabaseURL string
    RabbitMQURL string
    GeminiAPIKey string
    QueueName string
}

func LoadConfig() Config {

     _ = godotenv.Load()

    cfg := Config{
        DatabaseURL: os.Getenv("DATABASE_URL"),
        RabbitMQURL: os.Getenv("RABBITMQ_URL"),
        GeminiAPIKey: os.Getenv("GEMINI_API_KEY"),
        QueueName: os.Getenv("AI_INSIGHTS_QUEUE"),
    }

    if cfg.DatabaseURL == "" {
        log.Fatal("DATABASE_URL is required")
    }

    if cfg.RabbitMQURL == "" {
        log.Fatal("RABBITMQ_URL is required")
    }

    if cfg.QueueName == "" {
        cfg.QueueName = "ai_insights_queue"
    }

    return cfg
}