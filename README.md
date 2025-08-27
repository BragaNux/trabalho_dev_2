# 📱 Check-in de Evento (React Native + TypeScript)

Aplicativo mobile para operadores de portaria realizarem **check-in de participantes** em eventos. Desenvolvido em **Expo + React Native + TypeScript**, consumindo um backend fornecido pelo professor.

---

## 🚀 Tecnologias

* [Expo](https://expo.dev/) (React Native)
* TypeScript
* React Navigation (Stack)
* Expo Camera / Barcode Scanner
* Expo Haptics
* React Native Safe Area Context

---

## ⚙️ Configuração

### 1. Clonar o repositório

```bash
git clone <seu-repo>
cd expo-checkin
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo **.env** na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.44:5044
EXPO_PUBLIC_EVENT_ID=evt_123
EXPO_PUBLIC_TOKEN=Bearer eyJhbGciOi...
```

> ⚠️ Use o **IP da sua máquina** (via `ipconfig`) em vez de `localhost`.

### 4. Rodar o app

```bash
npx expo start --clear
```

Escaneie o QR Code no app **Expo Go** (Android/iOS).

---

## 📂 Estrutura de Pastas

```
expo-checkin/
 ├── app/                 # Arquivo App.tsx e navegação
 ├── components/          # Componentes reutilizáveis (Header, Footer, KPI)
 ├── screens/             # Telas (Evento, Participantes, Scanner)
 ├── services/            # Chamadas à API
 ├── types/               # Tipos TypeScript (DTOs da API)
 ├── utils/               # Funções utilitárias (formatar datas, debounce)
 ├── .env                 # Variáveis de ambiente
```

---

## 📱 Fluxo Principal

### 1. **Tela Evento**

* Exibe título, local, data/horário.
* Mostra KPIs: **Total**, **Presentes**, **Ausentes**.
* Botões: **Ver participantes** e **Scanner (QR)**.

### 2. **Tela Participantes**

* Busca com **debounce** e tolerância a acentos.
* Lista virtualizada com nome, e-mail/documento, status.
* Tap → check-in manual com confirmação.
* Pull-to-refresh para atualizar.

### 3. **Tela Scanner (QR)**

* Leitura de QR (`eventId`, `attendeeId`).
* Confirma se QR pertence ao evento atual.
* Feedback com vibração/toast.
* Previne leituras duplicadas.

---

## ✅ Requisitos Atendidos

* [x] Fluxo completo: Evento → Participantes → Check-in
* [x] Tipagem TS completa
* [x] Tratamento de erros, loading, lista vazia
* [x] Atualização de KPIs ao voltar
* [x] UX acessível (labels, contraste)
* [x] Bônus: Scanner com QR Code + Haptics

---

## 🧪 Casos de Teste

* Busca "ana" retorna Ana; "José" ≈ "Jose".
* Check-in de ausente → presente, incrementa contador.
* Check-in repetido → aviso com horário.
* Erro 500 → retry disponível.
* QR de outro evento → alerta.

---

## 👨‍🎓 Observações

> Trabalho acadêmico — disciplina **Desenvolvimento de Sistemas II**.
> Código organizado com comentários em pontos críticos (UX, chamadas à API, tratamento de erros).
> Foco em clareza, acessibilidade e experiência do operador de portaria.
