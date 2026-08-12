package core

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

func NewDB(ctx context.Context, cfg Config) (*pgxpool.Pool, error) {
    poolConfig, err := pgxpool.ParseConfig(cfg.DatabaseURL)
    if err != nil {
        return nil, fmt.Errorf("failed to parse database config: %w", err)
    }

    // Disable prepared statement caching (required for PgBouncer / Supabase pooler)
    poolConfig.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

    pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
    if err != nil {
        return nil, fmt.Errorf("failed to create db pool: %w", err)
    }

    if err := pool.Ping(ctx); err != nil {
        pool.Close()
        return nil, fmt.Errorf("failed to ping database: %w", err)
    }

    return pool, nil
}