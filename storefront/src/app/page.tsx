import { redirect } from "next/navigation"
import { headers } from "next/headers"

export default async function RootPage() {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  const hostname = host.split(":")[0].toLowerCase()

  if (hostname === "seller-area.smomo.shop") {
    redirect("/admin")
  }

  redirect("/store")
}
