package core

import (
    "fmt"

    amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
    Conn *amqp.Connection
    Ch   *amqp.Channel
}

func NewRabbitMQ(cfg Config) (*RabbitMQ, error) {
    conn, err := amqp.Dial(cfg.RabbitMQURL)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to rabbitmq: %w", err)
    }

    ch, err := conn.Channel()
    if err != nil {
        conn.Close()
        return nil, fmt.Errorf("failed to open channel: %w", err)
    }

    _, err = ch.QueueDeclare(
        cfg.QueueName,
        true,  // durable
        false, // auto-delete
        false, // exclusive
        false, // no-wait
        nil,
    )

    if err != nil {
        ch.Close()
        conn.Close()
        return nil, fmt.Errorf("failed to declare queue: %w", err)
    }

    return &RabbitMQ{
        Conn: conn,
        Ch:   ch,
    }, nil
}

func (r *RabbitMQ) Close() {
    r.Ch.Close()
    r.Conn.Close()
}