
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
				'sora': ['Sora', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
				'inter': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
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
				// Premium Monochrome System
				'pure-white': '#FFFFFF',
				'pure-black': '#000000',
				'gray-05': '#FAFAFA',
				'gray-10': '#F5F5F5',
				'gray-20': '#E8E8E8',
				'gray-30': '#D6D6D6',
				'gray-40': '#A3A3A3',
				'gray-50': '#737373',
				'gray-60': '#525252',
				'gray-70': '#404040',
				'gray-80': '#262626',
				'gray-90': '#171717',
				// Brand Colors
				'blue-interconecta': '#1A69FA',
				'blue-hover': '#0F47B3',
				'blue-light': '#F0F8FF',
				// Legacy Interconecta Colors (maintained for compatibility)
				interconecta: {
					primary: '#1A69FA',
					'primary-light': '#DEEEFF',
					accent: '#0F47B3',
					'text-primary': '#1C1C28',
					'text-body': '#2F2F3A',
					'text-secondary': '#6C6C84',
					'border-subtle': '#D8E4F9',
					'bg-component': '#FFFFFF',
					'bg-alternate': '#F5F9FF'
				}
			},
			// Micro-spacing System (4px base)
			spacing: {
				'space-0': '0',
				'space-1': '4px',
				'space-2': '8px',
				'space-3': '12px',
				'space-4': '16px',
				'space-5': '20px',
				'space-6': '24px',
				'space-8': '32px',
				'space-10': '40px',
				'space-12': '48px',
				'space-16': '64px',
				'space-20': '80px',
				'space-24': '96px',
				'space-32': '128px',
			},
			// Perfect Border Radius
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'radius-2': '2px',
				'radius-4': '4px',
				'radius-6': '6px',
				'radius-8': '8px',
				'radius-12': '12px',
				'radius-16': '16px',
				'radius-24': '24px',
				'radius-full': '9999px',
			},
			// Micro-shadows
			boxShadow: {
				'shadow-xs': '0 1px 2px rgba(0, 0, 0, 0.05)',
				'shadow-sm': '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
				'shadow-md': '0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.06)',
				'shadow-lg': '0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
				'shadow-xl': '0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)',
			},
			// Animation System
			transitionTimingFunction: {
				'ease-out-cubic': 'cubic-bezier(0.33, 1, 0.68, 1)',
				'ease-in-out-cubic': 'cubic-bezier(0.65, 0, 0.35, 1)',
				'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
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
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(40px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'float-notification': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'50%': { transform: 'translateY(-10px) rotate(1deg)' }
				},
				'grid-move': {
					'0%': { transform: 'translate(0, 0)' },
					'100%': { transform: 'translate(80px, 80px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'slide-up': 'slide-up 1s cubic-bezier(0.16, 1, 0.3, 1)',
				'float': 'float 6s ease-in-out infinite',
				'float-notification': 'float-notification 8s ease-in-out infinite',
				'grid-move': 'grid-move 60s linear infinite',
			},
			backgroundImage: {
				'gradient-interconecta': 'linear-gradient(135deg, #1A69FA 0%, #0F47B3 100%)',
				'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #F5F9FF 100%)',
				'gradient-radial': 'radial-gradient(circle at 30% 20%, rgba(26, 105, 250, 0.03) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(26, 105, 250, 0.02) 0%, transparent 50%)',
				'gradient-grid': 'linear-gradient(90deg, transparent 49%, var(--gray-10) 50%, transparent 51%), linear-gradient(0deg, transparent 49%, var(--gray-10) 50%, transparent 51%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
