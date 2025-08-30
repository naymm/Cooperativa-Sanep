
import React, { useState, useEffect } from "react";
import { InscricaoPublica } from "@/api/entities";
import { AssinaturaPlano } from "@/api/entities";
import { CrmNotificacao } from "@/api/entities";
import EmailService from "../components/comunicacao/EmailService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, FileText, Users, CreditCard } from "lucide-react";
import { toast } from "sonner";

import FormInscricaoPublica from "../components/inscricoes/FormInscricaoPublica";

export default function CadastroPublico() {
  console.log("=== CadastroPublico renderizado ===");
  
  const [inscricaoEnviada, setInscricaoEnviada] = useState(false);
  const [numeroInscricao, setNumeroInscricao] = useState("");
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    console.log("useEffect carregarPlanos executado");
    carregarPlanos();
  }, []);

  const carregarPlanos = async () => {
    console.log("Carregando planos...");
    try {
      const planos = await AssinaturaPlano.list();
      console.log("Planos carregados:", planos);
      setPlanosDisponiveis(Array.isArray(planos) ? planos.filter(p => p.ativo) : []);
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      setPlanosDisponiveis([]);
    }
  };

  const handleSubmitInscricao = async (dadosInscricao) => {
    console.log("=== handleSubmitInscricao chamada ===");
    console.log("isSubmitting:", isSubmitting);
    console.log("inscricaoEnviada:", inscricaoEnviada);
    
    // Prevenir submissões duplas
    if (isSubmitting || inscricaoEnviada) {
      console.log("Submissão bloqueada - já em progresso ou já enviada");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Iniciando submissão...");
    
    try {
      console.log("Submetendo inscrição com dados:", dadosInscricao);

      const dadosCompletos = {
        nome_completo: dadosInscricao.nome_completo || "",
        email: dadosInscricao.email || "",
        telefone: dadosInscricao.telefone || "",
        bi: dadosInscricao.bi || "",
        data_nascimento: dadosInscricao.data_nascimento || "",
        profissao: dadosInscricao.profissao || "",
        renda_mensal: Number(dadosInscricao.renda_mensal) || 0,
        provincia: dadosInscricao.provincia || "",
        municipio: dadosInscricao.municipio || "",
        endereco_completo: dadosInscricao.endereco_completo || "",
        assinatura_plano_id: dadosInscricao.assinatura_plano_id || "",
        status: "pendente"
      };

      console.log("Dados formatados para envio:", dadosCompletos);

      const inscricao = await InscricaoPublica.create(dadosCompletos);
      console.log("Inscrição criada com sucesso:", inscricao);

      if (!inscricao || !inscricao.id) {
        throw new Error("Falha na criação da inscrição - ID não retornado");
      }

      const numeroGerado = `INS${inscricao.id.slice(-6).toUpperCase()}`;
      setNumeroInscricao(numeroGerado);
      
      // Enviar e-mail de confirmação usando o sistema de eventos
      try {
        await EmailService.enviarPorEvento("confirmacao_inscricao", {
          email: dadosCompletos.email,
          nome_completo: dadosCompletos.nome_completo
        }, {
          nome_completo: dadosCompletos.nome_completo,
          email: dadosCompletos.email,
          provincia: dadosCompletos.provincia,
          data_inscricao: new Date().toLocaleDateString('pt-PT')
        });
        console.log("E-mail de confirmação adicionado à fila");
      } catch (emailError) {
        console.warn("Erro ao programar e-mail de confirmação:", emailError);
      }
      
      try {
        await CrmNotificacao.create({
          titulo: "Nova Inscrição Recebida",
          mensagem: `Inscrição de ${dadosCompletos.nome_completo} aguarda análise.`,
          tipo: "inscricao",
          link_destino: "/Inscricoes"
        });
        console.log("Notificação CRM criada");
      } catch (notifError) {
        console.warn("Aviso: Falha ao criar notificação CRM:", notifError);
      }

      setInscricaoEnviada(true);
      toast.success("Inscrição enviada com sucesso!");
      
    } catch (error) {
      console.error("====== ERRO DETALHADO AO ENVIAR INSCRIÇÃO ======");
      console.error("Erro completo:", error);
      console.error("Mensagem:", error.message);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      
      let errorMessage = "Erro ao enviar inscrição";
      if (error.message) {
        errorMessage = error.message;
      }

      toast.error(`${errorMessage}. Por favor, tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inscricaoEnviada) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md text-center shadow-xl">
          <CardHeader className="pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl text-green-800">Inscrição Enviada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-2">Número da sua inscrição:</p>
              <p className="text-xl font-bold text-green-800">{numeroInscricao}</p>
            </div>
            <div className="text-sm text-slate-600 space-y-2">
              <p>✅ A sua inscrição foi recebida com sucesso</p>
              <p>📧 Receberá um e-mail de confirmação em breve</p>
              <p>👥 A nossa equipe analisará a sua candidatura</p>
              <p>📱 Será contactado(a) com o resultado</p>
            </div>
            <div className="pt-4">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                Fazer Nova Inscrição
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <FormInscricaoPublica 
          onSubmit={handleSubmitInscricao}
          planosDisponiveis={planosDisponiveis}
        />
      </div>
    </div>
  );
}
