package insights

import (
	"context"
	"time"

	"financeflow-worker/core"
	"github.com/google/uuid"
)


type Service struct {
    repo   *Repository
    gemini *core.GeminiClient
}

func NewService(
    repo *Repository, 
    gemini *core.GeminiClient,
    ) *Service {
    
        return &Service{
            repo: repo,
            gemini: gemini,
        }
}

func (s *Service) GenerateInsights(
        ctx context.Context,
        userID uuid.UUID,
    ) error {
        now := time.Now()

        weekStart := time.Date(
            now.Year(),
            now.Month(),
            now.Day(),
            0, 0, 0, 0,
            now.Location(),
        )
        weekEnd := weekStart.AddDate(0, 0, -7)

        transactions, err := s.repo.GetLastWeekTransactions(
            ctx,
            userID,
            weekStart,
            weekEnd,
        )
        if err != nil{
            return err
        }
        if len(transactions) == 0 {
            return nil
        }

        return nil
    }
