import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const PRESCRIPTION_PROMPT = `
Você é um assistente especializado em análise de receitas veterinárias.
Analise a imagem a seguir (que pode ser uma receita veterinária, receituário ou documento médico animal) e extraia as informações em formato JSON.

Retorne APENAS um objeto JSON válido com os seguintes campos (use null para campos não encontrados):
{
  "vet_name": "nome do veterinário",
  "clinic": "nome da clínica ou hospital veterinário",
  "reason": "motivo da consulta ou diagnóstico principal (1 linha resumida)",
  "diagnosis": "diagnóstico completo",
  "prescription": "medicamentos prescritos com dosagens e duração",
  "follow_up_date": "data de retorno no formato YYYY-MM-DD ou null",
  "notes": "observações adicionais",
  "confidence": "high | medium | low"
}

Se a imagem não for uma receita veterinária, retorne:
{ "error": "Imagem não é uma receita veterinária" }
`;

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'GOOGLE_AI_API_KEY não configurada no servidor' },
            { status: 500 }
        );
    }

    const body = await request.json();
    const { imageUrl, imageBase64, mimeType } = body;

    if (!imageUrl && !imageBase64) {
        return NextResponse.json({ error: 'imageUrl ou imageBase64 é obrigatório' }, { status: 400 });
    }

    try {
        // Instantiated here (not at module scope) so the key is validated before use
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imagePart = imageBase64
            ? { inlineData: { data: imageBase64, mimeType: mimeType || 'image/jpeg' } }
            : await fetchImageAsPart(imageUrl);

        const result = await model.generateContent([PRESCRIPTION_PROMPT, imagePart]);
        const text = result.response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            return NextResponse.json({ error: 'IA não retornou dados estruturados' }, { status: 422 });
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (parsed.error) {
            return NextResponse.json({ error: parsed.error }, { status: 422 });
        }

        return NextResponse.json(parsed);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.error('[OCR] Error:', err);
        return NextResponse.json({ error: `Erro ao analisar imagem: ${message}` }, { status: 500 });
    }
}

async function fetchImageAsPart(imageUrl: string) {
    const resp = await fetch(imageUrl);
    if (!resp.ok) throw new Error('Não foi possível buscar a imagem');
    const arrayBuffer = await resp.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            mimeType: resp.headers.get('content-type') || 'image/jpeg',
        },
    };
}
