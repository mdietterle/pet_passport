import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'Pet Passport — Saúde do seu pet em um só lugar',
    description:
        'Gerencie vacinas, consultas veterinárias e ocorrências dos seus pets com facilidade.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body>{children}</body>
        </html>
    );
}
