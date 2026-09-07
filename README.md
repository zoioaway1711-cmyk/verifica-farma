# VerificaFarma

Portal Save Concept para autenticação de produtos, gestão de seriais e programa de benefícios.

## Publicação

O projeto é estático e os ficheiros públicos encontram-se em `dist/`.

## Netlify e registo central

O projeto inclui Netlify Functions e Netlify Blobs para registar consultas de seriais no painel administrativo. Configure estas variáveis em **Netlify → Project configuration → Environment variables**:

- `ADMIN_USER`: utilizador do painel;
- `ADMIN_PASSWORD`: senha forte do painel;
- `SESSION_SECRET`: chave aleatória com pelo menos 32 caracteres.

Depois faça um novo deploy. O IP, data/hora, serial, perfil e resultado são gravados no servidor e só ficam disponíveis após autenticação administrativa.
