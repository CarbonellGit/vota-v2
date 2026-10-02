# 📸 Pasta de Fotos dos Colaboradores

Coloque as fotos dos participantes nesta pasta (`server/photos/`).

O sistema lê e extrai automaticamente o **Nome** e o **E-mail Institucional** de acordo com os seguintes padrões de arquivo:

### 1. Padrão Recomendado:
```
Nome Completo - email@colegiocarbonell.com.br.jpg
```
*Exemplo:* `Mariana Santos - mariana.santos@colegiocarbonell.com.br.jpg`

### 2. Apenas com o E-mail:
```
email@colegiocarbonell.com.br.jpg
```
*Exemplo:* `carlos.ramos@colegiocarbonell.com.br.jpg`  
*(O sistema converte o prefixo para "Carlos Ramos")*

### 3. Apenas com o Nome:
```
Nome Sobrenome.jpg
```
*Exemplo:* `Beatriz Almeida.jpg`  
*(O sistema gera automaticamente o e-mail: `beatriz.almeida@colegiocarbonell.com.br`)*

---

### Como Sincronizar:
Após copiar os arquivos para esta pasta, acesse o painel **Admin** na aplicação e clique em **"Sincronizar Fotos"**.
Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`.
