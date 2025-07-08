
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
				'mono': ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'Courier New', 'monospace'],
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
				// Sistema de diseño unificado HSL - Corregido
				'pure-white': 'hsl(var(--pure-white))',
				'pure-black': 'hsl(var(--pure-black))',
				'gray-05': 'hsl(var(--gray-05))',
				'gray-10': 'hsl(var(--gray-10))',
				'gray-20': 'hsl(var(--gray-20))',
				'gray-30': 'hsl(var(--gray-30))',
				'gray-40': 'hsl(var(--gray-40))',
				'gray-50': 'hsl(var(--gray-50))',
				'gray-60': 'hsl(var(--gray-60))',
				'gray-70': 'hsl(var(--gray-70))',
				'gray-80': 'hsl(var(--gray-80))',
				'gray-90': 'hsl(var(--gray-90))',
				'blue-interconecta': 'hsl(var(--blue-interconecta))',
				'blue-hover': 'hsl(var(--blue-hover))',
				'blue-light': 'hsl(var(--blue-light))',
			},
			spacing: {
				'1': '4px',
				'2': '8px',
				'3': '12px',
				'4': '16px',
				'5': '20px',
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
				'2': '2px',
				'4': '4px',
				'6': '6px',
				'8': '8px',
				'12': '12px',
				'16': '16px',
				'24': '24px',
				'full': '9999px',
			},
			boxShadow: {
				'xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
				'lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
				'xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
				'premium': '0 20px 40px rgba(26, 105, 250, 0.1)',
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
					'50%': { transform: 'translateY(-4px)' }
				},
				'grid-move': {
					'0%': { transform: 'translate(0, 0)' },
					'100%': { transform: 'translate(80px, 80px)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float-notification': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(1deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.4s cubic-bezier(0.33, 1, 0.68, 1)',
				'float': 'float 6s ease-in-out infinite',
				'grid-move': 'grid-move 60s linear infinite',
				'slide-up': 'slide-up 1s cubic-bezier(0.16, 1, 0.3, 1)',
				'float-notification': 'float-notification 8s ease-in-out infinite',
			},
			transitionTimingFunction: {
				'premium': 'cubic-bezier(0.33, 1, 0.68, 1)',
				'premium-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
			},
			fontSize: {
				'hero': 'clamp(48px, 8vw, 96px)',
				'display': 'clamp(36px, 6vw, 72px)',
				'title': 'clamp(24px, 4vw, 48px)',
				'subtitle': 'clamp(18px, 3vw, 32px)',
				'body-xl': '24px',
				'body-lg': '20px',
			},
			letterSpacing: {
				'hero': '-0.04em',
				'display': '-0.03em',
				'title': '-0.02em',
				'subtitle': '-0.01em',
				'tight': '-0.02em',
				'wide': '0.05em',
			},
			lineHeight: {
				'hero': '0.9',
				'display': '0.95',
				'title': '1.1',
				'subtitle': '1.2',
				'relaxed': '1.6',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
