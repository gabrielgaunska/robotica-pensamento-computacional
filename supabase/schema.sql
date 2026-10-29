-- Robótica e Pensamento Computacional na Prática
-- Execute este arquivo no Supabase > SQL Editor.
-- Segurança: os usuários só podem editar atividades quando seu perfil tiver role='admin'.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'student' check (role in ('student','admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  unit text not null default '',
  duration text not null default '',
  summary text not null default '',
  materials jsonb not null default '[]'::jsonb,
  steps jsonb not null default '[]'::jsonb,
  published boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists activities_published_created_idx
  on public.activities (published, created_at desc);


-- Atividade inicial baseada no PDF fornecido. As imagens podem ser adicionadas
-- pelo professor depois de entrar no painel.
insert into public.activities (title, unit, duration, summary, materials, steps, published)
select
  'Comunicação Sonora com micro:bit',
  'Unidade 28',
  '2 horas',
  'Explore os recursos de áudio do micro:bit, use o microfone para detectar sons e crie projetos interativos com a matriz de LEDs.',
  '["Placas micro:bit (com cabo USB ou bateria)", "Computadores com acesso à internet", "Acessar a plataforma MakeCode (makecode.microbit.org)"]'::jsonb,
  $steps$[
    {"title":"Vamos explorar o som!","text":"A audição é um de nossos cinco sentidos e o som nos permite reconhecer coisas como um alarme de incêndio, um trovão e conseguimos nos comunicar pela fala.\n\nVamos explorar um pouquinho mais sobre o som usando a tecnologia do micro:bit!\n\nVamos conhecer o microfone e o alto-falante presente no micro:bit e como podemos criar projetos com eles?","image_url":""},
    {"title":"Microfone e alto-falante","text":"O microfone pode captar o som ao seu redor, como a voz de seus amigos ou uma música, além de permitir criar sua própria música. Já o alto-falante pode reproduzir sons para podermos escutá-los. Esses recursos podem adicionar sons aos seus projetos no micro:bit.","image_url":""},
    {"title":"Conhecendo o nível de som","text":"Vamos voltar à aba Input para explorar o bloco de comando sound level (nível de som) do micro:bit!","image_url":""},
    {"title":"O que é sound level?","text":"O bloco sound level mede o nível de som do ambiente pelo microfone integrado no micro:bit. Ele retorna um valor numérico que representa a intensidade do som detectado, de 0 (nenhum som) até 255 (muito alto).\n\nO evento de som alto ou silencioso pode ser usado para ativar uma ação quando determinado nível de som é detectado.","image_url":""},
    {"title":"Desafio: acenda os LEDs com uma palma","text":"Faça um programa em que todos os LEDs do micro:bit se acendam quando uma palma for batida perto dele (som alto) e todos os LEDs fiquem apagados quando estiver silencioso.\n\nUse os blocos adequados para responder à intensidade do som.","image_url":""},
    {"title":"Vamos além!","text":"Vamos aplicar nossos conhecimentos em situações mais complexas! Teste o projeto, observe os resultados e pense em outras maneiras de usar o som como entrada.","image_url":""},
    {"title":"Desafio: chapéu seletor de Hogwarts","text":"Na série Harry Potter, o Chapéu Seletor determina a qual das quatro casas cada aluno pertence: Grifinória, Lufa-Lufa, Corvinal e Sonserina.","image_url":""},
    {"title":"Programe o Chapéu Seletor","text":"Escreva um programa para o micro:bit atuar como o Chapéu Seletor. Sempre que um aluno agitar o micro:bit, uma mensagem deverá aparecer no display de LEDs informando a qual casa ele pertence.","image_url":""},
    {"title":"Sugestão de código","text":"Crie uma sequência que reconheça o gesto de agitar e escolha uma das quatro casas. Teste o programa e compartilhe sua solução com a turma.","image_url":""},
    {"title":"Parabéns, inventores!","text":"Atividade concluída! Feito com criatividade, dedicação e muita tecnologia. Agora, experimente modificar o projeto e inventar novas possibilidades.","image_url":""}
  ]$steps$::jsonb,
  true
where not exists (
  select 1 from public.activities where title = 'Comunicação Sonora com micro:bit'
);

alter table public.profiles enable row level security;
alter table public.activities enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "Profiles can be read by owner or admin" on public.profiles;
create policy "Profiles can be read by owner or admin"
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin());

drop policy if exists "Admins manage profiles" on public.profiles;
create policy "Admins manage profiles"
on public.profiles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Anyone can read published activities" on public.activities;
create policy "Anyone can read published activities"
on public.activities for select to anon, authenticated
using (published = true or public.is_admin());

drop policy if exists "Admins can insert activities" on public.activities;
create policy "Admins can insert activities"
on public.activities for insert to authenticated
with check (public.is_admin() and created_by = (select auth.uid()));

drop policy if exists "Admins can update activities" on public.activities;
create policy "Admins can update activities"
on public.activities for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins can delete activities" on public.activities;
create policy "Admins can delete activities"
on public.activities for delete to authenticated
using (public.is_admin());

-- Cria um bucket público só para as imagens que aparecem nas atividades publicadas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('activity-images', 'activity-images', true, 8388608,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set
  public = true,
  file_size_limit = 8388608,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view activity images" on storage.objects;
create policy "Public can view activity images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'activity-images');

drop policy if exists "Admins can upload activity images" on storage.objects;
create policy "Admins can upload activity images"
on storage.objects for insert to authenticated
with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "Admins can update activity images" on storage.objects;
create policy "Admins can update activity images"
on storage.objects for update to authenticated
using (bucket_id = 'activity-images' and public.is_admin())
with check (bucket_id = 'activity-images' and public.is_admin());

drop policy if exists "Admins can delete activity images" on storage.objects;
create policy "Admins can delete activity images"
on storage.objects for delete to authenticated
using (bucket_id = 'activity-images' and public.is_admin());

-- Após criar a conta de professor em Authentication > Users,
-- execute no SQL Editor substituindo o e-mail:
-- insert into public.profiles (id, role)
-- select id, 'admin' from auth.users where email = 'SEU-EMAIL-AQUI'
-- on conflict (id) do update set role = 'admin';
