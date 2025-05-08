/**
 * Utilitários para formatação de dados
 */

/**
 * Formata um valor numérico como moeda brasileira (R$)
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata um valor numérico como moeda (versão genérica)
 * Mantém o padrão brasileiro por default, mas pode ser configurado
 */
export function formatCurrency(valor: number, locale: string = 'pt-BR', currency: string = 'BRL'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(valor);
}

/**
 * Formata um valor numérico com separadores de milhares
 * @param valor Valor a ser formatado
 * @param casasDecimais Número de casas decimais (padrão: 2)
 */
export function formatarValor(valor: number, casasDecimais: number = 2): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: casasDecimais,
    maximumFractionDigits: casasDecimais
  }).format(valor);
}

/**
 * Formata uma data ISO para o formato brasileiro (DD/MM/YYYY)
 */
export function formatarData(dataISO?: string | null): string {
  if (!dataISO) return 'N/A';
  
  // Verificar se a string contém "undefined"
  if (typeof dataISO === 'string' && dataISO.includes('undefined')) {
    console.error('Data com formato inválido (contém undefined):', dataISO);
    return 'Data inválida';
  }
  
  try {
    // Verificar se a data é válida antes de tentar formatá-la
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) {
      console.error('Data inválida:', dataISO);
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(data);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

/**
 * Formata uma data ISO para o formato brasileiro com hora (DD/MM/YYYY HH:MM)
 */
export function formatarDataHora(dataISO?: string | null): string {
  if (!dataISO) return 'N/A';
  
  // Verificar se a string contém "undefined"
  if (typeof dataISO === 'string' && dataISO.includes('undefined')) {
    console.error('Data com formato inválido (contém undefined):', dataISO);
    return 'Data inválida';
  }
  
  try {
    // Verificar se a data é válida antes de tentar formatá-la
    const data = new Date(dataISO);
    if (isNaN(data.getTime())) {
      console.error('Data inválida:', dataISO);
      return 'Data inválida';
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(data);
  } catch (error) {
    console.error('Erro ao formatar data e hora:', error);
    return 'Data inválida';
  }
}

/**
 * Formata o tamanho de um arquivo para exibição amigável (KB, MB, etc)
 */
export function formatarTamanho(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formata o tamanho de um arquivo para exibição amigável (KB, MB, etc)
 * @deprecated Use formatarTamanho em vez disso
 */
export function formatarTamanhoArquivo(bytes: number): string {
  return formatarTamanho(bytes);
}

/**
 * Formata um CPF ou CNPJ para exibição com pontuação
 */
export function formatarCpfCnpj(valor: string): string {
  if (!valor) return '';
  
  // Remove caracteres não numéricos
  const apenasNumeros = valor.replace(/\D/g, '');
  
  if (apenasNumeros.length === 11) {
    // CPF: 000.000.000-00
    return apenasNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (apenasNumeros.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return apenasNumeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return valor;
}

/**
 * Formata um número de telefone para exibição com pontuação
 */
export function formatarTelefone(valor: string): string {
  if (!valor) return '';
  
  // Remover todos os caracteres não numéricos
  const numeros = valor.replace(/\D/g, '');
  
  // Verificar se é um número de telefone válido
  if (numeros.length < 10 || numeros.length > 11) {
    return valor; // Retorna o valor original se não for um formato válido
  }
  
  // Formatar como (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numeros.length === 11) {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 7)}-${numeros.substring(7)}`;
  } else {
    return `(${numeros.substring(0, 2)}) ${numeros.substring(2, 6)}-${numeros.substring(6)}`;
  }
}

/**
 * Formata um endereço completo a partir de componentes individuais
 */
export function formatarEndereco(
  endereco?: string,
  cidade?: string,
  estado?: string,
  cep?: string
): string {
  const partes = [];
  
  if (endereco) partes.push(endereco);
  
  const cidadeEstado = [];
  if (cidade) cidadeEstado.push(cidade);
  if (estado) cidadeEstado.push(estado);
  
  if (cidadeEstado.length > 0) {
    partes.push(cidadeEstado.join(' - '));
  }
  
  if (cep) partes.push(`CEP: ${cep}`);
  
  return partes.length > 0 ? partes.join(', ') : 'Endereço não informado';
}

/**
 * Objeto com cores para diferentes status de entidades
 */
export const coresStatus = {
  projeto: {
    'Em Elaboração': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Em Análise': 'bg-blue-100 text-blue-800 border-blue-200',
    'Aprovado': 'bg-green-100 text-green-800 border-green-200',
    'Contratado': 'bg-purple-100 text-purple-800 border-purple-200',
    'Cancelado': 'bg-red-100 text-red-800 border-red-200',
  },
  
  visita: {
    'Agendada': 'bg-blue-100 text-blue-800 border-blue-200',
    'Realizada': 'bg-green-100 text-green-800 border-green-200',
    'Cancelada': 'bg-red-100 text-red-800 border-red-200',
  },
  
  oportunidade: {
    'Contato Inicial': 'bg-blue-100 text-blue-800 border-blue-200',
    'Proposta Enviada': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Negociação': 'bg-purple-100 text-purple-800 border-purple-200',
    'Ganho': 'bg-green-100 text-green-800 border-green-200',
    'Perdido': 'bg-red-100 text-red-800 border-red-200',
  },
  
  documento: {
    'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Enviado': 'bg-blue-100 text-blue-800 border-blue-200',
    'Aprovado': 'bg-green-100 text-green-800 border-green-200',
    'Rejeitado': 'bg-red-100 text-red-800 border-red-200',
    'Em análise': 'bg-blue-100 text-blue-800 border-blue-200',
  }
};
