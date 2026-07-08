"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"
import { getAuthorInfo, getTales } from "@/lib/store"

export function DataExportPanel() {
  const [copied, setCopied] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const generateCode = () => {
    const author = getAuthorInfo()
    const tales = getTales()

    return `// Updated with your edits - replace this in lib/store.ts

export const DEFAULT_AUTHOR: AuthorInfo = ${JSON.stringify(author, null, 2)}

export const DEFAULT_TALES: Tale[] = ${JSON.stringify(tales, null, 2)}
`
  }

  const handleCopy = async () => {
    const code = generateCode()
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const code = generateCode()
    const blob = new Blob([code], { type: "text/typescript" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "updated-store-data.ts"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 max-w-md">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Сохранить изменения</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Ваши правки сохранены в браузере. Чтобы они отобразились после публикации:
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Button onClick={handleDownload} variant="default" className="w-full gap-2" size="sm">
            <Download className="h-4 w-4" />
            Скачать обновленный код
          </Button>
          <Button onClick={handleCopy} variant="outline" className="w-full gap-2 bg-transparent" size="sm">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Скопировано!" : "Копировать код"}
          </Button>
          <Button onClick={() => setShowCode(!showCode)} variant="ghost" className="w-full text-xs" size="sm">
            {showCode ? "Скрыть инструкцию" : "Показать инструкцию"}
          </Button>
        </div>

        {showCode && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 ml-4 list-decimal">
              <li>Нажмите "Скачать обновленный код"</li>
              <li>Откройте файл lib/store.ts в редакторе</li>
              <li>Замените DEFAULT_AUTHOR и DEFAULT_TALES скачанным кодом</li>
              <li>Сохраните файл и опубликуйте изменения</li>
              <li>После деплоя все увидят ваши правки!</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
