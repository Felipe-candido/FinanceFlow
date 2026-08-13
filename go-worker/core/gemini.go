package core

import (
    "context"

    "google.golang.org/genai"
)

type GeminiClient struct {
    client *genai.Client
}

func NewGeminiClient(apiKey string) (*GeminiClient, error){

	client, err := genai.NewClient(
		context.Background(),
		&genai.ClientConfig{
			APIKey: apiKey,
		},
	)

	if err != nil{
		return nil, err
	}

	return &GeminiClient{
		client: client,
	}, nil
}

// Generic method: receives any prompt and returns Gemini's text response.
func (g *GeminiClient) GenerateText(
        ctx context.Context,
        prompt string,
    ) (string, error) {
        
        response, err := g.client.Models.GenerateContent(
            ctx,
            "gemini-2.5-flash",
            genai.Text(prompt),
            nil,
        )
        if err != nil {
            return "", err
        }

        return response.Text(), nil
}
