import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Política de Privacidade (LGPD) - Smaller";
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
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Política de Privacidade
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD)
            </p>
          </div>
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            1. Dados Coletados e Finalidade
          </h2>
          <p>
            O <strong>Smaller</strong> coleta o mínimo de informações necessárias para operar o serviço com segurança e fornecer métricas agregadas aos criadores de links:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li>
              <strong>Para usuários autenticados:</strong> E-mail e hash criptográfico de senha (PBKDF2-SHA256) exclusivamente para autenticação da conta e gerenciamento de cotas.
            </li>
            <li>
              <strong>Em acessos a links encurtados:</strong> Endereço IP e User-Agent do navegador, processados para identificação de dispositivo, sistema operacional e país/cidade de origem, além de detecção de fraudes e rate limiting.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            2. Não Compartilhamento e Não Comercialização
          </h2>
          <p>
            Seus dados pessoais <strong>nunca serão comercializados</strong>, alugados ou compartilhados com terceiros para fins de marketing ou publicidade. As métricas exibidas no painel de analytics são agregadas e anônimas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            3. Armazenamento e Segurança
          </h2>
          <p>
            Utilizamos criptografia de ponta e práticas modernas de segurança da informação, como senhas com salt individual (100.000 iterações PBKDF2), chaves de API com hash SHA-256 e políticas ativas de mitigação de ataques (OWASP Top 10).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            4. Seus Direitos (Art. 18 da LGPD)
          </h2>
          <p>
            Você tem o direito de solicitar a confirmação do tratamento de seus dados, acesso, correção ou a exclusão definitiva de sua conta e dos links associados a ela a qualquer momento através do seu painel de perfil ou canal de suporte.
          </p>
        </section>
      </div>
    </div>
  );
}

