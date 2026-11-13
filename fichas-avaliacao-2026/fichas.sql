begin;

create table public.fichas_avaliacao_2026 (
  usuario uuid not null default auth.uid() references auth.users(id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9_-]{1,60}$'),
  dados jsonb not null check (
    jsonb_typeof(dados) = 'object' and octet_length(dados::text) <= 65536
    and dados ? 'id' and dados->>'id' is not null and dados->>'id' = id
  ),
  versao uuid not null default gen_random_uuid(),
  primary key (usuario, id)
);

alter table public.fichas_avaliacao_2026 enable row level security;
revoke all on public.fichas_avaliacao_2026 from public, anon, authenticated;
grant select, delete on public.fichas_avaliacao_2026 to authenticated;
grant insert (id, dados), update (dados, versao)
  on public.fichas_avaliacao_2026 to authenticated;

create policy fichas_da_conta on public.fichas_avaliacao_2026
  for all to authenticated
  using ((select auth.uid()) = usuario)
  with check ((select auth.uid()) = usuario);

create function public.substituir_fichas_2026(
  ficha jsonb, versao_atual uuid, apagar_id text, apagar_versao uuid
) returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  nova_versao uuid := pg_catalog.gen_random_uuid();
begin
  if apagar_id = ficha->>'id' then
    raise exception 'IDs iguais';
  end if;

  update public.fichas_avaliacao_2026
  set dados = ficha, versao = nova_versao
  where usuario = (select auth.uid()) and id = ficha->>'id' and versao = versao_atual;
  if not found then
    raise exception 'A ficha de destino mudou';
  end if;

  delete from public.fichas_avaliacao_2026
  where usuario = (select auth.uid()) and id = apagar_id and versao = apagar_versao;
  if not found then
    raise exception 'A ficha de origem mudou';
  end if;

  return nova_versao;
end;
$$;
revoke all on function public.substituir_fichas_2026(jsonb, uuid, text, uuid) from public, anon;
grant execute on function public.substituir_fichas_2026(jsonb, uuid, text, uuid) to authenticated;

commit;
