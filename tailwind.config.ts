
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Sistema Apple-inspired
				'system': {
					'background': 'var(--system-background)',
					'surface': 'var(--system-surface)',
					'border': 'var(--system-border)',
					'border-focus': 'var(--system-border-focus)',
					'primary': 'var(--system-primary)',
					'primary-hover': 'var(--system-primary-hover)',
					'accent': 'var(--system-accent)',
					'accent-bg': 'var(--system-accent-bg)',
					'text': {
						'primary': 'var(--system-text-primary)',
						'secondary': 'var(--system-text-secondary)',
						'tertiary': 'var(--system-text-tertiary)',
						'disabled': 'var(--system-text-disabled)'
					},
					'gray': {
						'1': 'var(--system-gray-1)',
						'2': 'var(--system-gray-2)',
						'3': 'var(--system-gray-3)',
						'4': 'var(--system-gray-4)',
						'5': 'var(--system-gray-5)',
						'6': 'var(--system-gray-6)',
						'7': 'var(--system-gray-7)',
						'8': 'var(--system-gray-8)'
					}
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			boxShadow: {
				'system-sm': 'var(--system-shadow-sm)',
				'system-md': 'var(--system-shadow-md)',
				'system-lg': 'var(--system-shadow-lg)',
				'system-xl': 'var(--system-shadow-xl)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			transitionTimingFunction: {
				'system-fast': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'system-normal': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'system-slow': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
