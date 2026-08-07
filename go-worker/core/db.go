package core

import (
    "context"
    "fmt"

    "github.com/jackc/pgx/v5/pgxpool"
)

func NewDB(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
    pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
    if err != nil {
        return nil, fmt.Errorf("failed to create db pool: %w", err)
    }

    if err := pool.Ping(ctx); err != nil {
        pool.Close()
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }

    return pool, nil
}