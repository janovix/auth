# @janovix/auth-ui

Shared UI components for Janovix applications.

## Installation

```bash
pnpm add @janovix/auth-ui
```

> **Note**: This package is published to GitHub Package Registry. Ensure your `.npmrc` is configured for the `@janovix` scope.

## Peer Dependencies

This package requires the following peer dependencies:

```bash
pnpm add react react-dom next-themes lucide-react motion
```

## Usage

### ThemeSwitcher

A theme switcher component with support for system, light, and dark themes.

```tsx
import { ThemeSwitcher } from "@janovix/auth-ui";

// Basic usage with default English labels
function App() {
	return <ThemeSwitcher />;
}
```

#### With Custom Labels (i18n)

Pass your own translated labels via the `labels` prop:

```tsx
import { ThemeSwitcher } from "@janovix/auth-ui";
import { useLanguage } from "@/components/LanguageProvider";

function LocalizedThemeSwitcher() {
	const { t } = useLanguage();

	return (
		<ThemeSwitcher
			labels={{
				theme: t("themeLabel"),
				system: t("themeSystem"),
				light: t("themeLight"),
				dark: t("themeDark"),
			}}
		/>
	);
}
```

#### Props

| Prop        | Type                                     | Default          | Description                       |
| ----------- | ---------------------------------------- | ---------------- | --------------------------------- |
| `className` | `string`                                 | -                | Additional CSS classes            |
| `size`      | `"sm" \| "md" \| "lg"`                   | `"sm"`           | Size of the switcher              |
| `shape`     | `"rounded" \| "pill"`                    | `"rounded"`      | Shape of the button               |
| `variant`   | `"default" \| "mini"`                    | `"default"`      | Display variant                   |
| `align`     | `"start" \| "center" \| "end"`           | `"center"`       | Dropdown alignment (mini variant) |
| `side`      | `"top" \| "bottom" \| "left" \| "right"` | `"top"`          | Dropdown side (mini variant)      |
| `labels`    | `ThemeSwitcherLabels`                    | English defaults | Translation labels                |

#### Variants

- **default**: Segmented control showing all three theme options
- **mini**: Compact dropdown showing only the current theme icon

```tsx
// Mini variant for sidebars
<ThemeSwitcher variant="mini" side="right" align="start" />

// Pill shape
<ThemeSwitcher shape="pill" size="md" />
```

## UI Primitives

This package also exports the following UI primitives used by ThemeSwitcher:

- `Button` / `buttonVariants`
- `DropdownMenu` and related components
- `Tooltip` and related components
- `cn` utility function

```tsx
import { Button, DropdownMenu, Tooltip, cn } from "@janovix/auth-ui";
```

## Styling

This package uses Tailwind CSS classes. Ensure your project has Tailwind CSS configured with the appropriate CSS variables for theming:

- `--background`, `--foreground`
- `--primary`, `--primary-foreground`
- `--secondary`, `--secondary-foreground`
- `--accent`, `--accent-foreground`
- `--muted`, `--muted-foreground`
- `--border`, `--ring`
- `--popover`, `--popover-foreground`

## Development

```bash
# Build the package
pnpm --filter @janovix/auth-ui build

# Watch mode
pnpm --filter @janovix/auth-ui dev

# Type check
pnpm --filter @janovix/auth-ui typecheck
```

## License

UNLICENSED - Proprietary
