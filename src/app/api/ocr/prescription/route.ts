import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { rateLimit } from '@/lib/rateLimit';

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

const MAX_REMOTE_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_BASE64_BYTES = 14 * 1024 * 1024; // ~10 MB after decode

function isAllowedImageUrl(raw: string): boolean {
    let parsed: URL;
    try {
        parsed = new URL(raw);
    } catch {
        return false;
    }
    if (parsed.protocol !== 'https:') return false;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return false;

    let supabaseHost: string;
    try {
        supabaseHost = new URL(supabaseUrl).host;
    } catch {
        return false;
    }

    return parsed.host === supabaseHost;
}

export async function POST(request: NextRequest) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = rateLimit(`ocr:${user.id}`, 10, 60 * 1000);
    if (!rl.ok) {
        return NextResponse.json(
            { error: 'Muitas requisições. Tente novamente em alguns instantes.' },
            { status: 429, headers: { 'Retry-After': Math.ceil((rl.resetAt - Date.now()) / 1000).toString() } },
        );
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Serviço de OCR indisponível' },
            { status: 500 }
        );
    }

    const body = await request.json();
    const { imageUrl, imageBase64, mimeType } = body ?? {};

    if (!imageUrl && !imageBase64) {
        return NextResponse.json({ error: 'imageUrl ou imageBase64 é obrigatório' }, { status: 400 });
    }

    if (imageUrl && typeof imageUrl !== 'string') {
        return NextResponse.json({ error: 'imageUrl inválido' }, { status: 400 });
    }
    if (imageBase64 && typeof imageBase64 !== 'string') {
        return NextResponse.json({ error: 'imageBase64 inválido' }, { status: 400 });
    }

    if (imageBase64 && imageBase64.length > MAX_BASE64_BYTES) {
        return NextResponse.json({ error: 'Imagem muito grande' }, { status: 400 });
    }

    if (imageUrl && !isAllowedImageUrl(imageUrl)) {
        return NextResponse.json(
            { error: 'Apenas imagens hospedadas no storage da aplicação são aceitas.' },
            { status: 400 },
        );
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const imagePart = imageBase64
            ? { inlineData: { data: imageBase64, mimeType: typeof mimeType === 'string' ? mimeType : 'image/jpeg' } }
            : await fetchImageAsPart(imageUrl as string);

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
        console.error('[OCR] Error:', err);
        return NextResponse.json({ error: 'Erro ao analisar imagem' }, { status: 500 });
    }
}

async function fetchImageAsPart(imageUrl: string) {
    const resp = await fetch(imageUrl, { redirect: 'error' });
    if (!resp.ok) throw new Error('image_fetch_failed');

    const contentLength = Number(resp.headers.get('content-length') || 0);
    if (contentLength && contentLength > MAX_REMOTE_IMAGE_BYTES) {
        throw new Error('image_too_large');
    }

    const arrayBuffer = await resp.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_REMOTE_IMAGE_BYTES) {
        throw new Error('image_too_large');
    }

    return {
        inlineData: {
            data: Buffer.from(arrayBuffer).toString('base64'),
            mimeType: resp.headers.get('content-type') || 'image/jpeg',
        },
    };
}
