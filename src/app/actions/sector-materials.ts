'use server'

import { prisma } from '@/lib/db';
import { withTenant } from '@/lib/server-utils';
import { revalidatePath } from 'next/cache';

export const addSectorMaterial = withTenant(async (data: { 
  sectorId: string; 
  productId: string; 
  minQuantity: number;
}) => {
  const material = await prisma.sectorMaterial.create({
    data: {
      sectorId: data.sectorId,
      productId: data.productId,
      minQuantity: data.minQuantity
    }
  });

  revalidatePath(`/admin/setores/${data.sectorId}`);
  return material;
});

export const updateSectorMaterial = withTenant(async (id: string, sectorId: string, data: { minQuantity: number }) => {
  const material = await prisma.sectorMaterial.update({
    where: { id },
    data: {
      minQuantity: data.minQuantity
    }
  });

  revalidatePath(`/admin/setores/${sectorId}`);
  return material;
});

export const removeSectorMaterial = withTenant(async (id: string, sectorId: string) => {
  await prisma.sectorMaterial.delete({
    where: { id }
  });

  revalidatePath(`/admin/setores/${sectorId}`);
  return true;
});
