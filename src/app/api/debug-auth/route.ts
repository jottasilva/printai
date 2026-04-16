import { NextResponse } from 'next/server';
import { getTenantId } from '@/lib/server-utils';
import { prisma } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return NextResponse.json({ error: 'Auth Error', details: authError }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ error: 'No User in Session' }, { status: 401 });
    }

    const prismaResult = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, email: true, tenantId: true, role: true }
    });

    const prismaByEmail = await prisma.user.findFirst({
        where: { email: user.email },
        select: { id: true, email: true, tenantId: true, role: true }
      });

    const tenantResult = prismaResult?.tenantId 
      ? await prisma.tenant.findUnique({ where: { id: prismaResult.tenantId } })
      : null;

    return NextResponse.json({
      authUserId: user.id,
      authUserEmail: user.email,
      prismaResult,
      prismaByEmail,
      tenantResult,
      message: 'Auth check complete'
    });
  } catch (err: any) {
    return NextResponse.json({ 
      error: 'Unexpected Failure', 
      message: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}
