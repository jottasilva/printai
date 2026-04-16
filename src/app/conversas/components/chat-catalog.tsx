import React from 'react';
import { Button } from '@/components/ui/button';

export function ChatCatalog() {
  return (
    <section className="w-80 bg-surface-container-low border-l border-surface-container-high flex flex-col overflow-y-auto no-scrollbar">
      {/* Section: Catalog Quick Actions */}
      <div className="p-5 border-b border-surface-container-high">
        <div className="flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-primary text-xl">inventory_2</span>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Catálogo de Produtos</h3>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {/* Card: Cartão de Visita */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between group hover:shadow-sm transition-all border border-transparent hover:border-primary-fixed">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-container rounded flex items-center justify-center overflow-hidden">
                <img 
                  className="object-cover h-full w-full" 
                  alt="Cartão de Visita" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCTHiFmiVHBeNE5uDiYPKvwruLKrd8UNUJAAAKQCcFE5x8Aen_THwYReaXF3UAY2hvyjL2RBjuodZVk_Oy2CH7rdOPbMeztkZ_cq3NzIQCMukLIQMArpJcCM_9k9UwvIw9ayFaiqmqqJ56uu4q-Df-PoxjNNikZNjfXmugwh-yDG36pPq1XbRsxaJ-lG2AZOO2KWORPyx21EDyD_UodeIdvmnpAojtkgrO3mfIzcxKjtVmHbQvTQt34mqIJo0HYZ_jTFv8idslvhxZU" 
                />
              </div>
              <span className="text-xs font-bold text-on-surface leading-tight">
                Cartão de Visita<br/>
                <span className="font-normal text-on-surface-variant">Verniz Localizado</span>
              </span>
            </div>
            <button className="p-1.5 text-primary hover:bg-primary-container rounded transition-colors">
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            </button>
          </div>

          {/* Card: Banner Roll-Up */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded-lg flex items-center justify-between group hover:shadow-sm transition-all border border-transparent hover:border-primary-fixed">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary-container rounded flex items-center justify-center overflow-hidden">
                <img 
                  className="object-cover h-full w-full" 
                  alt="Banner Roll-Up" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPve_YbXkoAuhL1I1hqAMU015fDpGxEik6opkXz6zCKAgdoEOCHLfjkPGhn6yOxOp29B4X-euM5ZYdP-f54aEYBK4SkALjjtEiWDXwEz0gbK0EOtYEvEOC4Cij1c5BlFnNC61XD0G1m3VIxnZCIqy6nQdTYBOiqCeA9jyuJz9YQIkFFbKg0mIpJHdo_0TECHzHwlUl-cSc5BKKEf3MmEd4TDmXAiEgloAZqmLfsphICDUgj1kXat_dc6SuCFSjkCgfh3Tk5nIALqXe" 
                />
              </div>
              <span className="text-xs font-bold text-on-surface leading-tight">
                Banner Roll-Up<br/>
                <span className="font-normal text-on-surface-variant">Lona 440g</span>
              </span>
            </div>
            <button className="p-1.5 text-primary hover:bg-primary-container rounded transition-colors">
              <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section: Shopping Cart */}
      <div className="p-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-xl">shopping_cart_checkout</span>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface">Carrinho do Cliente</h3>
          </div>
          <span className="text-[10px] font-bold text-on-surface-variant">2 Itens</span>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-xs font-bold text-on-surface">500x Cartão Visita Verniz</p>
              <p className="text-[10px] text-on-surface-variant">Papel Couché 300g • 4x4</p>
            </div>
            <span className="text-xs font-bold text-on-surface">R$ 145,00</span>
          </div>
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1">
              <p className="text-xs font-bold text-on-surface">1x Banner Roll-Up</p>
              <p className="text-[10px] text-on-surface-variant">Lona 440g • 80x200cm</p>
            </div>
            <span className="text-xs font-bold text-on-surface">R$ 120,00</span>
          </div>

          <div className="pt-3 mt-3 border-t border-surface-container-high flex justify-between items-center">
            <span className="text-xs font-black text-on-surface uppercase tracking-tighter">Total Estimado</span>
            <span className="text-lg font-black text-primary tracking-tighter">R$ 265,00</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full py-6 bg-primary text-on-primary rounded-lg text-sm font-bold shadow-md hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">assignment_turned_in</span>
            Formalizar Pedido
          </Button>
          <Button variant="ghost" className="w-full py-6 bg-surface-container-highest text-on-surface rounded-lg text-[11px] font-bold hover:bg-surface-container-high transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
            Enviar PDF
          </Button>
          <button className="w-full py-2 text-primary text-[11px] font-bold uppercase tracking-widest hover:underline transition-all mt-2">
            Visualizar Ficha do Cliente
          </button>
        </div>
      </div>

      {/* Bottom Sticky Branding/Status */}
      <div className="mt-auto p-4 bg-primary-container/20 border-t border-primary-container/30">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Sincronizado com Produção</span>
        </div>
      </div>
    </section>
  );
}
