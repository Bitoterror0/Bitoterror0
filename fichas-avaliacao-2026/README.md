# Banco das Fichas de Avaliação 2026

A página continua no GitHub Pages. O Supabase fornece o login e o PostgreSQL.
O arquivo `banco-config.js` vem vazio para que o modo atual continue disponível durante a preparação.

## Ativar

1. Crie um projeto Supabase na conta responsável pelos dados. No SQL Editor, aplique `fichas.sql` uma vez.
2. Em Authentication, desative cadastros públicos e crie as contas autorizadas com e-mail e senha. Cada conta vê somente suas próprias fichas. Use a mesma conta autorizada nos aparelhos que devem abrir os mesmos registros.
3. Preencha `url` e `chavePublicavel` em `banco-config.js` com a URL do projeto e a chave **publishable** (`sb_publishable_...`). Nunca inclua a chave secreta, a senha do banco ou senhas de usuários no Git.
4. Antes de ativar no endereço público, teste com fichas fictícias. Salve, abra em outra sessão com a mesma conta e confirme a ficha. Entre com outra conta e confirme que ela não enxerga o registro. Confira edição, exclusão e restauração.
5. Publique a branch em `main` após validar o projeto e as contas.

## Trazer fichas anteriores

Antes de ativar o banco, use **Cópia de segurança** para exportar o JSON no navegador onde as fichas já estão. Depois de entrar no site com a conta correta, use **Trazer fichas de uma cópia de segurança**. As fichas antigas do Claude usam o mesmo fluxo se a exportação estiver disponível naquele endereço. O JSON pode conter informações pessoais dos educandos. Guarde o arquivo em local protegido.

Após a ativação, o formulário exige login. Rascunhos ficam na aba até salvar. Uma aba aberta pode carregar os registros recentes com **Atualizar fichas**. O botão **Sair** encerra a sessão neste navegador.
