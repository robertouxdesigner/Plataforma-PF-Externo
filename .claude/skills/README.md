# Skills do projeto

Cada skill é uma pasta com um `SKILL.md`. O Claude lê o campo `description` para decidir quando usar a skill, então escreva-o com clareza.

## Índice

| Skill | Pasta | Quando usar |
|---|---|---|
| economia-tokens | `economia-tokens/` | Sempre — limita a resposta ao que foi pedido |
| frontend-design | `frontend-design/` | Criar ou melhorar interfaces (sites, landing pages, dashboards, componentes) — instalada de `nexu-io/open-design` |

## Como criar uma nova skill
1. Crie `.claude/skills/<nome-da-skill>/SKILL.md` (nome em minúsculas, com hífens).
2. Use o modelo abaixo.
3. Adicione uma linha na tabela do índice acima.
4. Arquivos de apoio (scripts, exemplos) ficam na mesma pasta da skill.

## Modelo

```markdown
---
name: nome-da-skill
description: O que a skill faz e quando deve ser usada (gatilhos claros).
---

# Nome da skill

## Quando usar
- ...

## Passos
1. ...

## Regras
- ...
```
