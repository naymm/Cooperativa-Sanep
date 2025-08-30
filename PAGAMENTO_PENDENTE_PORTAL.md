# Pagamento Pendente no Portal do Cooperado

## Visão Geral

Após a aprovação de uma inscrição pública, o sistema automaticamente gera um pagamento pendente que fica disponível no portal do cooperado para que ele possa realizar o pagamento diretamente.

## Fluxo Completo

### 1. **Inscrição Pública**
- Usuário preenche formulário de inscrição
- Seleciona plano de assinatura
- Inscrição criada com status "pendente"

### 2. **Aprovação pelo Admin**
- Administrador analisa inscrição na página de gestão
- Clica em "Aprovar" para abrir modal de aprovação
- Sistema cria cooperado automaticamente
- **Sistema gera pagamento pendente automaticamente**
- Status da inscrição muda para "aprovado"

### 3. **Pagamento no Portal do Cooperado**
- Cooperado recebe credenciais de acesso por email
- Acessa o portal do cooperado
- Vê pagamento pendente na seção financeira
- Realiza pagamento diretamente no portal

## Componentes Modificados

### **1. Inscricoes.jsx (Página Principal)**
- Integração com componente `AprovarInscricao`
- Função `handleAprovar` que cria pagamento pendente
- Modal de aprovação com interface completa
- Indicador visual de pagamento pendente

### **2. AprovarInscricao.jsx (Componente de Aprovação)**
- Interface para aprovar/rejeitar inscrições
- Criação automática de cooperado
- Geração automática de pagamento pendente
- Validações e tratamento de erros

### **3. InscricaoCard.jsx (Card de Inscrição)**
- Indicador visual de pagamento pendente
- Badge "Pagamento Pendente" para inscrições aprovadas
- Ícone de pagamento para melhor identificação

## Estrutura do Pagamento Pendente

### **Campos do Pagamento:**
```javascript
{
  id: "string",
  cooperado_id: "string", // ID do cooperado criado
  valor: "number", // Taxa de inscrição do plano
  tipo: "taxa_inscricao",
  data_vencimento: "date", // 30 dias após aprovação
  status: "pendente",
  inscricao_id: "string", // Referência à inscrição
  descricao: "Taxa de inscrição - [Nome do Cooperado]",
  observacoes: "Pagamento pendente da inscrição [ID]. O cooperado pode realizar o pagamento diretamente no portal."
}
```

### **Campos da Inscrição Atualizada:**
```javascript
{
  // ... campos existentes
  status: "aprovado",
  cooperado_id: "string", // ID do cooperado criado
  data_aprovacao: "date"
}
```

## Funcionalidades Implementadas

### **1. Geração Automática de Pagamento**
- Pagamento criado automaticamente após aprovação
- Valor baseado na taxa de inscrição do plano
- Vencimento de 30 dias após aprovação
- Status inicial "pendente"

### **2. Interface de Aprovação**
- Modal dedicado para aprovação/rejeição
- Visualização do plano selecionado
- Confirmação antes de aprovar
- Feedback visual do processo

### **3. Indicadores Visuais**
- Badge "Pagamento Pendente" em inscrições aprovadas
- Ícone de pagamento para identificação rápida
- Status atualizado em tempo real

### **4. Notificações Automáticas**
- Email de aprovação enviado ao cooperado
- Email com credenciais de acesso
- Email de rejeição (se aplicável)

## Benefícios do Sistema

### **Para o Cooperado:**
- Pagamento disponível imediatamente após aprovação
- Acesso direto ao portal para realizar pagamento
- Processo simplificado e transparente
- Notificações automáticas por email

### **Para a Administração:**
- Controle total sobre aprovações
- Geração automática de pagamentos
- Rastreabilidade completa
- Interface intuitiva para gestão

### **Para o Sistema:**
- Fluxo automatizado e consistente
- Integração entre inscrições e pagamentos
- Menos trabalho manual
- Melhor experiência do usuário

## Configuração Necessária

### **1. Campos na Tabela InscricaoPublica:**
```sql
ALTER TABLE InscricaoPublica ADD COLUMN cooperado_id TEXT;
ALTER TABLE InscricaoPublica ADD COLUMN data_aprovacao DATE;
ALTER TABLE InscricaoPublica ADD COLUMN data_rejeicao DATE;
```

### **2. Permissões:**
- Criação de cooperados
- Criação de pagamentos
- Atualização de inscrições
- Envio de emails

### **3. Integração:**
- Sistema de pagamentos
- Portal do cooperado
- Sistema de notificações

## Próximos Passos

### **1. Teste do Fluxo Completo**
- Testar inscrição pública
- Testar aprovação pelo admin
- Verificar geração de pagamento
- Testar acesso ao portal do cooperado

### **2. Validações**
- Verificar se pagamento aparece no portal
- Confirmar valores corretos
- Validar datas de vencimento
- Testar notificações por email

### **3. Melhorias Futuras**
- Relatórios de pagamentos pendentes
- Notificações de vencimento
- Integração com gateway de pagamento
- Dashboard de pagamentos

## Exemplo de Uso

### **1. Admin Aprova Inscrição:**
1. Acessa página de inscrições
2. Clica em "Aprovar" na inscrição pendente
3. Modal de aprovação abre
4. Confirma aprovação
5. Sistema cria cooperado e pagamento pendente
6. Credenciais são mostradas para cópia

### **2. Cooperado Realiza Pagamento:**
1. Recebe email com credenciais
2. Acessa portal do cooperado
3. Vê pagamento pendente na seção financeira
4. Clica em "Pagar"
5. Completa processo de pagamento
6. Status muda para "confirmado"

## Troubleshooting

### **Problemas Comuns:**

1. **Pagamento não aparece no portal:**
   - Verificar se cooperado_id foi gerado
   - Confirmar se pagamento foi criado na tabela
   - Verificar permissões do cooperado

2. **Erro ao criar pagamento:**
   - Verificar se plano existe
   - Confirmar valores da taxa de inscrição
   - Verificar permissões de criação

3. **Email não enviado:**
   - Verificar configuração SMTP
   - Confirmar template de email
   - Verificar fila de emails

### **Logs Importantes:**
- Criação de cooperado
- Geração de pagamento pendente
- Envio de emails
- Atualização de status
