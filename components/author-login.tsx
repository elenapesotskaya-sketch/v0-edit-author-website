"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LogIn } from "lucide-react"

interface AuthorLoginProps {
  onLogin: () => void
}

export function AuthorLogin({ onLogin }: AuthorLoginProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = () => {
    if (password === "1814") {
      setError("")
      setPassword("")
      setIsOpen(false)
      onLogin()
    } else {
      setError("Неверный пароль")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      handleLogin()
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setIsOpen(true)}
      >
        <LogIn className="h-4 w-4" />
        Вход для автора
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вход для автора</DialogTitle>
            <DialogDescription>
              Введите пароль для доступа к редактированию
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              onKeyPress={handleKeyPress}
              autoFocus
              className={error ? "border-red-500" : ""}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              onClick={handleLogin}
              className="w-full"
            >
              Войти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
