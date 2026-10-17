"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateProfileSettings } from "@/app/actions/settings"

type SettingsFormProps = {
  user: {
    id: string
    name: string
    email: string
    phone: string
  }
  profile: {
    address: string
    city: string
    zipCode: string
    country: string
  }
}

export function SettingsForm({ user, profile }: SettingsFormProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      zipCode: formData.get("zipCode") as string,
      country: formData.get("country") as string,
    }

    const result = await updateProfileSettings(user.id, data)
    
    if (result.success) {
      setMessage({ type: "success", text: "تم تحديث البيانات بنجاح!" })
    } else {
      setMessage({ type: "error", text: result.error || "حدث خطأ أثناء حفظ البيانات." })
    }
    
    setIsSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">الاسم الكامل</label>
          <Input name="name" defaultValue={user.name} required />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">البريد الإلكتروني</label>
          <Input name="email" type="email" defaultValue={user.email} required disabled className="bg-gray-100 cursor-not-allowed" />
          <p className="text-xs text-gray-500">لا يمكن تغيير البريد الإلكتروني حالياً.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">رقم الهاتف</label>
          <Input name="phone" defaultValue={user.phone} dir="ltr" className="text-right" />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">معلومات التوصيل</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">العنوان بالتفصيل</label>
            <Input name="address" defaultValue={profile.address} placeholder="الشارع، رقم المبنى..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">المدينة</label>
            <Input name="city" defaultValue={profile.city} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">الرمز البريدي</label>
            <Input name="zipCode" defaultValue={profile.zipCode} dir="ltr" className="text-right" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">الدولة</label>
            <Input name="country" defaultValue={profile.country} />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSaving} className="bg-[#ff2d55] hover:bg-[#ff2d55]/90 text-white min-w-[150px]">
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </form>
  )
}
