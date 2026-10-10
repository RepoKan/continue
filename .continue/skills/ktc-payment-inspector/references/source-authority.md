# Source Authority

Use this precedence when sources disagree:

1. Exact Production source for the inspected revision
2. Approved KTC specification for the applicable revision
3. Official vendor SDK or platform documentation
4. Matched Production runtime evidence from the same behavior/revision
5. Approved project business rules or explicit business clarification
6. Derived project knowledge
7. General model knowledge

Apply these rules:

- Record the authority level for every material requirement used in the verdict.
- Do not present lower-authority guidance as if it were specification text.
- If a higher-authority source contradicts a lower-authority rule, use the higher-authority source and record the conflict.
- If the exact Production source or parameter contract is required but unavailable, return `HOLD - IMPACT NOT PROVEN` for that conclusion.
- Do not infer a Production parameter name, unit, threshold operator, default, or host mapping from a documentation placeholder.
