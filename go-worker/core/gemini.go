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

func (g *GeminiClient) Test(ctx context.Context) (string, error) {
    response, err := g.client.Models.GenerateContent(
        ctx,
        "gemini-3.1-flash-lite",
        genai.Text("Say hello in one sentence."),
        nil,
    )
    if err != nil {
        return "", err
    }

    return response.Text(), nil
}
