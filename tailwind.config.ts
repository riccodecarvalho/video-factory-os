import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
    	container: {
    		center: true,
    		padding: '2rem',
    		screens: {
    			'2xl': '1400px'
    		}
    	},
    	extend: {
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
    			status: {
    				success: 'hsl(var(--status-success))',
    				warning: 'hsl(var(--status-warning))',
    				error: 'hsl(var(--status-error))',
    				running: 'hsl(var(--status-running))',
    				retrying: 'hsl(var(--status-retrying))',
    				pending: 'hsl(var(--status-pending))',
    				skipped: 'hsl(var(--status-skipped))',
    				blocked: 'hsl(var(--status-blocked))',
    				cancelled: 'hsl(var(--status-cancelled))',
    				info: 'hsl(var(--status-info))'
    			},
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)'
    		},
    		fontFamily: {
    			sans: [
    				'Inter',
    				'system-ui',
    				'sans-serif'
    			],
    			mono: [
    				'JetBrains Mono',
    				'Menlo',
    				'Monaco',
    				'Courier New',
    				'monospace'
    			]
    		},
    		fontSize: {
    			xs: [
    				'0.75rem',
    				{
    					lineHeight: '1rem'
    				}
    			],
    			sm: [
    				'0.875rem',
    				{
    					lineHeight: '1.25rem'
    				}
    			],
    			base: [
    				'1rem',
    				{
    					lineHeight: '1.5rem'
    				}
    			],
    			lg: [
    				'1.125rem',
    				{
    					lineHeight: '1.75rem'
    				}
    			],
    			xl: [
    				'1.25rem',
    				{
    					lineHeight: '1.75rem'
    				}
    			],
    			'2xl': [
    				'1.5rem',
    				{
    					lineHeight: '2rem'
    				}
    			],
    			'3xl': [
    				'1.875rem',
    				{
    					lineHeight: '2.25rem'
    				}
    			],
    			'4xl': [
    				'2.25rem',
    				{
    					lineHeight: '2.5rem'
    				}
    			]
    		},
    		spacing: {
    			'18': '4.5rem',
    			'88': '22rem',
    			'128': '32rem'
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
    			shimmer: {
    				'0%': {
    					backgroundPosition: '-200% 0'
    				},
    				'100%': {
    					backgroundPosition: '200% 0'
    				}
    			}
    		},
    		animation: {
    			'accordion-down': 'accordion-down 0.2s ease-out',
    			'accordion-up': 'accordion-up 0.2s ease-out',
    			shimmer: 'shimmer 2s linear infinite'
    		}
    	}
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
