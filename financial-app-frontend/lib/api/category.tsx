const BASE_URL = process.env.NEXT_PUBLIC_API_URL

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