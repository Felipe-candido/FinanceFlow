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

func (r *Repository) GetLastWeekTransactions(
    ctx context.Context,
    userID uuid.UUID,
) ([]Transaction, error) {

    rows, err := r.db.Query(ctx, `
        SELECT
            id,
            user_id,
            amount,
            description,
            category,
            transaction_date
        FROM transactions
        WHERE user_id = $1
          AND transaction_date >= CURRENT_DATE - INTERVAL '7 days'
        ORDER BY transaction_date ASC
    `, userID)

    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var txs []Transaction

    for rows.Next() {
        var t Transaction

        err := rows.Scan(
            &t.ID,
            &t.UserID,
            &t.Amount,
            &t.Description,
            &t.Category,
            &t.Date,
        )

        if err != nil {
            return nil, err
        }

        txs = append(txs, t)
    }

    return txs, rows.Err()
}