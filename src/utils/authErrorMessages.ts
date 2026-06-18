/**
 * O Firebase Auth lança erros com códigos técnicos (ex: "auth/weak-password").
 * Esta função traduz os mais comuns para mensagens que fazem sentido na
 * tela de login/cadastro, sem expor jargão de API ao usuário final.
 */
export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code ?? '';

  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-mail ou senha incorretos.';
    case 'auth/email-already-in-use':
      return 'Já existe uma conta com este e-mail.';
    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um momento e tente novamente.';
    case 'auth/network-request-failed':
      return 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
    default:
      return 'Não foi possível completar a operação. Tente novamente.';
  }
}
