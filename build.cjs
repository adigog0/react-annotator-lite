const esbuild = require("esbuild");
const postcss = require("postcss");
const autoprefixer = require("autoprefixer");
const fs = require("fs");
const svgrPlugin = require("esbuild-plugin-svgr");
const { execSync } = require("child_process");

const INDEX_CSS_PATH = 'src/index.css';
const TAILWIND_IMPORT = '@import "tailwindcss";';
const EMPTY_STYLE = '/* tailwind import temporarily removed for build */\n';

function removeTailwindImport() {
    const original = fs.readFileSync(INDEX_CSS_PATH, 'utf-8');
    if (original.includes(TAILWIND_IMPORT)) {
        fs.writeFileSync(INDEX_CSS_PATH, EMPTY_STYLE);
    }
    return original;
}

function restoreTailwindImport(original) {
    fs.writeFileSync(INDEX_CSS_PATH, original);
}

async function bundleCSS() {
    // Run Tailwind CLI to generate CSS with all used classes
    execSync(
        'npx tailwindcss -c tailwind.config.js -i ./src/index.css -o ./dist/index.css',
        { stdio: 'inherit' }
    );

    // Optionally, run PostCSS with autoprefixer on the output CSS
    const css = fs.readFileSync('dist/index.css', 'utf-8');
    const result = await postcss([autoprefixer]).process(css, {
        from: 'dist/index.css',
        to: 'dist/index.css',
    });
    fs.writeFileSync('dist/index.css', result.css);
}

async function buildTS() {
    await esbuild.build({
        entryPoints: ['src/App.tsx'],
        bundle: true,
        format: 'esm',
        outfile: 'dist/index.esm.js',
        external: ['react','react-dom'],
        plugins: [svgrPlugin()],
        minify: false,
        sourcemap: true,
        jsx: 'automatic',
        target: ['es2017']
    })

    await esbuild.build({
        entryPoints: ['src/App.tsx'],
        bundle: true,
        format: 'cjs',
        outfile: 'dist/index.cjs.js',
        external: ['react','react-dom'],
        plugins: [svgrPlugin()],
        minify: false,
        sourcemap: true,
        jsx: 'automatic',
        target: ['es2017']
    })
}

async function main() {
    await bundleCSS();
    const originalCss = removeTailwindImport();
    try {
        await buildTS();
    } finally {
        restoreTailwindImport(originalCss);
    }
}

main();