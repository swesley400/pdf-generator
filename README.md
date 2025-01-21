# PDF Generator Service

Este serviço permite gerar PDFs dinâmicos usando uma estrutura JSON flexível. O documento pode conter cabeçalho, rodapé e conteúdo com diversos tipos de elementos como textos, imagens, colunas e linhas.

## Estrutura Básica

```json
{
  "margins": {
    "left": 1,
    "right": 1,
    "bottom": 1,
    "top": 1
  },
  "orientation": "portrait | landscape",
  "page": "a4",
  "header": { ... },
  "content": [ ... ],
  "footer": { ... }
}
```

## Configurações da Página

### Margens
- Definidas em polegadas
- Exemplo: `"left": 1` = 1 polegada
- Aplicadas em todas as páginas

### Orientação
- `"portrait"`: Vertical (padrão)
- `"landscape"`: Horizontal

### Tamanho
- `"a4"`: Tamanho A4 padrão
- Outros tamanhos disponíveis: letter, legal, etc.

## Tipos de Elementos

### Text
```json
{
  "type": "text",
  "content": "Seu texto aqui",
  "font": "Helvetica | Helvetica-Bold",
  "size": 12,
  "align": "left | center | right",
  "color": "#000000"
}
```

### Image
```json
{
  "type": "image",
  "content": "URL_DA_IMAGEM",
  "width": 100,
  "height": 100,
  "align": "left | center | right"
}
```

### Row (Linha)
- Organiza elementos horizontalmente
- Divide o espaço disponível igualmente entre os filhos
```json
{
  "type": "row",
  "childs": [
    { "type": "text", ... },
    { "type": "image", ... }
  ]
}
```

### Column (Coluna)
- Organiza elementos verticalmente
- Cada elemento ocupa a largura total disponível
```json
{
  "type": "column",
  "childs": [
    { "type": "text", ... },
    { "type": "text", ... }
  ]
}
```

## Propriedades Aceitas

### Propriedades de Texto
- `type`: "text"
- `content`: string - Conteúdo do texto
- `font`: string - Nome da fonte (Helvetica, Helvetica-Bold, Helvetica-Oblique, Helvetica-BoldOblique)
- `size`: number - Tamanho da fonte
- `align`: string - Alinhamento (left, center, right)
- `color`: string - Cor do texto (formato hex)
- `backgroundColor`: string - Cor de fundo (formato hex)
- `lineGap`: number - Espaçamento entre linhas
- `width`: number - Largura do elemento
- `height`: number - Altura do elemento

### Propriedades de Imagem
- `type`: "image"
- `content`: string - URL da imagem
- `width`: number - Largura da imagem
- `height`: number - Altura da imagem
- `align`: string - Alinhamento (center, right)
- `backgroundColor`: string - Cor de fundo (formato hex)

### Propriedades de Linha
- `type`: "row"
- `childs`: array - Array de elementos filhos
- `backgroundColor`: string - Cor de fundo (formato hex)

### Propriedades de Coluna
- `type`: "column"
- `childs`: array - Array de elementos filhos
- `backgroundColor`: string - Cor de fundo (formato hex)

### Propriedades da Página
- `margins`: object
  - `left`: number - Margem esquerda
  - `right`: number - Margem direita
  - `bottom`: number - Margem inferior
  - `top`: number - Margem superior
- `orientation`: string - Orientação da página (portrait, landscape)
- `page`: string - Tamanho da página (a4, letter, legal)

### Propriedades de Cabeçalho/Rodapé
- `content`: array - Array de elementos

## Header e Footer

### Header (Cabeçalho)
- Aparece no topo de todas as páginas
- Altura calculada automaticamente
- Exemplo:
```json
"header": {
  "content": [
    {
      "type": "row",
      "childs": [
        {
          "type": "image",
          "content": "URL_LOGO",
          "width": 100,
          "height": 100
        },
        {
          "type": "column",
          "childs": [
            {
              "type": "text",
              "content": "TÍTULO",
              "font": "Helvetica-Bold",
              "size": 24
            }
          ]
        }
      ]
    }
  ]
}
```

### Footer (Rodapé)
- Aparece no final de todas as páginas
- Altura calculada automaticamente
- Exemplo:
```json
"footer": {
  "content": [
    {
      "type": "row",
      "childs": [
        {
          "type": "text",
          "content": "Data: 21/01/2025",
          "align": "left"
        },
        {
          "type": "text",
          "content": "Página 1 de 1",
          "align": "right"
        }
      ]
    }
  ]
}
```

## Estilos de Texto

### Fontes Disponíveis
- `"Helvetica"`: Fonte padrão
- `"Helvetica-Bold"`: Negrito
- `"Helvetica-Oblique"`: Itálico
- `"Helvetica-BoldOblique"`: Negrito e Itálico

### Tamanhos Recomendados
- Títulos principais: 20-24pt
- Subtítulos: 16-18pt
- Texto normal: 12pt
- Notas de rodapé: 10pt

### Cores
- Formato hexadecimal: `"#RRGGBB"`
- Exemplos:
  - Preto: `"#000000"`
  - Cinza: `"#666666"`
  - Azul: `"#2980B9"`

## Exemplos de Uso

### Layout com Logo e Título
```json
{
  "type": "row",
  "childs": [
    {
      "type": "image",
      "content": "URL_LOGO",
      "width": 100,
      "height": 100,
      "align": "left"
    },
    {
      "type": "column",
      "childs": [
        {
          "type": "text",
          "content": "TÍTULO PRINCIPAL",
          "font": "Helvetica-Bold",
          "size": 24,
          "align": "center"
        },
        {
          "type": "text",
          "content": "Subtítulo",
          "font": "Helvetica",
          "size": 16,
          "align": "center"
        }
      ]
    }
  ]
}
```

### Dados em Colunas
```json
{
  "type": "row",
  "childs": [
    {
      "type": "column",
      "childs": [
        {
          "type": "text",
          "content": "Coluna 1",
          "font": "Helvetica-Bold"
        },
        {
          "type": "text",
          "content": "Dado 1"
        }
      ]
    },
    {
      "type": "column",
      "childs": [
        {
          "type": "text",
          "content": "Coluna 2",
          "font": "Helvetica-Bold"
        },
        {
          "type": "text",
          "content": "Dado 2"
        }
      ]
    }
  ]
}
```

## Considerações Importantes

1. **Hierarquia**:
   - `row` e `column` podem ser aninhados
   - Use `childs` para definir elementos filhos
   - Mantenha a estrutura organizada para facilitar manutenção

2. **Espaçamento**:
   - Elementos em `row` têm espaçamento horizontal automático
   - Elementos em `column` têm espaçamento vertical automático
   - Textos têm margens internas para melhor legibilidade

3. **Imagens**:
   - Use URLs públicas e acessíveis
   - Defina width e height para melhor controle do layout
   - Formatos suportados: JPG, PNG, GIF

4. **Performance**:
   - Otimize imagens antes de usar
   - Evite estruturas muito profundas
   - Limite o número de elementos por página

5. **Quebras de Página**:
   - Automáticas quando o conteúdo excede a página
   - Header e footer são repetidos automaticamente
   - Conteúdo é distribuído respeitando as margens
