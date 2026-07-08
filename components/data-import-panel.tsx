"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Tale, AuthorInfo } from "@/lib/types"

export function DataImportPanel({ onImportSuccess }: { onImportSuccess?: () => void }) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      
      // Extract DEFAULT_AUTHOR and DEFAULT_TALES from the file
      const authorMatch = text.match(/export const DEFAULT_AUTHOR[:\s]*AuthorInfo = ({[\s\S]*?})\s*(?=\n(?:export|$))/)
      const talesMatch = text.match(/export const DEFAULT_TALES[:\s]*Tale\[\] = (\[[\s\S]*?\])\s*(?=\n(?:export|$))/)

      if (!authorMatch || !talesMatch) {
        throw new Error("Не удалось найти DEFAULT_AUTHOR или DEFAULT_TALES в файле")
      }

      const authorData = JSON.parse(authorMatch[1]) as AuthorInfo
      const talesData = JSON.parse(talesMatch[1]) as Tale[]

      // Save to localStorage
      localStorage.setItem("author_info", JSON.stringify(authorData))
      localStorage.setItem("author_tales", JSON.stringify(talesData))

      // Dispatch event to notify other components
      window.dispatchEvent(new Event("tales-updated"))
      window.dispatchEvent(new Event("author-updated"))

      setStatus("success")
      setMessage(`Успешно импортировано! ${talesData.length} рассказов загружено.`)
      
      if (onImportSuccess) {
        setTimeout(onImportSuccess, 1500)
      }

      // Reset after 3 seconds
      setTimeout(() => setStatus("idle"), 3000)
    } catch (error) {
      setStatus("error")
      setMessage(`Ошибка при импорте: ${error instanceof Error ? error.message : "неизвестная ошибка"}`)
      setTimeout(() => setStatus("idle"), 4000)
    }

    // Reset file input
    e.target.value = ""
  }

  return (
    <div className="fixed top-6 right-6 z-50 w-full max-w-sm">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
          Синхронизировать данные
        </h3>

        <div className="space-y-3">
          <div className="relative">
            <input
              type="file"
              accept=".ts,.tsx,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="data-import"
            />
            <label htmlFor="data-import" className="block">
              <Button asChild variant="default" className="w-full gap-2 cursor-pointer">
                <span>
                  <Upload className="h-4 w-4" />
                  Загрузить файл данных
                </span>
              </Button>
            </label>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
            Загрузите файл updated-store-data.ts с вашего основного сайта
          </p>
        </div>

        {status !== "idle" && (
          <Alert className={`mt-4 ${status === "success" ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-700" : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-700"}`}>
            <div className="flex items-start gap-2">
              {status === "success" ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
              )}
              <AlertDescription
                className={`text-sm ${
                  status === "success"
                    ? "text-green-800 dark:text-green-200"
                    : "text-red-800 dark:text-red-200"
                }`}
              >
                {message}
              </AlertDescription>
            </div>
          </Alert>
        )}
      </div>
    </div>
  )
}
