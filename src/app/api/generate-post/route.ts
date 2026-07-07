import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import prisma from '@/lib/prisma';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ─── Persona fixa da Vyrko (System Prompt) ───────────────────────────────────
const VYRKO_PERSONA = `
Você é o estrategista de conteúdo da **Vyrko**, uma empresa brasileira especializada em automação inteligente, agentes de IA e desenvolvimento de soluções tecnológicas sob medida para negócios.

Personalidade da Vyrko:
- Tom consultivo e direto, sem enrolação.
- Demonstra domínio técnico sem ser arrogante.
- Focada em resultados reais e mensuráveis.
- Linguagem acessível quando fala com leigos; precisa e técnica quando fala com devs/CTOs.
- Nunca soa genérica ou robótica. Sempre soa como um parceiro estratégico de confiança.
`.trim();

// ─── Mapa de instruções por Formato Editorial ────────────────────────────────
const FORMAT_INSTRUCTIONS: Record<string, string> = {
  case: `
FORMATO: CASE DE PROJETO (Antes/Depois)
- Estruture o carrossel assim: Slide 1 = Título chamativo com o resultado. Slides do meio = Descreva o PROBLEMA do cliente → a SOLUÇÃO que a Vyrko implementou → o RESULTADO obtido.
- Use linguagem de storytelling: "O cliente enfrentava X... Implementamos Y... O resultado foi Z."
- Se houver métricas fornecidas, destaque-as com destaque visual (ex: "40% mais rápido").`,

  dica: `
FORMATO: DICA TÉCNICA / EDUCATIVA
- Estruture o carrossel assim: Slide 1 = Título no formato "X sinais de que..." ou "Como fazer X em Y passos". Slides do meio = Uma dica por slide, curta e acionável.
- Cada dica deve ser independente e gerar valor imediato ao leitor.
- Use linguagem de autoridade educativa, como se estivesse ensinando algo que poucos sabem.`,

  bastidores: `
FORMATO: BASTIDORES DE DESENVOLVIMENTO
- Estruture o carrossel assim: Slide 1 = Título provocativo sobre o processo (ex: "Por trás do nosso agente de IA"). Slides do meio = Mostre o stack tecnológico, desafios enfrentados, decisões técnicas e como o time resolveu.
- Use uma linguagem mais informal e transparente, como se estivesse abrindo a cozinha.
- Mencione ferramentas e tecnologias específicas (ex: Python, n8n, LangChain, etc.) se fornecidas.`,

  opiniao: `
FORMATO: OPINIÃO / TENDÊNCIA DO MERCADO
- Estruture o carrossel assim: Slide 1 = Título polêmico ou provocativo sobre a tendência (ex: "IA vai substituir programadores?"). Slides do meio = Apresente sua visão com argumentos sólidos, dados ou experiência prática.
- Posicione a Vyrko como thought leader. Use uma linguagem confiante e opinativa, sem medo de tomar um lado.
- Finalize com uma reflexão ou pergunta que gere debate nos comentários.`,

  comparativo: `
FORMATO: COMPARATIVO (A vs. B)
- Estruture o carrossel assim: Slide 1 = Título no formato "X vs. Y: qual é melhor para seu negócio?". Slides do meio = Compare os dois lados ponto a ponto, mostrando vantagens e desvantagens de cada.
- Seja justo na comparação mas deixe claro qual alternativa a Vyrko recomenda e por quê.
- Use formatação que facilite a comparação visual (ex: ✅ vs ❌, ou lado a lado).`,
};

// ─── Mapa de instruções por Nível de Público ─────────────────────────────────
const AUDIENCE_INSTRUCTIONS: Record<string, string> = {
  leigo: `
PÚBLICO-ALVO: LEIGO (Dono de negócio, gerente, empreendedor — NÃO é técnico)
- PROIBIDO usar jargões técnicos como "API", "deploy", "pipeline", "stack", "microserviços", "endpoint" sem explicar.
- Foque 100% no BENEFÍCIO para o negócio: economia de tempo, redução de custo, aumento de vendas, menos erros humanos.
- Use analogias do dia a dia para explicar conceitos técnicos.
- O leitor deve pensar: "Preciso disso na minha empresa AGORA."`,

  tecnico: `
PÚBLICO-ALVO: TÉCNICO (Desenvolvedores, CTOs, engenheiros de software)
- Use vocabulário técnico com confiança: mencione frameworks, linguagens, padrões de arquitetura.
- Foque em COMO a solução foi construída, quais trade-offs foram feitos, qual stack foi usada.
- Compartilhe insights técnicos que agreguem ao repertório do leitor.
- O leitor deve pensar: "Esse time sabe o que faz, quero trocar ideia com eles."`,
};

