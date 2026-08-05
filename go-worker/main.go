package main

import (
	"log"
	"os"

	amqp "github.com/rabbitmq/amqp091-go"
)

func main() {
	log.Println("Starting Go Worker Service...")

	// 1. Get RabbitMQ URL from docker-compose environment variables
	rabbitURL := os.Getenv("RABBITMQ_URL")
	if rabbitURL == "" {
		rabbitURL = "amqp://guest:guest@localhost:5672/" // Fallback for local testing
	}

	// 2. Connect to RabbitMQ
	conn, err := amqp.Dial(rabbitURL)
	if err != nil {
		log.Fatalf("Failed to connect to RabbitMQ: %v", err)
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		log.Fatalf("Failed to open a channel: %v", err)
	}
	defer ch.Close()

	// 3. Declare the queues (ensures they exist before we listen)
	aiQueue, _ := ch.QueueDeclare("ai_insights_queue", true, false, false, false, nil)
	reportQueue, _ := ch.QueueDeclare("report_queue", true, false, false, false, nil)

	// 4. Create Consumers for both queues
	aiMessages, err := ch.Consume(aiQueue.Name, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Failed to register AI consumer: %v", err)
	}

	reportMessages, err := ch.Consume(reportQueue.Name, "", true, false, false, false, nil)
	if err != nil {
		log.Fatalf("Failed to register Report consumer: %v", err)
	}

	// 5. Create a channel to keep the main function running forever
	forever := make(chan struct{})

	// 6. Start a Goroutine for AI Insights
	go func() {
		for d := range aiMessages {
			log.Printf("[AI Insights] Received request: %s", d.Body)
			// TODO: Call AI API and save to DB
		}
	}()

	// 7. Start a Goroutine for Excel Reports
	go func() {
		for d := range reportMessages {
			log.Printf("[Reports] Received request: %s", d.Body)
			// TODO: Fetch data, build Excel with excelize, upload to Supabase
		}
	}()

	log.Println(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever // This blocks the main thread so the program doesn't exit
}