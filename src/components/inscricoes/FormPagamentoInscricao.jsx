import React, { useState } from "react";
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
import { FileUp, CheckCircle, DollarSign, CreditCard } from "lucide-react";
import { UploadFile } from "@/api/integrations";

export default function FormPagamentoInscricao({ 
  inscricao, 
  planoSelecionado, 
  onSubmit, 
  onBack 
}) {
  const [formData, setFormData] = useState({
    metodo_pagamento: "",
    referencia: "",
    comprovante_url: "",
    observacoes: ""
  });
  
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.metodo_pagamento) {
      newErrors.metodo_pagamento = "Método de pagamento é obrigatório";
    }
    if (!formData.referencia) {
      newErrors.referencia = "Referência do pagamento é obrigatória";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const pagamentoData = {
        valor: planoSelecionado.taxa_inscricao,
        data_pagamento: new Date().toISOString().split('T')[0],
        ...formData
      };

      onSubmit(pagamentoData);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const response = await UploadFile({ file });
      handleChange("comprovante_url", response.file_url);
    } catch (error) {
      console.error("Erro no upload:", error);
      setErrors(prev => ({ ...prev, comprovante: "Falha no upload do comprovante"}));
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="text-xl text-center flex items-center justify-center gap-2">
            <DollarSign className="w-6 h-6" />
            Pagamento da Taxa de Inscrição
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Resumo da Inscrição */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-blue-700">Inscrição</p>
                <p className="text-lg font-semibold text-blue-800">{inscricao.nome_completo}</p>
                <p className="text-sm text-blue-600">#{inscricao.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Plano Selecionado</p>
                <p className="text-lg font-semibold text-blue-800">{planoSelecionado.nome_plano}</p>
                <p className="text-sm text-blue-600">{planoSelecionado.valor_mensal?.toLocaleString()} Kz/mês</p>
              </div>
            </div>
          </div>

          {/* Valor a Pagar */}
          <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="text-center">
              <p className="font-medium text-green-700 mb-2">Taxa de Inscrição</p>
              <p className="text-4xl font-bold text-green-800 mb-2">
                {planoSelecionado.taxa_inscricao?.toLocaleString()} Kz
              </p>
              <p className="text-sm text-green-600">
                Este valor deve ser pago para finalizar a inscrição
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="metodo_pagamento">Método de Pagamento *</Label>
              <Select value={formData.metodo_pagamento} onValueChange={(value) => handleChange("metodo_pagamento", value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Como efectuou o pagamento?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="deposito">Depósito Bancário</SelectItem>
                  <SelectItem value="multicaixa">Multicaixa</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro (Presencial)</SelectItem>
                </SelectContent>
              </Select>
              {errors.metodo_pagamento && <p className="text-red-500 text-sm mt-1">{errors.metodo_pagamento}</p>}
            </div>

            <div>
              <Label htmlFor="referencia">Referência/Comprovativo *</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) => handleChange("referencia", e.target.value)}
                className="mt-1"
                placeholder="Número de referência, comprovativo ou recibo"
              />
              {errors.referencia && <p className="text-red-500 text-sm mt-1">{errors.referencia}</p>}
            </div>

            {/* Upload de Comprovante */}
            <div>
              <Label>Comprovante de Pagamento (Opcional)</Label>
              <div className="mt-2">
                {!formData.comprovante_url ? (
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <div className="space-y-2">
                      <FileUp className="w-8 h-8 text-slate-400 mx-auto" />
                      <div>
                        <label htmlFor="comprovante" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-700 font-medium">
                            Clique para anexar comprovante
                          </span>
                          <span className="text-slate-500"> ou arraste o arquivo aqui</span>
                        </label>
                        <input
                          id="comprovante"
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileUpload(e.target.files[0])}
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
                      <span className="text-green-700 font-medium">Comprovante anexado</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(formData.comprovante_url, '_blank')}
                      >
                        Ver
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleChange("comprovante_url", "")}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                )}
                
                {uploading && (
                  <div className="mt-2 flex items-center gap-2 text-blue-600">
                    <FileUp className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Enviando comprovante...</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                placeholder="Informações adicionais sobre o pagamento..."
                rows={3}
                className="mt-1"
              />
            </div>

            <div className="flex justify-between items-center pt-6 border-t">
              <Button type="button" variant="outline" onClick={onBack}>
                Voltar
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Finalizar Inscrição
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
