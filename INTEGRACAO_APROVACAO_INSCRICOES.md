# Integração do Componente de Aprovação de Inscrições

## Visão Geral

Este documento explica como integrar o componente `AprovarInscricao` na página de gestão de inscrições para permitir que administradores aprovem ou rejeitem inscrições públicas.

## Componente Criado

### **AprovarInscricao.jsx**
- Localização: `src/components/inscricoes/AprovarInscricao.jsx`
- Função: Interface para aprovar/rejeitar inscrições
- Funcionalidades: Criação automática de cooperado e pagamento pendente

## Como Integrar na Página de Inscrições

### 1. **Importar o Componente**

```javascript
import AprovarInscricao from "@/components/inscricoes/AprovarInscricao";
```

### 2. **Adicionar Estado para Modal**

```javascript
const [showAprovarModal, setShowAprovarModal] = useState(false);
const [inscricaoSelecionada, setInscricaoSelecionada] = useState(null);
const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
```

### 3. **Função para Abrir Modal de Aprovação**

```javascript
const handleAprovarInscricao = (inscricao) => {
  setInscricaoSelecionada(inscricao);
  setShowAprovarModal(true);
};
```

### 4. **Funções de Callback**

```javascript
const handleAprovar = async (inscricaoId, cooperado) => {
  // Atualizar lista de inscrições
  await carregarInscricoes();
  setShowAprovarModal(false);
  setInscricaoSelecionada(null);
  
  // Notificar sucesso
  toast.success(`Inscrição aprovada! Cooperado ${cooperado.numero_associado} criado.`);
};

const handleRejeitar = async (inscricaoId) => {
  // Atualizar lista de inscrições
  await carregarInscricoes();
  setShowAprovarModal(false);
  setInscricaoSelecionada(null);
  
  // Notificar sucesso
  toast.success("Inscrição rejeitada com sucesso!");
};
```

### 5. **Adicionar Botão na Lista de Inscrições**

```javascript
// No componente de card ou tabela de inscrições
{inscricao.status === "pendente" && (
  <Button
    onClick={() => handleAprovarInscricao(inscricao)}
    size="sm"
    className="bg-green-600 hover:bg-green-700"
  >
    <CheckCircle className="w-4 h-4 mr-1" />
    Aprovar
  </Button>
)}
```

### 6. **Adicionar Modal no JSX**

```javascript
{/* Modal de Aprovação */}
{showAprovarModal && inscricaoSelecionada && (
  <Dialog open={showAprovarModal} onOpenChange={setShowAprovarModal}>
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <AprovarInscricao
        inscricao={inscricaoSelecionada}
        planos={planosDisponiveis}
        onAprovar={handleAprovar}
        onRejeitar={handleRejeitar}
      />
    </DialogContent>
  </Dialog>
)}
```

## Exemplo Completo de Integração

### **Inscricoes.jsx** (Página Principal)

```javascript
import React, { useState, useEffect } from "react";
import { InscricaoPublica, AssinaturaPlano } from "@/api/entities";
import AprovarInscricao from "@/components/inscricoes/AprovarInscricao";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function Inscricoes() {
  const [inscricoes, setInscricoes] = useState([]);
  const [planosDisponiveis, setPlanosDisponiveis] = useState([]);
  const [showAprovarModal, setShowAprovarModal] = useState(false);
  const [inscricaoSelecionada, setInscricaoSelecionada] = useState(null);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [inscricoesData, planosData] = await Promise.all([
        InscricaoPublica.list(),
        AssinaturaPlano.list()
      ]);
      
      setInscricoes(inscricoesData);
      setPlanosDisponiveis(planosData.filter(p => p.ativo));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleAprovarInscricao = (inscricao) => {
    setInscricaoSelecionada(inscricao);
    setShowAprovarModal(true);
  };

  const handleAprovar = async (inscricaoId, cooperado) => {
    await carregarDados();
    setShowAprovarModal(false);
    setInscricaoSelecionada(null);
    toast.success(`Inscrição aprovada! Cooperado ${cooperado.numero_associado} criado.`);
  };

  const handleRejeitar = async (inscricaoId) => {
    await carregarDados();
    setShowAprovarModal(false);
    setInscricaoSelecionada(null);
    toast.success("Inscrição rejeitada com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inscrições Públicas</h1>
      </div>

      {/* Lista de Inscrições */}
      <div className="grid gap-4">
        {inscricoes.map((inscricao) => (
          <div key={inscricao.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{inscricao.nome_completo}</h3>
                <p className="text-sm text-slate-600">{inscricao.email}</p>
                <p className="text-sm text-slate-600">{inscricao.provincia}</p>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={
                  inscricao.status === "pendente" ? "secondary" :
                  inscricao.status === "aprovado" ? "default" :
                  inscricao.status === "rejeitado" ? "destructive" : "outline"
                }>
                  {inscricao.status}
                </Badge>
                
                {inscricao.status === "pendente" && (
                  <Button
                    onClick={() => handleAprovarInscricao(inscricao)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Aprovação */}
      {showAprovarModal && inscricaoSelecionada && (
        <Dialog open={showAprovarModal} onOpenChange={setShowAprovarModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AprovarInscricao
              inscricao={inscricaoSelecionada}
              planos={planosDisponiveis}
              onAprovar={handleAprovar}
              onRejeitar={handleRejeitar}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
```

## Funcionalidades do Componente

### **Aprovação de Inscrição:**
1. Cria cooperado automaticamente
2. Gera pagamento pendente
3. Atualiza status da inscrição
4. Notifica sucesso

### **Rejeição de Inscrição:**
1. Atualiza status para "rejeitado"
2. Registra data de rejeição
3. Notifica sucesso

### **Validações:**
- Verifica se plano existe
- Valida dados obrigatórios
- Trata erros de criação

## Campos Necessários na Tabela InscricaoPublica

```sql
-- Campos existentes
ALTER TABLE InscricaoPublica ADD COLUMN taxa_inscricao_pendente DECIMAL(10,2);
ALTER TABLE InscricaoPublica ADD COLUMN cooperado_id TEXT;
ALTER TABLE InscricaoPublica ADD COLUMN data_aprovacao DATE;
ALTER TABLE InscricaoPublica ADD COLUMN data_rejeicao DATE;
```

## Próximos Passos

1. **Integrar** o componente na página de inscrições
2. **Testar** o fluxo completo de aprovação
3. **Validar** criação de cooperados
4. **Verificar** geração de pagamentos
5. **Implementar** notificações automáticas
