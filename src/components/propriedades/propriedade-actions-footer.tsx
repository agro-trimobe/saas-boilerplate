'use client'

import { Button } from '@/components/ui/button'
import { Save, X } from 'lucide-react'
import Link from 'next/link'

interface PropriedadeActionsFooterProps {
  isSubmitting: boolean
  returnUrl: string
  actionLabel: string
}

export function PropriedadeActionsFooter({
  isSubmitting,
  returnUrl,
  actionLabel
}: PropriedadeActionsFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-background/80 backdrop-blur-sm border-t z-10">
      <div className="container mx-auto flex items-center justify-end gap-3 max-w-7xl">
        <Button
          type="button"
          variant="outline"
          size="sm"
          asChild
          className="gap-1.5"
        >
          <Link href={returnUrl}>
            <X className="h-4 w-4" />
            Cancelar
          </Link>
        </Button>
        
        <Button 
          type="submit" 
          size="sm"
          disabled={isSubmitting}
          className="gap-1.5 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
              Processando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {actionLabel}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
