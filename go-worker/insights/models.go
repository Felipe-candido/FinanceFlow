package insights

import (
    "time"
    "github.com/google/uuid"
)

type WeeklyInsight struct {
    ID          uuid.UUID `json:"id"`
    UserID      uuid.UUID `json:"user_id"`
    WeekStart   time.Time `json:"week_start"`
    Position    int16     `json:"position"`
    Title       string    `json:"title"`
    Description string    `json:"description"`
    Type        string    `json:"type"`
    CreatedAt   time.Time `json:"created_at"`
}

type Transaction struct {
    ID          uuid.UUID `json:"id"`
    UserID      uuid.UUID `json:"user_id"`
    Amount      float64   `json:"amount"`
    Description string    `json:"description"`
    Category    string    `json:"category"`
    Date        time.Time `json:"date"`
}

type GenerateInsightsJob struct {
    UserID uuid.UUID `json:"user_id"`
}