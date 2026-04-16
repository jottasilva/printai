// src/lib/db.ts
import { PrismaClient } from "@prisma/client";
import { getTenantContext } from "./tenant-context";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const basePrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query"],
  });

// Extensão para Injeção Automática de TenantId
export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const context = getTenantContext();
        
        // Se não houver contexto (ex: scripts de sistema, seed), prossegue normalmente.
        // Em produção, as Server Actions via withTenant garantirão o contexto.
        if (!context) {
          return query(args);
        }

        const { tenantId } = context;

        // Injeta tenantId em filtros de leitura (Read)
        if (['findFirst', 'findMany', 'findUnique', 'count', 'aggregate', 'groupBy'].includes(operation)) {
          (args as any).where = { ...(args as any).where, tenantId };
        }

        // Injeta tenantId em persistência (Write)
        if (['create', 'createMany'].includes(operation)) {
           if (Array.isArray((args as any).data)) {
             (args as any).data = (args as any).data.map((item: any) => ({ ...item, tenantId }));
           } else {
             (args as any).data = { ...(args as any).data, tenantId };
           }
        }

        // Injeta tenantId em updates e deletes para garantir que o usuário só altere o que lhe pertence
        if (['update', 'updateMany', 'upsert', 'delete', 'deleteMany'].includes(operation)) {
          (args as any).where = { ...(args as any).where, tenantId };
        }

        return query(args);
      },
    },
  },
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = basePrisma;

// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
