# Novo Fluxo de Inscrição Pública com Pagamento Após Aprovação

## Visão Geral

O sistema de inscrição pública foi modificado para que o usuário selecione o plano durante o cadastro, mas só pague depois que a inscrição for aprovada pelo administrador. Após a aprovação, o pagamento aparece automaticamente no painel financeiro e no portal do cooperado.

## Fluxo Atualizado

### 1. **Etapa 1: Dados Pessoais**
- Nome completo
- Data de nascimento
- Estado civil
- Informações do cônjuge (se casado)
- Informações dos filhos
- Nacionalidade
- Número do BI e validade

### 2. **Etapa 2: Contacto e Morada**
- Telefone
- Email
- Província
- Município
- Comuna
- Endereço completo

### 3. **Etapa 3: Dados Profissionais**
- Profissão
- Sector profissional (público/privado)
- Entidade (se aplicável)
- Rendimento mensal

### 4. **Etapa 4: Documentos (Anexos)**
- Fotografia 4x3
- BI frente e verso
- Declaração de serviço
- Comprovativo NIF
- BI do cônjuge (se casado)
- Documento agregado familiar (se tem filhos)

### 5. **Etapa 5: Seleção do Plano**
- Escolha do plano de assinatura
- Visualização da taxa de inscrição
- Observações adicionais
- **Inscrição enviada com status "pendente"**

### 6. **Etapa 6: Aprovação pelo Admin (Nova)**
- Administrador analisa a inscrição
- Aprova ou rejeita a candidatura
- Se aprovada: cria cooperado e gera pagamento pendente

### 7. **Etapa 7: Pagamento (Após Aprovação)**
- Pagamento aparece no painel financeiro
- Pagamento aparece no portal do cooperado
- Cooperado pode realizar o pagamento

## Componentes Criados/Modificados

### 1. **AprovarInscricao.jsx** (Novo)
- Componente para administradores aprovarem inscrições
- Cria cooperado automaticamente após aprovação
- Gera pagamento pendente na tabela Pagamento
- Interface para aprovar/rejeitar candidaturas

### 2. **CadastroPublico.jsx** (Modificado)
- Removida etapa de pagamento imediato
- Inscrição criada com status "pendente"
- Campo `taxa_inscricao_pendente` adicionado
- Função para criar pagamento após aprovação

### 3. **FormInscricaoPublica.jsx** (Modificado)
- Etapa 5 focada apenas na seleção do plano
- Mensagem atualizada sobre pagamento após aprovação
- Botão "Enviar Inscrição" em vez de "Criar Inscrição"

## Estados do Sistema

### Estados da Inscrição:
- `pendente` - Inscrição enviada, aguardando aprovação
- `aprovado` - Inscrição aprovada, cooperado criado
- `rejeitado` - Inscrição rejeitada
- `pago` - Pagamento realizado (após aprovação)

### Estados do Pagamento:
- `pendente` - Pagamento gerado após aprovação
- `confirmado` - Pagamento aprovado pelo administrador
- `rejeitado` - Pagamento rejeitado

## Fluxo de Dados

1. **Criação da Inscrição**:
   - Usuário preenche formulário
   - Sistema cria inscrição com status "pendente"
   - Taxa de inscrição salva na inscrição
   - Email de confirmação enviado

2. **Aprovação pelo Admin**:
   - Administrador analisa inscrição
   - Se aprovada: cria cooperado automaticamente
   - Gera pagamento pendente na tabela Pagamento
   - Atualiza status da inscrição para "aprovado"

3. **Pagamento pelo Cooperado**:
   - Pagamento aparece no portal do cooperado
   - Cooperado pode realizar pagamento
   - Sistema atualiza status do pagamento

## Benefícios do Novo Fluxo

### Para o Usuário:
- Processo mais simples e direto
- Seleção do plano antes da aprovação
- Pagamento só após confirmação de aceitação
- Menor risco de pagar sem ser aprovado

### Para a Administração:
- Controle total sobre aprovações
- Criação automática de cooperados
- Geração automática de pagamentos
- Melhor gestão do fluxo

### Para o Sistema:
- Separação clara entre inscrição e pagamento
- Integração automática com sistema de cooperados
- Rastreabilidade completa
- Menos complexidade no cadastro público

## Estrutura de Dados

### Tabela InscricaoPublica:
```javascript
{
  id: "string",
  nome_completo: "string",
  email: "string",
  // ... outros campos da inscrição
  assinatura_plano_id: "string",
  status: "pendente|aprovado|rejeitado|pago",
  taxa_inscricao_pendente: "number",
  cooperado_id: "string", // Após aprovação
  data_aprovacao: "date", // Após aprovação
  data_rejeicao: "date"   // Se rejeitada
}
```

### Tabela Pagamento (Após Aprovação):
```javascript
{
  id: "string",
  cooperado_id: "string", // ID do cooperado criado
  valor: "number",
  tipo: "taxa_inscricao",
  data_vencimento: "date",
  status: "pendente|confirmado|rejeitado",
  inscricao_id: "string", // Referência à inscrição
  descricao: "string",
  observacoes: "string"
}
```

## Configuração

O sistema agora requer:

1. **Campos adicionais** na tabela InscricaoPublica
2. **Permissões** para criação de cooperados
3. **Integração** com sistema de pagamentos
4. **Componente de aprovação** para administradores

## Próximos Passos

1. **Testar** o fluxo completo de aprovação
2. **Validar** criação automática de cooperados
3. **Verificar** geração de pagamentos pendentes
4. **Implementar** notificações para cooperados
5. **Configurar** relatórios de aprovações
