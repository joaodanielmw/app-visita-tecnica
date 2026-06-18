const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

/**
 * Ajuste de compatibilidade Firebase JS SDK <-> Metro
 * ----------------------------------------------------
 * A partir do Expo SDK 53, o Metro passou a resolver módulos usando o
 * campo "exports" do package.json por padrão. O Firebase JS SDK usa
 * arquivos .cjs internamente para o bundle de React Native, e essa nova
 * resolução pode falhar com o erro:
 *   "Error: Component auth has not been registered yet"
 * impedindo o app de sequer abrir.
 *
 * Esse problema é amplamente documentado (ver issues do repositório
 * expo/expo e firebase/firebase-js-sdk). A correção abaixo desativa essa
 * resolução "moderna" para usar o caminho tradicional, que o Firebase
 * espera. Em um app de pacote único (sem monorepo) como este, essa opção
 * não tem efeitos colaterais conhecidos — então deixamos ativada de forma
 * preventiva, mesmo que SDKs futuros possam corrigir o problema na raiz.
 */
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
