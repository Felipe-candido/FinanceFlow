package insights

import (
    "context"

    "github.com/jackc/pgx/v5/pgxpool"
)

type Repository struct {
    db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *Repository {
    return &Repository{db: db}
}

func (r *Repository) GetActiveUsers(ctx context.Context) ([]uuid.UUID, error) {
    rows, err := r.db.Query(ctx, `
        SELECT id
        FROM users
        WHERE is_active = true
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []uuid.UUID

    for rows.Next() {
        var id uuid.UUID

        if err := rows.Scan(&id); err != nil {
            return nil, err
        }

        users = append(users, id)
    }

    return users, rows.Err()
}