import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  UserPlus,
  AlertTriangle,
  FileText
} from "lucide-react";
import { InscricaoPublica, Pagamento, Cooperado, AssinaturaPlano } from "@/api/entities";
import { toast } from "sonner";

export default function AprovarInscricao({ inscricao, planos, onAprovar, onRejeitar }) {
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [action, setAction] = useState(null); // 'aprovar' ou 'rejeitar'

  const planoSelecionado = planos?.find(p => p.id === inscricao.assinatura_plano_id);

  const handleAprovar = async () => {
    setAction('aprovar');
    setShowConfirmDialog(true);
  };

  const handleRejeitar = async () => {
    setAction('rejeitar');
    setShowConfirmDialog(true);
  };

  const confirmarAcao = async () => {
    setLoading(true);
    try {
      if (action === 'aprovar') {
        await aprovarInscricao();
      } else {
        await rejeitarInscricao();
      }
    } catch (error) {
      console.error("Erro ao processar ação:", error);
      toast.error("Erro ao processar ação. Tente novamente.");
    } finally {
      setLoading(false);
      setShowConfirmDialog(false);
    }
  };

  const aprovarInscricao = async () => {
    try {
      // 1. Criar cooperado
      const cooperado = await Cooperado.create({
        nome_completo: inscricao.nome_completo,
        email: inscricao.email,
        telefone: inscricao.telefone,
        bi: inscricao.bi,
        data_nascimento: inscricao.data_nascimento,
        profissao: inscricao.profissao,
        renda_mensal: inscricao.renda_mensal,
        provincia: inscricao.provincia,
        municipio: inscricao.municipio,
        endereco_completo: inscricao.endereco_completo,
        assinatura_plano_id: inscricao.assinatura_plano_id,
        status: "ativo",
        data_inscricao: new Date().toISOString().split('T')[0],
        numero_associado: `CS${Date.now().toString().slice(-6)}`, // Gerar número único
        estado_civil: inscricao.estado_civil || "solteiro", // Campo obrigatório
        sector_profissional: inscricao.sector_profissional || "privado", // Campo obrigatório
        nacionalidade: inscricao.nacionalidade || "Angolana" // Campo obrigatório
      });

      console.log("Cooperado criado:", cooperado);

      // 2. Criar pagamento pendente
      const pagamento = await Pagamento.create({
        cooperado_id: cooperado.numero_associado,
        valor: planoSelecionado.taxa_inscricao,
        tipo: "taxa_inscricao",
        data_vencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        status: "pendente",
        inscricao_id: inscricao.id,
        descricao: `Taxa de inscrição - ${inscricao.nome_completo}`,
        observacoes: `Pagamento pendente da inscrição ${inscricao.id}`
      });

      console.log("Pagamento pendente criado:", pagamento);

      // 3. Atualizar status da inscrição
      await InscricaoPublica.update(inscricao.id, {
        status: "aprovado",
        cooperado_id: cooperado.numero_associado,
        data_aprovacao: new Date().toISOString().split('T')[0]
      });

      toast.success(`Inscrição aprovada! Cooperado criado com número ${cooperado.numero_associado}`);
      
      if (onAprovar) {
        onAprovar(inscricao.id, cooperado);
      }

    } catch (error) {
      console.error("Erro ao aprovar inscrição:", error);
      throw error;
    }
  };

  const rejeitarInscricao = async () => {
    try {
      await InscricaoPublica.update(inscricao.id, {
        status: "rejeitado",
        data_rejeicao: new Date().toISOString().split('T')[0]
      });

      toast.success("Inscrição rejeitada com sucesso!");
      
      if (onRejeitar) {
        onRejeitar(inscricao.id);
      }

    } catch (error) {
      console.error("Erro ao rejeitar inscrição:", error);
      throw error;
    }
  };

  return (
    <>
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Aprovar Inscrição
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Resumo da Inscrição */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Candidato</p>
                <p className="text-lg font-semibold text-blue-800">{inscricao.nome_completo}</p>
                <p className="text-sm text-blue-600">{inscricao.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Plano Selecionado</p>
                <p className="text-lg font-semibold text-blue-800">{planoSelecionado?.nome_plano}</p>
                <p className="text-sm text-blue-600">{planoSelecionado?.valor_mensal?.toLocaleString()} Kz/mês</p>
              </div>
            </div>
          </div>

          {/* Taxa de Inscrição */}
          {planoSelecionado && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-green-700">Taxa de Inscrição</p>
                  <p className="text-2xl font-bold text-green-800">
                    {planoSelecionado.taxa_inscricao?.toLocaleString()} Kz
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-sm text-green-600 mt-2">
                Este valor será gerado como pagamento pendente após aprovação
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={handleAprovar}
              className="flex-1 bg-green-600 hover:bg-green-700 flex items-center gap-2"
              disabled={loading}
            >
              <CheckCircle className="w-4 h-4" />
              Aprovar e Criar Cooperado
            </Button>
            
            <Button
              onClick={handleRejeitar}
              variant="outline"
              className="flex-1 border-red-300 text-red-700 hover:bg-red-50 flex items-center gap-2"
              disabled={loading}
            >
              <XCircle className="w-4 h-4" />
              Rejeitar
            </Button>
          </div>

          {/* Informações Adicionais */}
          <div className="text-sm text-slate-600 space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>Aprovar criará um novo cooperado e gerará pagamento pendente</span>
            </div>
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-500" />
              <span>O cooperado receberá acesso ao portal após aprovação</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {action === 'aprovar' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Confirmar Aprovação
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-600" />
                  Confirmar Rejeição
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {action === 'aprovar' 
                ? `Tem certeza que deseja aprovar a inscrição de ${inscricao.nome_completo}? Isso criará um novo cooperado e gerará um pagamento pendente.`
                : `Tem certeza que deseja rejeitar a inscrição de ${inscricao.nome_completo}?`
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmarAcao}
              className={action === 'aprovar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              disabled={loading}
            >
              {loading ? "Processando..." : action === 'aprovar' ? "Aprovar" : "Rejeitar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
