
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
				'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
				'mono': ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'monospace'],
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
				// Premium Design System
				'pure-white': '#FFFFFF',
				'pure-black': '#000000',
				'blue-interconecta': '#2563EB',
				'gray-05': '#F8FAFC',
				'gray-10': '#F1F5F9',
				'gray-20': '#E2E8F0',
				'gray-30': '#CBD5E1',
				'gray-40': '#94A3B8',
				'gray-50': '#64748B',
				'gray-60': '#475569',
				'gray-70': '#334155',
				'gray-80': '#1E293B',
				'gray-90': '#0F172A',
			},
			spacing: {
				'1': '4px',
				'2': '8px',
				'3': '12px',
				'4': '16px',
				'6': '24px',
				'8': '32px',
				'10': '40px',
				'12': '48px',
				'16': '64px',
				'20': '80px',
				'24': '96px',
				'32': '128px',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '16px',
				'3xl': '24px',
			},
			boxShadow: {
				'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'sm': '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
				'md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
				'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
				'xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
				'2xl': '0 25px 50px rgba(0, 0, 0, 0.15)',
				'premium': '0 20px 40px rgba(37, 99, 235, 0.1)',
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
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'grid-move': {
					'0%': { transform: 'translate(0, 0)' },
					'100%': { transform: 'translate(-20px, -20px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
				'float': 'float 6s ease-in-out infinite',
				'grid-move': 'grid-move 20s linear infinite',
			},
			transitionTimingFunction: {
				'premium': 'cubic-bezier(0.33, 1, 0.68, 1)',
				'premium-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
			fontSize: {
				'hero': 'clamp(48px, 8vw, 96px)',
				'display': 'clamp(32px, 6vw, 64px)',
				'subtitle': 'clamp(18px, 4vw, 24px)',
			},
			letterSpacing: {
				'hero': '-0.04em',
				'tight': '-0.02em',
				'wide': '0.05em',
			},
			lineHeight: {
				'hero': '0.9',
				'display': '1.1',
				'relaxed': '1.6',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
