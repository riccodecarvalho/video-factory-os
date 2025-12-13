# DS Changelog — Video Factory OS

## [1.1.0] - 2025-12-13 (Gate 0.65)

### Changed
- **Baseline visual:** Alinhada com 4pice Studio (ADR-005)
- **Light mode first:** Confirmado como default
- **Glow budget:** Apenas running + focus (muito sutil)

### Deprecated
- `.glass` → usar `border + shadow-sm`
- `.card-hover-glow` → usar `.card-hover`
- `.animate-pulse-glow` → usar `.animate-running`

### Added
- `.card-hover` (shadow ao invés de glow)
- `.card-active` (borda colorida)
- `.animate-running` (opacity pulse sutil)
- `.focus-ring` (padrão acessibilidade)
- `UI-REFERENCE.md` (patterns e Do/Don't)

---

## [1.0.0] - 2025-12-13 (Gate 0.6)

### Added
- 10 status colors (success, warning, error, running, retrying, pending, skipped, blocked, cancelled, info)
- Light mode first (removido dark forçado)
- `ds-spec.md` completo

---

## [0.1.0] - 2025-12-13 (Gate 0.5)

### Added
- Cores base (primary, secondary, muted, etc)
- Status colors iniciais
- Animações (pulse-glow, flow)
- Tokens de tipografia e spacing
