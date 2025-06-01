import nextauth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '../../../lib/firebase'; // Sua conexão com o Firebase
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore'; // Adicionado doc e setDoc
import bcrypt from 'bcryptjs'; // Certifique-se de instalar: npm install bcryptjs

export default nextauth({
  providers: [
    CredentialsProvider({
      name: 'Credentials', // Nome do seu método de autenticação
      credentials: {
        username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials, req) {
        const { username, password } = credentials;

        console.log('Credenciais recebidas:', { username, password }); // Log 1

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));

        console.log('Query do Firestore:', q); // Log 2

        try {
          const querySnapshot = await getDocs(q);

          console.log('Resultado da querySnapshot:', querySnapshot); // Log 3
          console.log('Query Snapshot está vazio?', querySnapshot.empty); // Log 4

          if (querySnapshot.empty) {
            console.log('Utilizador não encontrado no Firestore com o username:', username); // Log 5
            return null; // Utilizador não encontrado
          }

          const userDoc = querySnapshot.docs[0];
          const user = userDoc.data();
          const userId = userDoc.id; // Obtenha o ID do documento do utilizador do Firestore

          console.log('Utilizador encontrado no Firestore:', { userId, ...user }); // Log 6

          // Verifique se o campo password existe no documento do utilizador
          if (!user.password) {
            console.error('Campo de password ausente para o utilizador:', username);
            return null; // O utilizador existe, mas não tem password hash
          }

          const passwordMatch = await bcrypt.compare(password, user.password);

          console.log('Resultado da comparação da password:', passwordMatch); // Log 7

          if (passwordMatch) {
            // *** NOVO: Garantir que o documento do utilizador existe com o ID correto e dados essenciais ***
            // NextAuth armazena o 'id' que você retorna aqui na sessão.
            // Se esse 'id' não for o ID do documento do Firestore, a Conta.js não vai encontrar.
            // Usamos o userDoc.id como o ID do documento no Firestore.
            const userSessionData = {
              id: userId, // Este é o ID do documento Firestore
              username: user.username,
              email: user.email, // Adicione o email se for útil na sessão ou na página de conta
              isAdmin: user.isAdmin || false, // Garanta que isAdmin está presente, ou defina como false
              isUser: user.isUser || true // Garanta que isUser está presente, ou defina como true
            };

            // Opcional: Se o seu fluxo de criação de utilizador não garante isAdmin/isUser,
            // ou se você quer ter certeza que o documento no Firestore reflete esses campos,
            // você pode fazer um setDoc aqui (com merge para não sobrescrever).
            // Se os dados já estão no Firestore, este passo pode ser redundante,
            // mas garante que o documento tem os campos que você espera para a sessão.
            try {
              await setDoc(doc(db, 'users', userId), {
                isAdmin: userSessionData.isAdmin,
                isUser: userSessionData.isUser,
                // Não guarde a password aqui!
              }, { merge: true }); // 'merge: true' para não sobrescrever o documento inteiro
            } catch (e) {
              console.error("Erro ao garantir dados isAdmin/isUser no Firestore:", e);
              // Decide como lidar com este erro. Pode não impedir o login, mas pode afetar permissões.
            }

            console.log('Login bem-sucedido, dados da sessão:', userSessionData); // Log 8
            return userSessionData;
          } else {
            console.log('Password incorreta.'); // Log 9
            return null; // Password incorreta
          }
        } catch (error) {
          console.error('Erro ao autenticar utilizador no Firestore:', error); // Log de erro na query
          return null; // Retorna null em caso de erro na query
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT (JSON Web Tokens) para sessões mais escaláveis
  },
  secret: process.env.NEXTAUTH_SECRET, // Defina uma chave secreta segura nas suas variáveis de ambiente
  pages: {
    signIn: '/login', // Redirecionar para a sua página de login personalizada
  },
  callbacks: {
    async jwt({ token, user }) {
      // Adicione informações do utilizador ao token JWT
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.isAdmin = user.isAdmin;
        token.isUser = user.isUser;
        token.email = user.email; // Adicione o email ao token também
      }
      return token;
    },
    async session({ session, token }) {
      // Exponha as informações do token na sessão
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.email = token.email; // Exponha o email na sessão
        session.user.isAdmin = token.isAdmin;
        session.user.isUser = token.isUser;
      }
      return session;
    },
  },
});