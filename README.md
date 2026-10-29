# Robótica e Pensamento Computacional na Prática

Site de atividades de robótica para alunos dos 4º e 5º anos. Feito com Vite, JavaScript e Supabase.

## O que já está incluído

- Página inicial responsiva, com pesquisa e cartões de atividades.
- Página de atividade com materiais e navegação por etapas.
- Imagens de cada etapa em largura grande, sem limitar a altura.
- Link direto para https://makecode.microbit.org/.
- Área de professor com login, criação/edição de atividade, adicionar/remover passos, envio de imagens, publicar/despublicar e excluir.
- Banco de dados, autenticação e regras de segurança via Supabase.
- Atividade inicial “Comunicação Sonora com micro:bit”, estruturada a partir do PDF fornecido.
- Rodapé com a mensagem solicitada pelo professor Gabriel.

## Importante sobre a atividade inicial

A atividade aparece como demonstração local antes da configuração. Para torná-la permanente, abra a área do professor depois de configurar o Supabase e crie a atividade usando os textos do exemplo. As imagens não foram extraídas automaticamente do PDF; adicione as imagens originais de cada etapa no editor antes de publicar. Isso evita usar imagens inventadas ou de baixa qualidade.

## 1. Criar o projeto Supabase

1. Entre em https://supabase.com/ e crie um projeto.
2. Abra **SQL Editor** > **New query**.
3. Copie todo o conteúdo de `supabase/schema.sql`, cole no editor e clique em **Run**.
4. Vá a **Project Settings** > **API** (ou **Connect**, conforme a interface atual) e copie a **Project URL** e a chave publicável (`anon`/`publishable`). Nunca use a `service_role` no navegador.
5. Na raiz do projeto, duplique `.env.example` e renomeie a cópia para `.env`.
6. Preencha:
   ```
   VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   VITE_SUPABASE_ANON_KEY=SUA_CHAVE_PUBLICAVEL
   ```
7. Salve o arquivo.

A chave publicável é usada no front-end e depende das políticas RLS do banco. Nunca publique chaves secretas, senhas ou a chave `service_role`.

## 2. Criar a conta do professor

1. No Supabase, abra **Authentication** > **Users**.
2. Crie/invite o e-mail do professor e defina uma senha segura.
3. Copie o UUID do usuário criado.
4. No **SQL Editor**, execute este SQL substituindo o e-mail:
   ```sql
   insert into public.profiles (id, role)
   select id, 'admin'
   from auth.users
   where email = 'SEU-EMAIL-AQUI'
   on conflict (id) do update set role = 'admin';
   ```
5. A conta agora poderá entrar pela opção **Área do professor**.
6. Não disponibilize a conta administrativa aos alunos. O site não oferece cadastro público.

## 3. Rodar localmente

É necessário ter Node.js instalado.

```bash
npm install
npm run dev
```

Abra o endereço local informado pelo Vite. Para testar a versão de produção:

```bash
npm run build
npm run preview
```

O conteúdo de `.env` é local e não deve ser enviado ao GitHub. O `.gitignore` já exclui esse arquivo.

## 4. Colocar o projeto no GitHub pelo navegador

1. Entre em https://github.com/ e crie um repositório, por exemplo `robotica-pensamento-computacional`.
2. Deixe o repositório privado se preferir manter o código fora de acesso público; o site publicado poderá continuar acessível aos alunos.
3. No repositório, clique em **Add file** > **Upload files**.
4. Envie os arquivos e pastas deste projeto. Envie `.env.example`, mas **não** envie o `.env` preenchido.
5. Clique em **Commit changes**.
6. Se preferir, pode enviar o ZIP e extraí-lo no computador antes de fazer o upload. O GitHub não executa o site apenas por armazenar o ZIP: envie os arquivos já extraídos na raiz do repositório.

## 5. Publicar no Hostless.cloud

A interface pode variar um pouco com atualizações do Hostless. O fluxo documentado é conectar o repositório Git, criar um recurso do tipo **Site** e configurar build/output.

1. Acesse https://hostless.cloud/ e entre.
2. Crie um projeto e escolha criar um **Site**.
3. Conecte o GitHub e selecione o repositório `robotica-pensamento-computacional`.
4. Configure:
   - **Framework:** Vite (ou React/Vite, se for a opção disponível)
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Working directory:** deixe vazio se os arquivos `package.json` e `index.html` estiverem na raiz.
5. Adicione as variáveis de ambiente de build:
   - `VITE_SUPABASE_URL` = Project URL do Supabase
   - `VITE_SUPABASE_ANON_KEY` = chave publicável/anon do Supabase
6. Clique para criar/publicar o site e aguarde o build.
7. Abra a URL HTTPS gerada e teste a página inicial, a atividade e o login do professor.
8. Ao atualizar arquivos no GitHub, o Hostless pode publicar automaticamente novos builds conforme a integração configurada.

Documentação oficial: https://docs.hostless.cloud/sites/overview

## 6. Publicar a atividade inicial

A atividade de demonstração está definida em `src/main.js` com os textos do PDF. Para que ela seja permanente e editável:

1. Configure Supabase e crie a conta de professor.
2. Entre em **Área do professor**.
3. Clique em **Nova atividade**.
4. Copie o título, unidade, duração, descrição, materiais e os textos das 10 etapas da atividade de exemplo.
5. Use **＋ Adicionar passo** para criar as 10 etapas.
6. Em cada etapa, selecione a imagem correspondente do PDF/material original.
7. Salve a atividade. Ela ficará como rascunho.
8. Clique em **Publicar** quando estiver revisada.

## 7. Testes finais

- [ ] Página inicial abre no Chromebook.
- [ ] Pesquisa filtra atividades.
- [ ] Link do MakeCode abre em nova aba.
- [ ] Login de professor funciona.
- [ ] Conta sem papel `admin` não acessa o painel.
- [ ] Professor consegue adicionar e remover etapas.
- [ ] Imagens são enviadas ao Storage e aparecem grandes na atividade.
- [ ] Atividade publicada aparece em outro dispositivo.
- [ ] Rascunhos não aparecem para alunos.
- [ ] Nenhuma chave secreta está no GitHub.

## Limitações conhecidas desta primeira versão

- A atividade baseada no PDF vem com os textos transcritos, mas as imagens precisam ser adicionadas pelo professor no painel.
- A edição de uma atividade já salva não apaga automaticamente arquivos de imagem antigos que deixem de ser usados. Eles podem ser removidos manualmente do Storage.
- O login é para o professor; os alunos não precisam de contas para consultar conteúdo publicado.
- Para preservar a segurança, as políticas de acesso são aplicadas no banco com Row Level Security (RLS), e não apenas escondendo botões na interface.
