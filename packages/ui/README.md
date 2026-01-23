# @janovix/auth-ui

> Shared UI components for Janovix applications

Shared UI components for Janovix applications.

## Installation

```bash
pnpm add @janovix/auth-ui
```

> **Note**: This package is published to [npmjs.com](https://www.npmjs.com/package/@janovix/auth-ui).

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

### LanguageSwitcher

A language switcher component with segmented control and dropdown variants.

```tsx
import { LanguageSwitcher } from "@janovix/auth-ui";

const languages = [
	{ key: "en", label: "EN", nativeName: "English" },
	{ key: "es", label: "ES", nativeName: "Español" },
];

function App() {
	const [language, setLanguage] = useState("en");

	return (
		<LanguageSwitcher
			languages={languages}
			currentLanguage={language}
			onLanguageChange={setLanguage}
			labels={{ language: "Language" }}
		/>
	);
}
```

#### Props

| Prop               | Type                                     | Default     | Description                       |
| ------------------ | ---------------------------------------- | ----------- | --------------------------------- |
| `languages`        | `Language[]`                             | (required)  | Available languages               |
| `currentLanguage`  | `string`                                 | (required)  | Current selected language key     |
| `onLanguageChange` | `(key: string) => void`                  | (required)  | Callback when language changes    |
| `labels`           | `LanguageSwitcherLabels`                 | `{}`        | Translation labels for tooltips   |
| `className`        | `string`                                 | -           | Additional CSS classes            |
| `size`             | `"sm" \| "md" \| "lg"`                   | `"sm"`      | Size of the switcher              |
| `shape`            | `"rounded" \| "squared" \| "pill"`       | `"rounded"` | Shape of the button               |
| `variant`          | `"default" \| "mini"`                    | `"default"` | Display variant                   |
| `showIcon`         | `boolean`                                | `true`      | Show language icon                |
| `align`            | `"start" \| "center" \| "end"`           | `"center"`  | Dropdown alignment (mini variant) |
| `side`             | `"top" \| "bottom" \| "left" \| "right"` | `"top"`     | Dropdown side (mini variant)      |

#### Language Type

```tsx
type Language = {
	key: string; // Language code (e.g., "en", "es")
	label: string; // Short label (e.g., "EN", "ES")
	nativeName: string; // Full name (e.g., "English", "Español")
};
```

## UI Primitives

This package also exports the following UI primitives used by the components:

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
