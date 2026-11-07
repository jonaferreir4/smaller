export function ProfileBillingTab() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="surface-card p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Plano Free</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            Ativo
          </span>
        </div>
        <div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">R$ 0</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400"> / vitalício</span>
        </div>
        <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
          <li className="flex items-center gap-2">
            <span className="text-zinc-400">✓</span> Até 100 links criados
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-400">✓</span> Slugs customizados até 30 chars
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-400">✓</span> QR Code nativo em PNG
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-400">✓</span> Chaves de API para desenvolvedores
          </li>
        </ul>
      </div>

      <div className="surface-card p-5 rounded-xl border border-zinc-300 dark:border-zinc-700 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Plano Pro</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-semibold">
            SaaS
          </span>
        </div>
        <div>
          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">R$ 29</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400"> / mês</span>
        </div>
        <ul className="space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
          <li className="flex items-center gap-2">
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Links ilimitados
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Métricas completas de cliques
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> QR Codes de alta resolução
          </li>
          <li className="flex items-center gap-2">
            <span className="text-zinc-900 dark:text-zinc-100 font-bold">✓</span> Suporte prioritário via e-mail
          </li>
        </ul>
        <button
          type="button"
          onClick={() => alert("Módulo de checkout será ativado com integração Stripe/MercadoPago.")}
          className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-50 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 font-semibold text-xs transition-colors cursor-pointer shadow-xs"
        >
          Fazer Upgrade
        </button>
      </div>
    </div>
  );
}

