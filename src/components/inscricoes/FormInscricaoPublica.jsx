import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  ArrowRight, 
  UserPlus,
  FileUp,
  CheckCircle
} from "lucide-react";
import { UploadFile } from "@/api/integrations";

const provinciasAngola = [
  "Bengo", "Benguela", "Bié", "Cabinda", "Cuando Cubango", "Cuanza Norte", 
  "Cuanza Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda Norte", 
  "Lunda Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"
];

const entidadesPublicasAngola = [
  "Ministério da Educação", "Ministério da Saúde", "Polícia Nacional", 
  "Forças Armadas Angolanas", "Sonangol", "Endiama", "Outra"
];

const steps = [
  { id: 1, title: "Dados Pessoais" },
  { id: 2, title: "Contacto e Morada" },
  { id: 3, title: "Dados Profissionais" },
  { id: 4, title: "Documentos (Anexos)" },
  { id: 5, title: "Pagamento e Assinatura" },
];

export default function FormInscricaoPublica({ onSubmit, planosDisponiveis }) {
  const [currentStep, setCurrentStep] = useState(1);
  const isNew = true; // Sempre é novo para inscrição pública
  const [formData, setFormData] = useState({
    nome_completo: "",
    data_nascimento: "",
    estado_civil: "",
    nome_conjuge: "",
    tem_filhos: false,
    numero_filhos: 0,
    nacionalidade: "Angolana",
    bi: "",
    validade_documento_bi: "",
    email: "",
    telefone: "",
    provincia: "",
    municipio: "",
    comuna: "",
    endereco_completo: "",
    profissao: "",
    sector_profissional: "",
    entidade_publica: "",
    entidade_privada: "",
    renda_mensal: "",
    documentos_anexados: {
      foto_passe: null,
      bi_frente_verso: null,
      bi_conjuge: null,
      agregado_familiar_doc: null,
      declaracao_servico: null,
      nif_documento: null
    },
    assinatura_plano_id: "",
    taxa_inscricao_selecionada: "",
    observacoes: ""
  });

  const [errors, setErrors] = useState({});
  const [fileUploading, setFileUploading] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (formData.assinatura_plano_id && planosDisponiveis) {
      const planoSelecionado = planosDisponiveis.find(p => p.id === formData.assinatura_plano_id);
      if (planoSelecionado) {
        handleChange("taxa_inscricao_selecionada", planoSelecionado.taxa_inscricao);
      }
    }
  }, [formData.assinatura_plano_id, planosDisponiveis]);

  const validateStep = () => {
    const newErrors = {};
    
    if (currentStep === 1) {
      if (!formData.nome_completo) newErrors.nome_completo = "Nome é obrigatório.";
      if (!formData.data_nascimento) newErrors.data_nascimento = "Data de nascimento é obrigatória.";
      if (!formData.estado_civil) newErrors.estado_civil = "Estado civil é obrigatório.";
      if (formData.estado_civil === "casado" && !formData.nome_conjuge) {
        newErrors.nome_conjuge = "Nome do cônjuge é obrigatório.";
      }
      if (formData.tem_filhos && (!formData.numero_filhos || formData.numero_filhos <= 0)) {
        newErrors.numero_filhos = "Número de filhos inválido.";
      }
      if (!formData.nacionalidade) newErrors.nacionalidade = "Nacionalidade é obrigatória.";
      if (!formData.bi) {
        newErrors.bi = "Nº do BI é obrigatório.";
      }
      if (!formData.validade_documento_bi) newErrors.validade_documento_bi = "Validade do BI é obrigatória.";
    }
    
    if (currentStep === 2) {
      if (!formData.telefone) newErrors.telefone = "Telefone é obrigatório.";
      if (!formData.email) {
        newErrors.email = "E-mail é obrigatório.";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "E-mail inválido.";
      }
      if (!formData.provincia) newErrors.provincia = "Província é obrigatória.";
      if (!formData.municipio) newErrors.municipio = "Município é obrigatório.";
      if (!formData.comuna) newErrors.comuna = "Comuna é obrigatória.";
    }
    
    if (currentStep === 3) {
      if (!formData.profissao) newErrors.profissao = "Profissão é obrigatória.";
      if (!formData.sector_profissional) newErrors.sector_profissional = "Sector profissional é obrigatório.";
      if (formData.sector_profissional === "publico" && !formData.entidade_publica) {
        newErrors.entidade_publica = "Entidade pública é obrigatória.";
      }
      if (formData.sector_profissional === "privado" && !formData.entidade_privada) {
        newErrors.entidade_privada = "Entidade privada é obrigatória.";
      }
      if (!formData.renda_mensal || parseFloat(formData.renda_mensal) <= 0) {
        newErrors.renda_mensal = "Rendimento mensal é obrigatório e deve ser maior que zero.";
      }
    }
    
    // Passo 4 (Documentos) - Sem validação obrigatória para inscrições públicas
    if (currentStep === 4) {
      // Documentos são opcionais para inscrições públicas
      // Não há validação obrigatória aqui
    }
    
    if (currentStep === 5) {
      if (!formData.assinatura_plano_id) newErrors.assinatura_plano_id = "Selecione um pacote de assinatura.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir submissões duplas
    if (isSubmitting) {
      return;
    }
    
    if (!validateStep()) {
      alert("Por favor, corrija os erros antes de submeter.");
      return;
    }
    
    // Para inscrições públicas, os documentos são opcionais
    if (isNew) {
      const allDocsUploadedOrSkipped = Object.values(formData.documentos_anexados).every(doc => doc !== null) || 
                                       confirm("Existem documentos pendentes. Deseja continuar e adicioná-los mais tarde?");
      if (!allDocsUploadedOrSkipped) {
        setCurrentStep(4);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Erro ao submeter:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleFileUpload = async (file, fieldName) => {
    if (!file) return;
    setFileUploading(prev => ({ ...prev, [fieldName]: true }));
    try {
      const response = await UploadFile({ file });
      handleChange("documentos_anexados", {
        ...formData.documentos_anexados,
        [fieldName]: response.file_url
      });
    } catch (error) {
      console.error("Erro no upload:", error);
      setErrors(prev => ({ ...prev, [fieldName]: "Falha no upload."}));
    } finally {
      setFileUploading(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="nome_completo">Nome Completo</Label>
              <Input 
                id="nome_completo" 
                value={formData.nome_completo} 
                onChange={(e) => handleChange("nome_completo", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input 
                id="data_nascimento" 
                type="date" 
                value={formData.data_nascimento} 
                onChange={(e) => handleChange("data_nascimento", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="estado_civil">Estado Civil</Label>
              <Select value={formData.estado_civil} onValueChange={(value) => handleChange("estado_civil", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                  <SelectItem value="casado">Casado(a)</SelectItem>
                  <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                  <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.estado_civil === "casado" && (
              <div>
                <Label htmlFor="nome_conjuge">Nome do Cônjuge</Label>
                <Input 
                  id="nome_conjuge" 
                  value={formData.nome_conjuge} 
                  onChange={(e) => handleChange("nome_conjuge", e.target.value)} 
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="md:col-span-2 grid grid-cols-2 gap-x-6 items-center">
              <div>
                <Label htmlFor="tem_filhos">Tem Filhos?</Label>
                <Select 
                  value={formData.tem_filhos ? "sim" : "nao"} 
                  onValueChange={(value) => handleChange("tem_filhos", value === "sim")}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.tem_filhos && (
                <div>
                  <Label htmlFor="numero_filhos">Número de Filhos</Label>
                  <Input 
                    id="numero_filhos" 
                    type="number" 
                    min="1" 
                    value={formData.numero_filhos} 
                    onChange={(e) => handleChange("numero_filhos", parseInt(e.target.value))} 
                    className="mt-1"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="nacionalidade">Nacionalidade</Label>
              <Input 
                id="nacionalidade" 
                value={formData.nacionalidade} 
                onChange={(e) => handleChange("nacionalidade", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="bi">Nº do Bilhete de Identidade</Label>
              <Input 
                id="bi" 
                value={formData.bi} 
                onChange={(e) => handleChange("bi", e.target.value.toUpperCase())} 
                placeholder="000000000AA000"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="validade_documento_bi">Validade do BI</Label>
              <Input 
                id="validade_documento_bi" 
                type="date" 
                value={formData.validade_documento_bi} 
                onChange={(e) => handleChange("validade_documento_bi", e.target.value)} 
                className="mt-1"
              />
            </div>
          </CardContent>
        );
        
      case 2:
        return (
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input 
                id="telefone" 
                value={formData.telefone} 
                onChange={(e) => handleChange("telefone", e.target.value)} 
                placeholder="+244 000 000 000"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange("email", e.target.value)} 
                placeholder="exemplo@email.com"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="provincia">Província</Label>
              <Select value={formData.provincia} onValueChange={(value) => handleChange("provincia", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {provinciasAngola.map(prov => (
                    <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="municipio">Município</Label>
              <Input 
                id="municipio" 
                value={formData.municipio} 
                onChange={(e) => handleChange("municipio", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="comuna">Comuna</Label>
              <Input 
                id="comuna" 
                value={formData.comuna} 
                onChange={(e) => handleChange("comuna", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="endereco_completo">Endereço Completo</Label>
              <Textarea 
                id="endereco_completo" 
                value={formData.endereco_completo} 
                onChange={(e) => handleChange("endereco_completo", e.target.value)} 
                rows={3}
                className="mt-1"
                placeholder="Endereço completo com rua, número, bairro..."
              />
            </div>
          </CardContent>
        );
        
      case 3:
        return (
          <CardContent className="grid md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <Label htmlFor="profissao">Profissão</Label>
              <Input 
                id="profissao" 
                value={formData.profissao} 
                onChange={(e) => handleChange("profissao", e.target.value)} 
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="sector_profissional">Sector Profissional</Label>
              <Select value={formData.sector_profissional} onValueChange={(value) => handleChange("sector_profissional", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="publico">Público</SelectItem>
                  <SelectItem value="privado">Privado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="renda_mensal">Rendimento Mensal</Label>
              <div className="relative mt-1">
                <Input 
                  id="renda_mensal" 
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.renda_mensal} 
                  onChange={(e) => handleChange("renda_mensal", parseFloat(e.target.value) || "")} 
                  placeholder="Ex: 150000"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">Kz</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {formData.renda_mensal && !isNaN(formData.renda_mensal) ? 
                  `${Number(formData.renda_mensal).toLocaleString()} Kz` : 
                  "Introduza o rendimento mensal em Kwanzas"
                }
              </p>
            </div>
            
            {formData.sector_profissional === "publico" && (
              <div>
                <Label htmlFor="entidade_publica">Entidade Pública</Label>
                <Select value={formData.entidade_publica} onValueChange={(value) => handleChange("entidade_publica", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a entidade..." />
                  </SelectTrigger>
                  <SelectContent>
                    {entidadesPublicasAngola.map(ent => (
                      <SelectItem key={ent} value={ent}>{ent}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {formData.sector_profissional === "privado" && (
              <div>
                <Label htmlFor="entidade_privada">Nome da Entidade Privada</Label>
                <Input 
                  id="entidade_privada" 
                  value={formData.entidade_privada} 
                  onChange={(e) => handleChange("entidade_privada", e.target.value)} 
                  className="mt-1"
                />
              </div>
            )}
          </CardContent>
        );
        
      case 4:
        const docFields = [
          {label: "Fotografia 4x3", field: "foto_passe", required: false},
          {label: "Bilhete de Identidade (Frente e Verso)", field: "bi_frente_verso", required: false},
          {label: "Declaração de Serviço", field: "declaracao_servico", required: false},
          {label: "Comprovativo NIF", field: "nif_documento", required: false},
        ];
        
        if (formData.estado_civil === 'casado') {
          docFields.splice(2, 0, {label: "BI do Cônjuge (Frente e Verso)", field: "bi_conjuge", required: false});
        }
        if (formData.tem_filhos) {
          docFields.splice(formData.estado_civil === 'casado' ? 3 : 2, 0, {label: "Documento Agregado Familiar", field: "agregado_familiar_doc", required: false});
        }
        
        return (
          <CardContent className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-slate-700 mb-2">Anexar Documentos</p>
              <p className="text-sm text-slate-600">Anexe os documentos necessários. Todos os campos são opcionais.</p>
            </div>
            
            <div className="grid gap-6">
              {docFields.map(({label, field, required}) => (
                <div key={field} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <Label className="text-base font-medium text-slate-700">
                    {label}
                  </Label>
                  
                  <div className="mt-3">
                    {!formData.documentos_anexados[field] ? (
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                        <div className="space-y-2">
                          <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                          <div>
                            <label htmlFor={field} className="cursor-pointer">
                              <span className="text-blue-600 hover:text-blue-700 font-medium">
                                Clique para anexar
                              </span>
                              <span className="text-slate-500"> ou arraste o arquivo aqui</span>
                            </label>
                            <input
                              id={field}
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={(e) => handleFileUpload(e.target.files[0], field)}
                              className="hidden"
                            />
                          </div>
                          <p className="text-xs text-slate-500">PNG, JPG ou PDF até 5MB</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700 font-medium">Documento anexado</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(formData.documentos_anexados[field], '_blank')}
                          >
                            Ver
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleChange("documentos_anexados", {
                              ...formData.documentos_anexados,
                              [field]: null
                            })}
                          >
                            Remover
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {fileUploading[field] && (
                      <div className="mt-2 flex items-center gap-2 text-blue-600">
                        <FileUp className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">Enviando arquivo...</span>
                      </div>
                    )}
                    
                    {errors[field] && <p className="text-red-500 text-sm mt-1">{errors[field]}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        );
        
      case 5:
        return (
          <CardContent className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-lg font-medium text-slate-700 mb-2">Finalização da Inscrição</p>
              <p className="text-sm text-slate-600">Confirme os dados e selecione o plano</p>
            </div>
            
            <div>
              <Label htmlFor="assinatura_plano_id">Pacote de Assinatura</Label>
              <Select value={formData.assinatura_plano_id} onValueChange={(value) => handleChange("assinatura_plano_id", value)}>
                <SelectTrigger className={`mt-1 ${errors.assinatura_plano_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Selecione o plano..." />
                </SelectTrigger>
                <SelectContent>
                  {planosDisponiveis?.map(plano => (
                    <SelectItem key={plano.id} value={plano.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{plano.nome_plano}</span>
                        <span className="text-sm text-slate-500">
                          {plano.valor_mensal?.toLocaleString()} Kz/mês • Taxa: {plano.taxa_inscricao?.toLocaleString()} Kz
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assinatura_plano_id && (
                <p className="text-red-500 text-sm mt-1">{errors.assinatura_plano_id}</p>
              )}
            </div>
            
            {formData.assinatura_plano_id && formData.taxa_inscricao_selecionada !== "" && (
              <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="text-center">
                  <p className="font-medium text-blue-700 mb-2">Taxa de Inscrição</p>
                  <p className="text-3xl font-bold text-blue-800 mb-2">
                    {Number(formData.taxa_inscricao_selecionada).toLocaleString()} Kz
                  </p>
                  <p className="text-sm text-blue-600">
                    Este valor será gerado como um pagamento pendente após o registo
                  </p>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="observacoes">Observações Adicionais</Label>
              <Textarea 
                id="observacoes" 
                value={formData.observacoes} 
                onChange={(e) => handleChange("observacoes", e.target.value)} 
                rows={4} 
                className="mt-1"
                placeholder="Informações adicionais sobre a inscrição..."
              />
            </div>
          </CardContent>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <img 
            src="https://gruposanep.co.ao/wp-content/uploads/2025/06/logodark-scaled.png" 
            alt="CoopHabitat Logo" 
            className="h-12 sm:h-16 w-auto mx-auto mb-4"
          />
         
          <p className="text-slate-600 text-sm sm:text-base">
            Junte-se à nossa cooperativa de habitação
          </p>
        </div>
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-800">
             
            </h2>
            <span className="text-sm text-slate-500">
              Etapa {currentStep} de {steps.length}
            </span>
          </div>
          
          <Progress value={(currentStep / steps.length) * 100} className="w-full h-2 mb-4" />
          
          <div className="grid grid-cols-5 gap-2">
            {steps.map(step => (
              <div key={step.id} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step.id}
                </div>
                <p className={`text-xs ${
                  currentStep >= step.id ? 'font-semibold text-blue-600' : 'text-slate-500'
                }`}>
                  {step.title}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="text-xl text-center">
              {steps.find(s => s.id === currentStep)?.title}
            </CardTitle>
          </CardHeader>
          {renderStepContent()}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t bg-slate-50 p-6 rounded-lg">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          
          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={handlePrev} 
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> 
                Anterior
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button 
                type="button" 
                onClick={handleNext} 
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                Próximo 
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" /> 
                    Submeter Inscrição
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}