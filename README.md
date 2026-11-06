# Pathora

Career-readiness platform for students and graduates. React + Vite, Tailwind CSS, Supabase, Vercel.

## Run it
1. `npm install`
2. `npm run dev`, then open the address it prints (usually http://localhost:5173)

## Other commands
- `npm run build`: make the production version
- `npm run lint`: check the code for likely mistakes

## Structure
- `src/pages`: one file per screen
- `src/layouts`: page frames (public header and footer, app sidebar)
- `src/components`: small reusable pieces (Logo, Button)
- `src/navigation.js`: the sidebar items
- `src/index.css`: Pathora colours and fonts

Secrets go in a `.env` file (copy `.env.example`). Never commit `.env`.
