const BASE_URL = process.env.NEXT_PUBLIC_API_URL

type TransactionPayload = {
      date: string
      type: "income" | "expense"
      amount: number
      category_id: string
      description: string
}

export async function getCategories(token: string){
      const response = await fetch(`${BASE_URL}/categories/list`,{
            method: "GET",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
            }
      })

      if (!response.ok) {
            throw new Error("Failed to fetch categories data")
                  }

      return await response.json()
}

export async function getTransactions(token: string){
      const response = await fetch(`${BASE_URL}/transactions/list`,{
            method: "GET",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
            }
      })
      if (!response.ok) {
            throw new Error("Failed to fetch transactions data")
                  }

      return await response.json()
}

export async function createTransaction(token: string, transaction: TransactionPayload){
      const response = await fetch(`${BASE_URL}/transactions/add`,{
            method: "POST",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
      })

      if (!response.ok) {
            throw new Error("Failed to create transaction")
      }

      return await response.json()
}

export async function updateTransaction(token: string, idTransaction: string, transaction: TransactionPayload){
      const response = await fetch(`${BASE_URL}/transactions/update/${idTransaction}`,{
            method: "PUT",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
            },
            body: JSON.stringify(transaction),
      })

      if (!response.ok) {
            throw new Error("Failed to update transaction")
      }

      return await response.json()
}

export async function deleteTransaction(token:string, idTransaction: string){
      const response = await fetch(`${BASE_URL}/transactions/delete/${idTransaction}`, {
            method: "POST",
            headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json",
            }}
      )

      if (!response.ok) {
            throw new Error("Failed to delete transaction")
      }

      return await response.json()
}
