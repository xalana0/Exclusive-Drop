import nextauth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '../../../lib/firebase';// Sua conexão com o Firebase
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs'; // Certifique-se de instalar: npm install bcryptjs

export default nextauth({
  providers: [
    CredentialsProvider({
      name: 'Credentials', // Nome do seu método de autenticação
      async authorize(credentials) {
        const { username, password } = credentials;

        console.log('Credenciais recebidas:', { username, password });

        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', username));

        console.log('Query do Firestore:', q);

        const querySnapshot = await getDocs(q);

        console.log('Resultado da querySnapshot:', querySnapshot);

        if (querySnapshot.empty) {
          console.log('Utilizador não encontrado.');
          return null; // Utilizador não encontrado
        }

        const userDoc = querySnapshot.docs[0];
        const user = userDoc.data();
        const userId = userDoc.id; // Obtenha o ID do documento

        console.log('Utilizador encontrado no Firestore:', { userId, ...user });

        const passwordMatch = await bcrypt.compare(password, user.password);

        console.log('Resultado da comparação da password:', passwordMatch);

        if (passwordMatch) {
          // Retorne um objeto de utilizador com as informações que você quer na sessão
          const userSessionData = { id: userId, username: user.username, isAdmin: user.isAdmin, isUser: user.isUser };
          console.log('Login bem-sucedido, dados da sessão:', userSessionData);
          return userSessionData;
        } else {
          console.log('Password incorreta.');
          return null; // Password incorreta
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
      }
      return token;
    },
    async session({ session, token }) {
      // Passe as informações do token para a sessão
      session.user = token;
      return session;
    },
  },
});