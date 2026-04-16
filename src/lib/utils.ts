import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Serializa dados recursivamente para remover objetos não-POJO (como Decimal do Prisma)
 * evitando avisos de serialização do Next.js e melhorando performance
 */
export function serializeData<T>(data: T): T {
  if (data === null || data === undefined) return data
  
  // Se for array, processa cada item
  if (Array.isArray(data)) {
    return data.map(item => serializeData(item)) as any
  }

  // Se for Date, retorna o timestamp ou string ISO se preferir POJO absoluto
  if (data instanceof Date) {
    return data.toISOString() as any
  }

  // Se for objeto, processa chaves
  if (typeof data === 'object') {
    // Caso especial: Decimal do Prisma (possui método toNumber)
    if ((data as any).toNumber && typeof (data as any).toNumber === 'function') {
      return (data as any).toNumber()
    }

    const result: any = {}
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeData((data as any)[key])
      }
    }
    return result as T
  }

  return data
}
