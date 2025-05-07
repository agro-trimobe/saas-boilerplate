// Este arquivo foi movido para dentro do componente principal
// Mantido apenas para compatibilidade com o build

// Lista de estados brasileiros para compatibilidade
const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

// Exportando funções vazias para compatibilidade
export const utilsFuncoesEndereco = {
  buscarCoordenadas: async (params: any) => {
    console.warn('Esta função foi movida para o componente principal')
    return null
  },
  toggleAjusteManual: () => {
    console.warn('Esta função foi movida para o componente principal')
    return null
  },
  aplicarCoordenadasManuais: () => {
    console.warn('Esta função foi movida para o componente principal')
    return null
  }
}

export default utilsFuncoesEndereco
