import { normalizeScriptToSingleVoice } from "../lib/transformers/script-normalizer";

const inputs = [
    {
        name: "Roteiro com Vozes",
        input: `(voz: NARRADORA) Era uma vez...
(voz: ANTAGONISTA) Eu não acredito!
[PAUSA]
(voz: OTRO) Quem disse?`,
        expected: `Era uma vez...
Eu não acredito!

Quem disse?`
    },
    {
        name: "Roteiro Limpo",
        input: "Apenas um texto simples.",
        expected: "Apenas um texto simples."
    }
];

let failed = false;

console.log("🔍 Verificando Script Normalizer...");

inputs.forEach(({ name, input, expected }) => {
    const output = normalizeScriptToSingleVoice(input);
    const normalizedOutput = output.replace(/\n+/g, "\n").trim();
    const normalizedExpected = expected.replace(/\n+/g, "\n").trim();

    if (normalizedOutput === normalizedExpected) {
        console.log(`✅ ${name}: Passou`);
    } else {
        console.log(`❌ ${name}: Falhou`);
        console.log(`   Esperado: ${JSON.stringify(normalizedExpected)}`);
        console.log(`   Recebido: ${JSON.stringify(normalizedOutput)}`);
        failed = true;
    }
});

if (failed) process.exit(1);
console.log("🎉 Todos os testes passaram!");
