package insights

import (
    "fmt"
    "strings"
)

func buildPrompt(transactions []Transactions) string{
   var b strings.Builder

    b.WriteString("Analyze these transactions from the last 7 days:\n\n")

    for _, tx := range transactions {
        b.WriteString(fmt.Sprintf(
            "- %s: %.2f\n",
            tx.Description,
            tx.Amount,
        ))
    }

    b.WriteString(`
		Return exactly 5 financial insights as a JSON array.

		Return ONLY valid JSON.

		Example:

		[
			{
				"title": "Restaurant spending increased",
				"description": "You spent more on restaurants than usual this week.",
				"type": "warning"
			}
		]`
	)

    return b.String()
}