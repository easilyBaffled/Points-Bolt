import { Mode, plugin } from 'vite-plugin-markdown'
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [plugin({ mode: [Mode.MARKDOWN] })],
	test: {
		globals: true,
		environment: 'jsdom',
	},
	// assetsInclude: [ "**/*.md" ]
})