// ─── Mapa de instruções de CTA ───────────────────────────────────────────────
function buildCtaInstruction(ctaType: string, cta?: string): string {
  switch (ctaType) {
    case 'diagnostico':
      return `\n  3. Adicione um CTA convidando o leitor a agendar um DIAGNÓSTICO GRATUITO com a Vyrko. Ex: "Quer saber como aplicar isso no seu negócio? Agende um diagnóstico gratuito — link na bio 👆"`;
    case 'dm':
      return `\n  3. Adicione um CTA direcionando o leitor para enviar uma DM. Ex: "Manda um 'QUERO' no direct que a gente te explica como funciona 📩"`;
    case 'link_bio':
      return `\n  3. Adicione um CTA direcionando para o link na bio (portfólio/formulário de contato). Ex: "Conheça nossos cases e solicite um orçamento — link na bio 🔗"`;
    case 'engagement':
      return `\n  3. Adicione uma chamada (CTA) engajadora pedindo para a pessoa curtir, comentar sua opinião ou salvar o post.`;
    case 'conversion':
      return `\n  3. Adicione uma chamada (CTA) forte direcionando a pessoa para clicar no Link da Bio e conhecer a Vyrko.`;
    case 'custom':
      return cta
        ? `\n  3. Adicione esta Chamada para Ação (CTA) exata: "${cta}"`
        : `\n  3. Não adicione CTA.`;
    case 'none':
      return `\n  3. Não adicione nenhuma chamada para ação (CTA).`;
    default:
      return '';
  }
}

// ─── Construção do prompt de Prova Social ────────────────────────────────────
function buildSocialProofInstruction(socialProof?: string): string {
  if (!socialProof || socialProof.trim() === '') return '';
  return `
PROVA SOCIAL E CREDIBILIDADE:
O usuário forneceu as seguintes métricas, tecnologias ou contexto real. Você DEVE incorporar essas informações de forma natural no conteúdo (nos slides e/ou na legenda), usando-as como prova de autoridade e credibilidade:
"${socialProof}"
- Não invente dados. Use EXATAMENTE o que foi fornecido.
- Destaque os números e resultados de forma chamativa.
- Se tecnologias foram mencionadas, cite-as como selo de competência técnica.`;
}

export async function POST(request: Request) {
  try {
    const { theme, tone, audience, ctaType, cta, format, socialProof } = await request.json();

    if (!theme) {
      return NextResponse.json({ error: 'Tema é obrigatório' }, { status: 400 });
    }

    const settings = await prisma.settings.findUnique({
      where: { key: 'aiPrompt' }
    });
    
    const customPrompt = settings?.value;

    // ── Montar seções dinâmicas do prompt ──
    const toneInstruction = tone && tone !== 'default'
      ? `- Estilo/Tom de voz: ${tone}`
      : `- Profissional, direto, moderno e acessível.`;

    const formatInstruction = format && FORMAT_INSTRUCTIONS[format]
      ? FORMAT_INSTRUCTIONS[format]
      : '';

    const audienceInstruction = audience && AUDIENCE_INSTRUCTIONS[audience]
      ? AUDIENCE_INSTRUCTIONS[audience]
      : `Foco em gerar autoridade e demonstrar o valor prático da tecnologia/IA para negócios.`;

    const ctaInstruction = buildCtaInstruction(ctaType, cta);
    const socialProofInstruction = buildSocialProofInstruction(socialProof);

    // ── Prompt padrão completo ──
    const defaultPrompt = `
${VYRKO_PERSONA}

---

Sua tarefa é criar um post no formato CARROSSEL para o Instagram sobre o seguinte tema: "${theme}".

${formatInstruction}

Diretrizes de Voz e Público:
${toneInstruction}
${audienceInstruction}
- Não seja excessivamente acadêmico ou robótico.

${socialProofInstruction}

Regras do Carrossel:
- Crie entre 3 a 5 slides de conteúdo.
- O primeiro slide deve ser o Título Chamativo.
- Os slides do meio devem ter dicas ou informações valiosas e curtas.
- NÃO crie um slide final de "Curta e compartilhe", nós já adicionaremos um slide padrão automaticamente no final.

Retorne APENAS um objeto JSON válido (sem marcação Markdown em volta) com as seguintes chaves:
- "slides": Um array de strings, onde cada string é o texto de um slide do carrossel (max 10 a 15 palavras por slide).
- "caption": A legenda do post. SIGA EXATAMENTE este formato:
  1. Comece com emojis relevantes (ex: 🚀, 💡, 🧠, etc).
  2. Escreva um texto curto e envolvente de 2-3 frases sobre o tema (NÃO repita o conteúdo dos slides, traga contexto e curiosidade). Use emojis moderados.${ctaInstruction}
  4. Depois do texto e do CTA, adicione uma separação visual com pontos em linhas separadas (use exatamente: \n.\n.\n.\n.\n.)
  5. Depois dos pontos, coloque 5 a 8 hashtags relevantes (#Vyrko #MarketingDigital #AutomacaoDeProcessos etc).
    `;

    // Inject parameters into custom prompt if provided, otherwise use default
    let prompt = defaultPrompt;
    if (customPrompt) {
      prompt = customPrompt
        .replace('{{theme}}', theme)
        .replace('{{tone}}', tone || 'padrão')
        .replace('{{audience}}', audience || 'padrão')
        .replace('{{cta}}', cta || 'padrão')
        .replace('{{format}}', format || 'padrão')
        .replace('{{socialProof}}', socialProof || '')
        + '\n\nIMPORTANTE: Retorne APENAS um objeto JSON com as chaves "slides" (array de strings curtas) e "caption" (string).';
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) throw new Error('Sem resposta da IA');
    
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Erro ao gerar post:', error);
    return NextResponse.json({ error: 'Falha ao gerar o conteúdo' }, { status: 500 });
  }
}
