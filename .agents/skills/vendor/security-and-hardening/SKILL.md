---
name: security-and-hardening
description: Diretrizes de segurança OWASP para backend Web APIs (mitigação de Open Redirect, SSRF, SQL Injection, validação rigorosa de input e cabeçalhos HTTP).
---

# Hardening e Segurança em Web APIs (Community Vendor Skill)

Práticas de segurança alinhadas com as diretrizes OWASP Top 10 para APIs RESTful.

---

## 1. Validação Rigorosa de Entrada (Input Validation)

- **Sanitização de URLs:** Validar todas as URLs recebidas utilizando `Uri.TryCreate` com checagem de esquema obrigatoriamente `http` ou `https`.
- Rejeitar URLs que apontem para IP local (`127.0.0.1`, `localhost`, redes internas `10.x.x.x`, `192.168.x.x`) para evitar vunerabilidade Server-Side Request Forgery (SSRF).

---

## 2. Mitigação de Open Redirect e Loops

- Impedir que o encurtador encurte URLs pertencentes ao seu próprio domínio para prevenir exaustão de pilha ou loops infinitos de redirecionamento HTTP.

---

## 3. Proteção Contra Injeção e Manipulação de Dados

- **SQL Injection:** O uso de Entity Framework Core via LINQ parametriza consultas automaticamente. **Nunca** concatenar strings brutas em métodos como `FromSqlRaw`.
- **Limitação de Tamanho de Campos:** Garantir limites estritos em campos de banco de dados (`IpAdress` max 45, `UserAgent` max 512) para impedir ataques de estouro de buffer ou Negação de Serviço em armazenamento.
