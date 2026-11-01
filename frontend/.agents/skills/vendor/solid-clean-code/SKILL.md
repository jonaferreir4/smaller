---
name: solid-clean-code
description: Diretrizes de refatoração e arquitetura baseadas nos princípios SOLID e Clean Code em aplicações React/TypeScript.
---

# Princípios SOLID e Clean Code para React & TypeScript

Este guia define as diretrizes de arquitetura limpa e refatoração para manter componentes React coesos, desacoplados e alinhados aos princípios SOLID.

---

## 1. Single Responsibility Principle (SRP)
- **Separação Estado x Apresentação**: Componentes visuais devem focar exclusivamente em renderizar JSX. Lógica de estado complexa e chamadas assíncronas devem ser extraídas para custom hooks.
- **Limite de Linhas**: Componentes com mais de 200–250 linhas devem ser divididos em subcomponentes coesos.

---

## 2. Open/Closed Principle (OCP)
- **Composição em vez de arvoreis condicionais gigantes**: Utilize composição de subcomponentes e utilitários em vez de acumular dezenas de `if/else` no JSX principal.

---

## 3. Liskov Substitution Principle (LSP)
- Subcomponentes e elementos de UI devem aceitar contratos de props previsíveis e sem comportamentos colaterais inesperados.

---

## 4. Interface Segregation Principle (ISP)
- Subcomponentes de UI não devem receber objetos monolíticos inteiros se precisam de apenas 1 ou 2 propriedades. Passe props específicas.

---

## 5. Dependency Inversion Principle (DIP)
- Componentes de UI devem depender de callbacks e abstrações (`onClick`, `onShorten`), e não de manipulação direta de globais ou do DOM.
