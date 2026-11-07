import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  useEffect(() => {
    document.title = "Termos de Uso - Smaller";
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8">
      <div className="space-y-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para o início</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Termos de Uso
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Última atualização: Novembro de 2026
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            1. Aceitação dos Termos
          </h2>
          <p>
            Ao acessar ou utilizar a plataforma <strong>Smaller</strong>, você concorda expressamente em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar com algum destes termos, está proibido de usar este serviço.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            2. Uso Proibido e Política Anti-Abuso
          </h2>
          <p>
            O Smaller adota tolerância zero para abusos. É estritamente proibido encurtar links que apontem para:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>Sites de phishing, roubo de credenciais ou engenharia social;</li>
            <li>Distribuição de malware, vírus, cavalos de troia ou softwares nocivos;</li>
            <li>Conteúdo que viole direitos autorais ou propriedade intelectual;</li>
            <li>Spam, correntes ou mensagens em massa não solicitadas;</li>
            <li>Qualquer atividade ilegal, fraudulenta ou que infrinja a legislação brasileira.</li>
          </ul>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Links identificados como maliciosos são sumariamente revogados sem aviso prévio e os endereços de origem são bloqueados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            3. Limitação de Responsabilidade
          </h2>
          <p>
            O Smaller opera unicamente como intermediário técnico de redirecionamento. Não somos responsáveis pelo conteúdo de terceiros hospedado nas URLs originais de destino. O usuário assume total responsabilidade pelo conteúdo dos links que cria e compartilha.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            4. Disponibilidade e Modificações
          </h2>
          <p>
            Reservamo-nos o direito de alterar, suspender ou descontinuar qualquer recurso do serviço a qualquer momento, visando à segurança e estabilidade da infraestrutura.
          </p>
        </section>
      </div>
    </div>
  );
}

