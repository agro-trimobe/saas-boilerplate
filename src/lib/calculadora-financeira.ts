/**
 * Módulo de calculadora financeira para operações de crédito rural
 */

/**
 * Calcula o valor da parcela de um financiamento
 * @param valorFinanciamento Valor total do financiamento
 * @param taxaJurosAnual Taxa de juros anual (em percentual)
 * @param prazoMeses Prazo total do financiamento em meses
 * @param carenciaMeses Período de carência em meses (opcional)
 * @returns Objeto com informações do cálculo
 */
export function calcularParcela(
  valorFinanciamento: number,
  taxaJurosAnual: number,
  prazoMeses: number,
  carenciaMeses: number = 0
) {
  // Converter taxa anual para mensal
  const taxaMensal = Math.pow(1 + taxaJurosAnual / 100, 1 / 12) - 1;
  
  // Número de parcelas após carência
  const numeroParcelas = prazoMeses - carenciaMeses;
  
  // Cálculo da parcela usando a fórmula de amortização
  // P = VP * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
  // Onde: P = parcela, VP = valor presente, r = taxa, n = número de parcelas
  const parcela = valorFinanciamento * 
    (taxaMensal * Math.pow(1 + taxaMensal, numeroParcelas)) / 
    (Math.pow(1 + taxaMensal, numeroParcelas) - 1);
  
  return {
    parcela: Math.round(parcela * 100) / 100, // Arredonda para 2 casas decimais
    valorFinanciamento,
    taxaJurosAnual,
    taxaMensal: taxaMensal * 100, // Converte para percentual
    prazoMeses,
    carenciaMeses,
    numeroParcelas
  };
}

/**
 * Calcula o valor total a ser pago em um financiamento
 * @param valorParcela Valor da parcela
 * @param numeroParcelas Número de parcelas
 * @returns Valor total do financiamento
 */
export function calcularValorTotal(valorParcela: number, numeroParcelas: number) {
  return valorParcela * numeroParcelas;
}

/**
 * Calcula a taxa de juros efetiva de um financiamento
 * @param valorFinanciamento Valor total do financiamento
 * @param valorParcela Valor da parcela
 * @param prazoMeses Prazo total do financiamento em meses
 * @returns Taxa de juros efetiva mensal
 */
export function calcularTaxaEfetiva(
  valorFinanciamento: number,
  valorParcela: number,
  prazoMeses: number
) {
  // Implementação básica - para cálculos mais precisos seria necessário um algoritmo iterativo
  const valorTotal = valorParcela * prazoMeses;
  const jurosTotal = valorTotal - valorFinanciamento;
  
  // Taxa média mensal simples
  return (jurosTotal / valorFinanciamento) / prazoMeses * 100;
}

// Exporta todas as funções como um objeto
export const calculadoraFinanceira = {
  calcularParcela,
  calcularValorTotal,
  calcularTaxaEfetiva
};
