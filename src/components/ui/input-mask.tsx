'use client'

import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface InputMaskProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mask: 'cpf' | 'cnpj' | 'cpfcnpj' | 'telefone' | 'cep'
  icon?: React.ReactNode
}

const InputMask = React.forwardRef<HTMLInputElement, InputMaskProps>(
  ({ className, mask, onChange, value, icon, ...props }, ref) => {
    // Referência interna para o input
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Estado para controlar o valor formatado
    const [inputValue, setInputValue] = React.useState<string>('');
    
    // Atualizar o estado quando o valor externo mudar
    React.useEffect(() => {
      if (typeof value === 'string') {
        setInputValue(formatarValorParaExibicao(value));
      } else {
        setInputValue('');
      }
    }, [value, mask]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      
      // Permitir a edição direta se o usuário estiver apagando caracteres
      if (rawValue.length < inputValue.length) {
        setInputValue(rawValue);
        
        // Chamar o onChange original com o valor atual
        if (onChange) {
          const newEvent = {
            ...e,
            target: {
              ...e.target,
              value: rawValue
            }
          };
          onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
        }
        return;
      }
      
      // Extrair apenas os números
      const numbersOnly = rawValue.replace(/\D/g, '');
      let formattedValue = '';
      
      if (mask === 'cpf') {
        // Formato: 999.999.999-99
        if (numbersOnly.length <= 3) {
          formattedValue = numbersOnly;
        } else if (numbersOnly.length <= 6) {
          formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3)}`;
        } else if (numbersOnly.length <= 9) {
          formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6)}`;
        } else {
          formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6, 9)}-${numbersOnly.substring(9, 11)}`;
        }
      } else if (mask === 'cnpj') {
        // Formato: 99.999.999/0001-99
        if (numbersOnly.length <= 2) {
          formattedValue = numbersOnly;
        } else if (numbersOnly.length <= 5) {
          formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2)}`;
        } else if (numbersOnly.length <= 8) {
          formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5)}`;
        } else if (numbersOnly.length <= 12) {
          formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8)}`;
        } else {
          formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8, 12)}-${numbersOnly.substring(12, 14)}`;
        }
      } else if (mask === 'cpfcnpj') {
        // Detectar automaticamente CPF ou CNPJ
        if (numbersOnly.length <= 11) {
          // CPF
          if (numbersOnly.length <= 3) {
            formattedValue = numbersOnly;
          } else if (numbersOnly.length <= 6) {
            formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3)}`;
          } else if (numbersOnly.length <= 9) {
            formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6)}`;
          } else {
            formattedValue = `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6, 9)}-${numbersOnly.substring(9, 11)}`;
          }
        } else {
          // CNPJ
          if (numbersOnly.length <= 2) {
            formattedValue = numbersOnly;
          } else if (numbersOnly.length <= 5) {
            formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2)}`;
          } else if (numbersOnly.length <= 8) {
            formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5)}`;
          } else if (numbersOnly.length <= 12) {
            formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8)}`;
          } else {
            formattedValue = `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8, 12)}-${numbersOnly.substring(12, 14)}`;
          }
        }
      } else if (mask === 'telefone') {
        // Formato: (99) 99999-9999 ou (99) 9999-9999
        if (numbersOnly.length <= 2) {
          formattedValue = numbersOnly.length > 0 ? `(${numbersOnly}` : '';
        } else if (numbersOnly.length <= 6) {
          formattedValue = `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2)}`;
        } else if (numbersOnly.length <= 10) {
          // Telefone fixo
          formattedValue = `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2, 6)}-${numbersOnly.substring(6)}`;
        } else {
          // Celular
          formattedValue = `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2, 7)}-${numbersOnly.substring(7, 11)}`;
        }
      } else if (mask === 'cep') {
        // Formato: 99999-999
        if (numbersOnly.length <= 5) {
          formattedValue = numbersOnly;
        } else {
          formattedValue = `${numbersOnly.substring(0, 5)}-${numbersOnly.substring(5, 8)}`;
        }
      }
      
      // Se o valor formatado estiver vazio mas temos entrada, manter o valor original
      if (formattedValue === '' && rawValue !== '') {
        formattedValue = rawValue;
      }
      
      // Atualizar o estado interno
      setInputValue(formattedValue);
      
      // Criar um novo evento com o valor formatado
      const newEvent = {
        ...e,
        target: {
          ...e.target,
          value: formattedValue
        }
      };
      
      // Chamar o onChange original com o novo evento
      if (onChange) {
        onChange(newEvent as React.ChangeEvent<HTMLInputElement>);
      }
    };

    // Formatar valor para exibição conforme a máscara
    const formatarValorParaExibicao = (valor: string) => {
      if (!valor) return '';
      
      // Se já estiver formatado, retornar como está
      if (valor.includes('.') || valor.includes('-') || valor.includes('/') || valor.includes('(')) {
        return valor;
      }
      
      // Remover caracteres não numéricos
      const numbersOnly = valor.replace(/\D/g, '');
      
      if (mask === 'cpf' && numbersOnly.length === 11) {
        return `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6, 9)}-${numbersOnly.substring(9, 11)}`;
      } else if (mask === 'cnpj' && numbersOnly.length === 14) {
        return `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8, 12)}-${numbersOnly.substring(12, 14)}`;
      } else if (mask === 'cpfcnpj') {
        if (numbersOnly.length === 11) {
          return `${numbersOnly.substring(0, 3)}.${numbersOnly.substring(3, 6)}.${numbersOnly.substring(6, 9)}-${numbersOnly.substring(9, 11)}`;
        } else if (numbersOnly.length === 14) {
          return `${numbersOnly.substring(0, 2)}.${numbersOnly.substring(2, 5)}.${numbersOnly.substring(5, 8)}/${numbersOnly.substring(8, 12)}-${numbersOnly.substring(12, 14)}`;
        }
      } else if (mask === 'telefone') {
        if (numbersOnly.length === 10) {
          return `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2, 6)}-${numbersOnly.substring(6, 10)}`;
        } else if (numbersOnly.length === 11) {
          return `(${numbersOnly.substring(0, 2)}) ${numbersOnly.substring(2, 7)}-${numbersOnly.substring(7, 11)}`;
        }
      } else if (mask === 'cep' && numbersOnly.length === 8) {
        return `${numbersOnly.substring(0, 5)}-${numbersOnly.substring(5, 8)}`;
      }
      
      return valor;
    };

    return (
      <div className="relative">
        <Input
          ref={ref || inputRef}
          type="text"
          className={cn(icon ? "pl-9" : "", className)}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
        {icon && (
          <div className="absolute left-3 top-2.5 text-muted-foreground">
            {icon}
          </div>
        )}
      </div>
    );
  }
);

InputMask.displayName = "InputMask";

export { InputMask };
